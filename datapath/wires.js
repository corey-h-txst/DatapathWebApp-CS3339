/**
 * wires.js
 *
 * Builds and manages the datapath wire layer plus animated signal overlays.
 * Instruction steps can reference wires by unique id and declare whether
 * each wire should be active, animated, and which direction the pulse moves.
 *
 * Wire types:
 *   - 'permanent' : Always visible (dimmed by default), brightens when active.
 *                   Data-flow wires that carry values between components.
 *   - 'control'   : Hidden by default, shown with a dashed style when active.
 *                   Control signals from the Control unit to other components.
 *                   State 0 = blue dashed, state 1 = orange dashed.
 *
 * Wire states accumulate across steps so previous highlights persist as the
 * user progresses through an instruction.
 */

import { getMainLayer } from './canvas.js';

// ── Style definitions ────────────────────────────────────────────────────────

/**
 * Visual styles for each wire type in different states.
 *
 * @type {Object}
 */
const WIRE_STYLES = {
    permanent: {
        idle:      { stroke: '#45556a', opacity: 0.55, strokeWidth: 6 },
        active:    { stroke: '#f8fafc', opacity: 1,    strokeWidth: 7 },
        animation: { stroke: '#22c55e', opacity: 0.95 },
    },
    control: {
        hidden: { visible: false, stroke: '#000000', opacity: 0, strokeWidth: 5 },
        0: {
            visible: true,
            stroke: '#38bdf8',
            opacity: 0.95,
            strokeWidth: 5,
            dash: [14, 12],
        },
        1: {
            visible: true,
            stroke: '#f97316',
            opacity: 0.95,
            strokeWidth: 5,
            dash: [4, 12],
        },
        animation0: { stroke: '#7dd3fc', opacity: 0.9 },
        animation1: { stroke: '#fdba74', opacity: 0.9 },
    },
};

/** Style for junction dots (wire intersection points). */
const JUNCTION_STYLE = {
    radius: 9,
    fill: '#e2e8f0',
    stroke: '#0f172a',
    strokeWidth: 2,
    opacity: 0.95,
};

// ── Wire definitions ─────────────────────────────────────────────────────────

/**
 * Wire definitions include the wire type and the points for the line segments.
 * Points are in the format [x1, y1, x2, y2, ..., xn, yn].
 *
 * @type {Object<string, { type: 'permanent'|'control', points: number[] }>}
 */
const WIRE_DEFS = {
    // ── PC → Instruction Memory ──────────────────────────────────────────────
    'pc-to-instruction-mem': {
        type: 'permanent',
        points: [140, 800, 220, 800, 220, 800, 275, 800],
    },

    // ── Instruction Memory → Split ───────────────────────────────────────────
    'instruction-mem-to-split': {
        type: 'permanent',
        points: [675, 800, 760, 800],
    },

    // ── Instruction Split → Control ──────────────────────────────────────────
    'instruction-split-to-control': {
        type: 'permanent',
        points: [760, 800, 760, 340, 800, 340],
    },

    // ── Instruction Split → Register File (Read Data 1) ──────────────────────
    'instruction-split-to-reg-file-read-1': {
        type: 'permanent',
        points: [760, 800, 760, 720, 900, 720],
    },

    // ── Instruction Split → Read-2 Junction ──────────────────────────────────
    'instruction-split-to-read-2-junction': {
        type: 'permanent',
        points: [760, 800, 760, 760, 820, 760],
    },

    // ── Read-2 Junction → Register File (Read Data 2) ────────────────────────
    'read-2-junction-to-reg-file-read-2': {
        type: 'permanent',
        points: [820, 760, 900, 760],
    },

    // ── Instruction Read-2 → MUX Reg-Dst ─────────────────────────────────────
    'instruction-read-2-to-mux-reg-dst': {
        type: 'permanent',
        points: [820, 760, 820, 820, 840, 820],
    },

    // ── Instruction Split → MUX Reg-Dst ──────────────────────────────────────
    'instruction-split-to-mux-reg-dst': {
        type: 'permanent',
        points: [760, 800, 760, 900, 840, 900],
    },

    // ── Instruction Split → Sign Extend ──────────────────────────────────────
    'instruction-split-to-sign-ext': {
        type: 'permanent',
        points: [760, 800, 760, 1160, 1100, 1160],
    },

    // ── Control signals (dashed, hidden by default) ──────────────────────────
    'control-to-reg-file':       { type: 'control', points: [] },
    'control-to-mux-reg-dst':    { type: 'control', points: [] },
    'control-to-mux-alu-src':    { type: 'control', points: [] },
    'control-to-alu-control':    { type: 'control', points: [] },
    'control-to-data-mem':       { type: 'control', points: [] },
    'control-to-mux-mem-to-reg': { type: 'control', points: [] },

    // ── Register File Read Data 1 → ALU ──────────────────────────────────────
    'reg-file-read-1-to-alu': {
        type: 'permanent',
        points: [1300, 720, 1380, 720, 1380, 720, 1500, 720],
    },

    // ── Register File Read Data 2 → Split ────────────────────────────────────
    'reg-file-read-2-to-split': {
        type: 'permanent',
        points: [1300, 920, 1340, 920],
    },

    // ── Read Data 2 Split → MUX ALU-Src ──────────────────────────────────────
    'read-data-2-split-to-mux-alu-src': {
        type: 'permanent',
        points: [1340, 920, 1340, 860, 1420, 860],
    },

    // ── Read Data 2 Split → Data Memory ──────────────────────────────────────
    'read-data-2-split-to-data-mem': {
        type: 'permanent',
        points: [1340, 920, 1340, 980, 1650, 980],
    },

    // ── Sign Extend → Split ──────────────────────────────────────────────────
    'sign-ext-to-split': {
        type: 'permanent',
        points: [1220, 1160, 1380, 1160, 1380, 920],
    },

    // ── Sign Extend Split → MUX ALU-Src ──────────────────────────────────────
    'sign-ext-split-to-mux-alu-src': {
        type: 'permanent',
        points: [1380, 920, 1420, 920],
    },

    // ── Sign Extend Split → Shift Left 2 ─────────────────────────────────────
    'sign-ext-split-to-shift-left-2': {
        type: 'permanent',
        points: [1380, 920, 1380, 310, 1400, 310],
    },

    // ── MUX ALU-Src → ALU ────────────────────────────────────────────────────
    'mux-alu-src-to-alu': {
        type: 'permanent',
        points: [1450, 890, 1470, 890, 1470, 890, 1500, 890],
    },

    // ── ALU Control → ALU ────────────────────────────────────────────────────
    'alu-control-to-alu': {
        type: 'control',
        points: [],
    },

    // ── ALU → Result Split ───────────────────────────────────────────────────
    'alu-to-result-split': {
        type: 'permanent',
        points: [1555, 800, 1605, 800],
    },

    // ── ALU Result Split → Data Memory ───────────────────────────────────────
    'alu-result-split-to-data-mem': {
        type: 'permanent',
        points: [1605, 800, 1650, 800],
    },

    // ── ALU Result Split → MUX Mem-To-Reg ────────────────────────────────────
    'alu-result-split-to-mux-mem-to-reg': {
        type: 'permanent',
        points: [1605, 800, 1605, 1020, 2100, 1020, 2100, 840, 2150, 840],
    },

    // ── Data Memory → MUX Mem-To-Reg ─────────────────────────────────────────
    'data-mem-to-mux-mem-to-reg': {
        type: 'permanent',
        points: [2050, 800, 2100, 800, 2100, 800, 2150, 800],
    },

    // ── MUX Mem-To-Reg → Register File ───────────────────────────────────────
    'mux-mem-to-reg-to-reg-file': {
        type: 'permanent',
        points: [2190, 820, 2260, 820, 2260, 1050, 850, 1050, 850, 950, 900, 950],
    },

    // ── MUX Reg-Dst → Register File (Write Register) ─────────────────────────
    'mux-reg-dst-to-reg-file-write-reg': {
        type: 'permanent',
        points: [880, 850, 900, 850],
    },

    // ── PC → Adder PC ────────────────────────────────────────────────────────
    'pc-to-adder-pc': {
        type: 'permanent',
        points: [90, 700, 90, 520, 220, 520, 220, 180, 400, 180],
    },

    // ── Adder PC → Split ─────────────────────────────────────────────────────
    'adder-pc-to-split': {
        type: 'permanent',
        points: [455, 225, 1480, 225],
    },

    // ── Adder PC Split → Adder Branch ────────────────────────────────────────
    'adder-pc-split-to-adder-branch': {
        type: 'permanent',
        points: [1480, 225, 1540, 225, 1540, 145, 1650, 145],
    },

    // ── Shift Left 2 → Adder Branch ──────────────────────────────────────────
    'shift-left-2-to-adder-branch': {
        type: 'permanent',
        points: [1520, 310, 1580, 310, 1580, 250, 1650, 250],
    },

    // ── Adder PC Split → MUX PC-Src ──────────────────────────────────────────
    'adder-pc-split-to-mux-pc-src': {
        type: 'permanent',
        points: [1480, 225, 1480, 40, 1800, 40, 1800, 120, 1850, 120],
    },

    // ── Adder Branch → MUX PC-Src ────────────────────────────────────────────
    'adder-branch-to-mux-pc-src': {
        type: 'permanent',
        points: [1705, 205, 1850, 205],
    },

    // ── MUX PC-Src → PC (wraps around the bottom, y=-10) ─────────────────────
    'mux-pc-src-to-pc': {
        type: 'permanent',
        points: [1890, 145, 1930, 145, 1930, -10, 20, -10, 20, 750, 40, 750],
    },
};

// ── Junction definitions ─────────────────────────────────────────────────────

/**
 * Junction dots mark wire split/merge points on the canvas.
 * Each junction has a unique id and (x, y) position.
 *
 * @type {Array<{ id: string, x: number, y: number }>}
 */
const JUNCTION_DEFS = [
    { id: 'instruction-split-root',  x: 760,  y: 800 },
    { id: 'instruction-read-2-split', x: 820,  y: 760 },
    { id: 'read-data-2-split',       x: 1340, y: 920 },
    { id: 'sign-ext-split',          x: 1380, y: 920 },
    { id: 'alu-result-split',        x: 1605, y: 800 },
    { id: 'adder-pc-split',          x: 1480, y: 225 },
];

// ── Module-level state ───────────────────────────────────────────────────────

/** @type {Map<string, { def: object, baseLine: Konva.Line, pulseLine: Konva.Line, tween: Konva.Tween|null }>} */
const wireNodes = new Map();

/** @type {Konva.Group|null} */
let baseGroup = null;

/** @type {Konva.Group|null} */
let animationGroup = null;

/** @type {Konva.Group|null} */
let junctionGroup = null;

/**
 * Accumulated wire states across steps — so wires from previous steps
 * stay highlighted/animated as the user progresses through the instruction.
 *
 * @type {Array<{ id: string, state?: 0|1|'0'|'1', animate?: boolean, direction?: 'forward'|'reverse' }>}
 */
let accumulatedWireStates = [];

// ── Initialization ───────────────────────────────────────────────────────────

/**
 * Creates all wire nodes once and applies their default styles.
 * Must be called once after initCanvas() and before initComponents().
 * Wires are added to the main layer in z-order:
 *   1. animation group (pulse lines) — bottom
 *   2. base group (static wire lines)
 *   3. junction group (junction dots) — top of wires
 * Components are added to the main layer after initWires returns,
 * so they render on top of all wire content.
 */
export function initWires() {
    const mainLayer = getMainLayer();

    if (!mainLayer || baseGroup) return;

    baseGroup = new Konva.Group({ id: 'wire-base-group', listening: false });
    animationGroup = new Konva.Group({ id: 'wire-animation-group', listening: false });
    junctionGroup = new Konva.Group({ id: 'wire-junction-group', listening: false });

    for (const [id, def] of Object.entries(WIRE_DEFS)) {
        // Base line — the static wire visible on the canvas
        const baseLine = new Konva.Line({
            id,
            points: def.points,
            lineCap: 'round',
            lineJoin: 'round',
            listening: false,
        });

        // Pulse line — animated overlay that creates a moving dash effect
        const pulseLine = new Konva.Line({
            id: `${id}-pulse`,
            points: def.points,
            lineCap: 'round',
            lineJoin: 'round',
            dash: [18, 16],
            dashOffset: 0,
            visible: false,
            listening: false,
        });

        baseGroup.add(baseLine);
        animationGroup.add(pulseLine);

        wireNodes.set(id, {
            def,
            baseLine,
            pulseLine,
            tween: null,
        });
    }

    // Add groups to the main layer in correct z-order
    mainLayer.add(animationGroup);
    mainLayer.add(baseGroup);
    _initJunctions();
    mainLayer.add(junctionGroup);

    animationGroup.moveToBottom();
    baseGroup.moveToBottom();

    resetWires();
}

// ── Step application ─────────────────────────────────────────────────────────

/**
 * Applies a step's wire declarations, accumulating them so wires from
 * previous steps stay highlighted/animated as the user progresses.
 *
 * Step wire schema:
 *   wires: [
 *     { id: 'pc-to-instruction-mem', animate: true, direction: 'forward' },
 *     { id: 'control-to-mux-reg-dst', state: 1, animate: true }
 *   ]
 *
 * For permanent wires that are part of the data flow, animation is
 * automatically enabled so all pathway wires get the pulsing effect.
 *
 * @param {{ wires?: Array<{id: string, state?: 0|1|'0'|'1', animate?: boolean, direction?: 'forward'|'reverse'}> } | null} step
 */
export function applyWireStep(step) {
    // Merge new wire states into the accumulated list
    for (const wireState of step?.wires ?? []) {
        if (!wireState?.id) continue;

        const def = WIRE_DEFS[wireState.id];
        const isPermanent = def?.type === 'permanent';

        // Auto-animate permanent wires so all pathway wires get the pulsing effect
        const mergedState = {
            ...wireState,
            animate: isPermanent ? true : (wireState.animate ?? false),
        };

        const existing = accumulatedWireStates.find((w) => w.id === wireState.id);
        if (existing) {
            // Update in place to keep the latest state for this wire
            Object.assign(existing, mergedState);
        } else {
            accumulatedWireStates.push(mergedState);
        }
    }

    // Re-apply all accumulated wire states
    resetWires();
    for (const wireState of accumulatedWireStates) {
        setWireState(wireState.id, wireState);
    }
}

/**
 * Clears all accumulated wire states so the next applyWireStep starts fresh.
 * Called when a new simulation starts or when the user resets.
 */
export function clearAccumulatedWires() {
    accumulatedWireStates = [];
}

/**
 * Resets every wire back to its default (idle/hidden) appearance.
 */
export function resetWires() {
    for (const id of wireNodes.keys()) {
        _stopAnimation(id);
        _applyDefaultStyle(id);
    }

    getMainLayer()?.batchDraw();
}

// ── Single wire state ────────────────────────────────────────────────────────

/**
 * Updates a single wire's appearance and animation.
 *
 * @param {string} id - Wire id (e.g. 'pc-to-instruction-mem')
 * @param {{ state?: 0|1|'0'|'1', animate?: boolean, direction?: 'forward'|'reverse' }} state
 */
export function setWireState(id, state = {}) {
    const entry = wireNodes.get(id);
    if (!entry) return;

    _stopAnimation(id);

    if (entry.def.type === 'control') {
        // Control wires: show dashed style based on state (0 or 1)
        const controlState = _normalizeControlState(state.state);
        if (controlState === null) {
            _applyDefaultStyle(id);
            return;
        }

        const style = WIRE_STYLES.control[controlState];
        entry.baseLine.setAttrs(style);
        entry.baseLine.visible(true);

        if (state.animate) {
            const animationStyle = controlState === 0
                ? WIRE_STYLES.control.animation0
                : WIRE_STYLES.control.animation1;
            _startAnimation(id, animationStyle, state.direction);
        }
    } else {
        // Permanent wires: brighten and optionally animate
        entry.baseLine.setAttrs(WIRE_STYLES.permanent.active);

        if (state.animate) {
            _startAnimation(id, WIRE_STYLES.permanent.animation, state.direction);
        }
    }

    getMainLayer()?.batchDraw();
}

// ── Query functions ──────────────────────────────────────────────────────────

/**
 * Returns every available wire id.
 *
 * @returns {string[]}
 */
export function getWireIds() {
    return Object.keys(WIRE_DEFS);
}

/**
 * Returns a copy of a wire's point list.
 *
 * @param {string} id - Wire id
 * @returns {number[]} - Flat array of [x1, y1, x2, y2, ...]
 */
export function getWirePoints(id) {
    const points = WIRE_DEFS[id]?.points;
    return Array.isArray(points) ? [...points] : [];
}

/**
 * Returns a wire's declared type.
 *
 * @param {string} id - Wire id
 * @returns {'permanent'|'control'|null}
 */
export function getWireType(id) {
    return WIRE_DEFS[id]?.type ?? null;
}

/**
 * Returns wire ids filtered by type.
 *
 * @param {'permanent'|'control'} type - Wire type to filter by
 * @returns {string[]}
 */
export function getWireIdsByType(type) {
    return Object.entries(WIRE_DEFS)
        .filter(([, def]) => def.type === type)
        .map(([id]) => id);
}

/**
 * Computes the bounding box that contains all wire points.
 * Useful for setting camera content bounds so clamping accounts
 * for wires that extend beyond the component area (e.g. mux-pc-src-to-pc
 * which wraps around at y=-10).
 *
 * @returns {{ x: number, y: number, width: number, height: number } | null}
 */
export function getWireBounds() {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const def of Object.values(WIRE_DEFS)) {
        const pts = def.points;
        if (!pts || pts.length < 2) continue;

        for (let i = 0; i < pts.length - 1; i += 2) {
            const x = pts[i];
            const y = pts[i + 1];
            if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
    }

    if (!Number.isFinite(minX)) return null;

    return {
        x: minX,
        y: minY,
        width: Math.max(maxX - minX, 1),
        height: Math.max(maxY - minY, 1),
    };
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Applies the default (idle/hidden) style to a single wire.
 *
 * @param {string} id - Wire id
 */
function _applyDefaultStyle(id) {
    const entry = wireNodes.get(id);
    if (!entry) return;

    if (entry.def.type === 'control') {
        entry.baseLine.setAttrs(WIRE_STYLES.control.hidden);
    } else {
        entry.baseLine.setAttrs(WIRE_STYLES.permanent.idle);
        entry.baseLine.visible(true);
    }

    entry.baseLine.shadowBlur(0);
    entry.baseLine.shadowColor(undefined);
    entry.pulseLine.visible(false);
    entry.pulseLine.opacity(0);
}

/**
 * Starts a dash-offset animation on a wire's pulse line.
 * The animation loops indefinitely by resetting and replaying on finish.
 *
 * @param {string} id - Wire id
 * @param {{ stroke: string, opacity: number }} animationStyle - Visual style for the pulse
 * @param {'forward'|'reverse'} direction - Direction of the dash movement
 */
function _startAnimation(id, animationStyle, direction = 'forward') {
    const entry = wireNodes.get(id);
    if (!entry) return;

    entry.pulseLine.setAttrs({
        ...animationStyle,
        strokeWidth: entry.baseLine.strokeWidth() + 1,
        visible: true,
    });

    entry.pulseLine.dashOffset(0);

    entry.tween = new Konva.Tween({
        node: entry.pulseLine,
        duration: 0.55,
        easing: Konva.Easings.Linear,
        dashOffset: direction === 'reverse' ? 34 : -34,
        onFinish: () => {
            if (!entry.tween) return;
            entry.pulseLine.dashOffset(0);
            entry.tween.reset();
            entry.tween.play();
        },
    });

    entry.tween.play();
}

/**
 * Stops and cleans up any running animation on a wire.
 *
 * @param {string} id - Wire id
 */
function _stopAnimation(id) {
    const entry = wireNodes.get(id);
    if (!entry) return;

    if (entry.tween) {
        entry.tween.pause();
        entry.tween.destroy();
        entry.tween = null;
    }

    entry.pulseLine.visible(false);
    entry.pulseLine.opacity(0);
    entry.pulseLine.dashOffset(0);
}

/**
 * Normalizes a control wire state value to a numeric 0 or 1.
 * Accepts both number and string representations.
 *
 * @param {*} state - Raw state value
 * @returns {0|1|null} - Normalized state, or null if invalid
 */
function _normalizeControlState(state) {
    if (state === 0 || state === '0') return 0;
    if (state === 1 || state === '1') return 1;
    return null;
}

/**
 * Creates junction dot circles at the defined split/merge points.
 */
function _initJunctions() {
    if (!junctionGroup) return;

    for (const junction of JUNCTION_DEFS) {
        junctionGroup.add(new Konva.Circle({
            id: junction.id,
            x: junction.x,
            y: junction.y,
            ...JUNCTION_STYLE,
            listening: false,
        }));
    }
}
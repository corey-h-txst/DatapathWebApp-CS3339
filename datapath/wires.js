/**
 * wires.js
 *
 * Builds and manages the datapath wire layer plus animated signal overlays.
 * Instruction steps can reference wires by unique id and declare whether
 * each wire should be active, animated, and which direction the pulse moves.
 */

import { getAnimationLayer, getMainLayer } from './canvas.js';

const WIRE_STYLES = {
    permanent: {
        idle: { stroke: '#45556a', opacity: 0.55, strokeWidth: 6 },
        active: { stroke: '#f8fafc', opacity: 1, strokeWidth: 7 },
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

const JUNCTION_STYLE = {
    radius: 9,
    fill: '#e2e8f0',
    stroke: '#0f172a',
    strokeWidth: 2,
    opacity: 0.95,
};

// Wire definitions include the wire type and the points for the line segments. Points are in the format [x1, y1, x2, y2, ..., xn, yn]
const WIRE_DEFS = {
    'pc-to-instruction-mem': {
        type: 'permanent',
        points: [140, 800, 220, 800, 220, 800, 275, 800],
    },
    'instruction-mem-to-split': {
        type: 'permanent',
        points: [675, 800, 760, 800],
    },
    'instruction-split-to-control': {
        type: 'permanent',
        points: [760, 800, 760, 340, 800, 340],
    },
    'instruction-split-to-reg-file-read-1': {
        type: 'permanent',
        points: [760, 800, 760, 720, 900, 720],
    },
    'instruction-split-to-reg-file-read-2': {
        type: 'permanent',
        points: [760, 800, 760, 760, 820, 760, 900, 760],
    },
    'instruction-read-2-to-mux-reg-dst': {
        type: 'permanent',
        points: [820, 760, 820, 820, 840, 820],
    },
    'instruction-split-to-mux-reg-dst': {
        type: 'permanent',
        points: [760, 800, 760, 900, 840, 900],
    },
    'instruction-split-to-sign-ext': {
        type: 'permanent',
        points: [760, 800, 760, 1160, 1100, 1160],
    },
    'control-to-reg-file': {
        type: 'control',
        points: [],
    },
    'control-to-mux-reg-dst': {
        type: 'control',
        points: [],
    },
    'control-to-mux-alu-src': {
        type: 'control',
        points: [],
    },
    'control-to-alu-control': {
        type: 'control',
        points: [],
    },
    'control-to-data-mem': {
        type: 'control',
        points: [],
    },
    'control-to-mux-mem-to-reg': {
        type: 'control',
        points: [],
    },
    'reg-file-read-1-to-alu': {
        type: 'permanent',
        points: [1300, 720, 1380, 720, 1380, 720, 1500, 720],
    },
    'reg-file-read-2-to-split': {
        type: 'permanent',
        points: [1300, 920, 1340, 920],
    },
    'read-data-2-split-to-mux-alu-src': {
        type: 'permanent',
        points: [1340, 920, 1340, 860, 1420, 860],
    },
    'read-data-2-split-to-data-mem': {
        type: 'permanent',
        points: [1340, 920, 1340, 980, 1650, 980],
    },
    'sign-ext-to-split': {
        type: 'permanent',
        points: [1220, 1160, 1380, 1160, 1380, 920],
    },
    'sign-ext-split-to-mux-alu-src': {
        type: 'permanent',
        points: [1380, 920, 1420, 920],
    },
    'sign-ext-split-to-shift-left-2': {
        type: 'permanent',
        points: [1380, 920, 1380, 310, 1400, 310],
    },
    'mux-alu-src-to-alu': {
        type: 'permanent',
        points: [1440, 890, 1470, 890, 1470, 890, 1500, 890],
    },
    'alu-control-to-alu': {
        type: 'control',
        points: [],
    },
    'alu-to-result-split': {
        type: 'permanent',
        points: [1555, 800, 1605, 800],
    },
    'alu-result-split-to-data-mem': {
        type: 'permanent',
        points: [1605, 800, 1650, 800],
    },
    'alu-result-split-to-mux-mem-to-reg': {
        type: 'permanent',
        points: [1605, 800, 1605, 1020, 2100, 1020, 2100, 840, 2150, 840],
    },
    'data-mem-to-mux-mem-to-reg': {
        type: 'permanent',
        points: [2050, 800, 2100, 800, 2100, 800, 2150, 800],
    },
    'mux-mem-to-reg-to-reg-file': {
        type: 'permanent',
        points: [2190, 820, 2260, 820, 2260, 1050, 850, 1050, 850, 950, 900, 950],
    },
    'mux-reg-dst-to-reg-file-write-reg': {
        type: 'permanent',
        points: [880, 850, 900, 850],
    },
    'pc-to-adder-pc': {
        type: 'permanent',
        points: [90, 700, 90, 520, 220, 520, 220, 180, 400, 180],
    },
    'adder-pc-to-split': {
        type: 'permanent',
        points: [455, 225, 1480, 225],
    },
    'adder-pc-split-to-adder-branch': {
        type: 'permanent',
        points: [1480, 225, 1540, 225, 1540, 145, 1650, 145],
    },
    'shift-left-2-to-adder-branch': {
        type: 'permanent',
        points: [1520, 310, 1580, 310, 1580, 250, 1650, 250],
    },
    'adder-pc-split-to-mux-pc-src': {
        type: 'permanent',
        points: [1480, 225, 1480, 40, 1800, 40, 1800, 120, 1850, 120],
    },
    'adder-branch-to-mux-pc-src': {
        type: 'permanent',
        points: [1705, 205, 1850, 205],
    },
    'mux-pc-src-to-pc': {
        type: 'permanent',
        points: [1890, 145, 1930, 145, 1930, -10, 20, -10, 20, 750, 40, 750],
    },
};

const JUNCTION_DEFS = [
    { id: 'instruction-split-root', x: 760, y: 800 },
    { id: 'instruction-read-2-split', x: 820, y: 760 },
    { id: 'read-data-2-split', x: 1340, y: 920 },
    { id: 'sign-ext-split', x: 1380, y: 920 },
    { id: 'alu-result-split', x: 1605, y: 800 },
    { id: 'adder-pc-split', x: 1480, y: 225 },
];

const wireNodes = new Map();
let baseGroup = null;
let animationGroup = null;
let junctionGroup = null;

/**
 * Creates all wire nodes once and applies their default styles.
 */
export function initWires() {
    const mainLayer = getMainLayer();
    const animationLayer = getAnimationLayer();

    if (!mainLayer || !animationLayer || baseGroup) return;

    baseGroup = new Konva.Group({ id: 'wire-base-group', listening: false });
    animationGroup = new Konva.Group({ id: 'wire-animation-group', listening: false });
    junctionGroup = new Konva.Group({ id: 'wire-junction-group', listening: false });

    for (const [id, def] of Object.entries(WIRE_DEFS)) {
        const baseLine = new Konva.Line({
            id,
            points: def.points,
            lineCap: 'round',
            lineJoin: 'round',
            listening: false,
        });

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

    mainLayer.add(baseGroup);
    _initJunctions();
    mainLayer.add(junctionGroup);
    animationLayer.add(animationGroup);

    baseGroup.moveToBottom();
    resetWires();
}

/**
 * Applies a step's wire declarations.
 *
 * Step schema:
 *   wires: [
 *     { id: 'pc-to-instruction-mem', animate: true, direction: 'forward' },
 *     { id: 'control-to-mux-reg-dst', state: 1, animate: true }
 *   ]
 *
 * @param {{ wires?: Array<{id: string, state?: 0|1|'0'|'1', animate?: boolean, direction?: 'forward'|'reverse'}> } | null} step
 */
export function applyWireStep(step) {
    resetWires();

    for (const wireState of step?.wires ?? []) {
        if (!wireState?.id) continue;
        setWireState(wireState.id, wireState);
    }
}

/**
 * Resets every wire back to its default appearance.
 */
export function resetWires() {
    for (const id of wireNodes.keys()) {
        _stopAnimation(id);
        _applyDefaultStyle(id);
    }

    getMainLayer()?.batchDraw();
    getAnimationLayer()?.batchDraw();
}

/**
 * Updates a single wire's appearance and animation.
 *
 * @param {string} id
 * @param {{ state?: 0|1|'0'|'1', animate?: boolean, direction?: 'forward'|'reverse' }} state
 */
export function setWireState(id, state = {}) {
    const entry = wireNodes.get(id);
    if (!entry) return;

    _stopAnimation(id);

    if (entry.def.type === 'control') {
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
        entry.baseLine.setAttrs(WIRE_STYLES.permanent.active);

        if (state.animate) {
            _startAnimation(id, WIRE_STYLES.permanent.animation, state.direction);
        }
    }

    getMainLayer()?.batchDraw();
    getAnimationLayer()?.batchDraw();
}

/**
 * Returns every available wire id.
 *
 * @returns {string[]}
 */
export function getWireIds() {
    return Object.keys(WIRE_DEFS);
}

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

function _normalizeControlState(state) {
    if (state === 0 || state === '0') return 0;
    if (state === 1 || state === '1') return 1;
    return null;
}

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

/**
 * components.js
 *
 * Defines, draws, and manages all datapath components on the Konva.js canvas.
 * Each component is registered in the COMPONENTS registry with its position,
 * shape type, category, and display labels. The initComponents() function
 * iterates the registry and builds Konva groups for each one.
 *
 * Shape types:
 *   - 'rect'   : Rectangle (PC, Instruction Memory, Register File, Data Memory)
 *   - 'circle' : Circle (Control, Sign Extend, Shift Left 2, ALU Control)
 *   - 'alu'    : Chevron shape (main ALU, Adders)
 *   - 'mux'    : Pill-shaped rounded rect (all multiplexers)
 */

import { getMainLayer, getStage } from "./canvas.js";
import { showPopup, hidePopup } from "../ui/popup.js";

// ── Shape dimension constants ────────────────────────────────────────────────

const CIRCLE_RADIUS = 60;
const CIRCLE_DIAMETER = CIRCLE_RADIUS * 2;
const ALU_WIDTH = 45;
const ALU_HEIGHT = 250;
const MUX_WIDTH = 40;
const MUX_HEIGHT = 140;
const AND_WIDTH = 45;
const AND_HEIGHT = 80;

// ── Component Registry ───────────────────────────────────────────────────────

/**
 * @typedef {Object} ComponentDef
 * @property {string}  label       - Display name shown in the popup title
 * @property {string}  canvasLabel - Short label drawn on the canvas shape (supports '\n')
 * @property {string}  shape       - Drawing style: 'rect' | 'circle' | 'mux' | 'alu'
 * @property {string}  category    - Component category, determines stroke color
 * @property {number}  x           - X position on the canvas
 * @property {number}  y           - Y position on the canvas
 * @property {number}  [width]     - Width (required for 'rect' shape)
 * @property {number}  [height]    - Height (required for 'rect' shape)
 * @property {string}  info        - Description shown in the popup body
 */

/**
 * Registry of all datapath components.
 * Each key is a unique component id used to reference the component
 * from instruction steps, wire definitions, and camera animations.
 *
 * @type {Object<string, ComponentDef>}
 */
const COMPONENTS = {
    'pc': {
        label: 'Program Counter (PC)',
        canvasLabel: 'PC',
        shape: 'rect',
        category: 'register',
        x: 40, y: 700, width: 100, height: 200,
        info: 'The Program Counter stores the address of the next instruction to fetch. During normal execution it usually moves to PC + 4, but for a branch or jump it can be updated with a different target address.',
    },

    'instruction-mem': {
        label: 'Instruction Memory',
        canvasLabel: 'Instruction\nMemory',
        shape: 'rect',
        category: 'memory',
        x: 275, y: 600, width: 400, height: 400,
        info: 'Instruction memory uses the address from the PC to fetch the current instruction. Its output is the 32-bit instruction, which is then split into fields such as opcode, rs, rt, rd, funct, and immediate bits.',
    },

    'mux-reg-dst': {
        label: 'Multiplexer (MUX) - Register Destination',
        canvasLabel: 'M\nU\nX',
        shape: 'mux',
        category: 'mux',
        x: 840, y: 780,
        info: 'This multiplexer chooses which register number will be used as the destination for write-back. In a typical single-cycle datapath, it selects between rt for I-type instructions like loads and rd for R-type ALU instructions.',
    },

    'reg-file': {
        label: 'Register File',
        canvasLabel: 'Register\nFile',
        shape: 'rect',
        category: 'register',
        x: 900, y: 600, width: 400, height: 400,
        info: 'The register file stores the CPU’s general-purpose registers. It can read two source registers at the same time and write one destination register during write-back.',
    },

    'sign-ext': {
        label: 'Sign Extend',
        canvasLabel: 'Sign\nExtend',
        shape: 'circle',
        category: 'logic',
        x: 1100, y: 1100,
        info: 'The sign-extend unit takes a 16-bit immediate value and expands it to 32 bits while preserving its sign. This is important for instructions that use offsets or immediate operands, especially when the value can be negative.',
    },

    'mux-alu-src': {
        label: 'Multiplexer (MUX) - ALU Source',
        canvasLabel: 'M\nU\nX',
        shape: 'mux',
        category: 'mux',
        x: 1420, y: 820,
        info: 'This multiplexer chooses the ALU’s second input. It selects either the second register value or the sign-extended immediate, depending on the instruction type.',
    },

    'alu': {
        label: 'Arithmetic Logic Unit (ALU)',
        canvasLabel: 'A\nL\nU',
        shape: 'alu',
        category: 'alu',
        x: 1500, y: 675,
        info: 'The ALU performs arithmetic and logic operations such as add, subtract, AND, OR, and set-on-less-than. It is also used to calculate effective memory addresses and compare register values for branches.',
    },

    'alu-control': {
        label: 'ALU Control',
        canvasLabel: 'ALU\nControl',
        shape: 'circle',
        category: 'control',
        x: 1440, y: 1150,
        info: 'ALU Control tells the ALU exactly which operation to perform. It combines the high-level ALUOp signal from the main control unit with instruction-specific function bits when needed.',
    },

    'data-mem': {
        label: 'Data Memory',
        canvasLabel: 'Data\nMemory',
        shape: 'rect',
        category: 'memory',
        x: 1650, y: 600, width: 400, height: 400,
        info: 'Data memory is used by load and store instructions. The ALU provides the memory address, stores write register data into memory, and loads read data out so it can be written back to a register.',
    },

    'mux-mem-to-reg': {
        label: 'Multiplexer (MUX) - Memory to Register',
        canvasLabel: 'M\nU\nX',
        shape: 'mux',
        category: 'mux',
        x: 2150, y: 750,
        info: 'This multiplexer chooses what value will be written back into the register file. It usually selects between the ALU result and the value read from data memory.',
    },

    'control': {
        label: 'Control',
        canvasLabel: 'Control',
        shape: 'circle',
        category: 'control',
        x: 800, y: 280,
        info: 'The main control unit reads the instruction opcode and generates the control signals for the datapath. These signals decide things like register writes, memory reads or writes, ALU behavior, and multiplexer selections.',
    },

    'adder-pc': {
        label: 'Add',
        canvasLabel: 'A\nD\nD',
        shape: 'alu',
        category: 'alu',
        x: 400, y: 100,
        info: 'This adder computes PC + 4, which is the address of the next sequential instruction. Since each instruction is 4 bytes long, adding 4 moves to the next instruction in memory.',
    },

    'shift-left-2': {
        label: 'Shift\nLeft 2',
        canvasLabel: 'Shift',
        shape: 'circle',
        category: 'logic',
        x: 1400, y: 250,
        info: 'This unit shifts the branch offset left by 2 bits. That converts the word offset into a byte offset so it matches instruction address alignment.',
    },

    'adder-branch': {
        label: 'Add',
        canvasLabel: 'A\nD\nD',
        shape: 'alu',
        category: 'alu',
        x: 1650, y: 80,
        info: 'This adder computes the branch target address by adding PC + 4 to the shifted branch offset. If the branch condition is true, that result becomes the next PC value.',
    },

    'mux-pc-src': {
        label: 'Multiplexer (MUX) - PC Source',
        canvasLabel: 'M\nU\nX',
        shape: 'mux',
        category: 'mux',
        x: 1850, y: 110,
        info: 'This multiplexer chooses the next value loaded into the Program Counter. It selects between the normal sequential path and an alternate path such as a branch target or jump target.',
    },

    'and-gate': {
        label: 'AND Gate',
        canvasLabel: 'AND',
        shape: 'and',
        category: 'control',
        x: 1550, y: 440,
        info: 'The AND Gate combines the Branch control signal with the ALU Zero flag. If both are active (1), the gate outputs 1 to select the branch target in the PC Source multiplexer, causing a taken branch.',
    },
}
// ── Initialization ───────────────────────────────────────────────────────────

/**
 * Draws all components onto the main Konva layer and wires up
 * hover/click interactions. Must be called once after initCanvas().
 */
export function initComponents() {
    const layer = getMainLayer();

    for (const [id, def] of Object.entries(COMPONENTS)) {
        const group = _buildGroup(id, def);
        layer.add(group);
    }

    layer.batchDraw();
    _setupGlobalDismiss();
}

// ── Registry accessors ───────────────────────────────────────────────────────

/**
 * Returns the registry definition for a component by its id.
 *
 * @param {string} id - Component id (e.g. 'pc', 'alu', 'control')
 * @returns {ComponentDef|null}
 */
export function getComponent(id) {
    return COMPONENTS[id] ?? null;
}

/**
 * Returns the drawing bounds for a component on the canvas.
 * Bounds vary by shape type (rect uses def.width/height, circle uses CIRCLE_DIAMETER, etc.).
 *
 * @param {string} id - Component id
 * @returns {{ x: number, y: number, width: number, height: number } | null}
 */
export function getComponentBounds(id) {
    const def = getComponent(id);
    if (!def) return null;

    switch (def.shape) {
        case 'rect':
            return { x: def.x, y: def.y, width: def.width, height: def.height };
        case 'circle':
            return { x: def.x, y: def.y, width: CIRCLE_DIAMETER, height: CIRCLE_DIAMETER };
        case 'alu':
            return { x: def.x, y: def.y, width: ALU_WIDTH, height: ALU_HEIGHT };
        case 'mux':
            return { x: def.x, y: def.y, width: MUX_WIDTH, height: MUX_HEIGHT };
        case 'and':
            return { x: def.x, y: def.y, width: AND_WIDTH, height: AND_HEIGHT };
        default:
            return {
                x: def.x,
                y: def.y,
                width: def.width ?? 80,
                height: def.height ?? 80,
            };
    }
}

/**
 * Returns the visual center point for a component.
 * Used by the camera system to center the view on a component.
 *
 * @param {string} id - Component id
 * @returns {{ x: number, y: number } | null}
 */
export function getComponentCenter(id) {
    const bounds = getComponentBounds(id);
    if (!bounds) return null;

    return {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
    };
}

/**
 * Returns all component ids that belong to a given category.
 * Useful for querying groups of related components (e.g. all 'control' components).
 *
 * @param {string} category - Category name (e.g. 'control', 'memory', 'alu', 'register', 'mux', 'logic')
 * @returns {string[]} - Array of matching component ids
 */
export function getComponentsByCategory(category) {
    return Object.entries(COMPONENTS)
        .filter(([, def]) => def.category === category)
        .map(([id]) => id);
}

// ── Group building ───────────────────────────────────────────────────────────

/**
 * Builds a Konva.Group for a single component, adds the correct shape
 * and label, then attaches hover and click interactions.
 *
 * @param {string} id  - Registry key (used as the Konva group id)
 * @param {ComponentDef} def - Component definition from COMPONENTS
 * @returns {Konva.Group}
 */
function _buildGroup(id, def) {
    const group = new Konva.Group({ id, x: def.x, y: def.y });

    // Add the appropriate shape based on the component's shape type
    switch (def.shape) {
        case 'rect':
            if (id === 'reg-file') _addRegisterFile(group, def);
            else if (id === 'instruction-mem') _addInstructionMemory(group, def);
            else if (id === 'data-mem') _addDataMemory(group, def);
            else _addRect(group, def);
            break;
        case 'circle':
            _addCircle(group, def);
            break;
        case 'alu':
            _addALU(group, def);
            break;
        case 'mux':
            _addMUX(group, def);
            break;
        case 'and':
            _addANDGate(group, def);
            break;
    }

    _attachInteraction(group, id);
    return group;
}

// ── Interaction handlers ─────────────────────────────────────────────────────

/**
 * Attaches mouseenter, mouseleave, and click/tap handlers to a component group.
 * Clicking a component shows the info popup via popup.js.
 *
 * @param {Konva.Group} group - The component's Konva group
 * @param {string} id         - Component id (for debugging)
 */
function _attachInteraction(group, id) {
    group.on('mouseenter', () => {
        getStage().container().style.cursor = 'pointer';
    });

    group.on('mouseleave', () => {
        getStage().container().style.cursor = 'default';
    });

    group.on('click tap', (e) => {
        e.cancelBubble = true;
        showPopup(COMPONENTS[id], e.evt);
    });
}

// ── Label helper ─────────────────────────────────────────────────────────────

/**
 * Creates a centered Konva.Text node for use inside a component shape.
 * All shape builders route through this function for consistent styling.
 * Supports multi-line text via '\n' in the text string.
 *
 * @param {string} text     - Label text (may contain '\n' for line breaks)
 * @param {number} x        - X position of the text bounding box
 * @param {number} y        - Y position of the text bounding box
 * @param {number} width    - Width of the text bounding box
 * @param {number} height   - Height of the text bounding box
 * @param {number} fontSize - Font size in pixels
 * @returns {Konva.Text}
 */

function _themeForCategory(category) {
    const themes = {
        control: {
            stroke: '#ff6b6b',
            fillTop: '#2b1418',
            fillBottom: '#13090c',
            glow: 'rgba(255, 107, 107, 0.28)',
        },
        memory: {
            stroke: '#4da3ff',
            fillTop: '#12243a',
            fillBottom: '#08111d',
            glow: 'rgba(77, 163, 255, 0.28)',
        },
        alu: {
            stroke: '#4cd964',
            fillTop: '#102917',
            fillBottom: '#08130b',
            glow: 'rgba(76, 217, 100, 0.26)',
        },
        register: {
            stroke: '#ffb347',
            fillTop: '#2d2110',
            fillBottom: '#140c06',
            glow: 'rgba(255, 179, 71, 0.28)',
        },
        mux: {
            stroke: '#c084fc',
            fillTop: '#23132f',
            fillBottom: '#100819',
            glow: 'rgba(192, 132, 252, 0.28)',
        },
        logic: {
            stroke: '#2dd4bf',
            fillTop: '#0d2524',
            fillBottom: '#071312',
            glow: 'rgba(45, 212, 191, 0.28)',
        },
    };

    return themes[category] ?? {
        stroke: '#94a3b8',
        fillTop: '#1f2937',
        fillBottom: '#0f172a',
        glow: 'rgba(148, 163, 184, 0.22)',
    };
}
function _makeLabel(text, x, y, width, height, fontSize=34) {
    const textHeight = 14;
    const lineHeight = 1;
    return new Konva.Text({
        x,
        y: y + (height - textHeight) / 2,
        width,
        text,
        fontSize,
        fontFamily: 'monospace',
        fontStyle: 'bold',
        fill: '#f8fafc',
        align: 'center',
        lineHeight,
    });
}

function _makePortLabel(text, x, y, width, height, align = 'left') {
    return new Konva.Text({
        x,
        y,
        width,
        height,
        text,
        fontSize: 22,
        fontFamily: 'monospace',
        fontStyle: 'bold',
        fill: '#f8fafc',
        align,
        verticalAlign: 'middle',
        lineHeight: 1.0,
    });
}

function _addInnerBorder(group, width, height, radius = 12) {
    group.add(new Konva.Rect({
        x: 8,
        y: 8,
        width: Math.max(0, width - 16),
        height: Math.max(0, height - 16),
        cornerRadius: Math.max(0, radius - 3),
        stroke: 'rgba(255,255,255,0.08)',
        strokeWidth: 1,
        listening: false,
    }));
}

function _addRegisterFile(group, def) {
    _addStyledBox(group, def);

    // Main center label
    group.add(_makeLabel('Register\nFile', 110, 110, 180, 140, 35));

    // Left-side labels
    group.add(_makePortLabel('Read\nReg 1', 10, 85, 95, 60, 'left'));
    group.add(_makePortLabel('Read\nReg 2', 10, 140, 95, 60, 'left'));
    group.add(_makePortLabel('Write\nReg', 10, 215, 95, 60, 'left'));

    // Right-side labels
    group.add(_makePortLabel('Read\nData 1', 295, 90, 95, 60, 'right'));
    group.add(_makePortLabel('Read\nData 2', 295, 300, 95, 60, 'right'));

    // Bottom label
    group.add(_makePortLabel('Write\nData', 10, 320, 160, 55, 'left'));
}

function _addInstructionMemory(group, def) {
    _addStyledBox(group, def);

    // Main center label
    group.add(_makeLabel('Instruction\nMemory', 90, 40, 220, 90, 35));

    // Left-side label
    group.add(_makePortLabel('Read\nAddress', 10, 170, 85, 60, 'left'));

    // Right-side label
    group.add(_makePortLabel('Instruction\n[31-0]', 255, 170, 135, 80, 'right'));
}

function _addDataMemory(group, def) {
    _addStyledBox(group, def);

    // Main center label
    group.add(_makeLabel('Data\nMemory', 150, 45, 190, 90, 35));

    // Left-side labels
    group.add(_makePortLabel('Address', 10, 180, 95, 35, 'left'));
    group.add(_makePortLabel('Write Data', 10, 350, 150, 40, 'left'));

    // Right-side label
    group.add(_makePortLabel('Read Data', 255, 175, 125, 40, 'right'));
}

function _addStyledBox(group, def) {
    const theme = _themeForCategory(def.category);

    group.add(new Konva.Rect({
        width: def.width,
        height: def.height,
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: 0, y: def.height },
        fillLinearGradientColorStops: [
            0, theme.fillTop,
            1, theme.fillBottom,
        ],
        stroke: theme.stroke,
        strokeWidth: 3,
        cornerRadius: 12,
    }));

    _addInnerBorder(group, def.width, def.height, 12);
}

function _addPortStub(group, x1, y1, x2, y2) {
    group.add(new Konva.Line({
        points: [x1, y1, x2, y2],
        stroke: 'white',
        strokeWidth: 2,
        lineCap: 'round',
    }));
}

/**
 * Rectangular Component — used for PC, Instruction Memory,
 * Register File, and Data Memory.
 *
 * @param {Konva.Group} group - Group to add shapes into
 * @param {ComponentDef} def  - Component definition
 */
function _addRect(group, def) {
    _addStyledBox(group, def);
    group.add(_makeLabel(def.canvasLabel, 0, 0, def.width, def.height));
}

/**
 * Circular Component — used for Control, Sign Extend,
 * Shift Left 2, and ALU Control.
 *
 * @param {Konva.Group} group - Group to add shapes into
 * @param {ComponentDef} def  - Component definition
 */
function _addCircle(group, def) {
    const radius = 60;
    const diameter = radius * 2;
    const theme = _themeForCategory(def.category);

    group.add(new Konva.Circle({
        x: radius,
        y: radius,
        radius: radius,
        fillRadialGradientStartPoint: { x: radius - 18, y: radius - 18 },
        fillRadialGradientStartRadius: 8,
        fillRadialGradientEndPoint: { x: radius, y: radius },
        fillRadialGradientEndRadius: radius,
        fillRadialGradientColorStops: [
            0, theme.fillTop,
            1, theme.fillBottom,
        ],
        stroke: theme.stroke,
        strokeWidth: 3,
    }));

    group.add(new Konva.Circle({
        x: radius,
        y: radius,
        radius: radius - 8,
        stroke: 'rgba(255,255,255,0.08)',
        strokeWidth: 1,
        listening: false,
    }));

    group.add(_makeLabel(def.canvasLabel, 0, -15, CIRCLE_DIAMETER, CIRCLE_DIAMETER, 24));
}

/**
 * ALU Chevron Component — used for the main ALU and Adders.
 * Draws a custom polygon shape resembling an ALU symbol.
 *
 * @param {Konva.Group} group - Group to add shapes into
 * @param {ComponentDef} def  - Component definition
 */
function _addALU(group, def) {
    const theme = _themeForCategory(def.category);

    group.add(new Konva.Line({
        points: [0, 0, ALU_WIDTH, 70, ALU_WIDTH, 180, 0, ALU_HEIGHT, 0, 150, 15, 125, 0, 100],
        closed: true,
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: 55, y: 250 },
        fillLinearGradientColorStops: [
            0, theme.fillTop,
            1, theme.fillBottom,
        ],
        stroke: theme.stroke,
        strokeWidth: 3,
    }));

    group.add(new Konva.Line({
        points: [4, 10, 47, 72, 47, 176, 4, 238, 4, 152, 15, 125, 4, 98],
        closed: true,
        stroke: 'rgba(255,255,255,0.08)',
        strokeWidth: 1,
        listening: false,
    }));
    group.add(_makeLabel(def.canvasLabel, 5, -35, ALU_WIDTH, ALU_HEIGHT, 30));
}

/**
 * MUX Pill-Shaped Container — used for all multiplexers.
 * Draws a rounded rectangle with corner radius equal to half the width,
 * creating a pill/capsule shape.
 *
 * @param {Konva.Group} group - Group to add shapes into
 * @param {ComponentDef} def  - Component definition
 */
function _addMUX(group, def) {
    const height = 140;
    const width = 40;
    const theme = _themeForCategory(def.category);

    group.add(new Konva.Rect({
        x: 0, y: 0,
        width: width,
        height: height,
        cornerRadius: width / 2,
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: 0, y: height },
        fillLinearGradientColorStops: [
            0, theme.fillTop,
            1, theme.fillBottom,
        ],
        stroke: theme.stroke,
        strokeWidth: 3,
    }));

    group.add(new Konva.Rect({
        x: 5, y: 5,
        width: width - 10,
        height: height - 10,
        cornerRadius: (width - 10) / 2,
        stroke: 'rgba(255,255,255,0.08)',
        strokeWidth: 1,
        listening: false,
    }));

    group.add(_makeLabel(def.canvasLabel, 0, -35, MUX_WIDTH, MUX_HEIGHT, 30));
}

/**
 * AND Gate Component — rectangle with a convex semicircular dome on the right side.
 * Uses a custom Konva.Shape with an actual arc for the semicircular dome.
 * Hidden by default, shown when branch control is active.
 *
 * @param {Konva.Group} group - Group to add shapes into
 * @param {ComponentDef} def  - Component definition
 */
function _addANDGate(group, def) {
    const theme = _themeForCategory(def.category);
    const w = AND_WIDTH;
    const h = AND_HEIGHT;
    const halfH = h / 2;
    const domeR = halfH; // dome radius = half height for a proper semicircle

    group.add(new Konva.Shape({
        sceneFunc: function (context, shape) {
            context.beginPath();
            // Start at top-left corner
            context.moveTo(0, 0);
            // Top edge (left to right) — goes to the top of the dome arc
            context.lineTo(w, 0);
            // Convex semicircular dome on the right (top to bottom)
            // Arc center at (w, halfH), radius = halfH
            // Start angle = -π/2 (top), end angle = π/2 (bottom)
            context.arc(w, halfH, domeR, -Math.PI / 2, Math.PI / 2, false);
            // Bottom edge (right to left)
            context.lineTo(0, h);
            // Left edge (bottom to top)
            context.lineTo(0, 0);
            context.closePath();
            context.fillStrokeShape(shape);
        },
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: 0, y: h },
        fillLinearGradientColorStops: [
            0, theme.fillTop,
            1, theme.fillBottom,
        ],
        stroke: theme.stroke,
        strokeWidth: 3,
    }));

    // Inner border (inset version of the same shape)
    group.add(new Konva.Shape({
        sceneFunc: function (context, shape) {
            const inset = 5;
            const innerDomeR = domeR - inset;
            context.beginPath();
            context.moveTo(inset, inset);
            context.lineTo(w - inset, inset);
            context.arc(w - inset, halfH, innerDomeR, -Math.PI / 2, Math.PI / 2, false);
            context.lineTo(inset, h - inset);
            context.lineTo(inset, inset);
            context.closePath();
            context.fillStrokeShape(shape);
        },
        stroke: 'rgba(255,255,255,0.08)',
        strokeWidth: 1,
        listening: false,
    }));

    // Label — centered across the full visual width of the AND Gate (rect + dome)
    group.add(_makeLabel(def.canvasLabel, 0, 0, AND_WIDTH + AND_HEIGHT / 2, AND_HEIGHT, 24));

    // Start hidden — will be shown when control wires activate it
    group.visible(false);
}

/**
 * Shows or hides the AND Gate component on the canvas.
 * The AND Gate is hidden by default and only appears when
 * branch-related control wires are active.
 *
 * @param {boolean} visible - Whether the AND Gate should be visible
 */
export function setAndGateVisible(visible) {
    const layer = getMainLayer();
    if (!layer) return;

    const andGateGroup = layer.findOne('#and-gate');
    if (andGateGroup) {
        andGateGroup.visible(visible);
        layer.batchDraw();
    }
}

// ── Color mapping ────────────────────────────────────────────────────────────

/**
 * Maps a component's category to its corresponding stroke (outline) color.
 * Each category has a distinct color for visual differentiation on the canvas.
 *
 * @param {string} category - Component category
 * @returns {string} - CSS color string
 */
function _strokeForCategory(category) {
    return _themeForCategory(category).stroke;
}

// ── Global dismiss ───────────────────────────────────────────────────────────

/**
 * Clicking anywhere outside a component on the stage dismisses the popup.
 * This is attached to the stage's click/tap event with a single handler.
 */
function _setupGlobalDismiss() {
    getStage().on('click tap', (e) => hidePopup());
}
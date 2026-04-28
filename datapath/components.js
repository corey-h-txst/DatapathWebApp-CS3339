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
const ALU_WIDTH = 55;
const ALU_HEIGHT = 250;
const MUX_WIDTH = 40;
const MUX_HEIGHT = 140;

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
    'pc' : {
        label: 'Program Counter (PC)',
        canvasLabel: 'PC',
        shape: 'rect',
        category: 'register',
        x: 40, y: 700, width: 100, height: 200,
        info: 'placeholder',
    },

    'instruction-mem' : {
        label: 'Instruction Memory',
        canvasLabel: 'Instruction\nMemory',
        shape: 'rect',
        category: 'memory',
        x: 275, y: 600, width: 400, height: 400,
        info: 'placeholder',
    },

    'mux-reg-dst' : {
        label: 'Multiplexer (MUX) - Register Destination',
        canvasLabel: 'M\nU\nX',
        shape: 'mux',
        category: 'mux',
        x: 840, y: 780,
        info: 'placeholder',
    },

    'reg-file' : {
        label: 'Register File',
        canvasLabel: 'Register\nFile',
        shape: 'rect',
        category: 'register',
        x: 900, y: 600, width: 400, height: 400,
        info: 'placeholder',
    },

    'sign-ext' : {
        label: 'Sign Extend',
        canvasLabel: 'Sign\nExtend',
        shape: 'circle',
        category: 'logic',
        x: 1100, y: 1100,
        info: 'placeholder',
    },

    'mux-alu-src' : {
        label: 'Multiplexer (MUX) - ALU Source',
        canvasLabel: 'M\nU\nX',
        shape: 'mux',
        category: 'mux',
        x: 1420, y: 820,
        info: 'placeholder',
    },

    'alu' : {
        label: 'Arithmetic Logic Unit (ALU)',
        canvasLabel: 'A\nL\nU',
        shape: 'alu',
        category: 'alu',
        x: 1500, y: 675,
        info: 'placeholder',
    },

    'alu-control' : {
        label: 'ALU Control',
        canvasLabel: 'ALU\nControl',
        shape: 'circle',
        category: 'control',
        x: 1440, y: 1150,
        info: 'placeholder',
    },

    'data-mem' : {
        label: 'Data Memory',
        canvasLabel: 'Data\nMemory',
        shape: 'rect',
        category: 'memory',
        x: 1650, y: 600, width: 400, height: 400,
        info: 'placeholder',
    },

    'mux-mem-to-reg' : {
        label: 'Multiplexer (MUX) - Memory to Register',
        canvasLabel: 'M\nU\nX',
        shape: 'mux',
        category: 'mux',
        x: 2150, y: 750,
        info: 'placeholder',
    },

    'control' : {
        label: 'Control',
        canvasLabel: 'Control',
        shape: 'circle',
        category: 'control',
        x: 800, y: 280,
        info: 'placeholder',
    },

    'adder-pc' : {
        label: 'Add',
        canvasLabel: 'A\nD\nD',
        shape: 'alu',
        category: 'alu',
        x: 400, y: 100,
        info: 'placeholder',
    },

    'shift-left-2' : {
        label: 'Shift\nLeft 2',
        canvasLabel: 'Shift',
        shape: 'circle',
        category: 'logic',
        x: 1400, y: 250,
        info: 'placeholder',
    },

    'adder-branch' : {
        label: 'Add',
        canvasLabel: 'A\nD\nD',
        shape: 'alu',
        category: 'alu',
        x: 1650, y: 80,
        info: 'placeholder',
    },

    'mux-pc-src' : {
        label: 'Multiplexer (MUX) - PC Source',
        canvasLabel: 'M\nU\nX',
        shape: 'mux',
        category: 'mux',
        x: 1850, y: 110,
        info: 'placeholder',
    },
};

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
        case 'rect':   _addRect(group, def);   break;
        case 'circle': _addCircle(group, def); break;
        case 'alu':    _addALU(group, def);    break;
        case 'mux':    _addMUX(group, def);    break;
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
function _makeLabel(text, x, y, width, height, fontSize = 34) {
    const lineCount = String(text).split('\n').length;
    const lineHeight = 1;
    const textHeight = lineCount * fontSize * lineHeight;

    return new Konva.Text({
        x,
        y: y + (height - textHeight) / 2,
        width,
        text,
        fontSize,
        fontFamily: 'monospace',
        fontStyle: 'bold',
        fill: 'white',
        align: 'center',
        lineHeight,
    });
}

// ── Shape builders ───────────────────────────────────────────────────────────

/**
 * Rectangular Component — used for PC, Instruction Memory,
 * Register File, and Data Memory.
 *
 * @param {Konva.Group} group - Group to add shapes into
 * @param {ComponentDef} def  - Component definition
 */
function _addRect(group, def) {
    group.add(new Konva.Rect({
        width: def.width,
        height: def.height,
        fill: '#0d0f14',
        stroke: _strokeForCategory(def.category),
        strokeWidth: 2,
        cornerRadius: 10,
    }));

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
    group.add(new Konva.Circle({
        x: CIRCLE_RADIUS,
        y: CIRCLE_RADIUS,
        radius: CIRCLE_RADIUS,
        fill: '#0d0f14',
        stroke: _strokeForCategory(def.category),
        strokeWidth: 2,
    }));

    group.add(_makeLabel(def.canvasLabel, 0, 0, CIRCLE_DIAMETER, CIRCLE_DIAMETER, 24));
}

/**
 * ALU Chevron Component — used for the main ALU and Adders.
 * Draws a custom polygon shape resembling an ALU symbol.
 *
 * @param {Konva.Group} group - Group to add shapes into
 * @param {ComponentDef} def  - Component definition
 */
function _addALU(group, def) {
    group.add(new Konva.Line({
        points: [0, 0, ALU_WIDTH, 70, ALU_WIDTH, 180, 0, ALU_HEIGHT, 0, 150, 15, 125, 0, 100],
        closed: true,
        fill: '#0d0f14',
        stroke: _strokeForCategory(def.category),
        strokeWidth: 2,
    }));
    group.add(_makeLabel(def.canvasLabel, 10, 0, ALU_WIDTH - 10, ALU_HEIGHT, 30));
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
    group.add(new Konva.Rect({
        x: 0, y: 0,
        width: MUX_WIDTH,
        height: MUX_HEIGHT,
        cornerRadius: MUX_WIDTH / 2,
        fill: '#0d0f14',
        stroke: _strokeForCategory(def.category),
        strokeWidth: 2,
    }));

    group.add(_makeLabel(def.canvasLabel, 0, 0, MUX_WIDTH, MUX_HEIGHT, 30));
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
    const colors = {
        control: 'red',
        memory: 'blue',
        alu: 'green',
        register: 'orange',
        mux: 'purple',
        logic: 'teal',
    };
    return colors[category] ?? 'black';
}

// ── Global dismiss ───────────────────────────────────────────────────────────

/**
 * Clicking anywhere outside a component on the stage dismisses the popup.
 * This is attached to the stage's click/tap event with a single handler.
 */
function _setupGlobalDismiss() {
    getStage().on('click tap', (e) => hidePopup());
}
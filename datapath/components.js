/**
 * components.js
 * 
 * Defines, draws, and manages all datapath components on the Konva.js canvas
 */

import { getMainLayer, getStage } from "./canvas.js";
import { showPopup, hidePopup } from "../ui/popup.js";

/**
 * Component Registry
 * 
 * Fields:
 *  label {string} - display name on popup
 *  shape {string} - drawing style: 'rect' | 'circle' | 'mux' | 'alu'
 *  category {string} - type of component, determines stroke (outline) color
 *  x, y {number} - coordinate position on canvas
 *  width, height - {number} - used by 'rect' shape only
 *  info {string} - description shown in the popup body
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
        x: 800, y: 780,
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
        x: 1100, y: 1070,
        info: 'placeholder',
    },

    'mux-alu-src' : {
        label: 'Multiplexer (MUX) - ALU Source',
        canvasLabel: 'M\nU\nX',
        shape: 'mux',
        category: 'mux',
        x: 1400, y: 820,
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
        x: 1500, y: 1050,
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
        x: 800, y: 250,
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

/**
 * Draws all components onto main Konva layer and wires interactions.
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

/**
 * Returns the registry definition for a component by its id.
 * 
 * @param {string} id 
 * @returns {object|null}
 */
export function getComponent(id) {
    return COMPONENTS[id] ?? null;
}

/**
 * Returns all components belonging to a given category.
 * 
 * @param {string} category 
 * @returns {string[]} - array of matching component ids
 */
export function getComponentsByCategory(category) {
    return Object.entries(COMPONENTS)
        .filter(([, def]) => def.category === category)
        .map(([id]) => id);
}

/**
 * Builds a Konva.Group for a single component, adds correct shape and label,
 * then attaches hover and click interactions
 * 
 * @param {string} id - registry key
 * @param {object} def - component definition from COMPONENTS
 * @returns 
 */
function _buildGroup(id, def) {
    const group = new Konva.Group({id, x: def.x, y: def.y});

    switch (def.shape) {
        case 'rect': _addRect(group, def); break;
        case 'circle': _addCircle(group, def); break;
        case 'alu': _addALU(group, def); break;
        case 'mux': _addMUX(group, def); break;
    }

    _attachInteraction(group, id);

    return group;
}

/**
 * Attaches mouseenter, mouseleave, and click/tap handler to a component group
 * 
 * @param {Konva.Group} group 
 * @param {string} id 
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

/**
 * Creates a center Konva.Text node for use inside a component shape (component label).
 * All shape builder route through this function for consistency.
 *
 * @param {string} text
 * @param {number} x 
 * @param {number} y 
 * @param {number} width
 * @param {number} height
 * @param {number} fontSize
 * @returns {Konva.Text}
 */
function _makeLabel(text, x, y, width, height, fontSize=34) {
    return new Konva.Text({
        x, y,
        width, height,
        text,
        fontSize,
        fontFamily: 'monospace',
        fontStyle: 'bold',
        fill: 'white',
        align: 'center',
    });
    label.position({
        x: x + (width - label.width()) / 2,
        y: y + (height - label.height()) / 2,
    });
    return label;
}

/**
 * Rectangular Component - used for PC, Instruction Memory,
 * Register File, and Data Memory
 * 
 * @param {Konva.Group} group - group to add shapes into
 * @param {object} def - component definition from COMPONENTS
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
 * Circular Component - used for Control, Sign Extend,
 * Shift Left 2, and ALU Control
 * 
 * @param {Konva.Group} group - group to add shapes into
 * @param {object} def - component definition from COMPONENTS
 */
function _addCircle(group, def) {
    const radius = 60; // Fixed radius for all circle components
    const diameter = radius * 2;

    group.add(new Konva.Circle({
        x: radius,
        y: radius,
        radius: radius,
        fill: '#0d0f14',
        stroke: _strokeForCategory(def.category),
        strokeWidth: 2,
    }));

    group.add(_makeLabel(def.canvasLabel, 0, 0, diameter, diameter, 24));
}

/**
 * ALU Chevron Component - used for main ALU and Adders
 * 
 * @param {Konva.Group} group - group to add shapes into
 * @param {object} def - component definition from COMPONENTS
 */
function _addALU(group, def) {
    group.add(new Konva.Line({
        points: [0, 0, 55, 70, 55, 180, 0, 250, 0, 150, 15, 125, 0, 100],
        closed: true,
        fill: '#0d0f14',
        stroke: _strokeForCategory(def.category),
        strokeWidth: 2,
    }));
    group.add(_makeLabel(def.canvasLabel, 10, 0, 45, 250, 30));

}

/**
 * MUX Pilled-Shaped Container - used for all multiplexers
 * 
 * @param {Konva.Group} group - group to add shapes into
 * @param {object} def - component definition from COMPONENTS
 */
function _addMUX(group, def) {
    const height = 140;
    const width = 40;

    group.add(new Konva.Rect({
        x: 0, y: 0,
        width: width,
        height: height,
        cornerRadius: width / 2,
        fill: '#0d0f14',
        stroke: _strokeForCategory(def.category),
        strokeWidth: 2,
    }));

    group.add(_makeLabel(def.canvasLabel, 0, 0, width, height, 30));
}


/**
 * Maps a components category to its corresponding stroke color.
 * 
 * @param {string} category 
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

/**
 * Clicking anywhere outside a component dismisses the popup
 */
function _setupGlobalDismiss() {
    getStage().on('click tap', (e) => hidePopup());
}

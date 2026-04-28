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
    const group = new Konva.Group({ id, x: def.x, y: def.y });

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
    return new Konva.Text({
        x, y,
        width, height,
        text,
        fontSize,
        fontFamily: 'monospace',
        fontStyle: 'bold',
        fill: '#f8fafc',
        align: 'center',
        verticalAlign: 'middle',
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
    group.add(_makePortLabel('Read\nReg 1', 10, 25, 95, 60, 'left'));
    group.add(_makePortLabel('Read\nReg 2', 10, 115, 95, 60, 'left'));
    group.add(_makePortLabel('Write\nReg', 10, 205, 95, 60, 'left'));

    // Right-side labels
    group.add(_makePortLabel('Read\nData 1', 295, 90, 95, 60, 'right'));
    group.add(_makePortLabel('Read\nData 2', 295, 250, 95, 60, 'right'));

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
    group.add(_makePortLabel('Address', 10, 75, 95, 35, 'left'));
    group.add(_makePortLabel('Write Data', 10, 275, 150, 40, 'left'));

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
 * Rectangular Component - used for PC, Instruction Memory,
 * Register File, and Data Memory
 * 
 * @param {Konva.Group} group - group to add shapes into
 * @param {object} def - component definition from COMPONENTS
 */
function _addRect(group, def) {
    _addStyledBox(group, def);
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

    group.add(_makeLabel(def.canvasLabel, 0, 0, diameter, diameter, 24));
}

/**
 * ALU Chevron Component - used for main ALU and Adders
 * 
 * @param {Konva.Group} group - group to add shapes into
 * @param {object} def - component definition from COMPONENTS
 */
function _addALU(group, def) {
    const theme = _themeForCategory(def.category);

    group.add(new Konva.Line({
        points: [0, 0, 55, 70, 55, 180, 0, 250, 0, 150, 15, 125, 0, 100],
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

    group.add(_makeLabel(def.canvasLabel, 0, 0, width, height, 30));
}


/**
 * Maps a components category to its corresponding stroke color.
 * 
 * @param {string} category 
 * @returns {string} - CSS color string
 */
function _strokeForCategory(category) {
    return _themeForCategory(category).stroke;
}

/**
 * Clicking anywhere outside a component dismisses the popup
 */
function _setupGlobalDismiss() {
    getStage().on('click tap', (e) => hidePopup());
}

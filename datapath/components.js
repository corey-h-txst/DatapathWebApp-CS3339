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
        shape: 'rect',
        category: 'register',
        x: 40, y: 700, width: 100, height: 200,
        info: 'Holds the address of the next instruction to fetch from instruction memory. After each instruction, the PC is usually updated to PC + 4 unless a branch or jump changes the flow of control.',
    },

    'instruction-mem' : {
        label: 'Instruction Memory',
        shape: 'rect',
        category: 'memory',
        x: 275, y: 600, width: 400, height: 400,
        info: 'Stores the program instructions. Using the address from the PC, it outputs the current instruction so the processor can decode and execute it.',
    },

    'mux-reg-dst' : {
        label: 'Multiplexer (MUX) - Register Destination',
        shape: 'mux',
        category: 'mux',
        x: 800, y: 780,
        info: 'Chooses which register number will be used as the destination register for a write. It typically selects between rt and rd based on the RegDst control signal.',
    },

    'reg-file' : {
        label: 'Register File',
        shape: 'rect',
        category: 'register',
        x: 900, y: 600, width: 400, height: 400,
        info: 'Contains the CPU’s registers. It reads values from source registers named in the instruction and can write a result back into a destination register.',
    },

    'sign-ext' : {
        label: 'Sign Extend',
        shape: 'circle',
        category: 'logic',
        x: 1100, y: 1070,
        info: 'Takes a smaller immediate value from the instruction and extends it to the full word size while preserving its sign. This is needed for offsets, constants, loads, stores, and branches.',
    },

    'mux-alu-src' : {
        label: 'Multiplexer (MUX) - ALU Source',
        shape: 'mux',
        category: 'mux',
        x: 1400, y: 820,
        info: 'Selects the ALU’s second input. It chooses between register data and the sign-extended immediate value depending on the ALUSrc control signal.',
    },

    'alu' : {
        label: 'Arithmetic Logic Unit (ALU)',
        shape: 'alu',
        category: 'alu',
        x: 1500, y: 675,
        info: 'Performs arithmetic and logic operations such as add, subtract, AND, OR, and comparisons. It is used for instruction execution, address calculation, and branch decisions.',
    },

    'alu-control' : {
        label: 'ALU Control',
        shape: 'circle',
        category: 'control',
        x: 1500, y: 1050,
        info: 'Determines the exact ALU operation to perform. It uses high-level ALUOp control signals together with instruction function bits to tell the ALU what action to take.',
    },

    'data-mem' : {
        label: 'Data Memory',
        shape: 'rect',
        category: 'memory',
        x: 1650, y: 600, width: 400, height: 400,
        info: 'Stores program data. For load instructions it outputs data from memory, and for store instructions it writes register data into memory.',
    },

    'mux-mem-to-reg' : {
        label: 'Multiplexer (MUX) - Memory to Register',
        shape: 'mux',
        category: 'mux',
        x: 2150, y: 750,
        info: 'Chooses what value gets written back into the register file. It typically selects between the ALU result and data coming from memory.',
    },

    'control' : {
        label: 'Control',
        shape: 'circle',
        category: 'control',
        x: 800, y: 250,
        info: 'Reads the opcode field of the instruction and generates the main control signals for the datapath, such as RegWrite, MemRead, MemWrite, Branch, MemToReg, ALUSrc, and RegDst.',
    },

    'adder-pc' : {
        label: 'Add',
        shape: 'alu',
        category: 'alu',
        x: 400, y: 100,
        info: 'PC + 4 Adder\n' +
            'Adds 4 to the current PC value to produce the next sequential instruction address, often written as PC + 4.',
    },

    'shift-left-2' : {
        label: 'Shift Left 2',
        shape: 'circle',
        category: 'logic',
        x: 1400, y: 250,
        info: 'Shifts the branch immediate value left by 2 bits. This converts the instruction offset into a byte offset for word-aligned branch target addresses.',
    },

    'adder-branch' : {
        label: 'Add',
        shape: 'alu',
        category: 'alu',
        x: 1650, y: 80,
        info: 'Calculates the branch target address by adding PC + 4 to the shifted branch offset.',
    },

    'mux-pc-src' : {
        label: 'Multiplexer (MUX) - PC Source',
        shape: 'mux',
        category: 'mux',
        x: 1850, y: 110,
        info: 'Chooses the next value for the PC. It usually selects between the normal next address (PC + 4) and a branch target address.',
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

    layer.draw();
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
function _makeLabel(text, x, y, width, height, fontSize=14) {
    return new Konva.Text({
        x, y,
        width, height,
        text,
        fontSize,
        fontFamily: 'monospace',
        fonstStyle: 'bold',
        fill: 'black',
        align: 'center',
        verticalAlign: 'middle',
    });
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
        fill: 'gray',
        stroke: _strokeForCategory(def.category),
        strokeWidth: 2,
        cornerRadius: 10,
    }));

    group.add(_makeLabel(def.label, 0, 0, def.width, def.height));
}

/**
 * Circular Component - used for Control, Sign Extend,
 * Shift Left 2, and ALU Control
 * 
 * @param {Konva.Group} group - group to add shapes into
 * @param {object} def - component definition from COMPONENTS
 */
function _addCircle(group, def) {
    const radius = 40; // Fixed radius for all circle components
    const diameter = radius * 2;

    group.add(new Konva.Circle({
        x: radius,
        y: radius,
        radius: radius,
        fill: 'gray',
        stroke: _strokeForCategory(def.category),
        strokeWidth: 2,
    }));

    group.add(_makeLabel(def.label, 0, 0, diameter, diameter, 12));
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
        fill: 'gray',
        stroke: _strokeForCategory(def.category),
        strokeWidth: 2,
    }));
    group.add(_makeLabel(def.label, 5, 0, 45, 250, 11));

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
        fill: 'gray',
        stroke: _strokeForCategory(def.category),
        strokeWidth: 2,
    }));

    group.add(_makeLabel(def.label, 0, 0, width, height, 12));
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
/**
 * alu.js
 *
 * Defines the ALU instruction simulation data for the Datapath Visualizer.
 * This instruction walks through the datapath for an R-type ALU operation,
 * covering all 15 steps from PC fetch through write-back to the register file
 * and PC update.
 *
 * Wire state notation:
 *   { id: 'wire-id', state: 0|1, animate: true|false, direction: 'forward'|'reverse' }
 *   - state: 0 or 1 for control wires (determines dashed color)
 *   - animate: whether to show the pulsing animation on this wire
 *   - direction: which direction the pulse travels
 *
 * Each step includes:
 *   - componentId: The datapath component to focus on
 *   - wires: Wire state declarations for highlighting/animation
 *   - camera: Optional camera configuration (wireIds, pathPoints, scale, durationMs)
 *   - tour: Educational content for learn mode
 *   - quiz: Question data for quiz mode
 */

export const aluInstruction = {
    id: 'alu',
    label: 'ALU Instruction',
    steps: [
        // Step 1 — Program Counter (PC)
        // The PC holds the address of the current instruction.
        {
            componentId: 'pc',
            wires: [
                { id: 'pc-to-instruction-mem' },
            ],
            tour: {
                title: 'Program Counter',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 2 — Instruction Memory
        // The instruction is fetched from memory at the address in the PC.
        {
            componentId: 'instruction-mem',
            wires: [
                { id: 'pc-to-instruction-mem', animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['pc-to-instruction-mem'],
            },
            tour: {
                title: 'Instruction Memory',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 3 — Control
        // The Control unit decodes the instruction and sets control signals.
        // Control signals are fanned out to all controlled components.
        {
            componentId: 'control',
            wires: [
                { id: 'instruction-mem-to-split', animate: true, direction: 'forward' },
                { id: 'instruction-split-to-control', animate: true, direction: 'forward' },
                { id: 'control-to-reg-file', state: 1, animate: true, direction: 'forward' },
                { id: 'control-to-mux-reg-dst', state: 1, animate: true, direction: 'forward' },
                { id: 'control-to-mux-alu-src', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-alu-control', state: 1, animate: true, direction: 'forward' },
                { id: 'control-to-data-mem', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-mux-mem-to-reg', state: 0, animate: true, direction: 'forward' },
            ],
            tour: {
                title: 'Control',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 4 — MUX Register Destination
        // Selects the destination register (rd for R-type).
        {
            componentId: 'mux-reg-dst',
            wires: [
                { id: 'instruction-split-to-read-2-junction', animate: true, direction: 'forward' },
                { id: 'instruction-read-2-to-mux-reg-dst', animate: true, direction: 'forward' },
                { id: 'mux-reg-dst-to-reg-file-write-reg', animate: true, direction: 'forward' },
                { id: 'control-to-mux-reg-dst', state: 1, animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['instruction-split-to-read-2-junction', 'instruction-read-2-to-mux-reg-dst'],
            },
            tour: {
                title: 'Multiplexer (MUX) - Register Destination',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 5 — Register File
        // Reads the source register values and prepares the write destination.
        {
            componentId: 'reg-file',
            wires: [
                { id: 'instruction-split-to-reg-file-read-1', animate: true, direction: 'forward' },
                { id: 'read-2-junction-to-reg-file-read-2' },
                { id: 'mux-reg-dst-to-reg-file-write-reg' },
                { id: 'control-to-reg-file', state: 1, animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['instruction-split-to-reg-file-read-1'],
            },
            tour: {
                title: 'Register File',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 6 — Sign Extend
        // Extends the immediate value from 16 bits to 32 bits.
        {
            componentId: 'sign-ext',
            wires: [
                { id: 'instruction-split-to-sign-ext', animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['instruction-split-to-sign-ext'],
            },
            tour: {
                title: 'Sign Extend',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 7 — MUX ALU Source
        // Selects between register value and sign-extended immediate for ALU input.
        {
            componentId: 'mux-alu-src',
            wires: [
                { id: 'sign-ext-to-split' },
                { id: 'sign-ext-split-to-mux-alu-src' },
                { id: 'control-to-mux-alu-src', state: 0, animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['sign-ext-split-to-mux-alu-src'],
            },
            tour: {
                title: 'Multiplexer (MUX) - ALU Source',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 8 — ALU Control
        // Determines the ALU operation based on the function code and control signals.
        {
            componentId: 'alu-control',
            wires: [
                { id: 'control-to-alu-control', state: 1, animate: true, direction: 'forward' },
            ],
            tour: {
                title: 'ALU Control',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 9 — ALU
        // Performs the arithmetic/logical operation on the two input values.
        {
            componentId: 'alu',
            wires: [
                { id: 'reg-file-read-1-to-alu' },
                { id: 'mux-alu-src-to-alu', animate: true, direction: 'forward' },
                { id: 'alu-control-to-alu', state: 1, animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['mux-alu-src-to-alu'],
            },
            tour: {
                title: 'Arithmetic Logic Unit (ALU)',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 10 — Data Memory
        // For ALU instructions, data memory is not accessed (control signal = 0).
        {
            componentId: 'data-mem',
            wires: [
                { id: 'alu-to-result-split', animate: true, direction: 'forward' },
                { id: 'alu-result-split-to-data-mem', animate: true, direction: 'forward' },
                { id: 'control-to-data-mem', state: 0, animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['alu-to-result-split', 'alu-result-split-to-data-mem'],
            },
            tour: {
                title: 'Data Memory',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 11 — MUX Memory to Register
        // Selects between ALU result and memory data for write-back to register file.
        {
            componentId: 'mux-mem-to-reg',
            wires: [
                { id: 'alu-to-result-split', animate: true, direction: 'forward' },
                { id: 'alu-result-split-to-mux-mem-to-reg', animate: true, direction: 'forward' },
                { id: 'control-to-mux-mem-to-reg', state: 0, animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['alu-to-result-split', 'alu-result-split-to-mux-mem-to-reg'],
            },
            tour: {
                title: 'Multiplexer (MUX) - Memory to Register',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 12 — Register File (write-back)
        // The ALU result is written back to the destination register.
        {
            componentId: 'reg-file',
            wires: [
                { id: 'mux-mem-to-reg-to-reg-file', animate: true, direction: 'forward' },
                { id: 'control-to-reg-file', state: 1, animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['mux-mem-to-reg-to-reg-file'],
            },
            tour: {
                title: 'Register File',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 13 — Adder PC
        // Computes PC + 4 for the next sequential instruction address.
        {
            componentId: 'adder-pc',
            wires: [
                { id: 'pc-to-adder-pc', animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['pc-to-adder-pc'],
            },
            tour: {
                title: 'Add',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 14 — MUX PC Source
        // Selects between PC+4 and branch target for the next PC value.
        {
            componentId: 'mux-pc-src',
            wires: [
                { id: 'adder-pc-to-split', animate: true, direction: 'forward' },
                { id: 'adder-pc-split-to-mux-pc-src', animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['adder-pc-to-split', 'adder-pc-split-to-mux-pc-src'],
            },
            tour: {
                title: 'Multiplexer (MUX) - PC Source',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },

        // Step 15 — PC (update)
        // The PC is updated to the next instruction address (PC+4).
        {
            componentId: 'pc',
            wires: [
                { id: 'mux-pc-src-to-pc', animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['mux-pc-src-to-pc'],
            },
            tour: {
                title: 'Program Counter (PC)',
                body: 'Placeholder Educational Text'
            },
            quiz: {
                question: 'Placeholder Question?',
                body: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
                answer: 0,
            }
        },
    ],
};
/**
 * store.js
 *
 * Defines the Store instruction simulation data for the Datapath Visualizer.
 * This instruction walks through the datapath for a store word (sw) operation.
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
 *
 * Control signals for Store: RegDst=x, ALUSrc=1, MemtoReg=x, RegWrite=0, MemRead=0, MemWrite=1, Branch=0
 */

export const storeInstruction = {
    id: 'store',
    label: 'Store Instruction',
    steps: [
        // Step 1 — Program Counter (PC)
        {
            componentId: 'pc',
            wires: [
                { id: 'pc-to-instruction-mem' },
            ],
            tour: {
                title: 'Program Counter',
                body: 'The Program Counter holds the address of the current instruction and sends that address to instruction memory so the CPU can fetch the store instruction.'
            },
            quiz: {
                question: 'What does the Program Counter provide at the start of a store instruction?',
                body: [
                    'The address of the current instruction',
                    'The ALU result',
                    'The data memory value',
                    'The destination register value'
                ],
                answer: 0,
            }
        },

        // Step 2 — Instruction Memory
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
                body: 'Instruction memory uses the address from the PC to fetch the store instruction. The instruction fields, such as opcode, registers, and immediate offset, are then sent through the datapath.'
            },
            quiz: {
                question: 'What does instruction memory do here?',
                body: [
                    'Writes a value into memory',
                    'Fetches the instruction using the PC address',
                    'Updates the Program Counter',
                    'Chooses the ALU operation'
                ],
                answer: 1,
            }
        },
        // Step 3 — Control
        {
            componentId: 'control',
            wires: [
                { id: 'instruction-mem-to-split', animate: true, direction: 'forward' },
                { id: 'instruction-split-to-control', animate: true, direction: 'forward' },
                { id: 'control-to-reg-file', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-mux-reg-dst', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-mux-alu-src', state: 1, animate: true, direction: 'forward' },
                { id: 'control-to-alu-control', state: 1, animate: true, direction: 'forward' },
                { id: 'control-to-mem-write', state: 1, animate: true, direction: 'forward' },
                { id: 'control-to-mem-read', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-mux-mem-to-reg', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-and-gate', state: 0, animate: true, direction: 'forward' },
            ],
            tour: {
                title: 'Control',
                body: 'The control unit reads the opcode and recognizes a store instruction. It enables memory write, disables register write-back, selects the immediate as an ALU input, and prepares the datapath to store a register value into memory.'
            },
            quiz: {
                question: 'What is the main job of the control unit during a store instruction?',
                body: [
                    'To prepare the datapath to write a register value into memory',
                    'To compare two registers for branching',
                    'To load data from memory into a register',
                    'To calculate a jump target'
                ],
                answer: 0,
            }
        },
        // Step 4 — MUX Reg-Dst
        {
            componentId: 'mux-reg-dst',
            wires: [
                { id: 'instruction-split-to-mux-reg-dst', animate: true, direction: 'forward' },
                { id: 'mux-reg-dst-to-reg-file-write-reg', animate: true, direction: 'forward' },
                { id: 'control-to-mux-reg-dst', state: 0, animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['instruction-split-to-mux-reg-dst'],
            },
            tour: {
                title: 'MUX - Register Destination',
                body: 'This multiplexer normally chooses which register receives a value during write-back. A store instruction does not write a result into the register file, so this path is not used here.'
            },
            quiz: {
                question: 'Why is the RegDst multiplexer not important for a store instruction?',
                body: [
                    'Because stores always read from data memory',
                    'Because stores do not write a value to a register',
                    'Because it computes the store address',
                    'Because it compares registers'
                ],
                answer: 1,
            }
        },
        // Step 5 — Register File
        {
            componentId: 'reg-file',
            wires: [
                { id: 'instruction-split-to-reg-file-read-1', animate: true, direction: 'forward' },
                { id: 'instruction-split-to-read-2-junction', animate: true, direction: 'forward' },
                { id: 'read-2-junction-to-reg-file-read-2', animate: true, direction: 'forward' },
                { id: 'control-to-reg-file', state: 0, animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['instruction-split-to-reg-file-read-1'],
            },
            tour: {
                title: 'Register File',
                body: 'The register file reads two registers from the instruction. One register provides the base address, and the other provides the data value that will be written into memory.'
            },
            quiz: {
                question: 'What two important values come from the register file during a store instruction?',
                body: [
                    'A base address value and the data value to store',
                    'Two branch target addresses',
                    'A jump target and an ALU result',
                    'Two destination registers'
                ],
                answer: 0,
            }
        },
        // Step 6 — Sign Extend
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
                body: 'The 16 bit offset from the instruction is sign-extended to 32 bits. This keeps the offset correct even if it is negative.'
            },
            quiz: {
                question: 'Why is the store offset sign-extended?',
                body: [
                    'To preserve the correct 32 bit value of the offset',
                    'To turn it into a register number',
                    'To write it into memory',
                    'To force the ALU to subtract'
                ],
                answer: 0,
            }
        },
        // Step 7 — MUX ALU-Src
        {
            componentId: 'mux-alu-src',
            wires: [
                { id: 'sign-ext-to-split', animate: true, direction: 'forward' },
                { id: 'sign-ext-split-to-mux-alu-src', animate: true, direction: 'forward' },
                { id: 'control-to-mux-alu-src', state: 1, animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['sign-ext-split-to-mux-alu-src'],
            },
            tour: {
                title: 'MUX - ALU Source',
                body: 'This multiplexer chooses the ALU\'s second input. For a store instruction, it selects the sign-extended immediate offset instead of a second register value.'
            },
            quiz: {
                question: 'What does ALUSrc select for a store instruction?',
                body: [
                    'The second register value',
                    'The sign-extended immediate offset',
                    'The data memory output',
                    'PC + 4'
                ],
                answer: 1,
            }
        },
        // Step 8 — ALU Control
        {
            componentId: 'alu-control',
            wires: [
                { id: 'control-to-alu-control', state: 1, animate: true, direction: 'forward' },
            ],
            tour: {
                title: 'ALU Control',
                body: 'ALU control tells the ALU what operation to perform. For a store instruction, it selects addition so the base register value and offset can be combined into an effective memory address.'
            },
            quiz: {
                question: 'What ALU operation is used for a store instruction?',
                body: [
                    'Subtract',
                    'AND',
                    'Add',
                    'OR'
                ],
                answer: 2,
            }
        },
        // Step 9 — ALU
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
                title: 'ALU',
                body: 'The ALU adds the base register value and the sign-extended offset. The result is the effective address of the memory location where the data will be stored.'
            },
            quiz: {
                question: 'What does the ALU calculate for a store instruction?',
                body: [
                    'The branch condition',
                    'The effective memory address',
                    'The jump target',
                    'The destination register number'
                ],
                answer: 1,
            }
        },
        // Step 10 — Data Memory
        {
            componentId: 'data-mem',
            wires: [
                { id: 'alu-to-result-split', animate: true, direction: 'forward' },
                { id: 'alu-result-split-to-data-mem', animate: true, direction: 'forward' },
                { id: 'reg-file-read-2-to-split', animate: true, direction: 'forward' },
                { id: 'read-data-2-split-to-data-mem', animate: true, direction: 'forward' },
                { id: 'control-to-mem-write', state: 1, animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['alu-to-result-split', 'alu-result-split-to-data-mem', 'read-data-2-split-to-data-mem'],
            },
            tour: {
                title: 'Data Memory',
                body: 'Data memory uses the effective address from the ALU and writes the register value from rt into that memory location. This is the main action of the store instruction.'
            },
            quiz: {
                question: 'What does data memory do during a store instruction?',
                body: [
                    'Reads a value from memory into a register',
                    'Writes the register value into memory at the effective address',
                    'Calculates PC + 4',
                    'Chooses the destination register'
                ],
                answer: 1,
            }
        },
        // Step 11 — Adder PC
        {
            componentId: 'adder-pc',
            wires: [
                { id: 'pc-to-adder-pc', animate: true, direction: 'forward' },
                { id: 'constant-4-to-adder-pc', animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['pc-to-adder-pc', 'constant-4-to-adder-pc'],
            },
            tour: {
                title: 'Adder - PC + 4',
                body: 'This adder computes PC + 4, which is the address of the next sequential instruction. After the store finishes, execution normally continues there.'
            },
            quiz: {
                question: 'What does the PC adder calculate?',
                body: [
                    'The value to store in memory',
                    'The destination register',
                    'PC + 4',
                    'The sign-extended offset'
                ],
                answer: 2,
            }
        },
        // Step 12 — MUX PC-Src
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
                title: 'MUX - PC Source',
                body: 'This multiplexer chooses the next value for the Program Counter. For a normal store instruction, it selects the standard PC + 4 path rather than a branch or jump target.'
            },
            quiz: {
                question: 'What does the PC source multiplexer choose for a normal store instruction?',
                body: [
                    'The jump target',
                    'The branch target',
                    'The normal PC + 4 path',
                    'The data memory output'
                ],
                answer: 2,
            }
        },
        // Step 13 — Program Counter Update
        {
            componentId: 'pc',
            wires: [
                { id: 'mux-pc-src-to-pc', animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['mux-pc-src-to-pc'],
            },
            tour: {
                title: 'Program Counter Update',
                body: 'The Program Counter is updated with PC + 4. The CPU is now ready to fetch the next instruction.'
            },
            quiz: {
                question: 'What happens to the Program Counter at the end of a store instruction?',
                body: [
                    'It is updated to PC + 4',
                    'It is updated to the memory address',
                    'It is cleared to zero',
                    'It is written into the register file'
                ],
                answer: 0,
            }
        },
    ],
};
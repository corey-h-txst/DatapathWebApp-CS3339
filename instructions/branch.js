/**
 * branch.js
 *
 * Defines the Branch instruction simulation data for the Datapath Visualizer.
 * This instruction walks through the datapath for a branch-if-equal (beq) operation.
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
 * Control signals for Branch: RegDst=x, ALUSrc=0, MemtoReg=x, RegWrite=0, MemRead=0, MemWrite=0, Branch=1
 */

export const branchInstruction = {
    id: 'branch',
    label: 'Branch Instruction',
    steps: [
        // Step 1 — Program Counter (PC)
        {
            componentId: 'pc',
            wires: [
                { id: 'pc-to-instruction-mem' },
            ],
            tour: {
                title: 'Program Counter',
                body: 'The Program Counter holds the address of the current instruction and sends that address to instruction memory so the CPU can fetch the branch instruction.'
            },
            quiz: {
                question: 'What does the Program Counter provide at the start of this instruction?',
                body: [
                    'The next data memory value',
                    'The address of the current instruction',
                    'The ALU result',
                    'The destination register number'
                ],
                answer: 1,
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
                body: 'Instruction memory uses the address from the Program Counter to fetch the branch instruction. The instruction fields are then available to the rest of the datapath.'
            },
            quiz: {
                question: 'What does instruction memory do here?',
                body: [
                    'Stores the ALU result',
                    'Fetches the instruction using the PC address',
                    'Writes data into a register',
                    'Calculates the branch target'
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
                { id: 'control-to-mux-alu-src', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-alu-control', state: 1, animate: true, direction: 'forward' },
                { id: 'control-to-mem-write', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-mem-read', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-mux-mem-to-reg', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-and-gate', state: 1, animate: true, direction: 'forward' },
            ],
            tour: {
                title: 'Control',
                body: 'The control unit reads the opcode and recognizes a branch instruction. It disables register write and memory write, and it prepares the datapath to compare two register values and possibly change the PC.'
            },
            quiz: {
                question: 'What is the main job of the control unit during a branch?',
                body: [
                    'To store data in memory',
                    'To compare registers and possibly update the PC path',
                    'To choose a destination register for write back',
                    'To load data from data memory'
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
                body: 'The register file reads the two source registers named by the instruction. These two values are the operands the CPU compares to decide whether the branch should be taken.'
            },
            quiz: {
                question: 'What values does the register file provide for a branch instruction?',
                body: [
                    'Two source register values to compare',
                    'One memory value and one register value',
                    'A destination register and an immediate',
                    'Only the branch target address'
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
                body: 'The 16 bit branch offset is sign-extended to 32 bits. This preserves the correct value even if the offset is negative.'
            },
            quiz: {
                question: 'Why is the branch immediate sign-extended?',
                body: [
                    'To turn it into a register number',
                    'To preserve the correct value as a 32 bit offset',
                    'To write it into memory',
                    'To make the ALU always add'
                ],
                answer: 1,
            }
        },
        // Step 7 — MUX ALU-Src
        {
            componentId: 'mux-alu-src',
            wires: [
                { id: 'reg-file-read-2-to-split', animate: true, direction: 'forward' },
                { id: 'read-data-2-split-to-mux-alu-src', animate: true, direction: 'forward' },
                { id: 'control-to-mux-alu-src', state: 0, animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['read-data-2-split-to-mux-alu-src'],
            },
            tour: {
                title: 'MUX - ALU Source',
                body: 'For a branch comparison, this multiplexer selects the second register value as the ALU input instead of the sign-extended immediate. The ALU must compare two register operands.'
            },
            quiz: {
                question: 'What does ALUSrc choose for a branch comparison?',
                body: [
                    'The sign-extended immediate',
                    'The second register value',
                    'The data memory output',
                    'The destination register number'
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
                body: 'ALU control tells the ALU which operation to perform. For a beq style branch, it selects subtraction so the processor can test whether the two register values are equal.'
            },
            quiz: {
                question: 'What ALU operation is typically used for a beq comparison?',
                body: [
                    'AND',
                    'OR',
                    'Subtract',
                    'Shift left'
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
                { id: 'alu-zero-to-and-gate', animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['mux-alu-src-to-alu', 'alu-zero-to-and-gate'],
            },
            tour: {
                title: 'ALU',
                body: 'The ALU subtracts one register value from the other. If the result is zero, the two values are equal, which helps determine whether the branch is taken.'
            },
            quiz: {
                question: 'What does a zero result from the ALU mean during beq?',
                body: [
                    'The branch offset is invalid',
                    'The two register values are equal',
                    'Memory should be written',
                    'The instruction is a jump'
                ],
                answer: 1,
            }
        },
        // Step 10 — AND Gate
        {
            componentId: 'and-gate',
            wires: [
                { id: 'control-to-and-gate', state: 1, animate: true, direction: 'forward' },
                { id: 'alu-zero-to-and-gate', state: 1,animate: true, direction: 'forward' },
                { id: 'and-gate-to-mux-pc-src', animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['alu-zero-to-and-gate', 'and-gate-to-mux-pc-src'],
            },
            tour: {
                title: 'AND Gate',
                body: 'The AND gate combines the Branch control signal with the ALU Zero flag. If both are high (Branch=1 and Zero=1), the output selects the branch target address for the next PC.'
            },
            quiz: {
                question: 'What two signals does the AND gate combine for a branch?',
                body: [
                    'RegWrite and MemRead',
                    'The Branch control signal and the ALU Zero flag',
                    'ALUSrc and MemtoReg',
                    'PC + 4 and the branch offset'
                ],
                answer: 1,
            }
        },
        // Step 11 — Shift Left 2
        {
            componentId: 'shift-left-2',
            wires: [
                { id: 'sign-ext-to-split' },
                { id: 'sign-ext-split-to-shift-left-2', animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['sign-ext-split-to-shift-left-2'],
            },
            tour: {
                title: 'Shift Left 2',
                body: 'The sign-extended branch offset is shifted left by 2 bits. This converts the offset into a byte offset that matches word aligned instruction addresses.'
            },
            quiz: {
                question: 'Why is the branch offset shifted left by 2?',
                body: [
                    'To convert it to a byte offset for instruction addresses',
                    'To compare two registers',
                    'To disable memory access',
                    'To choose the destination register'
                ],
                answer: 0,
            }
        },
        // Step 12 — Adder PC
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
                body: 'This adder computes PC + 4, which is the address of the next sequential instruction. Even a branch instruction first forms this value before deciding whether to replace it.'
            },
            quiz: {
                question: 'What does the PC adder calculate?',
                body: [
                    'The memory address for a store',
                    'The register destination',
                    'PC + 4',
                    'The ALU zero flag'
                ],
                answer: 2,
            }
        },
        // Step 13 — Adder Branch
        {
            componentId: 'adder-branch',
            wires: [
                { id: 'adder-pc-to-split', animate: true, direction: 'forward' },
                { id: 'adder-pc-split-to-adder-branch', animate: true, direction: 'forward' },
                { id: 'shift-left-2-to-adder-branch', animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['adder-pc-split-to-adder-branch', 'shift-left-2-to-adder-branch'],
            },
            tour: {
                title: 'Adder - Branch Target',
                body: 'This adder computes the branch target address by adding PC + 4 to the shifted branch offset. That result is the address used if the branch is taken.'
            },
            quiz: {
                question: 'How is the branch target address formed?',
                body: [
                    'By adding PC + 4 and the shifted branch offset',
                    'By adding two register values',
                    'By reading data memory',
                    'By selecting rd from the instruction'
                ],
                answer: 0,
            }
        },
        // Step 14 — MUX PC-Src
        {
            componentId: 'mux-pc-src',
            wires: [
                { id: 'adder-pc-split-to-mux-pc-src' },
                { id: 'adder-branch-to-mux-pc-src', animate: true, direction: 'forward' },
                { id: 'and-gate-to-mux-pc-src', state: 1, animate: true, direction: 'forward' },
                { id: 'control-to-and-gate', state: 1, animate: true, direction: 'forward' },
                { id: 'alu-zero-to-and-gate', state: 1, animate: true, direction: 'forward' },
            ],
            camera: {
                wireIds: ['adder-branch-to-mux-pc-src', 'and-gate-to-mux-pc-src'],
            },
            tour: {
                title: 'MUX - PC Source',
                body: 'This multiplexer chooses the next value for the Program Counter. If the branch condition is true, it selects the branch target address. Otherwise, it selects the normal PC + 4 path.'
            },
            quiz: {
                question: 'What does the PC source multiplexer choose between?',
                body: [
                    'Two destination registers',
                    'The ALU result and data memory',
                    'The branch target and PC + 4',
                    'Two memory locations'
                ],
                answer: 2,
            }
        },
        // Step 15 — Program Counter Update
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
                body: 'The Program Counter is updated with the selected next address. If the branch is taken, the PC becomes the branch target. If not, it simply advances to the next sequential instruction.'
            },
            quiz: {
                question: 'What happens to the PC at the end of the branch instruction?',
                body: [
                    'It always jumps to data memory',
                    'It is cleared to zero',
                    'It is updated with either the branch target or PC + 4',
                    'It stores the ALU subtraction result'
                ],
                answer: 2,
            }
        },
    ],
};
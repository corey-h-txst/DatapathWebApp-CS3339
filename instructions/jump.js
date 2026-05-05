/**
 * jump.js
 *
 * Defines the Jump instruction simulation data for the Datapath Visualizer.
 * This instruction walks through the datapath for a jump (j) operation.
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
 * Control signals for Jump: RegDst=x, ALUSrc=x, MemtoReg=x, RegWrite=0, MemRead=0, MemWrite=0, Branch=0
 */

export const jumpInstruction = {
    id: 'jump',
    label: 'JUMP Instruction',
    steps: [
        // Step 1 — Program Counter (PC)
        {
            componentId: 'pc',
            wires: [
                { id: 'pc-to-instruction-mem' },
            ],
            tour: {
                title: 'Program Counter',
                body: 'The Program Counter holds the address of the current instruction and sends that address to instruction memory so the CPU can fetch the jump instruction.'
            },
            quiz: {
                question: 'What does the Program Counter provide at the start of a jump instruction?',
                body: [
                    'The address of the current instruction',
                    'The ALU result',
                    'The memory data value',
                    'The destination register number'
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
                body: 'Instruction memory uses the address from the PC to fetch the jump instruction. The instruction fields, including the opcode and jump target field, are then available to the datapath.'
            },
            quiz: {
                question: 'What does instruction memory do in this step?',
                body: [
                    'Writes a value into data memory',
                    'Fetches the instruction using the PC address',
                    'Performs the jump calculation',
                    'Updates the Program Counter'
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
                { id: 'control-to-alu-control', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-mem-write', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-mem-read', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-mux-mem-to-reg', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-and-gate', state: 0, animate: true, direction: 'forward' },
                { id: 'control-to-jump', state: 1, animate: true, direction: 'forward' },
            ],
            tour: {
                title: 'Control',
                body: 'The control unit reads the opcode and recognizes a jump instruction. It disables register write-back and memory access, and tells the PC logic that execution should continue at the jump target instead of the normal next instruction.'
            },
            quiz: {
                question: 'What is the control unit mainly doing for a jump instruction?',
                body: [
                    'Writing data into a register',
                    'Loading from data memory',
                    'Directing the PC to use the jump target path',
                    'Comparing two register values'
                ],
                answer: 2,
            }
        },
        // Step 4 — MUX PC-Src
        {
            componentId: 'mux-pc-src',
            wires: [
                { id: 'control-to-jump', state: 1, animate: true, direction: 'forward' },
            ],
            tour: {
                title: 'MUX - PC Source',
                body: 'This multiplexer chooses the next value for the Program Counter. For a jump instruction, it selects the jump target path instead of the normal sequential PC + 4 path.'
            },
            quiz: {
                question: 'What does the PC source multiplexer choose for a jump?',
                body: [
                    'The data memory output',
                    'The destination register',
                    'The jump target path instead of the normal sequential path',
                    'The ALU subtraction result'
                ],
                answer: 2,
            }
        },
        // Step 5 — Program Counter Update
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
                body: 'The Program Counter is updated with the jump destination. This completes the jump instruction and causes the CPU to fetch the next instruction from the new address.'
            },
            quiz: {
                question: 'What happens to the Program Counter at the end of a jump instruction?',
                body: [
                    'It is updated with the jump destination',
                    'It stores the ALU result',
                    'It writes to data memory',
                    'It always stays at PC + 4'
                ],
                answer: 0,
            }
        },
    ],
};
export const jumpInstruction = {
    id: 'jump',
    label: 'JUMP Instruction',
    steps: [
        // Step 1
        {
            componentId: 'pc',
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
        // Step 2
        {
            componentId: 'instruction-mem',
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
        // Step 3
        {
            componentId: 'control',
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
        // Step 4
        {
            componentId: 'mux-reg-dst',
            tour: {
                title: 'MUX - Register Destination',
                body: 'This multiplexer normally chooses which register receives a value during write-back. A jump instruction does not write a result into the register file, so this path is not used here.'
            },
            quiz: {
                question: 'Why is the RegDst multiplexer not important for a jump instruction?',
                body: [
                    'Because jumps always read from data memory',
                    'Because jumps do not write a value to a register',
                    'Because it computes the jump address',
                    'Because it compares registers'
                ],
                answer: 1,
            }
        },
        // Step 5
        {
            componentId: 'reg-file',
            tour: {
                title: 'Register File',
                body: 'The register file is part of the full datapath, but a basic jump instruction does not need to read two register operands to decide where to go next. The jump target comes from the instruction itself.'
            },
            quiz: {
                question: 'Why is the register file not central to a basic jump instruction?',
                body: [
                    'Because the jump target comes from the instruction bits',
                    'Because the ALU already stores the target',
                    'Because the PC is stored in data memory',
                    'Because jumps always use rd as the target'
                ],
                answer: 0,
            }
        },
        // Step 6
        {
            componentId: 'sign-ext',
            tour: {
                title: 'Sign Extend',
                body: 'The sign-extend unit is used for instructions with 16-bit immediates, but a jump instruction uses a different target field format. Because of that, this unit is not the main source of the jump address.'
            },
            quiz: {
                question: 'Why is sign extension not the main path for a basic jump?',
                body: [
                    'Because jumps use data memory instead',
                    'Because jumps use a different target field format',
                    'Because the ALU already sign-extends the value',
                    'Because jump instructions always write to a register'
                ],
                answer: 1,
            }
        },
        // Step 7
        {
            componentId: 'mux-alu-src',
            tour: {
                title: 'MUX - ALU Source',
                body: 'This multiplexer normally chooses the second ALU input. A jump instruction does not rely on the ALU to calculate a normal arithmetic result, so this path is not the important one here.'
            },
            quiz: {
                question: 'Why is the ALUSrc multiplexer not central during a jump?',
                body: [
                    'Because jumps do not depend on the ALU for a normal arithmetic result',
                    'Because it writes to the Program Counter directly',
                    'Because it stores the jump target in memory',
                    'Because it chooses the destination register'
                ],
                answer: 0,
            }
        },
        // Step 8
        {
            componentId: 'alu-control',
            tour: {
                title: 'ALU Control',
                body: 'ALU control normally tells the ALU which operation to perform. For a basic jump instruction, there is no main arithmetic or comparison operation to perform, so this unit is not a key part of the jump path.'
            },
            quiz: {
                question: 'Why is ALU control not heavily used in a basic jump?',
                body: [
                    'Because the jump is mainly a PC redirection operation',
                    'Because it only works for load instructions',
                    'Because it updates memory instead',
                    'Because it chooses the opcode'
                ],
                answer: 0,
            }
        },
        // Step 9
        {
            componentId: 'alu',
            tour: {
                title: 'ALU',
                body: 'The ALU usually performs arithmetic or logic operations, but a basic jump instruction is focused on redirecting control flow. The main goal is to build the jump destination and send it to the Program Counter.'
            },
            quiz: {
                question: 'What is the main purpose of a jump instruction?',
                body: [
                    'To store a value in memory',
                    'To compare two registers',
                    'To redirect control flow to a new instruction address',
                    'To produce an ALU result for write-back'
                ],
                answer: 2,
            }
        },
        // Step 10
        {
            componentId: 'data-mem',
            tour: {
                title: 'Data Memory',
                body: 'Data memory is not used for a basic jump instruction. The processor is not loading from memory or storing to memory here.'
            },
            quiz: {
                question: 'What role does data memory play in a basic jump instruction?',
                body: [
                    'It stores the jump target',
                    'It is not used',
                    'It compares the branch condition',
                    'It selects the destination register'
                ],
                answer: 1,
            }
        },
        // Step 11
        {
            componentId: 'mux-mem-to-reg',
            tour: {
                title: 'MUX - Memory to Register',
                body: 'This multiplexer normally chooses what value gets written back into a register. Since a jump instruction does not write a result to the register file, this path is not used here.'
            },
            quiz: {
                question: 'Why is MemToReg not used for a jump instruction?',
                body: [
                    'Because jumps do not write a value back to a register',
                    'Because it only works with the PC',
                    'Because it computes PC + 4',
                    'Because it shifts the target left by 2'
                ],
                answer: 0,
            }
        },
        // Step 12
        {
            componentId: 'adder-pc',
            tour: {
                title: 'Adder - PC + 4',
                body: 'This adder computes PC + 4, the address of the next sequential instruction. In jump addressing, these upper bits are important because the final jump destination is based partly on PC + 4 and partly on the jump target field.'
            },
            quiz: {
                question: 'What does the PC adder calculate?',
                body: [
                    'The ALU comparison result',
                    'The memory address for a store',
                    'PC + 4',
                    'The destination register number'
                ],
                answer: 2,
            }
        },
        // Step 13
        {
            componentId: 'shift-left-2',
            tour: {
                title: 'Shift Left 2',
                body: 'The jump target field is shifted left by 2 bits so it becomes word-aligned. In a full MIPS-style jump path, this shifted value is combined with the upper bits of PC + 4 to form the final jump address.'
            },
            quiz: {
                question: 'Why is the jump target shifted left by 2?',
                body: [
                    'To compare two registers',
                    'To make the address word-aligned',
                    'To sign-extend the immediate',
                    'To write the target into memory'
                ],
                answer: 1,
            }
        },
        // Step 14
        {
            componentId: 'mux-pc-src',
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
        // Step 15
        {
            componentId: 'pc',
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
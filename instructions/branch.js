export const branchInstruction = {
    id: 'branch',
    label: 'Branch Instruction',
    steps: [
        // Step 1
        {
            componentId: 'pc',
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
        // Step 2
        {
            componentId: 'instruction-mem',
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
        // Step 3
        {
            componentId: 'control',
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
        // Step 4
        {
            componentId: 'mux-reg-dst',
            tour: {
                title: 'MUX - Register Destination',
                body: 'This multiplexer normally selects the destination register for write back. A branch instruction does not write a result into the register file, so this path is not used for the final outcome.'
            },
            quiz: {
                question: 'Why is the RegDst multiplexer not important for a branch instruction?',
                body: [
                    'Because branch instructions do not write to a register',
                    'Because it always selects rd',
                    'Because it sends data to memory',
                    'Because it calculates PC + 4'
                ],
                answer: 0,
            }
        },
        // Step 5
        {
            componentId: 'reg-file',
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
        // Step 6
        {
            componentId: 'sign-ext',
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
        // Step 7
        {
            componentId: 'mux-alu-src',
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
        // Step 8
        {
            componentId: 'alu-control',
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
        // Step 9
        {
            componentId: 'alu',
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
        // Step 10
        {
            componentId: 'shift-left-2',
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
        // Step 11
        {
            componentId: 'adder-pc',
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
        // Step 12
        {
            componentId: 'adder-branch',
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
        // Step 13
        {
            componentId: 'data-mem',
            tour: {
                title: 'Data Memory',
                body: 'Data memory is not used for a branch instruction. The processor is only comparing register values and deciding where the next instruction address should come from.'
            },
            quiz: {
                question: 'What role does data memory play in this branch step flow?',
                body: [
                    'It stores the branch target',
                    'It is not used',
                    'It writes the ALU result',
                    'It selects the PC source'
                ],
                answer: 1,
            }
        },
        // Step 14
        {
            componentId: 'mux-mem-to-reg',
            tour: {
                title: 'MUX - Memory to Register',
                body: 'This multiplexer normally chooses what value gets written back into a register. Branch instructions do not write back into the register file, so this path is not used here.'
            },
            quiz: {
                question: 'Why is MemToReg not used for a branch instruction?',
                body: [
                    'Because branches always read memory',
                    'Because branches do not write a value back to a register',
                    'Because it only works for jumps',
                    'Because it computes the offset'
                ],
                answer: 1,
            }
        },
        // Step 15
        {
            componentId: 'mux-pc-src',
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
        // Step 16
        {
            componentId: 'pc',
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
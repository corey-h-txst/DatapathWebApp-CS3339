export const storeInstruction = {
    id: 'store',
    label: 'Store Instruction',
    steps: [
        // Step 1
        {
            componentId: 'pc',
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
        // Step 2
        {
            componentId: 'instruction-mem',
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
        // Step 3
        {
            componentId: 'control',
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
        // Step 4
        {
            componentId: 'mux-reg-dst',
            tour: {
                title: 'MUX - Register Destination',
                body: 'This multiplexer normally chooses which register will receive a value during write-back. A store instruction does not write a result into the register file, so this path is not used here.'
            },
            quiz: {
                question: 'Why is the RegDst multiplexer not important for a store instruction?',
                body: [
                    'Because stores always write to rd',
                    'Because stores do not write a value to a register',
                    'Because it computes the memory address',
                    'Because it updates the Program Counter'
                ],
                answer: 1,
            }
        },
        // Step 5
        {
            componentId: 'reg-file',
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
        // Step 6
        {
            componentId: 'sign-ext',
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
        // Step 7
        {
            componentId: 'mux-alu-src',
            tour: {
                title: 'MUX - ALU Source',
                body: 'This multiplexer chooses the ALU’s second input. For a store instruction, it selects the sign-extended immediate offset instead of a second register value.'
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
        // Step 8
        {
            componentId: 'alu-control',
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
        // Step 9
        {
            componentId: 'alu',
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
        // Step 10
        {
            componentId: 'data-mem',
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
        // Step 11
        {
            componentId: 'mux-mem-to-reg',
            tour: {
                title: 'MUX - Memory to Register',
                body: 'This multiplexer normally chooses what value gets written back to the register file. Since a store instruction does not write a result into a register, this path is not used here.'
            },
            quiz: {
                question: 'Why is MemToReg not used for a store instruction?',
                body: [
                    'Because stores always read from memory',
                    'Because stores do not write a value back to a register',
                    'Because it only works for branches',
                    'Because it computes the offset'
                ],
                answer: 1,
            }
        },
        // Step 12
        {
            componentId: 'adder-pc',
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
        // Step 13
        {
            componentId: 'mux-pc-src',
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
        // Step 14
        {
            componentId: 'pc',
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
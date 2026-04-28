export const loadInstruction = {
    id: 'load',
    label: 'Load Instruction',
    steps: [
        // Step 1
        {
            componentId: 'pc',
            tour: {
                title: 'Program Counter',
                body: 'The Program Counter holds the address of the current instruction and sends that address to instruction memory so the CPU can fetch the load instruction.'
            },
            quiz: {
                question: 'What does the Program Counter provide at the start of a load instruction?',
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
                body: 'Instruction memory uses the address from the PC to fetch the load instruction. The instruction fields, such as opcode, registers, and immediate offset, are then sent through the datapath.'
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
                body: 'The control unit reads the opcode and recognizes a load instruction. It enables memory read and register write, selects the immediate as an ALU input, and prepares the datapath to write loaded data back into a register.'
            },
            quiz: {
                question: 'What is the main job of the control unit during a load instruction?',
                body: [
                    'To compare two registers for branching',
                    'To prepare the datapath to read memory and write the result to a register',
                    'To disable all register activity',
                    'To calculate the jump destination'
                ],
                answer: 1,
            }
        },
        // Step 4
        {
            componentId: 'mux-reg-dst',
            tour: {
                title: 'MUX - Register Destination',
                body: 'This multiplexer chooses which register will receive the loaded value. For a load instruction, it selects the rt field because that is the destination register in an I-type load format.'
            },
            quiz: {
                question: 'Which register field does RegDst select for a load instruction?',
                body: [
                    'rd',
                    'rs',
                    'rt',
                    'The ALU output'
                ],
                answer: 2,
            }
        },
        // Step 5
        {
            componentId: 'reg-file',
            tour: {
                title: 'Register File',
                body: 'The register file reads the base register named by the instruction. That register value will be used as the starting address for calculating the memory location to load from.'
            },
            quiz: {
                question: 'What important value does the register file provide for a load instruction?',
                body: [
                    'The base register value used for address calculation',
                    'The final memory data',
                    'The branch target',
                    'The jump target'
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
                question: 'Why is the load offset sign-extended?',
                body: [
                    'To preserve the correct 32 bit value of the offset',
                    'To turn it into a destination register',
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
                body: 'This multiplexer chooses the ALU’s second input. For a load instruction, it selects the sign-extended immediate offset instead of a second register value.'
            },
            quiz: {
                question: 'What does ALUSrc select for a load instruction?',
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
                body: 'ALU control tells the ALU what operation to perform. For a load instruction, it selects addition so the base register value and offset can be combined into an effective memory address.'
            },
            quiz: {
                question: 'What ALU operation is used for a load instruction?',
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
                body: 'The ALU adds the base register value and the sign-extended offset. The result is the effective address of the memory location the CPU wants to read from.'
            },
            quiz: {
                question: 'What does the ALU calculate for a load instruction?',
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
                body: 'Data memory uses the effective address from the ALU and reads the value stored at that location. This is the actual data being loaded.'
            },
            quiz: {
                question: 'What does data memory do during a load instruction?',
                body: [
                    'Writes a value into memory',
                    'Reads the value stored at the effective address',
                    'Calculates PC + 4',
                    'Selects the destination register'
                ],
                answer: 1,
            }
        },
        // Step 11
        {
            componentId: 'mux-mem-to-reg',
            tour: {
                title: 'MUX - Memory to Register',
                body: 'This multiplexer chooses what value gets written back to the register file. For a load instruction, it selects the value coming from data memory rather than the ALU result.'
            },
            quiz: {
                question: 'What does MemToReg select for a load instruction?',
                body: [
                    'The ALU result',
                    'The value read from data memory',
                    'The branch target',
                    'The sign-extended immediate'
                ],
                answer: 1,
            }
        },
        // Step 12
        {
            componentId: 'reg-file',
            tour: {
                title: 'Register File Write Back',
                body: 'The register file writes the loaded memory value into the destination register chosen earlier. This completes the load instruction.'
            },
            quiz: {
                question: 'What gets written back into the register file at the end of a load instruction?',
                body: [
                    'The ALU control signal',
                    'The branch offset',
                    'The value read from memory',
                    'PC + 4'
                ],
                answer: 2,
            }
        },
        // Step 13
        {
            componentId: 'adder-pc',
            tour: {
                title: 'Adder - PC + 4',
                body: 'This adder computes PC + 4, which is the address of the next sequential instruction. After the load finishes, execution normally continues there.'
            },
            quiz: {
                question: 'What does the PC adder calculate?',
                body: [
                    'The memory value to load',
                    'The destination register',
                    'PC + 4',
                    'The sign-extended offset'
                ],
                answer: 2,
            }
        },
        // Step 14
        {
            componentId: 'mux-pc-src',
            tour: {
                title: 'MUX - PC Source',
                body: 'This multiplexer chooses the next value for the Program Counter. For a normal load instruction, it selects the standard PC + 4 path rather than a branch or jump target.'
            },
            quiz: {
                question: 'What does the PC source multiplexer choose for a normal load instruction?',
                body: [
                    'The jump target',
                    'The branch target',
                    'The normal PC + 4 path',
                    'The data memory output'
                ],
                answer: 2,
            }
        },
        // Step 15
        {
            componentId: 'pc',
            tour: {
                title: 'Program Counter Update',
                body: 'The Program Counter is updated with PC + 4. The CPU is now ready to fetch the next instruction.'
            },
            quiz: {
                question: 'What happens to the Program Counter at the end of a load instruction?',
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
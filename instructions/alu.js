export const aluInstruction = {
    id: 'alu',
    label: 'ALU Instruction',
    steps: [
        // Step 1
        {
            componentId: 'pc',
            tour: {
                title: 'Program Counter',
                body: 'The Program Counter holds the address of the current instruction. At the start of this step, it sends that address to instruction memory so the CPU knows which instruction to fetch.'
            },
            quiz: {
                question: 'What does the Program Counter provide at the start of an ALU instruction?',
                body: [
                    'The final ALU result',
                    'The value from data memory',
                    'The address of the current instruction',
                    'The destination register value'
                ],
                answer: 2,
            }
        },
        // Step 2
        {
            componentId: 'instruction-mem',
            tour: {
                title: 'Instruction Memory',
                body: 'Instruction memory uses the address from the PC to fetch the instruction. That instruction is then split into fields like opcode, register numbers, and function bits for the rest of the datapath.'
            },
            quiz: {
                question: 'What does instruction memory do in this step?',
                body: [
                    'Fetches the instruction using the PC address',
                    'Updates the Program Counter',
                    'Chooses the destination register',
                    'Writes a value into memory'
                ],
                answer: 0,
            }
        },
        // Step 3
        {
            componentId: 'control',
            tour: {
                title: 'Control',
                body: 'The control unit reads the opcode and decides how this instruction should move through the datapath. For an ALU instruction, it enables register reading and register write-back while leaving memory and branch actions off.'
            },
            quiz: {
                question: 'What is the control unit mainly doing for an ALU instruction?',
                body: [
                    'Writing directly to data memory',
                    'Forcing the PC to branch',
                    'Loading data from memory into a register',
                    'Preparing the datapath for register operations and write-back'
                ],
                answer: 3,
            }
        },
        // Step 4
        {
            componentId: 'mux-reg-dst',
            tour: {
                title: 'Multiplexer (MUX) - Register Destination',
                body: 'This multiplexer chooses which instruction field names the destination register. For an ALU instruction, it selects the rd field because the result is written to the destination register in the R-type format.'
            },
            quiz: {
                question: 'Which register field is selected as the destination for an ALU R-type instruction?',
                body: [
                    'rs',
                    'rd',
                    'rt',
                    'The funct field'
                ],
                answer: 1,
            }
        },
        // Step 5
        {
            componentId: 'reg-file',
            tour: {
                title: 'Register File',
                body: 'The register file reads the two source registers named by the instruction. These two values become the inputs that will be used for the arithmetic or logic operation.'
            },
            quiz: {
                question: 'What does the register file provide for an ALU instruction?',
                body: [
                    'Only one source register value',
                    'A memory address and a branch target',
                    'Two source register values',
                    'A jump target and PC + 4'
                ],
                answer: 2,
            }
        },
        // Step 6
        {
            componentId: 'sign-ext',
            tour: {
                title: 'Sign Extend',
                body: 'The sign-extend unit is shown in the datapath, but for a normal ALU R-type instruction its output is not the value the ALU uses. The second ALU operand will come from the register file instead.'
            },
            quiz: {
                question: 'Why is the sign-extend unit not the main input source here?',
                body: [
                    'Because the ALU instruction uses two register operands instead',
                    'Because sign extension is only for jumps',
                    'Because the ALU always reads from memory',
                    'Because the PC replaces the sign-extended value'
                ],
                answer: 0,
            }
        },
        // Step 7
        {
            componentId: 'mux-alu-src',
            tour: {
                title: 'Multiplexer (MUX) - ALU Source',
                body: 'This multiplexer decides the ALU’s second input. For an ALU instruction, it selects the second register value instead of the sign-extended immediate.'
            },
            quiz: {
                question: 'What does the ALUSrc multiplexer select for an ALU instruction?',
                body: [
                    'The data memory output',
                    'The sign-extended immediate',
                    'PC + 4',
                    'The second register value'
                ],
                answer: 3,
            }
        },
        // Step 8
        {
            componentId: 'alu-control',
            tour: {
                title: 'ALU Control',
                body: 'ALU control combines the general ALU operation code from the control unit with the instruction’s funct field. This tells the ALU exactly which operation to perform, such as add, subtract, AND, OR, or set-on-less-than.'
            },
            quiz: {
                question: 'What information helps ALU control decide the exact ALU operation?',
                body: [
                    'Only the Program Counter',
                    'The control signals and the funct field',
                    'Only the destination register',
                    'The memory address and branch flag'
                ],
                answer: 1,
            }
        },
        // Step 9
        {
            componentId: 'alu',
            tour: {
                title: 'Arithmetic Logic Unit (ALU)',
                body: 'The ALU performs the selected arithmetic or logic operation on the two register values. Its output is the final result of the instruction.'
            },
            quiz: {
                question: 'What does the ALU produce during this step?',
                body: [
                    'The final arithmetic or logic result',
                    'The fetched instruction',
                    'The sign-extended immediate',
                    'The branch target address'
                ],
                answer: 0,
            }
        },
        // Step 10
        {
            componentId: 'data-mem',
            tour: {
                title: 'Data Memory',
                body: 'Data memory is part of the full datapath, but an ALU instruction does not read from or write to memory. This stage is effectively bypassed for this instruction type.'
            },
            quiz: {
                question: 'What role does data memory play in a normal ALU instruction?',
                body: [
                    'It updates the Program Counter',
                    'It provides the second ALU input',
                    'It is bypassed and not used',
                    'It stores the ALU result'
                ],
                answer: 2,
            }
        },
        // Step 11
        {
            componentId: 'mux-mem-to-reg',
            tour: {
                title: 'Multiplexer (MUX) - Memory to Register',
                body: 'This multiplexer chooses what value gets written back to the register file. For an ALU instruction, it selects the ALU result rather than data coming from memory.'
            },
            quiz: {
                question: 'What does the MemToReg multiplexer select for an ALU instruction?',
                body: [
                    'The sign-extended immediate',
                    'The ALU result',
                    'The branch target',
                    'The value from data memory'
                ],
                answer: 1,
            }
        },
        // Step 12
        {
            componentId: 'reg-file',
            tour: {
                title: 'Register File',
                body: 'The register file writes the ALU result into the destination register selected earlier. This completes the write-back stage of the ALU instruction.'
            },
            quiz: {
                question: 'What gets written into the destination register at the end of the ALU instruction?',
                body: [
                    'The branch address',
                    'The fetched instruction',
                    'The value from data memory',
                    'The ALU result'
                ],
                answer: 3,
            }
        },
        // Step 13
        {
            componentId: 'adder-pc',
            tour: {
                title: 'Adder - PC + 4',
                body: 'This adder computes PC + 4, which is the address of the next sequential instruction. Since each instruction is 4 bytes, adding 4 moves to the next instruction.'
            },
            quiz: {
                question: 'Why does the PC adder add 4?',
                body: [
                    'Because the funct field is 4 bits',
                    'Because the ALU requires four inputs',
                    'Because each instruction is 4 bytes long',
                    'Because memory always advances by 4 registers'
                ],
                answer: 2,
            }
        },
        // Step 14
        {
            componentId: 'mux-pc-src',
            tour: {
                title: 'Multiplexer (MUX) - PC Source',
                body: 'This multiplexer chooses the next value of the PC. Because this is not a branch or jump, it selects the normal PC + 4 path.'
            },
            quiz: {
                question: 'What does the PC source multiplexer choose for a normal ALU instruction?',
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
                title: 'Program Counter (PC)',
                body: 'The Program Counter is updated with PC + 4. The CPU is now ready to fetch the next instruction.'
            },
            quiz: {
                question: 'What happens to the Program Counter at the end of a normal ALU instruction?',
                body: [
                    'It is cleared to zero',
                    'It is updated with PC + 4',
                    'It stores the ALU result',
                    'It jumps to data memory'
                ],
                answer: 1,
            }
        },
    ],
};
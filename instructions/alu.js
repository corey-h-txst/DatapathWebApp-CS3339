
// Wire Defintion Notation: {id: 'wire-id', state: 0 or 1 for control wires, animate: true/false, direction: 'forward' or 'backward'}

export const aluInstruction = {
    id: 'alu',
    label: 'ALU Instruction',
    steps: [
        // Step 1 - PC
        {
            componentId: 'pc',
            wires: [
                {},
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
        // Step 2 - Instruction Memory
        {
            componentId: 'instruction-mem',
            wires: [
                {},
            ],
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
        // Step 3 - Control
        {
            componentId: 'control',
            wires: [
                {},
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
        // Step 4 - MUX Reg-Dst
        {
            componentId: 'mux-reg-dst',
            wires: [
                {},
            ],
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
        // Step 5 - Register File
        {
            componentId: 'reg-file',
            wires: [
                {},
            ],
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
        // Step 6 - Sign Extend
        {
            componentId: 'sign-ext',
            wires: [
                {},
            ],
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
        // Step 7 - MUX ALU-Src
        {
            componentId: 'mux-alu-src',
            wires: [
                {},
            ],
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
        // Step 8 - ALU Control
        {
            componentId: 'alu-control',
            wires: [
                {},
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
        // Step 9 - ALU
        {
            componentId: 'alu',
            wires: [
                {},
            ],
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
        // Step 10 - Data Memory
        {
            componentId: 'data-mem',
            wires: [
                {},
            ],
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
        // Step 11 - MUX Mem-To-Reg
        {
            componentId: 'mux-mem-to-reg',
            wires: [
                {},
            ],
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
        // Step 12 - Register File
        {
            componentId: 'reg-file',
            wires: [
                {},
            ],
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
        // Step 13 - Adder PC
        {
            componentId: 'adder-pc',
            wires: [
                {},
            ],
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
        // Step 14 - MUX PC-Src
        {
            componentId: 'mux-pc-src',
            wires: [
                {},
            ],
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
        // Step 15 - PC
        {
            componentId: 'pc',
            wires: [
                {},
            ],
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

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
 */

export const jumpInstruction = {
    id: 'jump',
    label: 'JUMP Instruction',
    steps: [
        // Step 1 — Program Counter (PC)
        // The PC holds the address of the current instruction.
        {
            componentId: 'pc',
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
    ],
};
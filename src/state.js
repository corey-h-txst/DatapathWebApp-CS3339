/**
 * state.js
 *
 * Single source of truth for simulation mode and active instruction.
 */

const state = {
    mode: 'learn',  // learn | quiz
    instruction: null,
    stepIndex: 0,
}

export function setMode(mode) { state.mode = mode };
export function getMode() { return state.mode };

export function startSimulation(instruction) {
    state.instruction = instruction;
    state.stepIndex = 0;
}

export function resetSimulation() {
    state.instruction = null;
    state.stepIndex = 0;
}

export function getCurrentStep() {
    return state.instruction?.steps[state.stepIndex] ?? null;
}

export function advance() {
    if (!state.instruction) return false;
    if (state.stepIndex >= state.instruction.steps.length - 1) return false;
    state.stepIndex++;
    return true;
}

export function isFinished() {
    return !state.instruction ||
        state.stepIndex >= state.instruction.steps.length - 1;
}
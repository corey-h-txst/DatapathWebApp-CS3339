/**
 * state.js
 *
 * Single source of truth for simulation mode and active instruction.
 */

const state = {
    mode: 'learn',  // learn | quiz
    instruction: null,
    stepIndex: 0,
    running: false,
}

export function setMode(mode) { state.mode = mode };
export function getMode() { return state.mode };
export function setRunning(isRunning) { state.running = isRunning; }
export function isRunning() { return state.running; }

export function startSimulation(instruction) {
    state.instruction = instruction;
    state.stepIndex = 0;
    state.running = true;
}

export function resetSimulation() {
    state.instruction = null;
    state.stepIndex = 0;
    state.running = false;
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

export function step() {
    const ok = advance();
    if (!ok) return null;
    return getCurrentStep();
}

export function isFinished() {
    return !state.instruction ||
        state.stepIndex >= state.instruction.steps.length - 1;
}
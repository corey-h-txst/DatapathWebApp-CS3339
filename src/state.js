/**
 * state.js
 *
 * Single source of truth for simulation mode and active instruction.
 * All simulation lifecycle transitions flow through this module.
 */

const state = {
    mode: 'learn',       // learn | quiz
    instruction: null,   // currently loaded instruction object
    stepIndex: 0,        // index into instruction.steps
    running: false,      // whether a simulation is currently active
    quizScore: 0,        // number of correctly answered quiz questions
    quizTotal: 0,        // total quiz questions answered
}

/** @param {'learn'|'quiz'} mode */
export function setMode(mode) { state.mode = mode };

/** @returns {'learn'|'quiz'} */
export function getMode() { return state.mode };

/** @param {boolean} isRunning */
export function setRunning(isRunning) { state.running = isRunning; }

/** @returns {boolean} */
export function isRunning() { return state.running; }

/**
 * Records result of answer and increments total number of questions
 *
 * @param {boolean} correct
 */
export function recordAnswer(correct) {
    state.quizTotal++;
    if (correct) state.quizScore++;
}

/**
 * Returns score of quiz
 *
 * @returns {{ score: number, total: number }}
 */
export function getQuizScore() { return { score: state.quizScore, total: state.quizTotal }; }

/**
 * Resets sim state to base and loads currently selected instruction
 *
 * @param {{ id: string, label: string, steps: object[] }} instruction
 */
export function startSimulation(instruction) {
    state.instruction = instruction;
    state.stepIndex = 0;
    state.running = true;
    state.quizScore = 0;
    state.quizTotal = 0;
}

/**
 * Clears all sim state fields to base
 */
export function resetSimulation() {
    state.instruction = null;
    state.stepIndex = 0;
    state.running = false;
    state.quizScore = 0;
    state.quizTotal = 0;
}

/**
 * Returns current step in simulation
 *
 * @returns {{ componentId: string, tour: object, quiz: object } | null}
 */
export function getCurrentStep() {
    return state.instruction?.steps[state.stepIndex] ?? null;
}

/**
 * Advances simulation by 1 step and returns false if at end of sim
 *
 * @returns {boolean} whether the advance succeeded
 */
export function advance() {
    if (!state.instruction) return false;
    if (state.stepIndex >= state.instruction.steps.length - 1) return false;
    state.stepIndex++;
    return true;
}

/**
 * Convenient wrapper that advances sim and returns next step
 *
 * @returns {{ componentId: string, tour: object, quiz: object } | null}
 */
export function step() {
    const ok = advance();
    if (!ok) return null;
    return getCurrentStep();
}

/**
 * Returns when sim is ended and tells tour.js/quiz.js to show final popup
 *
 * @returns {boolean}
 */
export function isFinished() {
    return !state.instruction ||
        state.stepIndex >= state.instruction.steps.length - 1;
}
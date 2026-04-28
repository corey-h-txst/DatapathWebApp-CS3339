/**
 * state.js
 *
 * Single source of truth for simulation mode and active instruction.
 * All simulation lifecycle transitions flow through this module.
 *
 * The state object is module-scoped and not exported directly — all
 * reads and writes go through the exported getter/setter functions.
 * This ensures controlled access and makes it easy to add validation
 * or side effects later.
 */

/**
 * @typedef {Object} Instruction
 * @property {string}   id     - Unique instruction identifier (e.g. 'alu', 'load')
 * @property {string}   label  - Human-readable label (e.g. 'ALU Instruction')
 * @property {object[]} steps  - Array of step objects, each containing
 *                                componentId, wires, tour, and/or quiz data
 */

/**
 * @typedef {Object} Step
 * @property {string}   componentId - The datapath component to focus on
 * @property {object}   [tour]      - Tour step data (title, body)
 * @property {object}   [quiz]      - Quiz step data (question, body[], answer)
 * @property {object[]} [wires]     - Wire state declarations for this step
 */

const state = {
    mode: 'learn',       // 'learn' | 'quiz' — current application mode
    instruction: null,   // Currently loaded instruction object (see Instruction typedef)
    stepIndex: 0,        // Index into instruction.steps for the current step
    running: false,      // Whether a simulation is currently active
    quizScore: 0,        // Number of correctly answered quiz questions
    quizTotal: 0,        // Total quiz questions answered so far
};

// ── Mode accessors ───────────────────────────────────────────────────────────

/**
 * Sets the current application mode.
 *
 * @param {'learn'|'quiz'} mode - The mode to switch to
 */
export function setMode(mode) { state.mode = mode; }

/**
 * Returns the current application mode.
 *
 * @returns {'learn'|'quiz'}
 */
export function getMode() { return state.mode; }

// ── Running state ────────────────────────────────────────────────────────────

/**
 * Sets whether a simulation is currently active.
 *
 * @param {boolean} isRunning
 */
export function setRunning(isRunning) { state.running = isRunning; }

/**
 * Returns whether a simulation is currently active.
 *
 * @returns {boolean}
 */
export function isRunning() { return state.running; }

// ── Quiz scoring ─────────────────────────────────────────────────────────────

/**
 * Records the result of a quiz answer and increments the total question count.
 *
 * @param {boolean} correct - Whether the user's answer was correct
 */
export function recordAnswer(correct) {
    state.quizTotal++;
    if (correct) state.quizScore++;
}

/**
 * Returns the current quiz score as a { score, total } object.
 *
 * @returns {{ score: number, total: number }}
 */
export function getQuizScore() { return { score: state.quizScore, total: state.quizTotal }; }

// ── Simulation lifecycle ─────────────────────────────────────────────────────

/**
 * Resets all simulation state and loads the given instruction.
 * Clears any previous quiz score data.
 *
 * @param {Instruction} instruction - The instruction to simulate
 */
export function startSimulation(instruction) {
    state.instruction = instruction;
    state.stepIndex = 0;
    state.running = true;
    state.quizScore = 0;
    state.quizTotal = 0;
}

/**
 * Clears all simulation state fields back to their defaults.
 * Called when the user clicks Reset or when a simulation ends.
 */
export function resetSimulation() {
    state.instruction = null;
    state.stepIndex = 0;
    state.running = false;
    state.quizScore = 0;
    state.quizTotal = 0;
}

// ── Step navigation ──────────────────────────────────────────────────────────

/**
 * Returns the current step object from the active instruction.
 *
 * @returns {Step|null} The current step, or null if no instruction is loaded
 */
export function getCurrentStep() {
    return state.instruction?.steps[state.stepIndex] ?? null;
}

/**
 * Returns the next step in the active simulation without advancing state.
 * Useful for pre-loading camera targets or wire states for the upcoming step.
 *
 * @returns {Step|null} The next step, or null if at the end or no instruction
 */
export function getNextStep() {
    return state.instruction?.steps[state.stepIndex + 1] ?? null;
}

/**
 * Advances the simulation by one step.
 *
 * @returns {boolean} Whether the advance succeeded (false if at end or no instruction)
 */
export function advance() {
    if (!state.instruction) return false;
    if (state.stepIndex >= state.instruction.steps.length - 1) return false;
    state.stepIndex++;
    return true;
}

/**
 * Convenience wrapper that advances the simulation and returns the new current step.
 *
 * @returns {Step|null} The new current step, or null if advance failed
 */
export function step() {
    const ok = advance();
    if (!ok) return null;
    return getCurrentStep();
}

/**
 * Checks whether the simulation has reached its final step.
 * Used by tour.js and quiz.js to decide whether to show the end card.
 *
 * @returns {boolean} True if the simulation is at or past the last step
 */
export function isFinished() {
    return !state.instruction ||
        state.stepIndex >= state.instruction.steps.length - 1;
}
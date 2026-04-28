/**
 * panels.js
 *
 * Manages all sidebar UI interactions for the Datapath Visualizer.
 * Owns the run button state machine and wires instruction selection,
 * mode toggling, simulation start/step/reset, and the finish callback
 * passed down to tour.js and quiz.js.
 *
 * The sidebar contains:
 *   - Instruction selection buttons (ALU, Load, Store, Branch, Jump, None)
 *   - Mode toggle (Learn / Quiz)
 *   - Run, Step, and Reset buttons
 */

import { setMode, getMode, startSimulation, resetSimulation, advance, getCurrentStep } from '../src/state.js';
import { startTour, renderTourStep } from './tour.js';
import { startQuiz, renderQuizStep } from './quiz.js';
import { hideSimPopup, setComponentPopupsEnabled } from './popup.js';
import { resetWires, clearAccumulatedWires } from '../datapath/wires.js';

import { aluInstruction } from '../instructions/alu.js';
import { loadInstruction }   from '../instructions/load.js';
import { storeInstruction }  from '../instructions/store.js';
import { branchInstruction } from '../instructions/branch.js';
import { jumpInstruction }   from '../instructions/jump.js';

/**
 * Wires all sidebar button interactions.
 * Must be called after the DOM has been parsed and all subsystems initialized.
 */
export function initPanels() {

    // ── Element references ───────────────────────────────────────────────────
    const instructionButtons = document.querySelectorAll('.square-btn');
    const noneBtn            = document.getElementById('none-btn');
    const learnToggle        = document.getElementById('learn-toggle');
    const quizToggle         = document.getElementById('quiz-toggle');
    const toggleContainer    = document.getElementById('mode-toggle-container');
    const runBtn             = document.getElementById('run-btn');
    const resetBtn           = document.getElementById('reset-btn');
    const stepBtn            = document.getElementById('step-btn');

    // Maps button ids to their corresponding instruction data objects
    const instructionMap = {
        'alu-btn':    aluInstruction,
        'load-btn':   loadInstruction,
        'store-btn':  storeInstruction,
        'branch-btn': branchInstruction,
        'jump-btn':   jumpInstruction,
        'none-btn':   null,
    };

    /** @type {object|null} - Currently selected instruction object */
    let selectedInstruction = null;

    // ── Button activation ────────────────────────────────────────────────────

    /**
     * Marks one instruction button as active and dims all others.
     *
     * @param {HTMLElement} activeBtn - The button to activate
     */
    function activateButton(activeBtn) {
        instructionButtons.forEach(btn => {
            if (btn === activeBtn) {
                selectedInstruction = instructionMap[btn.id] ?? null;
                btn.classList.add('active');
                btn.classList.remove('dimmed');
            } else {
                btn.classList.add('dimmed');
                btn.classList.remove('active');
            }
        });
    }

    // ── Run button state ─────────────────────────────────────────────────────

    /**
     * Updates the run button's visual state and disabled property.
     *
     * @param {boolean} isRunning - Whether a simulation is currently active
     */
    function setRunning(isRunning) {
        if (isRunning) {
            runBtn.disabled = true;
            runBtn.classList.add('running');
            runBtn.innerHTML = '<span class="run-dot"></span>Running';
        } else {
            runBtn.disabled = false;
            runBtn.classList.remove('running');
            runBtn.innerHTML = 'Run';
        }
    }

    // ── Simulation finish handler ────────────────────────────────────────────

    /**
     * Called when the tour or quiz end card's Done button is clicked.
     * Hides the sim popup, re-enables component popups, clears wire states,
     * and resets the run button UI.
     */
    function finishSimulation() {
        hideSimPopup();
        setComponentPopupsEnabled(true);
        clearAccumulatedWires();
        resetWires();
        setRunning(false);
    }

    // ── Event wiring ─────────────────────────────────────────────────────────

    // None selected by default
    activateButton(noneBtn);

    // Instruction button clicks — select an instruction for simulation
    instructionButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (runBtn.disabled) return; // Ignore clicks while simulation is running
            activateButton(button);
            selectedInstruction = instructionMap[button.id] ?? null;
        });
    });

    // Run button — starts the simulation in the current mode (learn or quiz)
    runBtn.addEventListener('click', () => {
        if (!selectedInstruction) return;
        clearAccumulatedWires();
        startSimulation(selectedInstruction);
        setComponentPopupsEnabled(false);
        setRunning(true);
        if (getMode() === 'learn') startTour(finishSimulation);
        else startQuiz(finishSimulation);
    });

    // Step button — advances the simulation by one step
    // Only active while a simulation is running
    stepBtn.addEventListener('click', () => {
        if (!selectedInstruction) return;
        if (!runBtn.disabled) return;

        const step = advance();
        if (!step) return;

        const current = getCurrentStep();
        if (!current) return;

        if (getMode() === 'learn') {
            renderTourStep(current);
        } else {
            renderQuizStep(current);
        }
    });

    // Mode toggle — Learn
    learnToggle.addEventListener('click', () => {
        if (runBtn.disabled) return; // Lock mode when sim is running
        learnToggle.classList.add('active');
        quizToggle.classList.remove('active');
        toggleContainer.classList.remove('quiz-mode');
        setMode('learn');
    });

    // Mode toggle — Quiz
    quizToggle.addEventListener('click', () => {
        if (runBtn.disabled) return; // Lock mode when sim is running
        quizToggle.classList.add('active');
        learnToggle.classList.remove('active');
        toggleContainer.classList.add('quiz-mode');
        setMode('quiz');
    });

    // Reset button — returns the page to its base state
    resetBtn.addEventListener('click', () => {
        activateButton(noneBtn);
        learnToggle.classList.add('active');
        quizToggle.classList.remove('active');
        toggleContainer.classList.remove('quiz-mode');
        setMode('learn');
        resetSimulation();
        hideSimPopup();
        setComponentPopupsEnabled(true);
        clearAccumulatedWires();
        resetWires();
        setRunning(false);
    });
}
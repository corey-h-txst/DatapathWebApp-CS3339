/**
 * panel.js
 * 
 * Manages all sidebar UI interactions for the Datapath Visualizer
 * Owns the run button state machine and wires instruction selection,
 * mode toggling, simulation start/step/reset, and the finish callback
 * passed down to tour.js and quiz.js.
 */

import { setMode, getMode, startSimulation, resetSimulation, advance, getCurrentStep } from '../src/state.js';
import { startTour, renderTourStep } from './tour.js';
import { startQuiz, renderQuizStep } from './quiz.js';
import { hideSimPopup, setComponentPopupsEnabled } from './popup.js';
import { aluInstruction } from '../instructions/alu.js';
import { loadInstruction }   from '../instructions/load.js';
import { storeInstruction }  from '../instructions/store.js';
import { branchInstruction } from '../instructions/branch.js';
import { jumpInstruction }   from '../instructions/jump.js';

/**
 * Wires all sidebar button interactions.
 * Must be called after the DOM has been parsed.
 */
export function initPanels() {

    // Element references
    const instructionButtons = document.querySelectorAll('.square-btn');
    const noneBtn            = document.getElementById('none-btn');
    const learnToggle        = document.getElementById('learn-toggle');
    const quizToggle         = document.getElementById('quiz-toggle');
    const toggleContainer    = document.getElementById('mode-toggle-container');
    const runBtn             = document.getElementById('run-btn');
    const resetBtn           = document.getElementById('reset-btn');
    const stepBtn            = document.getElementById('step-btn');

    const instructionMap = {
        'alu-btn':    aluInstruction,
        'load-btn':   loadInstruction,
        'store-btn':  storeInstruction,
        'branch-btn': branchInstruction,
        'jump-btn':   jumpInstruction,
        'none-btn':   null,
    };

    // Tracks which instruction is currently selected
    let selectedInstruction = null;

    /**
     * Marks one instruction button as active and dims all others.
     *
     * @param {HTMLElement} activeBtn
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

    /**
     * Handles behavior for run button and updates sim state to running
     *
     * @param {bool} isRunning
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

    /**
     * Called when the tour or quiz end card's Done button
     * is clicked and hides sim popup
     */
    function finishSimulation() {
        hideSimPopup();
        setComponentPopupsEnabled(true);
        setRunning(false);  // resets run button UI
    }

    // None selected by default
    activateButton(noneBtn);

    // Instruction button clicks
    instructionButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Ignore clicks while simulation is running
            if (runBtn.disabled) return;
            activateButton(button);
            selectedInstruction = instructionMap[button.id] ?? null;
        });
    })

    // Starts simulation
    runBtn.addEventListener('click', () => {
        if (!selectedInstruction) return;
        startSimulation(selectedInstruction);
        setComponentPopupsEnabled(false);
        setRunning(true);
        if (getMode() === 'learn') startTour(finishSimulation);
        else startQuiz(finishSimulation);
    });

    // Step simulation forward one cycle
    // Only active while simulation is running
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

    // Mode toggle — learn
    learnToggle.addEventListener('click', () => {
        if (runBtn.disabled) return; // Lock mode when sim is running
        learnToggle.classList.add('active');
        quizToggle.classList.remove('active');
        toggleContainer.classList.remove('quiz-mode');
        setMode('learn');
    });

    // Mode toggle — quiz
    quizToggle.addEventListener('click', () => {
        if (runBtn.disabled) return; // Lock mode when sim is running
        quizToggle.classList.add('active');
        learnToggle.classList.remove('active');
        toggleContainer.classList.add('quiz-mode');
        setMode('quiz');
    });

    // Resets page to base state
    resetBtn.addEventListener('click', () => {
        activateButton(noneBtn);
        learnToggle.classList.add('active');
        quizToggle.classList.remove('active');
        toggleContainer.classList.remove('quiz-mode');
        setMode('learn');
        resetSimulation();
        hideSimPopup();
        setComponentPopupsEnabled(true);
        setRunning(false);
    });
}
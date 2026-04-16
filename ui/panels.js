/**
 * panel.js
 * 
 * Manages all sidebar UI interactions for the Datapath Visualizer
 * 
 * All logic is wrapped in DOMContentLoaded to gurantee all elements exist
 * before any event listeners are attached
 */

import { setMode, getMode, startSimulation, resetSimulation } from '../src/state.js';
import { startTour, endTour } from './tour.js';
import { startQuiz, endQuiz } from './quiz.js';
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
    const resetBtn           = document.getElementById('reset-btn');

    const instructionMap = {
        'alu-btn':    aluInstruction,
        'load-btn':   loadInstruction,
        'store-btn':  storeInstruction,
        'branch-btn': branchInstruction,
        'jump-btn':   jumpInstruction,
        'none-btn':   null,
    };

    /**
     * Marks one instruction button as active and dims all others.
     *
     * @param {HTMLElement} activeBtn
     */
    function activateButton(activeBtn) {
        instructionButtons.forEach(btn => {
            if (btn === activeBtn) {
                btn.classList.add('active');
                btn.classList.remove('dimmed');
            } else {
                btn.classList.add('dimmed');
                btn.classList.remove('active');
            }
        });
    }

    // None selected by default
    activateButton(noneBtn);

    // Instruction button clicks
    instructionButtons.forEach(button => {
        button.addEventListener('click', () => {
            activateButton(button);
            const instruction = instructionMap[button.id];

            if (!instruction) {
                resetSimulation();
                endTour();
                endQuiz();
                return;
            }

            startSimulation(instruction);

            if (getMode() === 'learn') startTour();
            else startQuiz();
        });
    });

    // Mode toggle — learn
    learnToggle.addEventListener('click', () => {
        learnToggle.classList.add('active');
        quizToggle.classList.remove('active');
        toggleContainer.classList.remove('quiz-mode');
        setMode('learn');
    });

    // Mode toggle — quiz
    quizToggle.addEventListener('click', () => {
        quizToggle.classList.add('active');
        learnToggle.classList.remove('active');
        toggleContainer.classList.add('quiz-mode');
        setMode('quiz');
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        activateButton(noneBtn);
        learnToggle.classList.add('active');
        quizToggle.classList.remove('active');
        toggleContainer.classList.remove('quiz-mode');
        setMode('learn');
        resetSimulation();
        endTour();
        endQuiz();
    });
}
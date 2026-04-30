/**
 * quiz.js
 *
 * UI handler for quiz-mode.
 * Iterates through instruction steps, rendering each quiz question in the sim popup
 * while letting popup.js handle display logic.
 *
 * The quiz flow:
 *   1. startQuiz() renders the first question
 *   2. User selects an answer → score is recorded, correct answer is revealed
 *   3. User clicks Next → _onNext() advances or shows the scored end card
 *   4. End card's Done button calls the onFinish callback (from panels.js)
 */

import { getCurrentStep, getNextStep, advance, isFinished, getQuizScore, recordAnswer } from '../src/state.js';
import { applyWireStep } from '../datapath/wires.js';
import { showQuizPopup, showQuizEndPopup } from './popup.js';
import { animateStepCamera } from './step-camera.js';

/**
 * Saved at startQuiz() so _onNext can read it directly.
 * Without this, onFinish would have to be passed as a parameter through
 * _renderCurrentStep → renderQuizStep → showQuizPopup just to reach _onNext.
 *
 * @type {(() => void)|null}
 */
let _onFinish = null;

/**
 * Starts the quiz for the currently loaded instruction.
 * Renders the first question immediately.
 *
 * @param {() => void} onFinish - Called when the user dismisses the end card
 */
export function startQuiz(onFinish) {
    _onFinish = onFinish;
    _renderCurrentStep();
}

/**
 * Renders a specific quiz step into the sim popup.
 * Applies wire states, animates the camera, and shows the quiz popup.
 * recordAnswer is passed as onAnswer so popup.js can score each choice click.
 *
 * @param {{ componentId: string, quiz: { question: string, body: string[], answer: number } }} step
 */
export function renderQuizStep(step) {
    if (!step) return;

    applyWireStep(step);
    animateStepCamera(step, getNextStep());
    showQuizPopup(step.quiz, _onNext, recordAnswer);
}

/**
 * Handles the Next button click inside the quiz popup.
 * Shows the scored end card on the last step, otherwise advances and re-renders.
 */
function _onNext() {
    if (isFinished()) {
        showQuizEndPopup(getQuizScore(), _onFinish);
        return;
    }
    advance();
    _renderCurrentStep();
}

/** Reads the current step from state and renders it. */
function _renderCurrentStep() {
    const step = getCurrentStep();
    if (!step) return;
    renderQuizStep(step);
}
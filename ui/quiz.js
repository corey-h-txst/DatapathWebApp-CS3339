/**
 * quiz.js
 *
 * UI handler for quiz-mode.
 * Goes through instruction steps rendering each sim popup
 * while letting popup.js handle display logic
 */

import { getCurrentStep, advance, isFinished, getQuizScore, recordAnswer } from '../src/state.js';
import { panToPoint } from '../datapath/canvas.js';
import { getComponent } from '../datapath/components.js';
import { applyWireStep } from '../datapath/wires.js';
import { showQuizPopup, showQuizEndPopup} from './popup.js';

// Saved at startTour()/startQuiz() so _onNext can read it directly.
// Without this, onFinish would have to be passed as a parameter through
// _renderCurrentStep → renderTourStep → showTourPopup just to reach _onNext.
let _onFinish = null;

/**
 * Starts the quiz for the currently loaded instruction
 * Renders the first question immediately
 *
 * @param {() => void} onFinish - called when the user dismisses the end card
 */
export function startQuiz(onFinish) {
    _onFinish = onFinish;
    _renderCurrentStep();
}

/**
 * Renders a specific quiz step into the sim popup.
 *
 * @param {{ componentId: string, quiz: { question: string, body: string[], answer: number } }} step
 */
export function renderQuizStep(step) {
    if (!step) return;

    applyWireStep(step);

    // Pan the canvas to center on this step's component
    const def = getComponent(step.componentId);
    if (def) {
        const cx = def.x + (def.width  ?? 80) / 2;
        const cy = def.y + (def.height ?? 80) / 2;
        panToPoint(cx, cy);
    }
    // recordAnswer is passed as onAnswer so popup.js can score each choice click
    showQuizPopup(step.quiz, _onNext, recordAnswer);
}

/**
 * Handles the Next button click inside the quiz popup
 * Shows the scored end card on the last step, otherwise advances and re-renders
 */
function _onNext() {
    if (isFinished()) {
        showQuizEndPopup(getQuizScore(), _onFinish)
        return;
    }
    advance();
    _renderCurrentStep();
}

/** Reads current step from state and renders it */
function _renderCurrentStep() {
    const step = getCurrentStep();
    if (!step) return;
    renderQuizStep(step);
}

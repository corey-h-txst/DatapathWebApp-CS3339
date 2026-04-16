/**
 * quiz.js
 *
 * UI handler for quiz-mode.
 */

import { getCurrentStep, advance, isFinished } from '../src/state.js';
import { panToComponent } from '../datapath/canvas.js';
import { showPopup, hidePopup } from './popup.js';

export function startQuiz() { _renderCurrentStep(); }

export function endQuiz() {
    hidePopup();
    // TODO: show score/completion
}

function _renderCurrentStep() {
    const step = getCurrentStep();
    if (!step) return;
    
    const def = getComponent(step.componentId);
    if (def) {
        const cx = def.x + (def.width ?? 80) / 2;
        const cy = def.y + (def.height ?? 80) / 2;
        panToPoint(cx, cy);
    }

    showPopup({ label: step.quiz.question, info: null, quiz: step.quiz }, null);
}

/**
 * Called when the user selects a choice.
 * 
 * @param {number} choiceIndex 
 */
export function submitAnswer(choiceIndex) {
    const step = getCurrentStep();
    if (!step) return;

    const correct = choiceIndex === step.quiz.answer;
    // TODO: render feedback in popup

    if (correct && !isFinished()) {
        advance();
        _renderCurrentStep();
    } else if (correct && isFinished()) {
        endQuiz();
    }
}
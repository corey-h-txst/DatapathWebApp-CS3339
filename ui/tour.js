/**
 * tour.js
 *
 * UI handler for learn-mode tours.
 */

import { getCurrentStep, advance, isFinished } from '../src/state.js';
import { panToComponent } from '../datapath/canvas.js';
import { showPopup, hidePopup } from './popup.js';

export function startTour() { _renderCurrentStep(); }

export function nextTourStep() {
    if (isFinished()) {
        endTour();
        return;
    }
    advance();
    _renderCurrentStep();
}

export function endTour() {
    hidePopup();
    // TODO: show completion message
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

    showPopup({ label: step.tour.title, info: step.tour.body }, null);
}
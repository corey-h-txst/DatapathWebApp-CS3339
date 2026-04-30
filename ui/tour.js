/**
 * tour.js
 *
 * UI handler for learn-mode tours.
 * Iterates through instruction steps, rendering each one in the sim popup
 * while letting popup.js handle display logic.
 *
 * The tour flow:
 *   1. startTour() renders the first step
 *   2. User clicks Next → _onNext() advances or shows the end card
 *   3. End card's Done button calls the onFinish callback (from panels.js)
 */

import { getCurrentStep, getNextStep, advance, isFinished } from '../src/state.js';
import { applyWireStep } from '../datapath/wires.js';
import { showTourPopup, showTourEndPopup } from './popup.js';
import { animateStepCamera } from './step-camera.js';

/**
 * Saved at startTour() so _onNext can read it directly.
 * Without this, onFinish would have to be passed as a parameter through
 * _renderCurrentStep → renderTourStep → showTourPopup just to reach _onNext.
 *
 * @type {(() => void)|null}
 */
let _onFinish = null;

/**
 * Starts the tour for the currently loaded instruction.
 * Renders the first step immediately.
 *
 * @param {() => void} onFinish - Called when the user dismisses the end card
 */
export function startTour(onFinish) {
    _onFinish = onFinish;
    _renderCurrentStep();
}

/**
 * Renders a specific tour step into the sim popup.
 * Applies wire states, animates the camera, and shows the tour popup.
 *
 * @param {{ componentId: string, tour: { title: string, body: string } }} step
 */
export function renderTourStep(step) {
    if (!step) return;

    applyWireStep(step);
    animateStepCamera(step, getNextStep());

    showTourPopup(step.tour, _onNext);
}

/**
 * Handles the Next button click inside the tour popup.
 * Shows the end card on the last step, otherwise advances and re-renders.
 */
function _onNext() {
    if (isFinished()) {
        showTourEndPopup(_onFinish);
        return;
    }
    advance();
    _renderCurrentStep();
}

/** Reads the current step from state and renders it. */
function _renderCurrentStep() {
    const step = getCurrentStep();
    if (!step) return;
    renderTourStep(step);
}
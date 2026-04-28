/**
 * simulator.js
 *
 * Initializes the simulator control buttons (run, step, reset).
 * Uses a guard flag to ensure controls are only initialized once,
 * even if initSimulatorControls is called multiple times.
 */

/** @type {boolean} */
let controlsInitialized = false;

/**
 * Wires up click handlers for the run, step, and reset buttons.
 * Each click removes the "active" class from all controls and
 * adds it to the clicked button for visual feedback.
 * Idempotent — subsequent calls are no-ops.
 */
export function initSimulatorControls() {
    if (controlsInitialized) return;

    const controls = [
        document.getElementById("run-btn"),
        document.getElementById("step-btn"),
        document.getElementById("reset-btn"),
    ].filter(Boolean);

    controls.forEach((button) => {
        button.addEventListener("click", () => {
            controls.forEach((control) => control.classList.remove("active"));
            button.classList.add("active");
        });
    });

    controlsInitialized = true;
}
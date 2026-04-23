let controlsInitialized = false;

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

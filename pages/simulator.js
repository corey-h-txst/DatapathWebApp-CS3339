const runBtn = document.getElementById("run-btn");
const stepBtn = document.getElementById("step-btn");
const resetBtn = document.getElementById("reset-btn");
const controls = [runBtn, stepBtn, resetBtn];
controls.forEach(btn => {
    btn.addEventListener("click", () => {
        controls.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

// Place for sidebar content stuff and updates on click or step change
const instructionButtons = document.querySelectorAll('.square-btn');
instructionButtons.forEach(button => {
    button.addEventListener('click', () => {

        // 3. When a button is clicked, loop through all buttons to update them
        instructionButtons.forEach(btn => {
            if (btn === button) {
                // If it's the one we just clicked, highlight it
                btn.classList.add('active');
                btn.classList.remove('dimmed');
            } else {
                // If it's any other button, dim it
                btn.classList.add('dimmed');
                btn.classList.remove('active');
            }
        });

    });
//Toggle for Lean/Quiz Mode
    const learnToggle = document.getElementById('learn-toggle');
    const quizToggle = document.getElementById('quiz-toggle');
    const toggleContainer = document.getElementById('mode-toggle-container');

    learnToggle.addEventListener('click', () => {
        learnToggle.classList.add('active');
        quizToggle.classList.remove('active');
        toggleContainer.classList.remove('quiz-mode');
    });

    quizToggle.addEventListener('click', () => {
        quizToggle.classList.add('active');
        learnToggle.classList.remove('active');
        toggleContainer.classList.add('quiz-mode');
    });

//Reset Button Logic
    const resetBtn = document.getElementById('reset-btn');

    resetBtn.addEventListener('click', () => {
        // 1. Unselect all instruction buttons
        // This removes both the active highlight and the dimmed effect,
        // returning them all to their default, fully-colored state.
        instructionButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.classList.remove('dimmed');
        });

        // 2. Reset the toggle switch back to Learn mode
        // This physically slides the block back to the left and updates the text color
        learnToggle.classList.add('active');
        quizToggle.classList.remove('active');
        toggleContainer.classList.remove('quiz-mode');

        console.log("UI Reset to default state");
    });
});
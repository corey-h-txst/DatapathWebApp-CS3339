/**
 * panel.js
 * 
 * Manages all sidebar UI interactions for the Datapath Visualizer
 * 
 * All logic is wrapped in DOMContentLoaded to gurantee all elements exist
 * before any event listeners are attached
 */

document.addEventListener('DOMContentLoaded', () => {

    // Element References
    const instructionButtons = document.querySelectorAll('.square-btn');
    const noneBtn = document.getElementById('none-btn');
    const learnToggle = document.getElementById('learn-toggle');
    const quizToggle = document.getElementById('quiz-toggle');
    const toggleContainer = document.getElementById('mode-toggle-container');
    const resetBtn = document.getElementById('reset-btn');


    /**
     * Marks one instruction as active and dims all other
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

    // 'None' is selected by default
    activateButton(noneBtn);

    // Instruction button highlighting
    instructionButtons.forEach(button => {
        button.addEventListener('click', () => activateButton(button));
    });

    // Mode toggle
    learnToggle.addEventListener('click', () => {
        learnToggle.classList.add('active');
        quizToggle.classList.remove('active');
        toggleContainer.classList.remove('quiz-mode');
    })

    quizToggle.addEventListener('click', () => {
        quizToggle.classList.add('active');
        learnToggle.classList.remove('active');
        toggleContainer.classList.add('quiz-mode')
    })

    // Reset button
    resetBtn.addEventListener('click', () => {
        activateButton(noneBtn);
        learnToggle.classList.add('active');
        quizToggle.classList.remove('active');
        toggleContainer.classList.remove('quiz-mode');
        console.log("UI reset to default state");
    })
})
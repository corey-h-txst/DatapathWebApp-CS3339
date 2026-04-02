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

        // Reset zoom and pan
        scale = 1;
        panX = 0;
        panY = 50;
        updateTransform();

        console.log("UI Reset to default state");
    });
});

//Zoom Logic
const svg = document.getElementById('datapath-svg');
const viewport = document.getElementById('viewport');

// --- 1. Variables & State ---
let scale = 1.2;
let panX = 0;
let panY = 0;
let isDragging = false;
let startX, startY;

const zoomSpeed = 0.1;
const maxZoom = 3;
const minZoom = 0.3;

// Set initial cursor style
svg.style.cursor = 'grab';

// --- 2. Core Functions ---

function updateTransform() {
    viewport.setAttribute('transform', `translate(${panX}, ${panY}) scale(${scale})`);
}

function centerOn(targetX, targetY) {
    const rect = svg.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    panX = centerX - (targetX * scale);
    panY = centerY - (targetY * scale);

    updateTransform();
}

// --- 3. Event Listeners ---

// Startup: Center on Main ALU
window.addEventListener('load', () => {
    centerOn(540, 280);
});

// Panning: Mouse Down
svg.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    svg.style.cursor = 'grabbing';
    startX = e.clientX - panX;
    startY = e.clientY - panY;
});

// Panning: Mouse Move (Global)
window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    updateTransform();
});

// Panning: Mouse Up
window.addEventListener('mouseup', () => {
    isDragging = false;
    svg.style.cursor = 'grab';
});

// Zoom: Mouse Wheel (Zoom into Cursor)
svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const oldScale = scale;
    if (e.deltaY < 0) {
        scale = Math.min(scale + zoomSpeed, maxZoom);
    } else {
        scale = Math.max(scale - zoomSpeed, minZoom);
    }

    // Adjust pan so the cursor stays over the same point
    panX = mouseX - (mouseX - panX) * (scale / oldScale);
    panY = mouseY - (mouseY - panY) * (scale / oldScale);

    updateTransform();
}, { passive: false });

// Zoom: Button Controls (Zoom into Center)
document.getElementById('zoom-in').addEventListener('click', () => {
    const oldScale = scale;
    scale = Math.min(scale + 0.2, maxZoom);
    const centerX = svg.clientWidth / 2;
    const centerY = svg.clientHeight / 2;
    panX = centerX - (centerX - panX) * (scale / oldScale);
    panY = centerY - (centerY - panY) * (scale / oldScale);
    updateTransform();
});

document.getElementById('zoom-out').addEventListener('click', () => {
    const oldScale = scale;
    scale = Math.max(scale - 0.2, minZoom);
    const centerX = svg.clientWidth / 2;
    const centerY = svg.clientHeight / 2;
    panX = centerX - (centerX - panX) * (scale / oldScale);
    panY = centerY - (centerY - panY) * (scale / oldScale);
    updateTransform();
});

document.getElementById('zoom-reset').addEventListener('click', () => {
    scale = 1.2;
    centerOn(540, 280);
});
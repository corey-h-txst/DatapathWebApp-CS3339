/**
 * popup.js
 *
 * Manages two popup types:
 *   1. Small component info popup — shown when the user clicks a datapath component.
 *      Displays the component's label and description. Draggable via its handle.
 *   2. Large simulation popup — used for tour steps, quiz questions, and end cards.
 *      Shared across tour.js and quiz.js; each replaces the body content with
 *      their respective data. Also draggable.
 *
 * Both popups are positioned within .canvas-wrapper and clamped so they never
 * overflow the wrapper bounds.
 */

// ── Component popup (small, draggable) ───────────────────────────────────────

/** @type {HTMLElement|null} */
let popupElement = null;

/** @type {boolean} - Disabled while a simulation is running */
let allowComponentPopup = true;

/**
 * Enables or disables the small component popup.
 * Disabled while a simulation is running so component clicks don't spawn info cards.
 *
 * @param {boolean} enabled
 */
export function setComponentPopupsEnabled(enabled) { allowComponentPopup = enabled; }

/**
 * Creates the small component popup and appends it to .canvas-wrapper.
 * The popup starts hidden and is reused for every subsequent component click.
 * Call once at app init.
 */
export function initPopup() {
    popupElement = document.createElement('div');
    popupElement.id = 'component-popup';
    popupElement.innerHTML = `
        <div class="popup__handle">
            <button class="popup__close" aria-label="Close">✕</button>
        </div>
        <h3 class="popup__title"></h3>
        <p class="popup__body"></p>
    `;
    popupElement.style.display = 'none';

    document.querySelector('.canvas-wrapper').appendChild(popupElement);
    popupElement.querySelector('.popup__close').addEventListener('click', hidePopup);

    _makeDraggable(popupElement, popupElement.querySelector('.popup__handle'));
}

/**
 * Populates the small popup with a component's label and description,
 * then positions and displays it near the user's cursor.
 *
 * @param {{ label: string, info?: string }} def - Component entry from COMPONENTS
 * @param {MouseEvent} nativeEvent - The original click event for cursor positioning
 */
export function showPopup(def, nativeEvent) {
    if (!popupElement) return;
    if (!allowComponentPopup) return;

    popupElement.querySelector('.popup__title').textContent = def.label;
    popupElement.querySelector('.popup__body').textContent  = def.info ?? '';
    popupElement.style.display = 'block';
    if (nativeEvent) _positionNearCursor(popupElement, nativeEvent);
}

/**
 * Hides the small component popup.
 * Called by the close button and by the global stage click dismiss handler.
 */
export function hidePopup() {
    if (popupElement) popupElement.style.display = 'none';
}

// ── Simulation popup (large, draggable) ──────────────────────────────────────

/** @type {HTMLElement|null} */
let simPopup = null;

/**
 * Creates the large draggable sim popup and appends it to .canvas-wrapper.
 * The popup is shared across tour steps, quiz questions, and end cards;
 * each replaces the body content with their respective data.
 * Call once at app init alongside initPopup().
 */
export function initSimPopup() {
    simPopup = document.createElement('div');
    simPopup.id = 'sim-popup';
    simPopup.className = 'sim-popup--hidden';
    simPopup.innerHTML = `
        <div class="sim-popup__handle">
            <span class="sim-popup__drag-hint">⠿ drag</span>
        </div>
        <div class="sim-popup__body"></div>
        <div class="sim-popup__footer">
            <button class="sim-popup__next">Next →</button>
        </div>
    `;

    document.querySelector('.canvas-wrapper').appendChild(simPopup);
    _centerInWrapper(simPopup);
    _makeDraggable(simPopup, simPopup.querySelector('.sim-popup__handle'));
}

/**
 * Renders a tour step into the sim popup.
 *
 * @param {{ title: string, body: string }} tourData - Tour step content
 * @param {() => void} onNext - Called when the Next button is clicked
 */
export function showTourPopup(tourData, onNext) {
    if (!simPopup) return;

    simPopup.querySelector('.sim-popup__body').innerHTML = `
        <div class="sim-popup__title">${_esc(tourData.title)}</div>
        <div class="sim-popup__text">${_esc(tourData.body)}</div>
    `;

    _setNextHandler(onNext);
    _showNextBtn(true);
    _showSimPopup();
}

/**
 * Renders a quiz question into the sim popup.
 * The Next button stays hidden until the user selects an answer.
 * Once answered, all choices are locked and the correct answer is always revealed.
 *
 * @param {{ question: string, body: string[], answer: number }} quizData - Quiz step content
 * @param {() => void} onNext - Called when the Next button is clicked after answering
 * @param {(correct: boolean) => void} onAnswer - Called immediately on choice click to record score
 */
export function showQuizPopup(quizData, onNext, onAnswer) {
    if (!simPopup) return;

    const choicesHtml = quizData.body
        .map((choice, i) => `<button class="quiz-choice" data-index="${i}">${_esc(choice)}</button>`)
        .join('');

    simPopup.querySelector('.sim-popup__body').innerHTML = `
        <div class="sim-popup__question">${_esc(quizData.question)}</div>
        <div class="quiz-choices">${choicesHtml}</div>
        <div class="quiz-feedback"></div>
    `;

    _showNextBtn(false);

    // Attach click handlers to each choice button
    simPopup.querySelectorAll('.quiz-choice').forEach(btn => {
        btn.addEventListener('click', () => {
            const chosen  = parseInt(btn.dataset.index, 10);
            const correct = chosen === quizData.answer;

            if (onAnswer) onAnswer(correct);

            const feedback = simPopup.querySelector('.quiz-feedback');

            // Lock all choices and clear any prior result classes
            simPopup.querySelectorAll('.quiz-choice').forEach(b => {
                b.disabled = true;
                b.classList.remove('correct', 'incorrect');
            });

            btn.classList.add(correct ? 'correct' : 'incorrect');
            // Always highlight the correct answer regardless of what was chosen
            simPopup.querySelectorAll('.quiz-choice')[quizData.answer].classList.add('correct');

            feedback.textContent = correct ? '✓ Correct!' : '✗ Incorrect — see the correct answer above.';
            feedback.className   = `quiz-feedback ${correct ? 'correct' : 'incorrect'}`;

            _setNextHandler(onNext);
            _showNextBtn(true);
        });
    });

    _showSimPopup();
}

/**
 * Replaces the sim popup body with a congratulatory tour completion card.
 *
 * @param {() => void} onClose - Called when the user clicks Done
 */
export function showTourEndPopup(onClose) {
    if (!simPopup) return;

    simPopup.querySelector('.sim-popup__body').innerHTML = `
        <div class="end-card">
            <div class="end-card__icon">🎉</div>
            <div class="end-card__heading">Tour Complete!</div>
            <div class="end-card__sub">
                Great work — you've stepped through the entire datapath for this instruction.
                Use the Reset button whenever you're ready to explore another one.
            </div>
        </div>
    `;

    _setNextHandler(onClose);
    simPopup.querySelector('.sim-popup__next').textContent = 'Done ✓';
    _showNextBtn(true);
    _showSimPopup();
}

/**
 * Replaces the sim popup body with a scored quiz results card.
 * Tier, icon, heading, and phrase are all chosen based on percentage score:
 *   high ≥ 80% | mid ≥ 50% | low < 50%
 *
 * @param {{ score: number, total: number }} result - Quiz score data
 * @param {() => void} onClose - Called when the user clicks Done
 */
export function showQuizEndPopup(result, onClose) {
    if (!simPopup) return;

    const { score, total } = result;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    const tier    = pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low';
    const icon    = tier === 'high' ? '🏆' : tier === 'mid' ? '💪' : '📚';
    const phrase  = _scorePhrase(pct);
    const heading = tier === 'high' ? 'Excellent Work!' :
                    tier === 'mid'  ? 'Good Effort!'    : 'Keep Practicing!';

    simPopup.querySelector('.sim-popup__body').innerHTML = `
        <div class="end-card">
            <div class="end-card__icon">${icon}</div>
            <div class="end-card__heading">${_esc(heading)}</div>
            <div class="end-card__score tier-${tier}">
                <span class="end-card__score-fraction">${score} / ${total}</span>
                <span class="end-card__score-pct">${pct}%</span>
            </div>
            <div class="end-card__phrase">${_esc(phrase)}</div>
            <div class="end-card__sub">
                Hit Reset whenever you're ready to try again or switch instructions.
            </div>
        </div>
    `;

    _setNextHandler(onClose);
    simPopup.querySelector('.sim-popup__next').textContent = 'Done ✓';
    _showNextBtn(true);
    _showSimPopup();
}

/**
 * Returns an encouraging or congratulatory phrase based on percentage score.
 *
 * @param {number} pct - Score percentage (0–100)
 * @returns {string}
 */
function _scorePhrase(pct) {
    if (pct === 100) return "Perfect score — you clearly know this datapath cold!";
    if (pct >= 80)   return "Really strong result. You've got a solid grasp of the datapath.";
    if (pct >= 60)   return "Nice work! A bit more review and you'll have this down.";
    if (pct >= 40)   return "You're getting there — revisit the tour to shore up the gaps.";
    if (pct >= 20)   return "This stuff is tricky. Try the Learn tour first, then come back.";
    return                  "Don't sweat it — everyone starts somewhere. The tour is a great first step.";
}

/** Hides the sim popup by adding the hidden CSS class. */
export function hideSimPopup() {
    if (simPopup) simPopup.classList.add('sim-popup--hidden');
}

// ── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Positions an element near the cursor with a fixed offset, then clamps it
 * so it never overflows any edge of .canvas-wrapper.
 *
 * @param {HTMLElement} element    - The popup element to position
 * @param {MouseEvent}  nativeEvent - The original mouse event for cursor position
 */
function _positionNearCursor(element, nativeEvent) {
    const OFFSET  = 15;
    const wrapper = document.querySelector('.canvas-wrapper');
    const wRect   = wrapper.getBoundingClientRect();

    let left = nativeEvent.clientX - wRect.left + OFFSET;
    let top  = nativeEvent.clientY - wRect.top  + OFFSET;

    const overflowX = left + element.offsetWidth  - wRect.width;
    const overflowY = top  + element.offsetHeight - wRect.height;

    if (overflowX > 0) left -= overflowX + OFFSET;
    if (overflowY > 0) top  -= overflowY + OFFSET;

    element.style.left = `${Math.max(OFFSET, left)}px`;
    element.style.top  = `${Math.max(OFFSET, top)}px`;
}

/**
 * Positions an element in the top-right corner of .canvas-wrapper with
 * generous padding from the top and right edges.
 * Uses rAF so the element has rendered dimensions before they are read.
 *
 * @param {HTMLElement} element - The popup element to center
 */
function _centerInWrapper(element) {
    const wrapper = document.querySelector('.canvas-wrapper');
    requestAnimationFrame(() => {
        const wRect = wrapper.getBoundingClientRect();
        const eRect = element.getBoundingClientRect();
        const padding = 48;
        element.style.left = `${Math.max(padding, wRect.width - eRect.width - padding)}px`;
        element.style.top  = `${Math.max(padding, padding)}px`;
    });
}

/**
 * Makes an element draggable within .canvas-wrapper via a dedicated handle.
 * Position is clamped so the element can never be dragged outside the wrapper bounds.
 *
 * @param {HTMLElement} element - Element to move
 * @param {HTMLElement} handle  - Element the user grabs to initiate the drag
 */
function _makeDraggable(element, handle) {
    let startX, startY, startLeft, startTop;

    handle.addEventListener('mousedown', e => {
        e.preventDefault();
        const wrapper = document.querySelector('.canvas-wrapper');
        const wRect   = wrapper.getBoundingClientRect();

        startX    = e.clientX;
        startY    = e.clientY;
        startLeft = parseInt(element.style.left, 10) || 0;
        startTop  = parseInt(element.style.top,  10) || 0;

        function onMove(e) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            const maxLeft = wRect.width  - element.offsetWidth;
            const maxTop  = wRect.height - element.offsetHeight;

            element.style.left = `${Math.max(0, Math.min(startLeft + dx, maxLeft))}px`;
            element.style.top  = `${Math.max(0, Math.min(startTop  + dy, maxTop ))}px`;
        }

        function onUp() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup',   onUp);
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup',   onUp);
    });
}

/** Removes the hidden class from the sim popup and re-centers it. */
function _showSimPopup() {
    simPopup.classList.remove('sim-popup--hidden');
    _centerInWrapper(simPopup);
}

/**
 * Shows or hides the sim popup footer that contains the Next/Done button.
 *
 * @param {boolean} visible - Whether the footer should be visible
 */
function _showNextBtn(visible) {
    simPopup.querySelector('.sim-popup__footer').style.display = visible ? 'flex' : 'none';
}

/**
 * Replaces the Next button with a fresh clone to strip any prior click listeners,
 * then attaches the new callback.
 * Cloning avoids stacking multiple handlers as the user steps through questions.
 *
 * @param {() => void} callback - The click handler for the Next button
 */
function _setNextHandler(callback) {
    const btn   = simPopup.querySelector('.sim-popup__next');
    const fresh = btn.cloneNode(true);
    btn.replaceWith(fresh);
    fresh.addEventListener('click', callback);
}

/**
 * HTML-escapes a string to prevent injection when setting innerHTML.
 *
 * @param {string} str - Raw string to escape
 * @returns {string} - Escaped string safe for innerHTML
 */
function _esc(str) {
    return String(str ?? '')
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"');
}
/**
 * popup.js
 * 
 * Creates and manages floating component information popups
 */

let popupElement = null;

/**
 * Creates popup div and appends it to .canvas-wrapper.
 * Then popup starts hidden and is resused for every subsequent component clcik.
 */
export function initPopup() {
    popupElement = document.createElement('div');
    popupElement.id = 'component-popup';
    popupElement.innerHTML = `
        <button class="popup__close" aria-label="Close">✕</button>
        <h3 class="popup__title"></h3>
        <p class="popup__body"></p>
    `;
    popupElement.style.display = 'none';

    document.querySelector('.canvas-wrapper').appendChild(popupElement);
    popupElement.querySelector('.popup__close').addEventListener('click', hidePopup)
}

/**
 * Populates popup with the component's label and description and
 * then positions and displays it near the user's cursor.
 * 
 * @param {object} def - component entry from COMPONENTS
 * @param {string} def.label - popup title
 * @param {string} def.info - popup description
 * @param {string} nativeEvent
 */
export function showPopup(def, nativeEvent) {
    if(!popupElement) return;

    popupElement.querySelector('.popup__title').textContent = def.label;
    popupElement.querySelector('.popup__body').textContent = def.info ?? '';

    popupElement.style.display = 'block';

    if (nativeEvent) _positionPopup(nativeEvent);
}

/**
 * Hides the popup.
 * 
 * Called by close button and global stage click dismiss handler in components.js.
 */
export function hidePopup(){
    if(popupElement) popupElement.style.display = 'none';
}

/**
 * Positions popup near the cursor while being offset by OFFSET pixels.
 * Also clamps position so the popup never overflows the right or bottom edge
 * of the .canvas-wrapper, and never fgoes above or left of OFFSET margin.
 * 
 * @param {MouseEvent} nativeEvent 
 */
function _positionPopup(nativeEvent){
    const OFFSET = 15;

    const wrapper = document.querySelector('.canvas-wrapper');
    const wrapperRect = wrapper.getBoundingClientRect();

    let left = nativeEvent.clientX - wrapperRect.left + OFFSET;
    let top = nativeEvent.clientY - wrapperRect.top + OFFSET;

    const overflowX = left + popupElement.offsetWidth  - wrapperRect.width;
    const overflowY = top  + popupElement.offsetHeight - wrapperRect.height;

    if (overflowX > 0) left -= overflowX + OFFSET;
    if (overflowY > 0) top  -= overflowY + OFFSET;

    left = Math.max(OFFSET, left);
    top  = Math.max(OFFSET, top);

    popupElement.style.left = `${left}px`;
    popupElement.style.top  = `${top}px`;
}
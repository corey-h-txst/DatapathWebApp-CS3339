/**
 * canvas.js
 * 
 * Initializes and manages Konva.js stage for Datapath Visualizer
 */

// Konva instances
let stage = null;
let mainLayer = null;
let animationLayer = null;

// Canvas configurations
const CANVAS_WIDTH = 2300;
const CANVAS_HEIGHT = 1250;
let MIN_SCALE = 0.8;
const MAX_SCALE = 3;

/**
 * Creates Konva stage, layers, and all camera controls.
 * 
 * @param {string} containerId 
 */
export function initCanvas(containerId) {
    const container = document.getElementById(containerId);

    stage = new Konva.Stage({
        container: containerId,
        width: container.clientWidth,
        height: container.clientHeight,
        draggable: true,
    });

    // Main layer - static datapath components and wires
    mainLayer = new Konva.Layer();

    // Animation layer - any animations drawn on top of main layer
    animationLayer = new Konva.Layer();

    stage.add(mainLayer);
    stage.add(animationLayer);

    // Compute minimum scale that fits full datapath in viewport
    MIN_SCALE = Math.min(
        container.clientWidth / CANVAS_WIDTH,
        container.clientHeight / CANVAS_HEIGHT
    );

    // Start fully zoomed upon loading page
    stage.scale({x: MIN_SCALE, y: MIN_SCALE});
    stage.position(_clampPosition({x: 0, y: 0}, MIN_SCALE));

    _setupZoom();
    _setupPanClamping();
    _setupResizeObserver(container);
}

/**
 * Adds mouse-wheel zoom sclaed toward user cursor position where scale is clamped
 * between MIN_SCALE (full view) and MAX_SCALE (close-up).
 * 
 * After scaling position is clamped so content never leaves the viewport.
 */
function _setupZoom() {
    const SCALE_FACTOR = 1.08; // Multiplier per wheel tick

    stage.on('wheel', (e) => {
        e.evt.preventDefault();

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        // The point on the canvas where cursor is on top of
        const stageOrigin = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const direction = e.evt.deltaY < 0 ? 1 : -1;
        const rawScale = oldScale * (direction > 0 ? SCALE_FACTOR : 1 / SCALE_FACTOR);
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, rawScale));

        stage.scale({ x: newScale, y: newScale });

        // Re-anchor stage so cursor remains fixed
        const anchorPos = {
            x: pointer.x - stageOrigin.x * newScale,
            y: pointer.y - stageOrigin.y * newScale,
        };

        stage.position(_clampPosition(anchorPos, newScale));
    });
}

/**
 * Prevents user from panning outside of the canvas content area.
 * 
 * Fires on all drag events and immediately corrects stage position.
 */ 
function _setupPanClamping() {
    stage.on('dragmove', () => {
        stage.position(_clampPosition(stage.position(), stage.scaleX()));
    });
}

/**
 * Computes valid stage position that keeps the currently scaled
 * canvas within the viewport.
 * 
 * If scaled content is small (at MIN_SCALE) then content is locked
 * and centered with no panning allowed.
 * 
 * When scaled content is larger than view port (zoomed in) then panning
 * is allowed up to the point where either edge of the content reaches
 * their corresponding edge of the view port.
 * 
 * @param {{x: number, y: number}} pos - input stage position
 * @param {number} scale - current scale
 * @returns  {{x: number, y: number}} - clamped stage position
 */
function _clampPosition(pos, scale) {
    const viewWidth = stage.width();
    const viewHeight = stage.height();

    const scaledWidth = CANVAS_WIDTH * scale;
    const scaledHeight = CANVAS_HEIGHT * scale;

    let minX, maxX, minY, maxY;

    if (scaledWidth <= viewWidth) {
        // Content fits horizontally - lock it centered
        const cx = (viewWidth - scaledWidth) / 2;
        minX = cx;
        maxX = cx;
    } else {
        // Content overflows - allow panning between left & right edges
        minX = viewWidth - scaledWidth;
        maxX = 0;
    }

    if (scaledHeight <= viewHeight) {
        // Content fits vertically - lock it centered
        const cy = (viewHeight - scaledHeight) / 2;
        minY = cy;
        maxY = cy;
    } else {
        // Content overflows - allow panning between top & bottom edges
        minY = viewHeight - scaledHeight;
        maxY = 0;
    }

    return{
        x: Math.min(maxX, Math.max(minX, pos.x)),
        y: Math.min(maxY, Math.max(minY, pos.y)),
    };
}

/**
 * Keeps stage sized to its container when the browser window is resized.
 * 
 * Also recomputes MIN_SCALE so the full datapath still fits at max zoom-out,
 * and reclamps theposition in case the smaller viewport clips content.
 * 
 * @param {HTMLElement} container 
 */
function _setupResizeObserver(container) {
    const ro = new ResizeObserver(() => {
        stage.width(container.clientWidth);
        stage.height(container.clientHeight);

        MIN_SCALE = Math.min(
            container.clientHeight / CANVAS_HEIGHT,
            container.clientWidth / CANVAS_WIDTH
        );

        stage.position(_clampPosition(stage.position(), stage.scaleX()));
    });
    ro.observe(container);
}

/**
 * Smoothly pans and zooms the stage to frame a component.
 * 
 * @param {string} componentId
 * @param {number} [targetScale=1.4] - zoom level to land on
 * @param {number} [durationMs=600]
 */
export function panToComponent(componentId, targetScale = 1.4, durationMs = 600) {
    const def = getComponent(componentId);
    if (!def) return;

    // Find center of the component in canvas space
    const cx = def.x + (def.width ?? 80) / 2;
    const cy = def.y + (def.height ?? 80) / 2;

    const clampedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, targetScale));

    // Where stage needs to be so that point (cx, cy) lands at viewport center
    const targetPos = _clampPosition({
        x: stage.width()  / 2 - cx * clampedScale,
        y: stage.height() / 2 - cy * clampedScale,
    }, clampedScale);

    // Tween both position and scale simultaneously
    const tween = new Konva.Tween({
        node: stage,
        duration: durationMs / 1000,
        easing: Konva.Easings.EaseInOut,
        x: targetPos.x,
        y: targetPos.y,
        scaleX: clampedScale,
        scaleY: clampedScale,
    });

    tween.play();
}

// Returns Konva stage instance
export function getStage() { return stage; }
// Returns main layer
export function getMainLayer() { return mainLayer; }
// Returns animation layer
export function getAnimationLayer() { return animationLayer; }
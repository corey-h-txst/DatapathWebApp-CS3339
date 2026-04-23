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

// Separate fit scale from user zoom limit
let FIT_SCALE = 1;
let MIN_SCALE = 0.4;
const MAX_SCALE = 2;

// controls how far user can zoom out past fit
const USER_MIN_SCALE_MULT = 0.75;

/**
 * Creates Konva stage, layers, and all camera controls.
 * 
 * @param {string} containerId 
 */
export function initCanvas(containerId) {
    const container = document.getElementById(containerId);

    stage = new Konva.Stage({
        container: document.getElementById(containerId),
        width: container.getBoundingClientRect().width,
        height: container.getBoundingClientRect().height,
        draggable: true,
    });

    // Main layer - static datapath components and wires
    mainLayer = new Konva.Layer();

    // Animation layer - any animations drawn on top of main layer
    animationLayer = new Konva.Layer();

    stage.add(mainLayer);
    stage.add(animationLayer);

    // Compute minimum scale that fits full datapath in viewport
    FIT_SCALE = Math.min(
        container.clientWidth / CANVAS_WIDTH,
        container.clientHeight / CANVAS_HEIGHT
    );

    MIN_SCALE = FIT_SCALE * USER_MIN_SCALE_MULT;

    // Start fully zoomed upon loading page
    stage.scale({x: FIT_SCALE, y: FIT_SCALE});
    stage.position(_clampPosition({x: 0, y: 0}, FIT_SCALE));

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
 */ 
function _setupPanClamping() {
    stage.on('dragmove', () => {
        stage.position(_clampPosition(stage.position(), stage.scaleX()));
    });
}

/**
 * Computes valid stage position that keeps the currently scaled
 * canvas within the viewport.
 */
function _clampPosition(pos, scale) {
    const viewWidth = stage.width();
    const viewHeight = stage.height();

    const scaledWidth = CANVAS_WIDTH * scale;
    const scaledHeight = CANVAS_HEIGHT * scale;

    let minX, maxX, minY, maxY;

    if (scaledWidth <= viewWidth) {
        const cx = (viewWidth - scaledWidth) / 2;
        minX = cx;
        maxX = cx;
    } else {
        minX = viewWidth - scaledWidth;
        maxX = 0;
    }

    if (scaledHeight <= viewHeight) {
        const cy = (viewHeight - scaledHeight) / 2;
        minY = cy;
        maxY = cy;
    } else {
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
 */
function _setupResizeObserver(container) {
    const ro = new ResizeObserver(() => {
        stage.width(container.clientWidth);
        stage.height(container.clientHeight);

        FIT_SCALE = Math.min(
            container.clientWidth / CANVAS_WIDTH,
            container.clientHeight / CANVAS_HEIGHT
        );

        MIN_SCALE = FIT_SCALE * USER_MIN_SCALE_MULT;

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
export function panToPoint(cx, cy, targetScale = 1.4, durationMs = 600) {
    const clampedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, targetScale));

    const targetPos = _clampPosition({
        x: stage.width()  / 2 - cx * clampedScale,
        y: stage.height() / 2 - cy * clampedScale,
    }, clampedScale);

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

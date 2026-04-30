/**
 * canvas.js
 *
 * Initializes and manages the Konva.js stage for the Datapath Visualizer.
 * Responsibilities include:
 *   - Creating the Konva stage, main layer, and animation layer
 *   - Mouse-wheel zoom with cursor-anchored scaling
 *   - Pan clamping to keep content within the viewport
 *   - ResizeObserver to keep the stage sized to its container
 *   - Camera animation (panToPoint, panToBounds, playCameraSequence, panAlongPath)
 *   - Stop/cancel in-progress camera motions
 */

// ── Module-level state ───────────────────────────────────────────────────────

/** @type {Konva.Stage|null} */
let stage = null;

/** @type {Konva.Layer|null} */
let mainLayer = null;

/** @type {Konva.Layer|null} */
let animationLayer = null;

// Canvas dimensions — the full datapath layout area
const CANVAS_WIDTH = 2300;
const CANVAS_HEIGHT = 1250;

// Scale boundaries
let FIT_SCALE = 1;       // Scale that fits the full content in the viewport
let MIN_SCALE = 0.4;     // Minimum allowed scale (user can zoom out this far)
const MAX_SCALE = 2;     // Maximum allowed scale (user can zoom in this far)

// Controls how far the user can zoom out past the fit scale
const USER_MIN_SCALE_MULT = 0.75;

// Camera animation state
/** @type {Konva.Tween[]} */
let activeCameraTweens = [];

/** @type {number} - Incremented each time a new camera motion starts, used to invalidate old ones */
let cameraMotionToken = 0;

/**
 * Content bounds — computed from all components and wires so camera
 * clamping uses the actual content area rather than the fixed canvas size.
 * Set once during app init via setContentBounds().
 *
 * @type {{ x: number, y: number, width: number, height: number } | null}
 */
let contentBounds = null;

// ── Initialization ───────────────────────────────────────────────────────────

/**
 * Creates the Konva stage, main layer, animation layer, and sets up all
 * camera controls (zoom, pan clamping, resize observer).
 * Must be called once at app startup.
 *
 * @param {string} containerId - The id of the DOM element to mount the canvas into
 */
export function initCanvas(containerId) {
    const container = document.getElementById(containerId);

    stage = new Konva.Stage({
        container: document.getElementById(containerId),
        width: container.getBoundingClientRect().width,
        height: container.getBoundingClientRect().height,
        draggable: true,
    });

    // Main layer — holds static datapath components and wires
    mainLayer = new Konva.Layer();

    // Animation layer — holds animated overlays (e.g. pulse lines) drawn on top
    animationLayer = new Konva.Layer();

    stage.add(mainLayer);
    stage.add(animationLayer);

    // Compute the minimum scale that fits the full datapath in the viewport
    FIT_SCALE = Math.min(
        container.clientWidth / CANVAS_WIDTH,
        container.clientHeight / CANVAS_HEIGHT
    );

    MIN_SCALE = FIT_SCALE * USER_MIN_SCALE_MULT;

    // Start fully zoomed out to show the entire datapath
    stage.scale({ x: FIT_SCALE, y: FIT_SCALE });
    stage.position(_clampPosition({ x: 0, y: 0 }, FIT_SCALE));

    _setupZoom();
    _setupPanClamping();
    _setupResizeObserver(container);
}

// ── Zoom (mouse wheel) ───────────────────────────────────────────────────────

/**
 * Adds mouse-wheel zoom scaled toward the user's cursor position.
 * Scale is clamped between MIN_SCALE (full view) and MAX_SCALE (close-up).
 *
 * The stage is re-anchored so the cursor point stays fixed during zoom.
 * No clamping is applied during zoom to avoid jarring position snaps.
 */
function _setupZoom() {
    const SCALE_FACTOR = 1.08; // Multiplier per wheel tick

    stage.on('wheel', (e) => {
        e.evt.preventDefault();

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        // The point on the canvas that the cursor is hovering over
        const stageOrigin = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const direction = e.evt.deltaY < 0 ? 1 : -1;
        const rawScale = oldScale * (direction > 0 ? SCALE_FACTOR : 1 / SCALE_FACTOR);

        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, rawScale));

        stage.scale({ x: newScale, y: newScale });

        // Re-anchor stage so the cursor point remains fixed on the canvas.
        // No clamping here to avoid visible position snaps during zoom.
        stage.position({
            x: pointer.x - stageOrigin.x * newScale,
            y: pointer.y - stageOrigin.y * newScale,
        });
    });
}

// ── Pan clamping ─────────────────────────────────────────────────────────────

/**
 * Prevents the user from panning too far outside the canvas content area.
 * Uses generous padding so edge content (e.g. wires at y=-10) remains
 * reachable when zoomed in.
 */
function _setupPanClamping() {
    stage.on('dragmove', () => {
        stage.position(_clampPosition(stage.position(), stage.scaleX(), 300));
    });
}

// ── Content bounds ───────────────────────────────────────────────────────────

/**
 * Sets the content bounds used for camera clamping and fit-to-viewport.
 * Should be called after all components and wires are initialized.
 * Also recalculates FIT_SCALE and repositions the stage so the full
 * content area is visible.
 *
 * @param {{ x: number, y: number, width: number, height: number }} bounds
 */
export function setContentBounds(bounds) {
    contentBounds = bounds;

    // Recalculate FIT_SCALE based on actual content extents so the
    // full datapath (including edge wires) fits the viewport on load.
    const container = stage?.container();
    if (!container) return;

    const cw = contentBounds.width;
    const ch = contentBounds.height;

    FIT_SCALE = Math.min(
        container.clientWidth / cw,
        container.clientHeight / ch,
    );

    MIN_SCALE = FIT_SCALE * USER_MIN_SCALE_MULT;

    // Reposition to center the content in the viewport
    stage.scale({ x: FIT_SCALE, y: FIT_SCALE });
    stage.position(_clampPosition({ x: 0, y: 0 }, FIT_SCALE));
}

/**
 * Computes a valid stage position that keeps the currently scaled
 * content within the viewport. Uses contentBounds if set (which
 * reflects actual component/wire extents), otherwise falls back
 * to the fixed CANVAS_WIDTH/CANVAS_HEIGHT.
 *
 * @param {{ x: number, y: number }} pos - Desired stage position
 * @param {number} scale - Current zoom scale
 * @param {number} [padding=0] - Extra pixels of slack so edge content
 *   (e.g. wires at y=-10) remains reachable when zoomed in
 * @returns {{ x: number, y: number }} - Clamped stage position
 */
function _clampPosition(pos, scale, padding = 0) {
    const viewWidth = stage.width();
    const viewHeight = stage.height();

    const cw = contentBounds ? contentBounds.width : CANVAS_WIDTH;
    const ch = contentBounds ? contentBounds.height : CANVAS_HEIGHT;

    const scaledWidth = cw * scale;
    const scaledHeight = ch * scale;

    let minX, maxX, minY, maxY;

    // If content fits within the viewport, center it
    if (scaledWidth <= viewWidth) {
        const cx = (viewWidth - scaledWidth) / 2;
        minX = cx;
        maxX = cx;
    } else {
        // Content is larger than viewport — allow panning with padding
        minX = viewWidth - scaledWidth - padding;
        maxX = padding;
    }

    if (scaledHeight <= viewHeight) {
        const cy = (viewHeight - scaledHeight) / 2;
        minY = cy;
        maxY = cy;
    } else {
        minY = viewHeight - scaledHeight - padding;
        maxY = padding;
    }

    return {
        x: Math.min(maxX, Math.max(minX, pos.x)),
        y: Math.min(maxY, Math.max(minY, pos.y)),
    };
}

// ── Resize handling ──────────────────────────────────────────────────────────

/**
 * Keeps the stage sized to its container when the browser window is resized.
 * Also recalculates FIT_SCALE and re-clamps the stage position.
 *
 * @param {HTMLElement} container - The DOM element wrapping the stage
 */
function _setupResizeObserver(container) {
    const ro = new ResizeObserver(() => {
        stage.width(container.clientWidth);
        stage.height(container.clientHeight);

        const cw = contentBounds ? contentBounds.width : CANVAS_WIDTH;
        const ch = contentBounds ? contentBounds.height : CANVAS_HEIGHT;

        FIT_SCALE = Math.min(
            container.clientWidth / cw,
            container.clientHeight / ch,
        );

        MIN_SCALE = FIT_SCALE * USER_MIN_SCALE_MULT;

        stage.position(_clampPosition(stage.position(), stage.scaleX()));
    });
    ro.observe(container);
}

// ── Camera animation — single point ──────────────────────────────────────────

/**
 * Smoothly pans and zooms the stage to center on a specific point.
 *
 * @param {number} cx - World-space x-coordinate to center on
 * @param {number} cy - World-space y-coordinate to center on
 * @param {number} [targetScale=1.4] - Zoom level to land on
 * @param {number} [durationMs=600] - Animation duration in milliseconds
 * @returns {number|null} Camera motion token (can be used to cancel)
 */
export function panToPoint(cx, cy, targetScale = 1.4, durationMs = 600) {
    return playCameraSequence([
        { focus: 'point', x: cx, y: cy, scale: targetScale, durationMs },
    ]);
}

// ── Camera animation — bounding box ──────────────────────────────────────────

/**
 * Smoothly pans and zooms the stage to fit a bounding box within the viewport.
 *
 * @param {{ x: number, y: number, width: number, height: number }} bounds
 * @param {number} [padding=120] - Padding around the bounds in pixels
 * @param {number} [durationMs=700] - Animation duration in milliseconds
 * @returns {number|null} Camera motion token
 */
export function panToBounds(bounds, padding = 120, durationMs = 700) {
    return playCameraSequence([
        { focus: 'bounds', bounds, padding, durationMs },
    ]);
}

// ── Camera animation — multi-stop sequence ───────────────────────────────────

/**
 * Plays a sequence of camera moves. Each stop can target either a point
 * or a bounds rectangle. Stops are played in order, one after another.
 *
 * @param {Array<{ focus: 'point'|'bounds', x?: number, y?: number, scale?: number, bounds?: object, padding?: number, durationMs?: number }>} sequence
 * @returns {number|null} Camera motion token
 */
export function playCameraSequence(sequence = []) {
    if (!stage) return null;

    const stops = sequence
        .map(_resolveCameraStop)
        .filter(Boolean);

    if (!stops.length) return null;

    const token = _startCameraMotion();
    let index = 0;

    const playNext = () => {
        if (token !== cameraMotionToken || index >= stops.length) return;

        const stop = stops[index];
        index++;

        _playCameraTween(stop, token, playNext);
    };

    playNext();
    return token;
}

// ── Camera animation — path following ────────────────────────────────────────

/**
 * Follows a series of world-space points at a consistent zoom level.
 * Useful for tracing a wire path across the datapath.
 *
 * @param {Array<{ x: number, y: number }>} points - Ordered list of points to visit
 * @param {{ targetScale?: number, durationMs?: number, initialDurationMs?: number, segmentMinDurationMs?: number }} [options]
 * @returns {number|null} Camera motion token
 */
export function panAlongPath(points, options = {}) {
    const path = _normalizeCameraPath(points);
    if (!path.length) return null;

    // Single point — just pan to it
    if (path.length === 1) {
        return panToPoint(
            path[0].x,
            path[0].y,
            options.targetScale ?? 1.2,
            options.durationMs ?? 600,
        );
    }

    const initialDurationMs = options.initialDurationMs ?? 320;
    const segmentMinDurationMs = options.segmentMinDurationMs ?? 170;
    const targetScale = options.targetScale ?? 1.2;

    // Compute distances between consecutive points for proportional timing
    const segmentDistances = [];
    for (let i = 1; i < path.length; i++) {
        segmentDistances.push(_distance(path[i - 1], path[i]));
    }

    const totalDistance = segmentDistances.reduce((sum, distance) => sum + distance, 0);
    const remainingDurationMs = Math.max(
        segmentMinDurationMs * segmentDistances.length,
        (options.durationMs ?? 1500) - initialDurationMs,
    );

    // Build the sequence: first stop at the start point, then each subsequent point
    const sequence = [
        {
            focus: 'point',
            x: path[0].x,
            y: path[0].y,
            scale: targetScale,
            durationMs: initialDurationMs,
        },
    ];

    for (let i = 1; i < path.length; i++) {
        const segmentDurationMs = totalDistance > 0
            ? Math.max(
                segmentMinDurationMs,
                Math.round((segmentDistances[i - 1] / totalDistance) * remainingDurationMs),
            )
            : Math.round(remainingDurationMs / segmentDistances.length);

        sequence.push({
            focus: 'point',
            x: path[i].x,
            y: path[i].y,
            scale: targetScale,
            durationMs: segmentDurationMs,
        });
    }

    return playCameraSequence(sequence);
}

// ── Camera animation — stop ──────────────────────────────────────────────────

/**
 * Stops any in-progress camera motion immediately.
 * All active tweens are paused and destroyed.
 */
export function stopCameraMotion() {
    cameraMotionToken++;

    for (const tween of activeCameraTweens) {
        tween.pause();
        tween.destroy();
    }

    activeCameraTweens = [];
}

// ── Layer accessors ──────────────────────────────────────────────────────────

/** @returns {Konva.Stage|null} */
export function getStage() { return stage; }

/** @returns {Konva.Layer|null} */
export function getMainLayer() { return mainLayer; }

/** @returns {Konva.Layer|null} */
export function getAnimationLayer() { return animationLayer; }

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Starts a new camera motion by stopping any previous one and returning
 * a fresh token. The token is used to ignore callbacks from old motions.
 *
 * @returns {number} New camera motion token
 */
function _startCameraMotion() {
    stopCameraMotion();
    return cameraMotionToken;
}

/**
 * Resolves a camera stop definition into a normalized { cx, cy, scale, durationMs } object.
 * Supports both 'point' and 'bounds' focus types.
 *
 * @param {{ focus: string, x?: number, y?: number, scale?: number, bounds?: object, padding?: number, durationMs?: number }} stop
 * @returns {{ cx: number, cy: number, scale: number, durationMs: number }|null}
 */
function _resolveCameraStop(stop) {
    if (!stage || !stop) return null;

    if (stop.focus === 'bounds') {
        const bounds = stop.bounds;
        if (!bounds) return null;

        const width = Math.max(bounds.width ?? 0, 1);
        const height = Math.max(bounds.height ?? 0, 1);
        const padding = stop.padding ?? 120;

        // Compute the scale that fits the bounds within the viewport with padding
        const targetScale = _clampScale(Math.min(
            Math.max(stage.width() - padding * 2, 1) / width,
            Math.max(stage.height() - padding * 2, 1) / height,
        ));

        return {
            cx: bounds.x + width / 2,
            cy: bounds.y + height / 2,
            scale: targetScale,
            durationMs: stop.durationMs ?? 700,
        };
    }

    if (stop.focus === 'point') {
        return {
            cx: stop.x,
            cy: stop.y,
            scale: _clampScale(stop.scale ?? 1.4),
            durationMs: stop.durationMs ?? 600,
        };
    }

    return null;
}

/**
 * Creates and plays a Konva.Tween that animates the stage to a target
 * position and scale. When the tween finishes, onFinish is called.
 * Clamping is NOT applied during camera animations so edge content
 * (e.g. wires at y=-10) can be properly framed.
 *
 * @param {{ cx: number, cy: number, scale: number, durationMs: number }} stop
 * @param {number} token - Camera motion token for invalidation
 * @param {() => void} onFinish - Callback when the tween completes
 */
function _playCameraTween(stop, token, onFinish) {
    // Compute the raw target position without clamping — camera animations
    // need to be able to frame edge content (e.g. wires at y=-10). Clamping
    // is only applied to user drag/zoom operations to keep content in view.
    const targetPos = {
        x: stage.width() / 2 - stop.cx * stop.scale,
        y: stage.height() / 2 - stop.cy * stop.scale,
    };

    let tween = null;
    tween = new Konva.Tween({
        node: stage,
        duration: stop.durationMs / 1000,
        easing: Konva.Easings.EaseInOut,
        x: targetPos.x,
        y: targetPos.y,
        scaleX: stop.scale,
        scaleY: stop.scale,
        onFinish: () => {
            activeCameraTweens = activeCameraTweens.filter((entry) => entry !== tween);
            tween.destroy();

            if (token !== cameraMotionToken) return;
            onFinish?.();
        },
    });

    activeCameraTweens.push(tween);
    tween.play();
}

/**
 * Clamps a scale value between MIN_SCALE and MAX_SCALE.
 *
 * @param {number} scale
 * @returns {number}
 */
function _clampScale(scale) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/**
 * Normalizes an array of points by removing invalid entries and
 * consecutive duplicates.
 *
 * @param {Array<{ x: number, y: number }>} points
 * @returns {Array<{ x: number, y: number }>}
 */
function _normalizeCameraPath(points) {
    const normalized = [];

    for (const point of points ?? []) {
        if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;

        const previous = normalized[normalized.length - 1];
        if (previous && previous.x === point.x && previous.y === point.y) continue;

        normalized.push({ x: point.x, y: point.y });
    }

    return normalized;
}

/**
 * Euclidean distance between two points.
 *
 * @param {{ x: number, y: number }} a
 * @param {{ x: number, y: number }} b
 * @returns {number}
 */
function _distance(a, b) {
    return Math.hypot((b.x ?? 0) - (a.x ?? 0), (b.y ?? 0) - (a.y ?? 0));
}
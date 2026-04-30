/**
 * step-camera.js
 *
 * Resolves camera motion for tour/quiz steps.
 * Steps can optionally provide `camera.wireIds` to force a specific
 * wire path for motion while still allowing `step.wires` to control
 * highlighting independently.
 *
 * Camera strategies:
 *   - Single component: pan to its center at DEFAULT_COMPONENT_SCALE
 *   - Multiple wires: two-stop sequence (start of path → target component)
 *   - Control component: zoom out to show the full control fanout
 */

import { panAlongPath, panToPoint, panToBounds, playCameraSequence } from '../datapath/canvas.js';
import { getComponentBounds, getComponentCenter } from '../datapath/components.js';
import { getWirePoints } from '../datapath/wires.js';

// ── Constants ────────────────────────────────────────────────────────────────

/** Zoom level when focusing on a single component. */
const DEFAULT_COMPONENT_SCALE = 1.6;

/** Zoom level when following a wire path. */
const DEFAULT_PATH_SCALE = 1.4;

/** Padding around the control fanout bounds when zooming out. */
const CONTROL_OVERVIEW_PADDING = 140;

/** Duration for a full path pan animation (milliseconds). */
const PATH_PAN_DURATION_MS = 1800;

/** Duration for a single-component pan animation (milliseconds). */
const COMPONENT_PAN_DURATION_MS = 900;

/**
 * Maps control wire ids to their target component ids.
 * Used to compute the bounding box for the control overview zoom.
 *
 * @type {Object<string, string>}
 */
const CONTROL_FANOUT_COMPONENTS = {
    'control-to-reg-file':       'reg-file',
    'control-to-mux-reg-dst':    'mux-reg-dst',
    'control-to-mux-alu-src':    'mux-alu-src',
    'control-to-alu-control':    'alu-control',
    'control-to-data-mem':       'data-mem',
    'control-to-mux-mem-to-reg': 'mux-mem-to-reg',
};

// ── Main entry point ─────────────────────────────────────────────────────────

/**
 * Animates the camera for a simulation step.
 * Determines the best camera strategy based on the step's component and wires.
 *
 * @param {{ componentId?: string, wires?: Array<{ id?: string }>, camera?: { wireIds?: string[], pathPoints?: number[], scale?: number, durationMs?: number } } | null} step
 * @param {{ componentId?: string, wires?: Array<{ id?: string }>, camera?: { wireIds?: string[], pathPoints?: number[], scale?: number } } | null} nextStep
 */
export function animateStepCamera(step, nextStep = null) {
    if (!step?.componentId) return;

    // Special handling for the Control component — zoom out to show all fanout wires
    if (step.componentId === 'control' && _animateControlOverview(step, nextStep)) {
        return;
    }

    const path = _resolveStepPath(step);
    if (path.length > 1) {
        // For steps with multiple wires, pan smoothly from the start of the
        // wire path to the target component, using a slower, steady pan
        // rather than tracing every intermediate point.
        const startPoint = path[0];
        const endPoint = path[path.length - 1];
        const targetScale = step.camera?.scale ?? DEFAULT_PATH_SCALE;
        const durationMs = step.camera?.durationMs ?? PATH_PAN_DURATION_MS;

        // Use a two-stop sequence: first frame the start area, then pan to
        // the target component. This gives a smooth overview of the wire space.
        playCameraSequence([
            {
                focus: 'point',
                x: startPoint.x,
                y: startPoint.y,
                scale: targetScale,
                durationMs: Math.min(durationMs * 0.35, 700),
            },
            {
                focus: 'point',
                x: endPoint.x,
                y: endPoint.y,
                scale: targetScale,
                durationMs: Math.max(durationMs * 0.65, 900),
            },
        ]);
        return;
    }

    // Single component — pan directly to its center
    const center = getComponentCenter(step.componentId);
    if (!center) return;

    panToPoint(
        center.x,
        center.y,
        step.camera?.scale ?? DEFAULT_COMPONENT_SCALE,
        step.camera?.durationMs ?? COMPONENT_PAN_DURATION_MS,
    );
}

// ── Control overview ─────────────────────────────────────────────────────────

/**
 * Zooms the camera out to show the Control component and all its fanout wires.
 * The camera stays zoomed out until the user clicks Next, at which point the
 * next step's animateStepCamera call handles the transition.
 *
 * @param {{ componentId?: string, camera?: { overviewPadding?: number, overviewDurationMs?: number } }} step
 * @param {object|null} nextStep
 * @returns {boolean} Whether the control overview was animated
 */
function _animateControlOverview(step, nextStep) {
    const fanoutBounds = _resolveControlOverviewBounds();

    if (!fanoutBounds) return false;

    panToBounds(
        fanoutBounds,
        step.camera?.overviewPadding ?? CONTROL_OVERVIEW_PADDING,
        step.camera?.overviewDurationMs ?? 900,
    );
    return true;
}

// ── Path resolution ──────────────────────────────────────────────────────────

/**
 * Resolves the camera path for a step by combining wire points and the
 * target component center.
 *
 * @param {{ componentId?: string, wires?: Array<{ id?: string }>, camera?: { wireIds?: string[], pathPoints?: number[] } }} step
 * @returns {Array<{ x: number, y: number }>}
 */
function _resolveStepPath(step) {
    const rawPath = _resolveRawStepPath(step);
    const center = getComponentCenter(step?.componentId);

    if (!center) return rawPath;
    if (!rawPath.length) return [center];

    return _appendPoint(rawPath, center);
}

/**
 * Resolves the starting point of a step's camera path.
 *
 * @param {{ componentId?: string, wires?: Array<{ id?: string }>, camera?: { wireIds?: string[], pathPoints?: number[] } }} step
 * @returns {{ x: number, y: number }|null}
 */
function _resolveStepStartPoint(step) {
    if (!step?.componentId) return null;

    const rawPath = _resolveRawStepPath(step);
    if (rawPath.length) return rawPath[0];

    return getComponentCenter(step.componentId);
}

/**
 * Resolves the raw camera path from a step's camera or wire declarations.
 * Priority order:
 *   1. Explicit pathPoints from step.camera
 *   2. Explicit wireIds from step.camera
 *   3. Wire ids from step.wires
 *
 * @param {{ wires?: Array<{ id?: string }>, camera?: { wireIds?: string[], pathPoints?: number[] } }} step
 * @returns {Array<{ x: number, y: number }>}
 */
function _resolveRawStepPath(step) {
    // Priority 1: explicit pathPoints
    const explicitPath = _flatPointsToPairs(step?.camera?.pathPoints);
    if (explicitPath.length) return explicitPath;

    // Priority 2: explicit wireIds
    const explicitWireIds = Array.isArray(step?.camera?.wireIds)
        ? step.camera.wireIds.filter(Boolean)
        : [];

    if (explicitWireIds.length) {
        return _stitchOrderedWirePath(explicitWireIds);
    }

    // Priority 3: wire ids from step.wires
    const wireIds = (step?.wires ?? [])
        .map((wire) => wire?.id)
        .filter(Boolean);

    if (!wireIds.length) return [];

    const target = getComponentCenter(step.componentId);
    if (!target) return _stitchOrderedWirePath(wireIds);

    return _buildIncomingWirePath(wireIds, target);
}

// ── Control overview bounds ──────────────────────────────────────────────────

/**
 * Computes the bounding box that encompasses the Control component and
 * all its fanout components and wires.
 *
 * @returns {{ x: number, y: number, width: number, height: number } | null}
 */
function _resolveControlOverviewBounds() {
    const boundsList = [];
    const pointList = [];

    const controlBounds = getComponentBounds('control');
    if (controlBounds) boundsList.push(controlBounds);

    for (const [wireId, componentId] of Object.entries(CONTROL_FANOUT_COMPONENTS)) {
        const componentBounds = getComponentBounds(componentId);
        if (componentBounds) boundsList.push(componentBounds);

        pointList.push(..._flatPointsToPairs(getWirePoints(wireId)));
    }

    return _combineBounds(boundsList, pointList);
}

// ── Wire path stitching ──────────────────────────────────────────────────────

/**
 * Builds a camera path from a list of wire ids, ordering them so the path
 * flows naturally from the start of the first wire to the end of the last.
 * Wires are connected end-to-end by matching shared endpoints.
 *
 * @param {string[]} wireIds - Ordered list of wire ids to trace
 * @returns {Array<{ x: number, y: number }>}
 */
function _stitchOrderedWirePath(wireIds) {
    let path = [];

    for (const wireId of wireIds) {
        const wirePath = _flatPointsToPairs(getWirePoints(wireId));
        if (!wirePath.length) continue;

        if (!path.length) {
            path = wirePath;
            continue;
        }

        const lastPoint = path[path.length - 1];
        const firstPoint = wirePath[0];
        const finalPoint = wirePath[wirePath.length - 1];

        // Try to connect end-to-start
        if (_samePoint(lastPoint, firstPoint)) {
            path = _mergePaths(path, wirePath);
            continue;
        }

        // Try to connect end-to-end (reversed)
        if (_samePoint(lastPoint, finalPoint)) {
            path = _mergePaths(path, [...wirePath].reverse());
            continue;
        }

        // No shared point — just append with a gap
        path = _mergePaths(path, wirePath, false);
    }

    return path;
}

/**
 * Builds a camera path that traces wires leading into a target component.
 * Uses a greedy algorithm to find the best starting wire (closest to target)
 * and then chains remaining wires by matching shared endpoints.
 *
 * @param {string[]} wireIds - Wire ids to consider
 * @param {{ x: number, y: number }} targetPoint - Center of the target component
 * @returns {Array<{ x: number, y: number }>}
 */
function _buildIncomingWirePath(wireIds, targetPoint) {
    const candidates = wireIds
        .map((id, index) => ({
            id,
            index,
            points: _flatPointsToPairs(getWirePoints(id)),
        }))
        .filter((entry) => entry.points.length);

    if (!candidates.length) return [];

    // Find the wire whose endpoint is closest to the target
    let bestEntry = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const entry of candidates) {
        const firstPoint = entry.points[0];
        const lastPoint = entry.points[entry.points.length - 1];
        const firstDistance = _distance(firstPoint, targetPoint);
        const lastDistance = _distance(lastPoint, targetPoint);
        const score = Math.min(firstDistance, lastDistance);

        if (score < bestScore) {
            bestScore = score;
            bestEntry = {
                ...entry,
                points: lastDistance <= firstDistance
                    ? [...entry.points]
                    : [...entry.points].reverse(),
            };
        }
    }

    if (!bestEntry) return [];

    // Chain remaining wires by matching shared endpoints
    let path = [...bestEntry.points];
    const remaining = candidates.filter((entry) => entry.id !== bestEntry.id);

    while (remaining.length) {
        const start = path[0];
        let matchIndex = -1;
        let nextPoints = null;

        for (let i = 0; i < remaining.length; i++) {
            const candidate = remaining[i];
            const firstPoint = candidate.points[0];
            const lastPoint = candidate.points[candidate.points.length - 1];

            if (_samePoint(lastPoint, start)) {
                matchIndex = i;
                nextPoints = candidate.points;
                break;
            }

            if (_samePoint(firstPoint, start)) {
                matchIndex = i;
                nextPoints = [...candidate.points].reverse();
                break;
            }
        }

        if (!nextPoints) break;

        path = _mergePaths(nextPoints, path);
        remaining.splice(matchIndex, 1);
    }

    return path;
}

// ── Geometry helpers ─────────────────────────────────────────────────────────

/**
 * Computes the combined bounding box of a list of rectangles and points.
 *
 * @param {Array<{ x: number, y: number, width: number, height: number }>} boundsList
 * @param {Array<{ x: number, y: number }>} points
 * @returns {{ x: number, y: number, width: number, height: number } | null}
 */
function _combineBounds(boundsList, points) {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const bounds of boundsList ?? []) {
        if (!bounds) continue;

        minX = Math.min(minX, bounds.x);
        minY = Math.min(minY, bounds.y);
        maxX = Math.max(maxX, bounds.x + bounds.width);
        maxY = Math.max(maxY, bounds.y + bounds.height);
    }

    for (const point of points ?? []) {
        if (!point) continue;

        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
    }

    if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
        return null;
    }

    return {
        x: minX,
        y: minY,
        width: Math.max(maxX - minX, 1),
        height: Math.max(maxY - minY, 1),
    };
}

/**
 * Appends a point to the end of a path, skipping duplicates.
 *
 * @param {Array<{ x: number, y: number }>} path
 * @param {{ x: number, y: number }} point
 * @returns {Array<{ x: number, y: number }>}
 */
function _appendPoint(path, point) {
    if (!point) return [...path];
    if (!path.length) return [{ x: point.x, y: point.y }];

    const lastPoint = path[path.length - 1];
    if (_samePoint(lastPoint, point)) {
        return [...path];
    }

    return [...path, { x: point.x, y: point.y }];
}

/**
 * Merges two paths, optionally deduplicating the shared endpoint.
 *
 * @param {Array<{ x: number, y: number }>} left
 * @param {Array<{ x: number, y: number }>} right
 * @param {boolean} dedupeSharedPoint - If true, skip the first point of right if it matches the last of left
 * @returns {Array<{ x: number, y: number }>}
 */
function _mergePaths(left, right, dedupeSharedPoint = true) {
    if (!left.length) return [...right];
    if (!right.length) return [...left];

    const merged = [...left];
    const startIndex = dedupeSharedPoint && _samePoint(left[left.length - 1], right[0]) ? 1 : 0;

    for (let i = startIndex; i < right.length; i++) {
        const point = right[i];
        const previous = merged[merged.length - 1];

        if (!previous || !_samePoint(previous, point)) {
            merged.push({ x: point.x, y: point.y });
        }
    }

    return merged;
}

/**
 * Converts a flat array of [x1, y1, x2, y2, ...] to an array of { x, y } pairs.
 * Skips invalid or duplicate consecutive points.
 *
 * @param {number[]} points - Flat coordinate array
 * @returns {Array<{ x: number, y: number }>}
 */
function _flatPointsToPairs(points) {
    const pairs = [];

    for (let i = 0; i < (points?.length ?? 0) - 1; i += 2) {
        const x = points[i];
        const y = points[i + 1];
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

        const previous = pairs[pairs.length - 1];
        if (previous && previous.x === x && previous.y === y) continue;

        pairs.push({ x, y });
    }

    return pairs;
}

/**
 * Estimates a reasonable camera pan duration based on path distance.
 *
 * @param {Array<{ x: number, y: number }>} path
 * @returns {number} Duration in milliseconds
 */
function _pathDurationMs(path) {
    let totalDistance = 0;

    for (let i = 1; i < path.length; i++) {
        totalDistance += _distance(path[i - 1], path[i]);
    }

    return Math.min(2400, Math.max(950, Math.round(totalDistance * 0.8)));
}

/**
 * Checks if two points are within a tolerance of each other.
 *
 * @param {{ x: number, y: number }|null} a
 * @param {{ x: number, y: number }|null} b
 * @param {number} [tolerance=2] - Maximum distance in pixels to consider "same"
 * @returns {boolean}
 */
function _samePoint(a, b, tolerance = 2) {
    if (!a || !b) return false;
    return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;
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
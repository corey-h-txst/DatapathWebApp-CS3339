/**
 * main.js
 *
 * Application entry point.
 * Initializes all subsystems in dependency order:
 *   canvas → popups → components → wires → panels
 *
 * After initialization, computes the bounding box of all components
 * and wires so the camera can clamp to the actual content area rather
 * than the fixed canvas size. This ensures edge content (e.g. wires
 * at y=-10) is properly framed.
 */

import { initCanvas, setContentBounds } from "../datapath/canvas.js";
import { initComponents, getComponentBounds } from "../datapath/components.js";
import { initWires, getWireBounds } from "../datapath/wires.js";
import { initPopup, initSimPopup } from "../ui/popup.js";
import { initPanels } from "../ui/panels.js";

// ── Subsystem initialization (dependency order) ──────────────────────────────

initCanvas('konva-container');  // Must be first — creates the Konva stage
initPopup();                    // Small component info popup (hidden initially)
initSimPopup();                 // Large simulation popup for tour/quiz steps
initComponents();               // Draws all datapath components on the canvas
initWires();                    // Draws all wire lines and junction dots

// ── Compute content bounds for camera clamping ───────────────────────────────
// The fixed CANVAS_WIDTH/CANVAS_HEIGHT is larger than the actual content.
// By computing the bounding box of all components and wires, the camera
// can clamp to the real content area, making edge wires (e.g. mux-pc-src-to-pc
// at y=-10) properly reachable when zoomed in.

const componentIds = [
    'pc', 'instruction-mem', 'mux-reg-dst', 'reg-file', 'sign-ext',
    'mux-alu-src', 'alu', 'alu-control', 'data-mem', 'mux-mem-to-reg',
    'control', 'adder-pc', 'shift-left-2', 'adder-branch', 'mux-pc-src',
];

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

// Accumulate component bounding boxes
for (const id of componentIds) {
    const bounds = getComponentBounds(id);
    if (bounds) {
        minX = Math.min(minX, bounds.x);
        minY = Math.min(minY, bounds.y);
        maxX = Math.max(maxX, bounds.x + bounds.width);
        maxY = Math.max(maxY, bounds.y + bounds.height);
    }
}

// Accumulate wire bounding box (wires may extend beyond components)
const wireBounds = getWireBounds();
if (wireBounds) {
    minX = Math.min(minX, wireBounds.x);
    minY = Math.min(minY, wireBounds.y);
    maxX = Math.max(maxX, wireBounds.x + wireBounds.width);
    maxY = Math.max(maxY, wireBounds.y + wireBounds.height);
}

// Only set bounds if we found at least one valid component/wire
if (Number.isFinite(minX)) {
    setContentBounds({
        x: minX,
        y: minY,
        width: Math.max(maxX - minX, 1),
        height: Math.max(maxY - minY, 1),
    });
}

// Panels must be initialized last — it wires sidebar button interactions
// that depend on all other subsystems being ready.
initPanels();
/**
 * main.js
 *
 * Application entry point.
 * Initializes all subsystems in dependency order
 *   canvas → popups → components → panels
 */

import { initCanvas } from "../datapath/canvas.js";
import { initComponents } from "../datapath/components.js";
import { initWires } from "../datapath/wires.js";
import { initPopup, initSimPopup } from "../ui/popup.js";
import { initPanels } from "../ui/panels.js";

initCanvas('konva-container');
initPopup();
initSimPopup();
initComponents();
initWires();
initPanels();

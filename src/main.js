import { initCanvas } from "../datapath/canvas.js";
import { initComponents } from "../datapath/components.js";
import { initPopup } from "../ui/popup.js";
import { initPanels } from "../ui/panels.js";

initCanvas('konva-container');
initPopup();
initComponents();
initPanels();
import { initCanvas } from "../datapath/canvas.js";
import { initComponents } from "../datapath/components.js";
import { initPopup } from "../ui/popup.js";

initCanvas('konva-container');
initPopup();
initComponents();
/**
 * router.js
 *
 * Client-side SPA router for the Datapath Visualizer.
 * Manages navigation between the home, simulator, learn, and about pages.
 * The simulator page is lazy-loaded on first visit — main.js and the
 * simulator controls are initialized only when the user navigates to sim.
 */

import { initSimulatorControls } from "./simulator.js";

/** @type {Promise<void>|null} */
let simulatorInitPromise = null;

const routes = {
    home: document.getElementById("home-screen"),
    sim: document.getElementById("simulator"),
    learn: document.getElementById("learn-page"),
    about: document.getElementById("about-page"),
};

const navLinks = {
    home: document.getElementById("nav-home"),
    sim: document.getElementById("nav-sim"),
    learn: document.getElementById("nav-learn"),
    about: document.getElementById("nav-about"),
};

/**
 * Ensures the simulator module is loaded and initialized.
 * Uses a singleton promise so subsequent calls return the same
 * in-flight or resolved promise, preventing duplicate initialization.
 *
 * @returns {Promise<void>}
 */
async function ensureSimulatorReady() {
    if (!simulatorInitPromise) {
        simulatorInitPromise = import("../src/main.js")
            .then(() => {
                initSimulatorControls();
            })
            .catch((error) => {
                simulatorInitPromise = null;
                throw error;
            });
    }

    return simulatorInitPromise;
}

/**
 * Navigates to the specified route.
 * Hides all pages, shows the target page, and highlights the nav link.
 * If the target is the simulator, ensures it is initialized first.
 *
 * @param {string} routeName
 * @returns {Promise<void>}
 */
async function navigate(routeName) {
    const nextRoute = routes[routeName];
    if (!nextRoute) return;

    Object.values(routes).forEach((route) => route?.classList.remove("active"));
    Object.values(navLinks).forEach((link) => link?.classList.remove("active"));

    nextRoute.classList.add("active");
    navLinks[routeName]?.classList.add("active");

    if (routeName === "sim") {
        await ensureSimulatorReady();
    }
}

// Wire up nav link click handlers
Object.entries(navLinks).forEach(([routeName, link]) => {
    link?.addEventListener("click", (event) => {
        event.preventDefault();
        void navigate(routeName);
    });
});

// Wire up the Start button on the home screen
document.getElementById("start-btn")?.addEventListener("click", () => {
    void navigate("sim");
});

// Wire up the Learn More button on the home screen
document.getElementById("learn-more-btn")?.addEventListener("click", () => {
    void navigate("learn");
});

// Learn page Definitions / Analogies toggle
const learnPageToggleContainer = document.getElementById("learn-page-toggle-container");
const definitionsToggle = document.getElementById("definitions-toggle");
const analogiesToggle = document.getElementById("analogies-toggle");
const analogyIntro = document.getElementById("analogy-intro");

const analogyText = {
    "Program Counter (PC)": "Like the clipboard showing the next work order number. It tells the warehouse which instruction to handle next.",

    "Instruction Memory": "Like the stack of work orders. It stores the instructions that tell the warehouse what job needs to be done.",

    "Register File": "Like a small sorting table. It temporarily holds the packages or information the worker needs right now.",

    "Data Memory": "Like the warehouse storage shelves. It holds data for later, and the CPU can either take data from it or put data back into it.",

    "ALU": "Like the processing station. This is where the worker does the actual work, such as adding, subtracting, or comparing information.",

    "Multiplexer (MUX)": "Like a conveyor belt switch. It chooses which path the package or information should take next.",

    "Adder (ADD)": "Like a label machine that adds numbers together. It helps figure out things like the next instruction address.",

    "Control Unit": "Like the warehouse supervisor. It reads the work order and tells every station what it should do.",

    "Shift Left": "Like converting a short shelf code into a full warehouse location. It moves the bits over so the address can be used correctly.",

    "Sign Extend": "Like rewriting a short direction note into a full-size label without changing its meaning. If it was a negative direction, it stays negative.",

    "ALU Control": "Like a specific command card for the processing station. It tells the ALU exactly what operation to perform.",

    "Load": "Like taking a package off the warehouse shelf and bringing it to the sorting table so it can be used.",

    "Store": "Like taking a package from the sorting table and putting it back onto the warehouse shelf.",

    "Branch": "Like a conditional detour. If the work order says a certain condition is true, the package is sent to a different route.",

    "Jump": "Like skipping straight to a specific work order instead of going to the next one in line.",

    "ADD": "Like combining two package counts to get a new total.",

    "SUB": "Like subtracting one package count from another to see the difference."
};

const learnCards = document.querySelectorAll("#learn-page .learn-card");

learnCards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent.trim();
    const paragraph = card.querySelector("p");

    if (title && paragraph) {
        paragraph.dataset.definition = paragraph.textContent.trim();
        paragraph.dataset.analogy = analogyText[title] || paragraph.textContent.trim();
    }
});

function showLearnDefinitions() {
    definitionsToggle?.classList.add("active");
    analogiesToggle?.classList.remove("active");
    learnPageToggleContainer?.classList.remove("quiz-mode");
    analogyIntro?.classList.remove("show");

    learnCards.forEach((card) => {
        const paragraph = card.querySelector("p");
        if (paragraph?.dataset.definition) {
            paragraph.textContent = paragraph.dataset.definition;
        }
    });
}

function showLearnAnalogies() {
    analogiesToggle?.classList.add("active");
    definitionsToggle?.classList.remove("active");
    learnPageToggleContainer?.classList.add("quiz-mode");
    analogyIntro?.classList.add("show");

    learnCards.forEach((card) => {
        const paragraph = card.querySelector("p");
        if (paragraph?.dataset.analogy) {
            paragraph.textContent = paragraph.dataset.analogy;
        }
    });
}

definitionsToggle?.addEventListener("click", showLearnDefinitions);
analogiesToggle?.addEventListener("click", showLearnAnalogies);

// Navigate to the home page on initial load
void navigate("home");
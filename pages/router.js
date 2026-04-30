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

// Navigate to the home page on initial load
void navigate("home");
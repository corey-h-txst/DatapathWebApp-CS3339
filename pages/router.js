import { initSimulatorControls } from "./simulator.js";

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

Object.entries(navLinks).forEach(([routeName, link]) => {
    link?.addEventListener("click", (event) => {
        event.preventDefault();
        void navigate(routeName);
    });
});

document.getElementById("start-btn")?.addEventListener("click", () => {
    void navigate("sim");
});

document.getElementById("learn-more-btn")?.addEventListener("click", () => {
    void navigate("learn");
});

void navigate("home");

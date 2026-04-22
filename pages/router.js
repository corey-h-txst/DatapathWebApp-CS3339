let simulatorInitPromise = null;
let simulatorReady = false;
let simulatorModules = null;

const routes = {
    home: {
        el: document.getElementById('home-screen'),
        init() {},
        enter() {},
        leave() {}
    },
    sim: {
        el: document.getElementById('simulator'),
        async init() {
            if (simulatorInitPromise) return simulatorInitPromise;
            simulatorInitPromise = (async () => {
                try {
                    console.log("🚀 Initializing Simulator...");
                    const container = document.getElementById("konva-container");
                    if (!container) {
                        throw new Error("Canvas container missing");
                    }
                    const rect = container.getBoundingClientRect();
                    console.log("📐 Container size:", rect);
                    console.log("⬇️ Loading modules...");
                    simulatorModules = await loadSimulatorModules();
                    const canvas = simulatorModules.canvas;
                    const components = simulatorModules.components;
                    const popup = simulatorModules.popup;
                    if (!canvas?.initCanvas) {
                        throw new Error("Canvas init missing");
                    }
                    console.log("🎨 Init canvas");
                    await new Promise(requestAnimationFrame);
                    await new Promise(requestAnimationFrame);
                    canvas.initCanvas("konva-container");
                    requestAnimationFrame(() => {
                        console.log("🧩 Init components");
                        components?.initComponents?.();
                        console.log("💬 Init popup");
                        popup?.initPopup?.();
                        canvas.getStage?.()?.draw();
                        simulatorReady = true;
                        console.log("✅ Simulator READY");
                    });
                } catch (err) {
                    console.error("❌ Simulator init error:", err);
                    simulatorInitPromise = null;
                    simulatorReady = false;
                }
            })();
            return simulatorInitPromise;
        },
        enter() {
            console.log("➡️ Entered Simulator");
        },
        leave() {
            console.log("⬅️ Left Simulator");
        }
    },
    learn: {
        el: document.getElementById('learn-page'),
        init() {},
        enter() {},
        leave() {}
    },
    about: {
        el: document.getElementById('about-page'),
        init() {},
        enter() {},
        leave() {}
    }
};

const navLinks = {
    home: document.getElementById('nav-home'),
    sim: document.getElementById('nav-sim'),
    learn: document.getElementById('nav-learn'),
    about: document.getElementById('nav-about'),
};

let currentRoute = null;
async function navigate(routeName) {
    const route = routes[routeName];
    if (!route) return;
    console.log("➡️ Navigate:", routeName);
    Object.values(routes).forEach(r => r.el?.classList.remove('active'));
    Object.values(navLinks).forEach(n => n?.classList.remove('active'));
    route.el?.classList.add('active');
    navLinks[routeName]?.classList.add('active');
    currentRoute = routeName;
    route.init?.();
    route.enter?.();
}

async function loadSimulatorModules() {
    console.log("⬇️ Loading canvas...");
    const canvasModule = await import("../datapath/canvas.js");
    console.log("✅ canvas loaded");
    console.log("⬇️ Loading components...");
    const componentsModule = await import("../datapath/components.js");
    console.log("✅ components loaded");
    console.log("⬇️ Loading popup...");
    const popupModule = await import("../ui/popup.js");
    console.log("✅ popup loaded");
    return {
        canvas: canvasModule,
        components: componentsModule,
        popup: popupModule
    };
}

navLinks.home.onclick = () => navigate("home");
navLinks.sim.onclick = () => navigate("sim");
navLinks.learn.onclick = () => navigate("learn");
navLinks.about.onclick = () => navigate("about");
document.getElementById("start-btn").onclick = () => navigate("sim");
document.getElementById("learn-more-btn").onclick = () => navigate("learn");
navigate("home");

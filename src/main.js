document.addEventListener("DOMContentLoaded", () => {
    const pages = {
        home: document.getElementById("home-screen"),
        sim: document.getElementById("simulator"),
        learn: document.getElementById("learn-page"),
        about: document.getElementById("about-page")
    };

    const navLinks = {
        sim: document.getElementById("nav-sim"),
        learn: document.getElementById("nav-learn"),
        about: document.getElementById("nav-about")
    };

    const startBtn = document.getElementById("start-btn");
    const learnMoreBtn = document.getElementById("learn-more-btn");
    const settingsBtn = document.getElementById("settings-btn");
    const settingsPanel = document.getElementById("settings-panel");
    const closeSettingsBtn = document.getElementById("close-settings");
    const applySettingsBtn = document.getElementById("apply-settings");
    const bgSelect = document.getElementById("bg-select");
    const bgColorPicker = document.getElementById("bg-color-picker");
    const overlaySelect = document.getElementById("overlay-select");
    const overlayOpacity = document.getElementById("overlay-opacity");
    const screenOverlay = document.createElement("div");
    screenOverlay.id = "screen-overlay";
    Object.assign(screenOverlay.style, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1500,
        transition: "background-color 0.3s"
    });
    document.body.appendChild(screenOverlay);

    const hideAllPages = () => {
        Object.values(pages).forEach(p => p?.classList.remove("active"));
        Object.values(navLinks).forEach(l => l?.classList.remove("active"));
    };

    const addHomeButton = () => {
        if (document.getElementById("back-home-btn")) return;
        const btn = document.createElement("button");
        btn.id = "back-home-btn";
        btn.textContent = "🏠 Home";
        Object.assign(btn.style, {
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 1000,
            padding: "8px 12px",
            background: "#00d4aa",
            color: "#0d0f14",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600"
        });
        btn.addEventListener("click", () => showPage("home"));
        pages.sim.appendChild(btn);
    };

    const applySettings = () => {
        if (!bgSelect || !overlaySelect || !overlayOpacity) return;
        const bgColors = {
            default: "",
            black: "#000000",
            white: "#ffffff",
            custom: bgColorPicker?.value || "#ffffff"
        };
        document.body.style.backgroundColor = bgColors[bgSelect.value] || "";
        const overlayColors = {
            black: `rgba(0,0,0,${overlayOpacity.value/100})`,
            white: `rgba(255,255,255,${overlayOpacity.value/100})`,
            none: "transparent"
        };
        screenOverlay.style.backgroundColor = overlayColors[overlaySelect.value] || "transparent";
    };

    let simulatorReady = false;
    let preloadStarted = false;
    const preloadSimulator = () => {
        if (preloadStarted) return;
        preloadStarted = true;
        requestIdleCallback(async () => {
            try {
                const [{ initCanvas }, { initComponents }, { initPopup }] = await Promise.all([
                    import("../datapath/canvas.js"),
                    import("../datapath/components.js"),
                    import("../ui/popup.js")
                ]);
                initCanvas("konva-container");
                initPopup();
                initComponents();
                simulatorReady = true;
                console.log("Simulator preloaded in background!");
            } catch (err) {
                console.error("Error preloading simulator:", err);
            }
        });
    };

    const showPage = (pageName) => {
        if (!pages[pageName]) return console.warn(`Page "${pageName}" not found!`);
        hideAllPages();
        pages[pageName].classList.add("active");
        if (navLinks[pageName]) navLinks[pageName].classList.add("active");
        if (pageName === "sim") {
            addHomeButton();
            if (!simulatorReady) preloadSimulator();
        }
    };

    startBtn?.addEventListener("click", () => showPage("sim"));
    learnMoreBtn?.addEventListener("click", () => showPage("learn"));
    navLinks.sim?.addEventListener("click", e => { e.preventDefault(); showPage("sim"); });
    navLinks.learn?.addEventListener("click", e => { e.preventDefault(); showPage("learn"); });
    navLinks.about?.addEventListener("click", e => { e.preventDefault(); showPage("about"); });
    bgSelect?.addEventListener("change", () => {
        bgColorPicker.style.display = bgSelect.value === "custom" ? "block" : "none";
        applySettings();
    });
    overlaySelect?.addEventListener("change", applySettings);
    overlayOpacity?.addEventListener("input", applySettings);
    bgColorPicker?.addEventListener("input", applySettings);
    settingsBtn?.addEventListener("click", () => settingsPanel.style.display = "block");
    closeSettingsBtn?.addEventListener("click", () => settingsPanel.style.display = "none");
    applySettingsBtn?.addEventListener("click", applySettings);
    applySettings();
    preloadSimulator();
    showPage("home");
});

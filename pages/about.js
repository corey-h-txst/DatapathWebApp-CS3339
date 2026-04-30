const img = new Image();
img.src = "pictures/datapath-preview.png";
img.onload = () => {
    console.log("About preview loaded");
};
img.onerror = () => {
    console.warn("Preview image missing — fallback active");
};

// JavaScript source code
const canvas = document.getElementById("digZone");
const ctx = canvas.getContext("2d");

// Couche de "poussière"
const dustColor = "#b49b7f";
ctx.fillStyle = dustColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Mode transparent
ctx.globalCompositeOperation = "destination-out";

let isBrushing = false;

canvas.addEventListener("mousedown", () => isBrushing = true);
canvas.addEventListener("mouseup", () => isBrushing = false);
canvas.addEventListener("mouseleave", () => isBrushing = false);

canvas.addEventListener("mousemove", e => {
    if (!isBrushing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // "Pinceau" qui efface
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
});

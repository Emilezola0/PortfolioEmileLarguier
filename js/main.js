import { Void } from "./Void.js";
import { Folder } from "./Folder.js";
import { Mob } from "./Mob.js";
import { Bullet } from "./Bullet.js";
import { spawnManager } from "./spawnManager.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    voidZone.setCenter(canvas.width / 2, canvas.height / 2);
});

const voidZone = new Void(canvas.width / 2, canvas.height / 2);
const folders = [];
const bullets = [];
const mobs = [];
let score = 0;

const scrapImg = new Image();
scrapImg.src = "assets/scrap.png";

let draggedFolder = null;

canvas.addEventListener("mousedown", e => {
    for (const folder of folders) {
        if (folder.isHovered(e.clientX, e.clientY)) {
            draggedFolder = folder;
            break;
        }
    }
});
canvas.addEventListener("mousemove", e => {
    if (draggedFolder) {
        draggedFolder.x = e.clientX;
        draggedFolder.y = e.clientY;
    }
});
canvas.addEventListener("mouseup", () => {
    draggedFolder = null;
});

function drawUI() {
    ctx.drawImage(scrapImg, canvas.width - 100, 20, 24, 24);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(score, canvas.width - 70, 38);
}

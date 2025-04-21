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

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    voidZone.draw(ctx);

    folders.forEach(folder => {
        folder.update(mobs, bullets);
        folder.draw(ctx);
    });

    for (let i = mobs.length - 1; i >= 0; i--) {
        const mob = mobs[i];
        mob.update(voidZone.center);
        mob.draw(ctx);

        if (voidZone.absorb(mob)) {
            mobs.splice(i, 1);
            voidZone.grow(5);
        }
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.update();
        bullet.draw(ctx);

        if (bullet.isOutOfBounds(canvas)) {
            bullets.splice(i, 1);
            continue;
        }

        for (let j = mobs.length - 1; j >= 0; j--) {
            if (bullet.hits(mobs[j])) {
                mobs[j].hp -= 50;
                bullets.splice(i, 1);
                if (mobs[j].hp <= 0) {
                    mobs.splice(j,

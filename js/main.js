import { Void } from "./Void.js";
import { Folder } from "./Folder.js";
import { Mob } from "./Mob.js";
import { Bullet } from "./Bullet.js";
import { spawnManager } from "./spawnManager.js";
import { Particle } from "./Particle.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const voidZone = new Void(canvas.width / 2, canvas.height / 2);

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    voidZone.setCenter(canvas.width / 2, canvas.height / 2); // void reste centré
});

const folders = [];
const bullets = [];
const mobs = [];
let particles = [];
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

    // Folders
    folders.forEach(folder => {
        folder.update(mobs, bullets);
        folder.draw(ctx);
    });

    // Mobs
    for (let i = mobs.length - 1; i >= 0; i--) {
        const mob = mobs[i];
        mob.update(voidZone.center);
        mob.draw(ctx);

        if (voidZone.absorb(mob)) {
            mobs.splice(i, 1);
            voidZone.grow(mob.nutrition);
        }
    }

    // Check if folders get sucked in
    for (let i = folders.length - 1; i >= 0; i--) {
        const f = folders[i];
        const dx = f.x - voidZone.center.x;
        const dy = f.y - voidZone.center.y;
        if (Math.sqrt(dx * dx + dy * dy) < voidZone.radius + 16) {
            folders.splice(i, 1);
        }
    }

    if (folders.length === 0) {
        alert("Game Over: all folders were consumed by the void.");
        location.reload();
    }

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.update();
        bullet.draw(ctx);

        if (bullet.isOutOfBounds(canvas)) {
            bullets.splice(i, 1);
            continue;
        }

        for (let j = mobs.length - 1; j >= 0; j--) {
            const mob = mobs[j];
            if (bullet.hits(mob)) {
                mob.hp -= 50;

                // Generate particles
                for (let k = 0; k < 10; k++) {
                    particles.push(new Particle(bullet.x, bullet.y, "orange"));
                }

                bullets.splice(i, 1);

                if (mob.hp <= 0) {
                    voidZone.grow(mob.nutrition);
                    mobs.splice(j, 1);
                    score++;
                }
                break;
            }
        }
    }

    // Particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    drawUI();
    spawnManager.update(mobs, voidZone.radius, canvas);

    requestAnimationFrame(updateGame);
}

fetch("public/projects.json")
    .then(res => res.json())
    .then(data => {
        const radius = 300;
        const step = (2 * Math.PI) / data.length;
        data.forEach((proj, i) => {
            const angle = i * step;
            const x = canvas.width / 2 + radius * Math.cos(angle);
            const y = canvas.height / 2 + radius * Math.sin(angle);
            folders.push(new Folder(x, y, proj.name));
        });
        updateGame();
    });

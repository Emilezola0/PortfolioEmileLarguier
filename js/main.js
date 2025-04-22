import { Void } from "./Void.js";
import { Folder } from "./Folder.js";
import { Mob } from "./Mob.js";
import { Bullet } from "./Bullet.js";
import { spawnManager } from "./spawnManager.js";
import { Particle } from "./Particle.js";
import { ScrapCollector } from "./ScrapCollector.js";
import { Scrap } from "./Scrap.js";
import { MobDeathParticle } from "./MobDeathParticle.js";


// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const voidZone = new Void(canvas.width / 2, canvas.height / 2);

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    voidZone.setCenter(canvas.width / 2, canvas.height / 2);
});

// Toggle for sound visual
const soundToggle = document.getElementById("soundToggle");
let soundEnabled = soundToggle.checked;

soundToggle.addEventListener("change", () => {
    soundEnabled = soundToggle.checked;
});

const folders = [];
const bullets = [];
const mobs = [];
let particles = [];
let voidParticles = [];
let score = 0;
let flyingScraps = [];
let mobParticles = [];

let collector = new ScrapCollector(canvas.width / 2 + 100, canvas.height / 2);

const scrapImg = new Image();
scrapImg.src = "assets/scrap.png";

const scrapImgCollect = new Image();
scrapImgCollect.src = "assets/scrapCollect.png";

// Ajout pour le son :
const scrapSound = document.getElementById("scrapSound");
const projectileSound = document.getElementById("projectileSound");
const explodeSound = document.getElementById("explodeSound");

let draggedFolder = null;

canvas.addEventListener("mousedown", e => {
    if (collector.isHovered(e.clientX, e.clientY)) {
        collector.dragging = true;
        return;
    }
    for (const folder of folders) {
        if (folder.isHovered(e.clientX, e.clientY)) {
            draggedFolder = folder;
            break;
        }
    }
});

canvas.addEventListener("mousemove", e => {
    if (collector.dragging) {
        collector.update(e.clientX, e.clientY);
        return;
    }
    if (draggedFolder) {
        draggedFolder.x += (e.clientX - draggedFolder.x) * 0.2;
        draggedFolder.y += (e.clientY - draggedFolder.y) * 0.2;
        draggedFolder.dragging = true;
    }
});

canvas.addEventListener("mouseup", () => {
    collector.dragging = false;
    if (draggedFolder) draggedFolder.dragging = false;
    draggedFolder = null;
});

function drawUI() {
    // Affiche le score
    ctx.drawImage(scrapImg, canvas.width - 100, 20, 24, 24);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(score, canvas.width - 70, 38);

    // Barre de pause entre vagues
    if (spawnManager.isPaused()) {
        const progress = spawnManager.getPauseProgress();
        const barWidth = 200;
        const barHeight = 10;
        const x = canvas.width / 2 - barWidth / 2;
        const y = 20;

        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.fillStyle = "white";
        ctx.fillRect(x, y, barWidth * progress, barHeight);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = "16px sans-serif";
        ctx.fillText("Next wave " + spawnManager.wave, canvas.width / 2, 30);
    }
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    voidZone.draw(ctx);

    if (Math.random() < 0.3) {
        const angle = Math.random() * Math.PI * 2;
        const radius = voidZone.radius + 30 + Math.random() * 40;
        const x = voidZone.center.x + radius * Math.cos(angle);
        const y = voidZone.center.y + radius * Math.sin(angle);
        voidParticles.push(new Particle(x, y, "purple", angle, radius));
    }

    for (const folder of folders) {
        folder.update(mobs, bullets, voidZone.center, voidZone.radius, soundEnabled, projectileSound);
        folder.draw(ctx);
    }

    for (let i = mobs.length - 1; i >= 0; i--) {
        const mob = mobs[i];
        mob.update(voidZone.center);
        mob.draw(ctx);

        if (voidZone.absorb(mob)) {
            mobs.splice(i, 1);
            voidZone.grow(mob.nutrition);
            continue;
        }

        if (mob.isReadyToRemove()) {
            mobs.splice(i, 1);
        }
    }

    for (const p of voidParticles) {
        p.update(voidZone.center);
        p.draw(ctx);
    }

    for (let i = folders.length - 1; i >= 0; i--) {
        const f = folders[i];
        if (f.absorbing && f.opacity <= 0) {
            folders.splice(i, 1);
        }
    }

    if (folders.length === 0) {
        alert("Game Over: all folders were consumed by the void.");
        location.reload();
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
            const mob = mobs[j];
            if (bullet.hits(mob)) {
                mob.takeDamage(50);

                for (let k = 0; k < 10; k++) {
                    particles.push(new Particle(bullet.x, bullet.y, "orange"));
                }

                bullets.splice(i, 1);

                if (mob.hp <= 0) {
                    mobs.splice(j, 1);

                    if (soundEnabled) {
                        const boom = explodeSound.cloneNode(); // sound for mob when destruct
                        boom.volume = 0.7;
                        document.body.appendChild(boom);
                        boom.play();
                        boom.addEventListener("ended", () => {
                            boom.remove();
                        });
                    }

                    const scrapCount = mob.scrapNumber || 1;
                    for (let s = 0; s < scrapCount; s++) {
                        const angle = Math.random() * 2 * Math.PI;
                        const radius = 10 + Math.random() * 20;
                        const x = mob.x + mob.width / 2 + Math.cos(angle) * radius;
                        const y = mob.y + mob.height / 2 + Math.sin(angle) * radius;

                        // On instancie proprement des objets Scrap
                        flyingScraps.push(new Scrap(x, y, scrapImgCollect));
                    }
                }

                break;
            }
        }
    }

    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    voidParticles = voidParticles.filter(p => p.life > 0);

    for (let i = flyingScraps.length - 1; i >= 0; i--) {
        const scrap = flyingScraps[i];
        const result = scrap.update(collector);

        if (result === "collected") {
            score += 1;
            flyingScraps.splice(i, 1);

            if (soundEnabled) {
                const soundClone = scrapSound.cloneNode(); // sound system for scrap
                soundClone.volume = 0.7;
                document.body.appendChild(soundClone); // <- IMPORTANT
                soundClone.play();

                soundClone.addEventListener("ended", () => {
                    document.body.removeChild(soundClone);
                });
            }

            for (let p = 0; p < 6; p++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 15;
                const px = collector.x + Math.cos(angle) * radius;
                const py = collector.y + Math.sin(angle) * radius;
                particles.push(new Particle(px, py, "yellow"));
            }

            continue;
        }

        scrap.draw(ctx, scrapImgCollect);
    }

    collector.draw(ctx);

    drawUI();
    spawnManager.update(mobs, voidZone.radius, canvas);

    mobParticles = mobParticles.filter(p => p.life > 0);
    mobParticles.forEach(p => {
        p.update();
        p.draw(ctx);
    });

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


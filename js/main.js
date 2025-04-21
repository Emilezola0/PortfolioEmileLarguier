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
    voidZone.setCenter(canvas.width / 2, canvas.height / 2);
});

const folders = [];
const bullets = [];
const mobs = [];
let particles = [];
let voidParticles = []; // ajout des particules orbitales
let score = 0;
let flyingScraps = [];

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
        // Lerp vers la position pour un effet plus fluide
        draggedFolder.x += (e.clientX - draggedFolder.x) * 0.2;
        draggedFolder.y += (e.clientY - draggedFolder.y) * 0.2;
        draggedFolder.dragging = true;
    }
});

canvas.addEventListener("mouseup", () => {
    if (draggedFolder) draggedFolder.dragging = false;
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

    // Générer des void particles en orbite
    if (Math.random() < 0.3) {
        const angle = Math.random() * Math.PI * 2;
        const radius = voidZone.radius + 30 + Math.random() * 40;
        const x = voidZone.center.x + radius * Math.cos(angle);
        const y = voidZone.center.y + radius * Math.sin(angle);
        voidParticles.push(new Particle(x, y, "purple", angle, radius));
    }

    // Met à jour et dessine les folders (update d'abord, draw ensuite pour le z-index)
    for (const folder of folders) {
        folder.update(mobs, bullets, voidZone.center, voidZone.radius);
    }

    for (const folder of folders) {
        folder.draw(ctx);
    }

    // Mobs
    for (let i = mobs.length - 1; i >= 0; i--) {
        const mob = mobs[i];
        mob.update(voidZone.center);
        mob.draw(ctx);

        if (voidZone.absorb(mob)) {
            mobs.splice(i, 1);
            voidZone.grow(mob.nutrition); // le void grandit seulement ici
        }
    }

    // Void particles orbit
    for (const p of voidParticles) {
        p.update(voidZone.center);
        p.draw(ctx);
    }

    // Supprimer les folders aspirés visuellement
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

                for (let k = 0; k < 10; k++) {
                    particles.push(new Particle(bullet.x, bullet.y, "orange"));
                }

                bullets.splice(i, 1);

                if (mob.hp <= 0) {
                    mobs.splice(j, 1);
                    score++;

                    const scrapCount = mob.nutrition; // ou fixe à 1 si pas de nutrition

                    for (let s = 0; s < scrapCount; s++) {
                        flyingScraps.push({
                            x: bullet.x,
                            y: bullet.y,
                            vx: Math.random() * 2 - 1,
                            vy: -Math.random() * 2 - 1,
                            alpha: 1,
                            delay: s * 5, // étalement de l'apparition des scraps
                            reached: false
                        });
                    }
                }
                break;
            }
        }
    }

    // Particles classiques
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    // Nettoyage des particules orbitales
    voidParticles = voidParticles.filter(p => p.life > 0);

    // Animation des scraps collectés
    const targetX = canvas.width - 90;
    const targetY = 32;

    const scrapImgCollect = new Image();
    scrapImgCollect.src = "assets/scrapCollect.png"; // Scrap image collectée

    for (let i = flyingScraps.length - 1; i >= 0; i--) {
        const scrap = flyingScraps[i];
        if (scrap.delay > 0) {
            scrap.delay--;
            continue;
        }

        const dx = targetX - scrap.x;
        const dy = targetY - scrap.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10 && !scrap.reached) {
            score += 1;
            scrap.reached = true;
            flyingScraps.splice(i, 1); // Retirer le scrap une fois qu'il a atteint le score
            continue;
        }

        // Lerp vers la cible (ease-in)
        scrap.x += dx * 0.1;
        scrap.y += dy * 0.1;

        ctx.save();
        ctx.globalAlpha = scrap.alpha;
        ctx.drawImage(scrapImgCollect, scrap.x, scrap.y, 16, 16); // Afficher l'image du scrap
        ctx.restore();
    }

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

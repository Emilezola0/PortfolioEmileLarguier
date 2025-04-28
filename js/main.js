import { Void } from "./Void.js";
import { Folder } from "./Folder.js";
import { Mob } from "./Mob.js";
import { Bullet } from "./Bullet.js";
import { spawnManager } from "./spawnManager.js";
import { Particle } from "./Particle.js";
import { ScrapCollector } from "./ScrapCollector.js";
import { Scrap } from "./Scrap.js";
import { MobDeathParticle } from "./MobDeathParticle.js";
import { SoundManager } from './SoundManager.js';
import { Background } from "./Background.js";
import { upgrades, upgradeFolder } from './upgrades.js';
import { Shop } from "./Shop.js";
import { CVBuffer } from "./CVBuffer.js";
import { setupPauseMenu } from './pauseMenu.js';
import { gamePaused } from './pauseMenu.js';

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Création d'un écran de fin (overlay)
const gameOverScreen = document.createElement("div");
gameOverScreen.style.position = "fixed";
gameOverScreen.style.top = "0";
gameOverScreen.style.left = "0";
gameOverScreen.style.width = "100vw";
gameOverScreen.style.height = "100vh";
gameOverScreen.style.background = "rgba(0, 0, 0, 0.8)";
gameOverScreen.style.display = "flex";
gameOverScreen.style.flexDirection = "column";
gameOverScreen.style.justifyContent = "center";
gameOverScreen.style.alignItems = "center";
gameOverScreen.style.color = "white";
gameOverScreen.style.fontFamily = "Arial, sans-serif";
gameOverScreen.style.fontSize = "24px";
gameOverScreen.style.zIndex = "10";
gameOverScreen.style.display = "none";

const message = document.createElement("div");
message.innerText = "Game Over: all folders were consumed by the void.";

const playAgainBtn = document.createElement("button");
playAgainBtn.innerText = "Play Again";
playAgainBtn.style.marginTop = "20px";
playAgainBtn.style.padding = "10px 20px";
playAgainBtn.style.fontSize = "18px";
playAgainBtn.style.border = "none";
playAgainBtn.style.borderRadius = "8px";
playAgainBtn.style.background = "#ffffff";
playAgainBtn.style.color = "#000000";
playAgainBtn.style.cursor = "pointer";
playAgainBtn.style.transition = "background 0.3s";

playAgainBtn.addEventListener("mouseenter", () => {
    playAgainBtn.style.background = "#dddddd";
});
playAgainBtn.addEventListener("mouseleave", () => {
    playAgainBtn.style.background = "#ffffff";
});
playAgainBtn.addEventListener("click", () => {
    location.reload(); // ou tu pourrais relancer le setup sans recharger la page
});

gameOverScreen.appendChild(message);
gameOverScreen.appendChild(playAgainBtn);
document.body.appendChild(gameOverScreen);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const voidZone = new Void(canvas.width / 2, canvas.height / 2);

// Game Over to false
let isGameOver = false;
// UPDATE
let lastTime = performance.now();

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    voidZone.setCenter(canvas.width / 2, canvas.height / 2);
    background.onResize();
});

// pause menu
window.addEventListener('DOMContentLoaded', () => {
    setupPauseMenu();
});

// Background
const background = new Background(canvas);

// Toggle for sound visual
const soundToggle = document.getElementById("soundToggle");
let soundEnabled = soundToggle.checked;

// Wave Display
const waveDisplay = document.getElementById('waveDisplay');

// Sound manager
SoundManager.soundEnabled = soundToggle.checked;

soundToggle.addEventListener("change", () => {
    soundEnabled = soundToggle.checked;
    SoundManager.soundEnabled = soundToggle.checked;
});

const folders = [];
const bullets = [];
const mobs = [];
let particles = [];
let voidParticles = [];
let totalNumberOfScraps = 0;
let flyingScraps = [];
let mobParticles = [];
const items = [];

// Mouse
let mouseDown = false;
let shopStartX = 0;
let shopStartY = 0;
let folderStartX = 0;
let folderStartY = 0;
let itemStartX = 0;
let itemStartY = 0;


let collector = new ScrapCollector(canvas.width / 2 + 100, canvas.height / 2);
let shop = null; // initialize after charging folders

// Images
const scrapImg = new Image();
scrapImg.src = "assets/scrap.png";

// Drag
let draggedFolder = null;
let draggedShop = false;
let draggedItem = null;

canvas.addEventListener("mousedown", e => {
    if (collector.isHovered(e.clientX, e.clientY)) {
        collector.dragging = true;
        return;
    }

    for (const folder of folders) {
        if (folder.isHovered(e.clientX, e.clientY)) {
            draggedFolder = folder;
            folderStartX = e.clientX;
            folderStartY = e.clientY;
            folder.handleClick({ x: e.clientX, y: e.clientY });
            draggedFolder.dragging = false;
            return;
        }
    }

    for (const item of items) {
        if (item.isHovered(e.clientX, e.clientY)) {
            draggedItem = item;
            itemStartX = e.clientX;
            itemStartY = e.clientY;
            item.handleClick({ x: e.clientX, y: e.clientY });
            draggedItem.dragging = false;
            return;
        }
    }

    if (shop && shop.isHovered(e.clientX, e.clientY)) {
        draggedShop = true;
        shopStartX = e.clientX;
        shopStartY = e.clientY;
        shop.wasDragged = false;
        return;
    }

    mouseDown = true;
});

canvas.addEventListener("mousemove", e => {

    // Update mouse pos for each folders
    for (const folder of folders) {
        // check if mouse hover folder
        folder.hovered = folder.isHovered(e.clientX, e.clientY);
    }
    for (const item of items) {
        item.hovered = item.isHovered(e.clientX, e.clientY);
    }

    if (collector.dragging) {
        collector.update(e.clientX, e.clientY);
        return;
    }
    if (draggedFolder) {
        // OLD ONE == draggedFolder.x += (e.clientX - draggedFolder.x) * 0.2;
        // OLD ONE == draggedFolder.y += (e.clientY - draggedFolder.y) * 0.2;
        const dx = e.clientX - folderStartX;
        const dy = e.clientY - folderStartY;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            draggedFolder.dragging = true;
        }

        draggedFolder.updatePosition(e.movementX, e.movementY);
        folderStartX = e.clientX;
        folderStartY = e.clientY;
    }

    if (draggedItem) {
        const dx = e.clientX - itemStartX;
        const dy = e.clientY - itemStartY;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            draggedItem.dragging = true;
        }

        draggedItem.updatePosition(e.movementX, e.movementY);
        itemStartX = e.clientX;
        itemStartY = e.clientY;
    }

    if (draggedShop && shop && !draggedFolder) {
        const dx = e.clientX - shopStartX;
        const dy = e.clientY - shopStartY;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            shop.wasDragged = true;
        }

        shop.updatePosition(e.movementX, e.movementY);
        shopStartX = e.clientX;
        shopStartY = e.clientY;
    }
});

canvas.addEventListener("mouseup", (e) => {
    // Collector
    collector.dragging = false;
    // Folder
    if (draggedFolder && draggedFolder.isHovered(e.clientX, e.clientY)) {
        draggedFolder.handleMouseUp({ x: e.clientX, y: e.clientY });
    }
    draggedFolder = null;

    // Items
    if (draggedItem && draggedItem.isHovered(e.clientX, e.clientY)) {
        draggedItem.handleMouseUp({ x: e.clientX, y: e.clientY });
    }
    draggedItem = null;

    // Shop
    if (shop && shop.isHovered(e.clientX, e.clientY)) {
        shop.handleMouseUp();
    }
    draggedShop = false;

    mouseDown = false;
});

function drawUI() {
    if (spawnManager.isPaused() && !isGameOver) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = "16px 'PressStart2P', monospace"; // Si tu veux garder ton style arcade
        ctx.fillText(`Vague ${spawnManager.getWave()}`, canvas.width / 2, 10);
    }
}

function updateWaveDisplay() {
    const wave = spawnManager.getWave();
    waveDisplay.textContent = `Vague ${wave}`;

    // Reset des classes avant d'appliquer les nouvelles
    waveDisplay.classList.remove('wave-tier-2', 'wave-tier-3');

    // Ajout des classes selon le niveau de vague
    if (wave >= 10 && wave < 20) {
        waveDisplay.classList.add('wave-tier-2');
    } else if (wave >= 20) {
        waveDisplay.classList.add('wave-tier-3');
    }
}


function updateGame() {
    const now = performance.now();
    const deltaTime = now - lastTime;
    lastTime = now;
    if (isGameOver) return; // <== stop loop here if game over
    if (gamePaused) return; // stop loop here if pause

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.update();
    background.draw();
    voidZone.draw(ctx);

    if (Math.random() < 0.3) {
        const angle = Math.random() * Math.PI * 2;
        const radius = voidZone.radius + 30 + Math.random() * 40;
        const x = voidZone.center.x + radius * Math.cos(angle);
        const y = voidZone.center.y + radius * Math.sin(angle);
        voidParticles.push(new Particle(x, y, "purple", angle, radius));
    }

    for (const folder of folders) {
        folder.update(mobs, bullets, voidZone.center, voidZone.radius);
        folder.draw(ctx);
    }

    for (const item of items) {
        item.update();
        item.draw(ctx);
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

    if (folders.length === 0 && !isGameOver) {
        isGameOver = true;
        gameOverScreen.style.display = "flex";
        return;
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.update();
        bullet.draw(ctx);

        for (let j = mobs.length - 1; j >= 0; j--) {
            const mob = mobs[j];

            if (bullet.hits(mob)) {
                mob.takeDamage(bullet.damage); // damage

                for (let k = 0; k < 10; k++) {
                    particles.push(new Particle(bullet.x, bullet.y, "orange"));
                }

                const shouldDestroy = bullet.registerHit(); // update hitcount and check pierce

                if (shouldDestroy) {
                    bullets.splice(i, 1); // destroy if pierce is finished
                }

                if (mob.hp <= 0) {
                    mobs.splice(j, 1);
                    SoundManager.play('explode');

                    const scrapCount = mob.scrapNumber || 1;
                    for (let s = 0; s < scrapCount; s++) {
                        const angle = Math.random() * 2 * Math.PI;
                        const radius = 10 + Math.random() * 20;
                        const x = mob.x + mob.width / 2 + Math.cos(angle) * radius;
                        const y = mob.y + mob.height / 2 + Math.sin(angle) * radius;
                        flyingScraps.push(new Scrap(x, y));
                    }
                }

                break; // important cuz we don't touch only one mob per tick
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
            totalNumberOfScraps += 1;
            flyingScraps.splice(i, 1);

            SoundManager.play('scrapCollect');

            for (let p = 0; p < 6; p++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 15;
                const px = collector.x + Math.cos(angle) * radius;
                const py = collector.y + Math.sin(angle) * radius;
                particles.push(new Particle(px, py, "yellow"));
            }

            continue;
        }
        scrap.draw(ctx);
    }

    if (shop) {
        if (shop.numberOfScraps !== totalNumberOfScraps) {
            // Update if number are not the same
            shop.setContext(totalNumberOfScraps, folders); // player stats == score == number of scrap in possession and folders
            shop.refreshShopPopup(); // update pop up if open
        } else {
            // Don't if it's not the same
            shop.setContext(totalNumberOfScraps, folders); // player stats == score == number of scrap in possession and folders
        }
        //For now no particle === shop.update(particles);
        shop.draw(ctx);
        shop.drawConnectionLine(ctx);

        const popup = document.getElementById("shop-popup"); // Look if pop-up is open
        if (popup && !popup.classList.contains("hidden")) {
            shop.drawConnectionWithScrapCollector(ctx, collector);
        }
    }

    // Collector
    collector.draw(ctx, totalNumberOfScraps);
    // Spawn Manager
    spawnManager.update(mobs, voidZone.radius, canvas, deltaTime);
    // Wave
    drawUI();
    updateWaveDisplay();

    // Mob particle Effect
    mobParticles = mobParticles.filter(p => p.life > 0);
    mobParticles.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    requestAnimationFrame(updateGame); // <== continue que si pas Game Over
}

export function spendScrap(amount) {
    if (totalNumberOfScraps >= amount) {
        totalNumberOfScraps -= amount;
        shop.setContext(totalNumberOfScraps, folders);
        return true;
    }
    return false;
}

// Creer le pop-up de demarrage
const startGamePopup = document.createElement('div');
startGamePopup.classList.add('popup-start-game');

const header = document.createElement('div');
header.classList.add('popup-header');
header.innerHTML = 'Welcome to my game and portfolio!'; // Titre du pop-up

const content = document.createElement('div');
content.classList.add('popup-content');
content.innerHTML = `
  <p>Click on game elements with your mouse to move them.</p>

  <p>
    The <span style="color: #00ccff;"><strong>planets</strong></span> are my projects, whether 
    <span style="color: #ffcc00;"><strong>School</strong></span>, 
    <span style="color: #ff66cc;"><strong>Personal</strong></span>, or 
    <span style="color: #66ff66;"><strong>Jam</strong></span>.<br>
    Click on a <span style="color: #00ccff;"><strong>planet</strong></span> to discover the project!
  </p>

  <p>As for the other game items:</p>
  <p>
    The <span style="color: #ffaa00;"><strong>bag</strong></span> lets you collect metal pieces to upgrade your planets<br>
    The <span style="color: #ff00ff;"><strong>computer</strong></span> opens a store window linked to the nearest folder
  </p>

  <p>
    <strong style="color: #ff4444;">Defeat condition:</strong><br>
    All folders have been sucked into the <span style="color: #ff4444;"><strong>black hole</strong></span>!<br>
    (If a folder has been sucked in, it’s still available via a button on the right)
  </p>
`;

const closeButton = document.createElement('button');
closeButton.classList.add('popup-close-btn', 'shop-item', 'play-button');
closeButton.innerHTML = 'PLAY';

closeButton.addEventListener('click', () => {
    startGamePopup.style.display = 'none'; // Cache le pop-up lorsque le jeu commence
    SoundManager.play('click');
    // Ici tu peux demarrer ton jeu apres la fermeture du pop-up
    fetch("public/projects.json")
        .then(res => res.json())
        .then(data => {
            const radius = 300;
            const step = (2 * Math.PI) / data.length;
            data.forEach((proj, i) => {
                const angle = i * step;
                const x = canvas.width / 2 + radius * Math.cos(angle);
                const y = canvas.height / 2 + radius * Math.sin(angle);
                folders.push(new Folder(x, y, proj.name, proj.JsName, proj.planetStyle));
            });

            // Assure-toi de bien initialiser le shop après avoir ajoute les dossiers
            const firstFolder = folders[0];
            const secondFolder = folders[1];
            shop = new Shop(firstFolder.x + 50, firstFolder.y);
            // Ajouter l'instance au tableau items
            items.push(new CVBuffer(secondFolder.x + 50, firstFolder.y, folders, shop));

            // Demarrer le jeu apres l'initialisation
            updateGame();
        });
});

startGamePopup.appendChild(header);
startGamePopup.appendChild(content);
startGamePopup.appendChild(closeButton);

document.body.appendChild(startGamePopup);

export function resumeGame() {
    updateGame();
}
import { Folder } from "./Folder.js";
import { ShootingStar, STAR_TYPES } from "./ShootingStar.js";
import { CosmicObject, CANNON_INTERVAL } from "./CosmicObject.js";
import { Effects } from "./Effects.js";
import { SoundManager } from './SoundManager.js';
import { Background } from "./Background.js";
import { Shop, formatDust } from "./Shop.js";
import { setupPauseMenu } from './pauseMenu.js';
import { gamePaused } from './pauseMenu.js';

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Free space in the middle of the screen
const center = { x: canvas.width / 2, y: canvas.height / 2 };

const MAX_STARS = 250;          // hard cap, keeps the frame rate smooth
const BOUNCE_SOUND_DELAY = 140; // ms between two bounce sounds

let lastTime = performance.now();
let running = false;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    center.x = canvas.width / 2;
    center.y = canvas.height / 2;
    background.onResize();

    // keep everything reachable
    for (const body of [...folders, ...cosmicObjects]) {
        body.x = Math.min(Math.max(body.x, 30), canvas.width - 30);
        body.y = Math.min(Math.max(body.y, 30), canvas.height - 30);
    }
});

// pause menu
window.addEventListener('DOMContentLoaded', () => {
    setupPauseMenu();
});

// Background
const background = new Background(canvas);

// Sound
const soundToggle = document.getElementById("soundToggle");
SoundManager.soundEnabled = soundToggle.checked;
soundToggle.addEventListener("change", () => {
    SoundManager.soundEnabled = soundToggle.checked;
});

// HUD
const stardustDisplay = document.getElementById('stardustDisplay');
const stardustValue = document.getElementById('stardustValue');
const shopButton = document.getElementById('shopButton');

// World
const folders = [];        // portfolio planets
const cosmicObjects = [];  // planets, pulsars, holes, orbiters, cannons
const stars = [];
const effects = new Effects();
let bouncers = [];         // everything a star bounces on
let deflectors = [];       // everything that bends trajectories
let orbiters = [];         // make nearby planets turn around them
let cannons = [];

let stardust = 0;
let shownStardust = -1;
let lastBounceSound = 0;
let lastShopRefresh = 0;
let shopDirty = false;

const starCounts = {};
for (const type of Object.keys(STAR_TYPES)) starCounts[type] = 0;

function rebuildBodies() {
    bouncers = [...folders, ...cosmicObjects.filter(o => o.def.bouncer)];
    deflectors = cosmicObjects.filter(o => o.pull);
    orbiters = cosmicObjects.filter(o => o.def.spin);
    cannons = cosmicObjects.filter(o => o.kind === "cannon");
}

// Planets inside an orbiter's radius turn around it
function applyOrbiters(dt) {
    for (const o of orbiters) {
        for (const b of bouncers) {
            if (b.dragging) continue;
            const dx = b.x - o.x;
            const dy = b.y - o.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > o.range * o.range || d2 < 4) continue;

            const a = o.def.spin * Math.sqrt(120 / Math.max(Math.sqrt(d2), 40)) * dt;
            const cos = Math.cos(a);
            const sin = Math.sin(a);
            b.x = o.x + dx * cos - dy * sin;
            b.y = o.y + dx * sin + dy * cos;
        }
    }
}

function fireCannons(dt) {
    for (const cannon of cannons) {
        cannon.fireTimer += dt;
        if (cannon.fireTimer < CANNON_INTERVAL || cannon.dragging) continue;
        cannon.fireTimer = 0;
        cannon.bump = 1;

        const star = new ShootingStar("cannon", canvas.width, canvas.height);
        const muzzle = cannon.muzzle();
        star.launch(muzzle.x, muzzle.y, cannon.aim);
        stars.push(star);
        effects.burst(muzzle.x, muzzle.y, star.color, 4, 0.1);
    }
}

// Dotted preview of a cannon shot and its first bounces (ignores black / white holes)
function drawAimPreview(cannon) {
    const w = canvas.width;
    const h = canvas.height;
    const start = cannon.muzzle();
    let ox = start.x;
    let oy = start.y;
    let dx = Math.cos(cannon.aim);
    let dy = Math.sin(cannon.aim);

    ctx.save();
    ctx.strokeStyle = "rgba(255,170,80,0.45)";
    ctx.setLineDash([3, 7]);
    ctx.beginPath();
    ctx.moveTo(ox, oy);

    for (let bounce = 0; bounce < 8; bounce++) {
        // distance to the screen edge
        let tMin = Infinity;
        if (dx > 0) tMin = Math.min(tMin, (w - ox) / dx);
        else if (dx < 0) tMin = Math.min(tMin, -ox / dx);
        if (dy > 0) tMin = Math.min(tMin, (h - oy) / dy);
        else if (dy < 0) tMin = Math.min(tMin, -oy / dy);

        // nearest planet on the way
        let hit = null;
        for (const b of bouncers) {
            const r = b.radius + 3;
            const cx = ox - b.x;
            const cy = oy - b.y;
            const proj = cx * dx + cy * dy;
            const c = cx * cx + cy * cy - r * r;
            if (c <= 0) continue; // starting inside
            const disc = proj * proj - c;
            if (disc < 0) continue;
            const t = -proj - Math.sqrt(disc);
            if (t > 0.01 && t < tMin) {
                tMin = t;
                hit = b;
            }
        }

        if (tMin === Infinity || tMin < 0) break;
        ox += dx * tMin;
        oy += dy * tMin;
        ctx.lineTo(ox, oy);
        if (!hit) break;

        const nx = (ox - hit.x) / (hit.radius + 3);
        const ny = (oy - hit.y) / (hit.radius + 3);
        const dot = dx * nx + dy * ny;
        dx -= 2 * dot * nx;
        dy -= 2 * dot * ny;
    }

    ctx.stroke();
    ctx.restore();
}

function addStar(type) {
    if (stars.length >= MAX_STARS) return;
    const star = new ShootingStar(type, canvas.width, canvas.height);
    stars.push(star);
    starCounts[type]++;
    effects.burst(star.x, star.y, star.color, 12, 0.2);
}

// Called by a star each time it hits a planet / bumper
function onBounce(star, body, x, y) {
    // cannon comets: each bounce of the same shot is worth one more
    const chain = star.def.chain ? Math.min(star.bounces, star.def.maxChain) : 1;
    const gain = star.def.value * chain * body.valueMult;
    stardust += gain;
    body.bump = 1;

    const crowded = stars.length > 80;
    effects.burst(x, y, star.color, crowded ? 3 : 7);
    if (!crowded || Math.random() < 0.3) {
        effects.text(x, y - 10, "+" + gain, star.color);
    }

    if (star.def.prism) star.shiftHue();

    if (star.def.warp && bouncers.length > 1) {
        let target = body;
        while (target === body) {
            target = bouncers[Math.floor(Math.random() * bouncers.length)];
        }
        star.warpTo(target);
        effects.beam(x, y, star.x, star.y, star.color);
        effects.burst(star.x, star.y, star.color, crowded ? 3 : 7);
        target.bump = 1;
    }

    const now = performance.now();
    if (now - lastBounceSound > BOUNCE_SOUND_DELAY) {
        lastBounceSound = now;
        SoundManager.play('bounce');
    }
}

// === Shop ===
let placing = null; // { object, cost } while a cosmic object follows the cursor

const shop = new Shop({
    getDust: () => stardust,
    spend(amount) {
        if (stardust < amount) return false;
        stardust -= amount;
        return true;
    },
    starCount: type => starCounts[type],
    canAddStar: () => stars.length < MAX_STARS,
    addStar,
    cosmicCount: kind => cosmicObjects.filter(o => o.kind === kind).length,
    startPlacing(kind, cost) {
        placing = { object: new CosmicObject(kind, pointer.x, pointer.y), cost };
        canvas.style.cursor = "crosshair";
    }
});

shopButton.addEventListener("click", () => {
    SoundManager.play('click');
    shop.toggle();
});

window.addEventListener("keydown", e => {
    if (e.key === "Escape" && placing) {
        placing = null; // nothing was spent yet
        canvas.style.cursor = "";
    }
});

// === Pointer: drag planets / cosmic objects, click a planet to open it ===
const pointer = { x: center.x, y: center.y };
let dragged = null;
let rotating = null; // cannon being aimed
let dragMoved = false;
let dragStartX = 0;
let dragStartY = 0;

function findCannonHandle(x, y) {
    for (const cannon of cannons) if (cannon.isHandleHovered(x, y)) return cannon;
    return null;
}

function findTarget(x, y) {
    for (const obj of cosmicObjects) if (obj.isHovered(x, y)) return obj;
    for (const folder of folders) if (folder.isHovered(x, y)) return folder;
    return null;
}

canvas.addEventListener("pointerdown", e => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;

    if (placing) {
        if (stardust >= placing.cost) {
            stardust -= placing.cost;
            placing.object.x = pointer.x;
            placing.object.y = pointer.y;
            cosmicObjects.push(placing.object);
            rebuildBodies();
            effects.burst(pointer.x, pointer.y, placing.object.color, 24, 0.25);
            SoundManager.play('powerUp');
        }
        placing = null;
        canvas.style.cursor = "";
        return;
    }

    rotating = findCannonHandle(pointer.x, pointer.y);
    if (rotating) {
        rotating.rotating = true;
        canvas.setPointerCapture(e.pointerId);
        return;
    }

    dragged = findTarget(pointer.x, pointer.y);
    if (dragged) {
        dragged.dragging = true;
        dragMoved = false;
        dragStartX = pointer.x;
        dragStartY = pointer.y;
        canvas.setPointerCapture(e.pointerId);
    }
});

canvas.addEventListener("pointermove", e => {
    const dx = e.clientX - pointer.x;
    const dy = e.clientY - pointer.y;
    pointer.x = e.clientX;
    pointer.y = e.clientY;

    if (rotating) {
        rotating.aim = Math.atan2(pointer.y - rotating.y, pointer.x - rotating.x);
        return;
    }

    if (dragged) {
        if (Math.hypot(pointer.x - dragStartX, pointer.y - dragStartY) > 3) dragMoved = true;
        if (dragMoved) {
            dragged.x += dx;
            dragged.y += dy;
        }
        return;
    }

    if (placing) return;

    let hovering = false;
    for (const folder of folders) {
        folder.hovered = folder.isHovered(pointer.x, pointer.y);
        hovering = hovering || folder.hovered;
    }
    for (const obj of cosmicObjects) {
        obj.hovered = obj.isHovered(pointer.x, pointer.y);
        obj.handleHovered = obj.isHandleHovered(pointer.x, pointer.y);
        hovering = hovering || obj.hovered || obj.handleHovered;
    }
    canvas.style.cursor = hovering ? "pointer" : "";
});

function endDrag() {
    if (rotating) {
        rotating.rotating = false;
        rotating = null;
    }
    if (!dragged) return;
    dragged.dragging = false;

    if (dragged instanceof Folder && !dragMoved) {
        SoundManager.play('click');
        dragged.openFolderPopup();
    }
    dragged = null;
}

// Mouse wheel over a cannon: fine aiming
canvas.addEventListener("wheel", e => {
    for (const cannon of cannons) {
        if (cannon.isHovered(e.clientX, e.clientY) || cannon.isHandleHovered(e.clientX, e.clientY)) {
            cannon.aim += Math.sign(e.deltaY) * 0.04;
            e.preventDefault();
            return;
        }
    }
}, { passive: false });

canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

// === HUD ===
function updateHud(now) {
    const value = Math.floor(stardust);
    if (value !== shownStardust) {
        shownStardust = value;
        shopDirty = true;
        stardustValue.textContent = formatDust(value);

        // Reuse the tier styles as the collection grows
        stardustDisplay.classList.toggle('wave-tier-2', value >= 1000 && value < 100000);
        stardustDisplay.classList.toggle('wave-tier-3', value >= 100000);
    }

    if (shopDirty && shop.isOpen() && now - lastShopRefresh > 200) {
        lastShopRefresh = now;
        shopDirty = false;
        shop.refresh();
    }
}

function updateGame(now) {
    if (gamePaused) { // stop loop here if pause
        running = false;
        return;
    }
    // clamp: no huge jump after a pause or a hidden tab
    const deltaTime = Math.min(now - lastTime, 50);
    lastTime = now;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    background.update();
    background.draw();
    applyOrbiters(deltaTime);
    fireCannons(deltaTime);

    for (const obj of cosmicObjects) {
        obj.update(deltaTime);
        obj.draw(ctx);
    }
    for (const cannon of cannons) {
        if (cannon.hovered || cannon.handleHovered || cannon.dragging || cannon.rotating) {
            drawAimPreview(cannon);
        }
    }

    for (const folder of folders) {
        folder.update(deltaTime);
    }

    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        star.update(deltaTime, w, h, bouncers, deflectors, onBounce);
        if (star.dead) {
            effects.burst(star.x, star.y, star.color, 4, 0.08);
            stars[i] = stars[stars.length - 1];
            stars.pop();
        }
    }
    ShootingStar.drawAll(ctx, stars);

    for (const folder of folders) {
        folder.draw(ctx);
    }

    effects.update(deltaTime);
    effects.draw(ctx);

    if (placing) {
        placing.object.x = pointer.x;
        placing.object.y = pointer.y;
        placing.object.update(deltaTime);
        placing.object.draw(ctx, true);
        if (placing.object.kind === "cannon") drawAimPreview(placing.object);

        ctx.fillStyle = "white";
        ctx.font = "10px 'PressStart2P', monospace";
        ctx.textAlign = "center";
        ctx.fillText("Click to place - Esc to cancel", pointer.x, pointer.y - 40);
    }

    updateHud(now);

    requestAnimationFrame(updateGame);
}

// Start pop-up
const startGamePopup = document.createElement('div');
startGamePopup.classList.add('popup-start-game');

const header = document.createElement('div');
header.classList.add('popup-header');
header.innerHTML = 'Welcome to my portfolio!';

const content = document.createElement('div');
content.classList.add('popup-content');
content.innerHTML = `
  <p>Sit back and watch: nothing to lose here, the sky just gets busier.</p>

  <p>
    The <span style="color: #00ccff;"><strong>planets</strong></span> are my projects, whether
    <span style="color: #ffcc00;"><strong>School</strong></span>,
    <span style="color: #ff66cc;"><strong>Personal</strong></span>, or
    <span style="color: #66ff66;"><strong>Jam</strong></span>.<br>
    Click on a <span style="color: #00ccff;"><strong>planet</strong></span> to discover the project,
    or drag it anywhere you like!
  </p>

  <p>
    <span style="color: #ffffff;"><strong>Shooting stars</strong></span> bounce on the planets.<br>
    Every bounce earns <span style="color: #ffd75e;"><strong>stardust</strong></span>.
  </p>

  <p>
    Spend it in the <span style="color: #ff00ff;"><strong>shop</strong></span>: more stars, new kinds of stars,<br>
    <span style="color: #ffaa50;"><strong>comet cannons</strong></span> you can aim, and cosmic objects<br>
    like <span style="color: #b48cff;"><strong>black holes</strong></span> to shape their trajectories.
  </p>
`;

const closeButton = document.createElement('button');
closeButton.classList.add('popup-close-btn', 'shop-item', 'play-button');
closeButton.innerHTML = 'START';

closeButton.addEventListener('click', () => {
    startGamePopup.style.display = 'none';
    SoundManager.play('click');

    fetch("public/projects.json")
        .then(res => res.json())
        .then(data => {
            const radius = Math.max(140, Math.min(300, Math.min(canvas.width, canvas.height) / 2 - 80));
            const step = (2 * Math.PI) / data.length;
            data.forEach((proj, i) => {
                const angle = i * step;
                const x = center.x + radius * Math.cos(angle);
                const y = center.y + radius * Math.sin(angle);
                folders.push(new Folder(x, y, proj.name, proj.JsName, proj.planetStyle));
            });

            folders.push(new Folder(center.x, center.y, "CV", null, {}, {
                icon: "assets/Items/CVBuffer.png",
                popupData: {
                    title: "CV",
                    slides: [
                        { type: "image", img: "assets/Items/CVBuffer.png", desc: "<br><a href='https://emilelarguier2.wixsite.com/game-designer-portfo' target='_blank'>Portfolio</a>" }
                    ]
                }
            }));

            rebuildBodies();

            for (let i = 0; i < STAR_TYPES.classic.free; i++) addStar("classic");

            resumeGame();
        });
});

startGamePopup.appendChild(header);
startGamePopup.appendChild(content);
startGamePopup.appendChild(closeButton);

document.body.appendChild(startGamePopup);

export function resumeGame() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(updateGame);
}

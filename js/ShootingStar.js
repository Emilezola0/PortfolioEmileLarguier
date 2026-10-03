// ShootingStar.js
// Persistent shooting stars: they cross the screen, bounce on portfolio
// planets (stardust!) and get deflected by cosmic objects.

const TRAIL_POINTS = 16;      // points kept per trail
const TRAIL_INTERVAL = 22;    // ms between two trail samples
const BASE_SPEED = 0.28;      // px / ms, reference speed for deflection
const TWO_PI = Math.PI * 2;

export const STAR_TYPES = {
    classic: {
        label: "Comet",
        desc: "A classic shooting star",
        rgb: [255, 255, 255],
        speed: 0.28,
        value: 1,
        free: 5,            // owned from the start
        unlockCost: 0,
        baseCost: 8,
        growth: 1.35
    },
    swift: {
        label: "Swift",
        desc: "Twice as fast, longer trail",
        rgb: [95, 224, 255],
        speed: 0.56,
        value: 1,
        free: 0,
        unlockCost: 60,
        baseCost: 45,
        growth: 1.4
    },
    sinuous: {
        label: "Serpent",
        desc: "Snakes through space, x2 stardust",
        rgb: [255, 122, 217],
        speed: 0.26,
        value: 2,
        wobble: 0.75,       // heading amplitude (rad)
        wobbleSpeed: 0.006, // rad / ms
        free: 0,
        unlockCost: 200,
        baseCost: 120,
        growth: 1.4
    },
    warp: {
        label: "Warp",
        desc: "Teleports to another planet on bounce, x3",
        rgb: [125, 255, 154],
        speed: 0.3,
        value: 3,
        warp: true,
        free: 0,
        unlockCost: 600,
        baseCost: 320,
        growth: 1.45
    },
    prism: {
        label: "Prism",
        desc: "Changes color on every bounce, x5",
        rgb: [255, 220, 120],
        speed: 0.34,
        value: 5,
        prism: true,
        free: 0,
        unlockCost: 2000,
        baseCost: 1000,
        growth: 1.5
    }
};

// Fired by comet cannons: straight, predictable shots that leave the screen.
// Every bounce of the same comet is worth one more stardust (chain).
export const CANNON_STAR = {
    label: "Cannon comet",
    rgb: [255, 170, 80],
    speed: 0.42,
    value: 1,
    ephemeral: true,    // dies when leaving the screen
    chain: true,
    maxChain: 10,
    maxBounces: 25,
    maxAge: 20000
};

// Pre-rendered glow sprites, one per color (no shadowBlur at runtime)
const glowCache = new Map();
function getGlow(colorKey, rgb) {
    let sprite = glowCache.get(colorKey);
    if (sprite) return sprite;

    const size = 40;
    sprite = document.createElement("canvas");
    sprite.width = sprite.height = size;
    const g = sprite.getContext("2d");
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.18, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.9)`);
    grad.addColorStop(0.5, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.25)`);
    grad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);

    glowCache.set(colorKey, sprite);
    return sprite;
}

function hueToRgb(h) {
    // full saturation, light color
    const c = (n) => {
        const k = (n + h / 30) % 12;
        return Math.round(255 * (0.7 - 0.3 * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
    };
    return [c(0), c(8), c(4)];
}

export class ShootingStar {
    constructor(type, w, h) {
        this.type = type;
        this.def = STAR_TYPES[type] || CANNON_STAR;
        this.speed = this.def.ephemeral ? this.def.speed : this.def.speed * (0.9 + Math.random() * 0.2);
        this.dead = false;
        this.bounces = 0;
        this.age = 0;

        this.x = 0;
        this.y = 0;
        this.heading = 0;                       // base direction (rad)
        this.phase = Math.random() * TWO_PI;    // wobble phase (sinuous)

        this.tx = new Float32Array(TRAIL_POINTS);
        this.ty = new Float32Array(TRAIL_POINTS);
        this.tHead = 0;
        this.tCount = 0;
        this.tTimer = 0;

        this.hue = Math.floor(Math.random() * 12) * 30;
        this.setColor(this.def.prism ? hueToRgb(this.hue) : this.def.rgb,
            this.def.prism ? "h" + this.hue : type);

        this.enterFromEdge(w, h);
    }

    setColor(rgb, key) {
        this.rgb = rgb;
        this.color = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        this.colorHead = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.85)`;
        this.colorTail = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`;
        this.sprite = getGlow(key, rgb);
    }

    shiftHue() {
        this.hue = (this.hue + 30 + Math.floor(Math.random() * 4) * 30) % 360;
        this.setColor(hueToRgb(this.hue), "h" + this.hue);
    }

    resetTrail() {
        this.tCount = 0;
        this.tTimer = 0;
    }

    wobbleOffset() {
        return this.def.wobble ? Math.sin(this.phase) * this.def.wobble : 0;
    }

    // Set the real travel direction (compensates the wobble)
    setDirection(vx, vy) {
        this.heading = Math.atan2(vy, vx) - this.wobbleOffset();
    }

    enterFromEdge(w, h) {
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { this.x = Math.random() * w; this.y = 1; }
        else if (side === 1) { this.x = w - 1; this.y = Math.random() * h; }
        else if (side === 2) { this.x = Math.random() * w; this.y = h - 1; }
        else { this.x = 1; this.y = Math.random() * h; }

        // aim somewhere in the central area
        const tx = w / 2 + (Math.random() - 0.5) * w * 0.5;
        const ty = h / 2 + (Math.random() - 0.5) * h * 0.5;
        this.setDirection(tx - this.x, ty - this.y);
        this.resetTrail();
    }

    // Start from a precise point in a precise direction (cannon)
    launch(x, y, angle) {
        this.x = x;
        this.y = y;
        this.heading = angle;
        this.resetTrail();
    }

    // Jump next to a body and leave it outward (warp stars)
    warpTo(body) {
        const angle = Math.random() * TWO_PI;
        this.x = body.x + Math.cos(angle) * (body.radius + 6);
        this.y = body.y + Math.sin(angle) * (body.radius + 6);
        this.setDirection(Math.cos(angle), Math.sin(angle));
        this.resetTrail();
    }

    update(dt, w, h, bouncers, deflectors, onBounce) {
        // --- Deflection by black / white holes (direction only, never a trap) ---
        for (let i = 0; i < deflectors.length; i++) {
            const o = deflectors[i];
            const dx = o.x - this.x;
            const dy = o.y - this.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > o.range * o.range || d2 < 1) continue;

            const d = Math.sqrt(d2);
            const dirX = Math.cos(this.heading);
            const dirY = Math.sin(this.heading);
            const sin = (dirX * dy - dirY * dx) / d; // >0 : object is on the turning side
            const falloff = 1 - d / o.range;
            this.heading += o.pull * sin * falloff / (d2 + 1600) * (BASE_SPEED / this.speed) * dt;
        }

        // --- Move ---
        if (this.def.wobble) this.phase += this.def.wobbleSpeed * dt;
        const angle = this.heading + this.wobbleOffset();
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        this.x += vx * this.speed * dt;
        this.y += vy * this.speed * dt;

        if (this.def.ephemeral) {
            this.age += dt;
            if (this.x < 0 || this.x > w || this.y < 0 || this.y > h ||
                this.age > this.def.maxAge || this.bounces >= this.def.maxBounces) {
                this.dead = true;
                return;
            }
        }

        // --- Screen edges: soft bounce, no reward ---
        let reflected = false;
        if (this.x < 0 && vx < 0) { this.x = 0; vx = -vx; reflected = true; }
        else if (this.x > w && vx > 0) { this.x = w; vx = -vx; reflected = true; }
        if (this.y < 0 && vy < 0) { this.y = 0; vy = -vy; reflected = true; }
        else if (this.y > h && vy > 0) { this.y = h; vy = -vy; reflected = true; }
        if (reflected) this.setDirection(vx, vy);

        // --- Planets & bumpers ---
        for (let i = 0; i < bouncers.length; i++) {
            const b = bouncers[i];
            const dx = this.x - b.x;
            const dy = this.y - b.y;
            const r = b.radius + 3;
            const d2 = dx * dx + dy * dy;
            if (d2 >= r * r) continue;

            const d = Math.sqrt(d2) || 1;
            const nx = dx / d;
            const ny = dy / d;
            const dot = vx * nx + vy * ny;
            if (dot >= 0) continue; // already leaving

            // reflect + tiny random spin so loops never repeat forever
            // (cannon comets stay perfectly predictable)
            const jitter = this.def.ephemeral ? 0 : (Math.random() - 0.5) * 0.3;
            const rx = vx - 2 * dot * nx;
            const ry = vy - 2 * dot * ny;
            const cos = Math.cos(jitter);
            const sinJ = Math.sin(jitter);
            this.setDirection(rx * cos - ry * sinJ, rx * sinJ + ry * cos);

            this.x = b.x + nx * r;
            this.y = b.y + ny * r;

            this.bounces++;
            onBounce(this, b, this.x, this.y);
            break;
        }

        // --- Trail sampling ---
        this.tTimer += dt;
        if (this.tTimer >= TRAIL_INTERVAL) {
            this.tTimer = 0;
            this.tx[this.tHead] = this.x;
            this.ty[this.tHead] = this.y;
            this.tHead = (this.tHead + 1) % TRAIL_POINTS;
            if (this.tCount < TRAIL_POINTS) this.tCount++;
        }
    }

    draw(ctx) {
        const n = this.tCount;
        if (n > 0) {
            let idx = 0;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            for (let i = 1; i <= n; i++) {
                idx = (this.tHead - i + TRAIL_POINTS) % TRAIL_POINTS;
                ctx.lineTo(this.tx[idx], this.ty[idx]);
            }
            const grad = ctx.createLinearGradient(this.x, this.y, this.tx[idx], this.ty[idx]);
            grad.addColorStop(0, this.colorHead);
            grad.addColorStop(1, this.colorTail);
            ctx.strokeStyle = grad;
            ctx.stroke();
        }
        ctx.drawImage(this.sprite, this.x - 20, this.y - 20);
    }

    // Draw every star in one pass (shared canvas state)
    static drawAll(ctx, stars) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i = 0; i < stars.length; i++) stars[i].draw(ctx);
        ctx.restore();
    }
}

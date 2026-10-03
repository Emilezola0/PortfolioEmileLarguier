// Sun.js
// The sun burns every comet that touches it: the comet pays stardust for the
// bounces it made since its last burn, then comes back from the edge of the screen.
// Like the CV, clicking it opens a popup (link to LinkedIn).
import { openCustomPopup } from './PopupManager.js';
import { LINKS } from './links.js';

const TWO_PI = Math.PI * 2;
const GLOW_SIZE = 180;

export const SUN_MAX_BOUNCES = 15; // bounces paid per burn, at most

// Pre-rendered corona
let glowSprite = null;
function getGlow() {
    if (glowSprite) return glowSprite;
    glowSprite = document.createElement("canvas");
    glowSprite.width = glowSprite.height = GLOW_SIZE;
    const g = glowSprite.getContext("2d");
    const half = GLOW_SIZE / 2;
    const grad = g.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, "rgba(255,240,180,0.9)");
    grad.addColorStop(0.3, "rgba(255,170,60,0.45)");
    grad.addColorStop(0.6, "rgba(255,90,20,0.15)");
    grad.addColorStop(1, "rgba(255,60,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, GLOW_SIZE, GLOW_SIZE);
    return glowSprite;
}

export class Sun {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.name = "LinkedIn";
        this.radius = 26;
        this.color = "#ffb347";
        this.time = Math.random() * 1000;
        this.bump = 0; // 1 -> 0 after burning a comet

        this.hovered = false;
        this.dragging = false;
    }

    isHovered(mx, my) {
        return Math.hypot(mx - this.x, my - this.y) < this.radius + 4;
    }

    touches(star) {
        const dx = star.x - this.x;
        const dy = star.y - this.y;
        return dx * dx + dy * dy < this.radius * this.radius;
    }

    openFolderPopup() {
        openCustomPopup({
            title: "LinkedIn",
            slides: [
                { type: "text", desc: `<a href='${LINKS.linkedin}' target='_blank'>Open my LinkedIn</a>` }
            ]
        });
    }

    update(dt) {
        this.time += dt;
        if (this.bump > 0) this.bump = Math.max(0, this.bump - dt / 400);
    }

    draw(ctx) {
        const pulse = 1 + Math.sin(this.time * 0.002) * 0.05 + this.bump * 0.2;
        let scale = 1;
        if (this.dragging) scale = 1.15;
        else if (this.hovered) scale = 1.08;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);

        // corona
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const size = GLOW_SIZE * pulse;
        ctx.drawImage(getGlow(), -size / 2, -size / 2, size, size);

        // flares
        ctx.strokeStyle = "rgba(255,190,90,0.35)";
        ctx.lineWidth = 2;
        ctx.rotate(this.time * 0.0003);
        for (let i = 0; i < 8; i++) {
            const a = i * TWO_PI / 8;
            const len = this.radius * (1.45 + 0.2 * Math.sin(this.time * 0.003 + i * 1.7) + this.bump * 0.5);
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * this.radius * 1.1, Math.sin(a) * this.radius * 1.1);
            ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
            ctx.stroke();
        }
        ctx.restore();

        // body
        const body = ctx.createRadialGradient(-6, -6, 2, 0, 0, this.radius);
        body.addColorStop(0, "#fffbe0");
        body.addColorStop(0.5, "#ffd24a");
        body.addColorStop(1, "#ff8a1f");
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, TWO_PI);
        ctx.fill();

        ctx.restore();

        // Name under the sun
        ctx.fillStyle = "white";
        ctx.font = "14px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x, this.y + this.radius + 26);
    }
}

// Effects.js
// Lightweight pooled visual feedback: sparks, floating "+N" texts, warp beams.
// Everything is capped so the frame rate stays stable with many stars.

const MAX_PARTICLES = 600;
const MAX_TEXTS = 30;
const MAX_BEAMS = 20;

export class Effects {
    constructor() {
        // Particles (struct of arrays, swap-remove)
        this.count = 0;
        this.px = new Float32Array(MAX_PARTICLES);
        this.py = new Float32Array(MAX_PARTICLES);
        this.pvx = new Float32Array(MAX_PARTICLES);
        this.pvy = new Float32Array(MAX_PARTICLES);
        this.plife = new Float32Array(MAX_PARTICLES);
        this.psize = new Float32Array(MAX_PARTICLES);
        this.pcolor = new Array(MAX_PARTICLES);

        this.texts = [];
        this.beams = [];
    }

    burst(x, y, color, amount, power = 0.12) {
        for (let n = 0; n < amount && this.count < MAX_PARTICLES; n++) {
            const i = this.count++;
            const angle = Math.random() * Math.PI * 2;
            const speed = power * (0.3 + Math.random());
            this.px[i] = x;
            this.py[i] = y;
            this.pvx[i] = Math.cos(angle) * speed;
            this.pvy[i] = Math.sin(angle) * speed;
            this.plife[i] = 1;
            this.psize[i] = 2 + Math.random() * 2;
            this.pcolor[i] = color;
        }
    }

    text(x, y, label, color) {
        if (this.texts.length >= MAX_TEXTS) return;
        this.texts.push({ x, y, label, color, life: 1 });
    }

    beam(x1, y1, x2, y2, color) {
        if (this.beams.length >= MAX_BEAMS) return;
        this.beams.push({ x1, y1, x2, y2, color, life: 1 });
    }

    update(dt) {
        const decay = dt / 600; // ~0.6 s of life
        for (let i = this.count - 1; i >= 0; i--) {
            this.plife[i] -= decay;
            if (this.plife[i] <= 0) {
                const last = --this.count;
                this.px[i] = this.px[last];
                this.py[i] = this.py[last];
                this.pvx[i] = this.pvx[last];
                this.pvy[i] = this.pvy[last];
                this.plife[i] = this.plife[last];
                this.psize[i] = this.psize[last];
                this.pcolor[i] = this.pcolor[last];
                continue;
            }
            this.px[i] += this.pvx[i] * dt;
            this.py[i] += this.pvy[i] * dt;
        }

        for (let i = this.texts.length - 1; i >= 0; i--) {
            const t = this.texts[i];
            t.life -= dt / 900;
            t.y -= 0.03 * dt;
            if (t.life <= 0) this.texts.splice(i, 1);
        }

        for (let i = this.beams.length - 1; i >= 0; i--) {
            this.beams[i].life -= dt / 350;
            if (this.beams[i].life <= 0) this.beams.splice(i, 1);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        // Warp beams
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        for (const b of this.beams) {
            ctx.globalAlpha = b.life * 0.7;
            ctx.strokeStyle = b.color;
            ctx.beginPath();
            ctx.moveTo(b.x1, b.y1);
            ctx.lineTo(b.x2, b.y2);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Sparks (pixel squares, matches the retro look)
        let lastColor = null;
        for (let i = 0; i < this.count; i++) {
            if (this.pcolor[i] !== lastColor) {
                lastColor = this.pcolor[i];
                ctx.fillStyle = lastColor;
            }
            ctx.globalAlpha = this.plife[i];
            const s = this.psize[i];
            ctx.fillRect(this.px[i] - s / 2, this.py[i] - s / 2, s, s);
        }
        ctx.restore();

        // Floating rewards
        if (this.texts.length) {
            ctx.save();
            ctx.font = "10px 'PressStart2P', monospace";
            ctx.textAlign = "center";
            for (const t of this.texts) {
                ctx.globalAlpha = Math.min(1, t.life * 1.5);
                ctx.fillStyle = t.color;
                ctx.fillText(t.label, t.x, t.y);
            }
            ctx.restore();
        }
    }
}

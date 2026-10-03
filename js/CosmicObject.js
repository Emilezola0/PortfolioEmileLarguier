// CosmicObject.js
// Purchasable objects the player places on the map.
// Black / white holes bend star trajectories, pulsars are extra bumpers.

const TWO_PI = Math.PI * 2;

export const COSMIC_TYPES = {
    blackhole: {
        label: "Black Hole",
        desc: "Pulls star trajectories toward it",
        color: "#b48cff",
        radius: 16,
        pull: 22,
        range: 260,
        baseCost: 150,
        growth: 1.8,
        max: 5
    },
    whitehole: {
        label: "White Hole",
        desc: "Pushes star trajectories away",
        color: "#bff4ff",
        radius: 14,
        pull: -22,
        range: 260,
        baseCost: 150,
        growth: 1.8,
        max: 5
    },
    pulsar: {
        label: "Pulsar",
        desc: "A bumper worth double stardust",
        color: "#ffd75e",
        radius: 13,
        bouncer: true,
        valueMult: 2,
        baseCost: 250,
        growth: 1.8,
        max: 6
    }
};

export class CosmicObject {
    constructor(kind, x, y) {
        this.kind = kind;
        this.def = COSMIC_TYPES[kind];
        this.x = x;
        this.y = y;
        this.radius = this.def.radius;
        this.pull = this.def.pull || 0;
        this.range = this.def.range || 0;
        this.valueMult = this.def.valueMult || 1;
        this.color = this.def.color;

        this.angle = Math.random() * TWO_PI;
        this.bump = 0;       // bounce feedback (pulsar)
        this.hovered = false;
        this.dragging = false;
    }

    isHovered(mx, my) {
        return Math.hypot(mx - this.x, my - this.y) < this.radius + 8;
    }

    update(dt) {
        this.angle += dt * 0.0012;
        if (this.bump > 0) this.bump = Math.max(0, this.bump - dt / 350);
    }

    draw(ctx, ghost = false) {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (ghost) ctx.globalAlpha = 0.6;

        // Area of influence, only while handling the object
        if (this.range && (ghost || this.hovered || this.dragging)) {
            ctx.beginPath();
            ctx.arc(0, 0, this.range, 0, TWO_PI);
            ctx.strokeStyle = "rgba(255,255,255,0.12)";
            ctx.setLineDash([4, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (this.kind === "blackhole") this.drawBlackHole(ctx);
        else if (this.kind === "whitehole") this.drawWhiteHole(ctx);
        else this.drawPulsar(ctx);

        ctx.restore();
    }

    drawBlackHole(ctx) {
        const r = this.radius;

        const halo = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 3);
        halo.addColorStop(0, "rgba(150,100,255,0.35)");
        halo.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, r * 3, 0, TWO_PI);
        ctx.fill();

        // accretion disc
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = `rgba(200,170,255,${0.45 - i * 0.12})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, r * (1.5 + i * 0.35), r * (0.55 + i * 0.12), this.angle + i * 0.5, 0, TWO_PI);
            ctx.stroke();
        }

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TWO_PI);
        ctx.fill();
        ctx.strokeStyle = "rgba(200,170,255,0.6)";
        ctx.stroke();
    }

    drawWhiteHole(ctx) {
        const r = this.radius;
        const pulse = (this.angle * 0.8) % 1;

        const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.6);
        halo.addColorStop(0, "rgba(255,255,255,1)");
        halo.addColorStop(0.35, "rgba(180,240,255,0.55)");
        halo.addColorStop(1, "rgba(120,200,255,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, r * 2.6, 0, TWO_PI);
        ctx.fill();

        // waves flowing outward
        ctx.lineWidth = 1;
        for (let i = 0; i < 2; i++) {
            const t = (pulse + i * 0.5) % 1;
            ctx.strokeStyle = `rgba(200,245,255,${0.5 * (1 - t)})`;
            ctx.beginPath();
            ctx.arc(0, 0, r + t * r * 2.2, 0, TWO_PI);
            ctx.stroke();
        }
    }

    drawPulsar(ctx) {
        const r = this.radius * (1 + this.bump * 0.25);

        // rotating beams
        ctx.save();
        ctx.rotate(this.angle * 2);
        ctx.strokeStyle = "rgba(255,215,94,0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 2.6, 0);
        ctx.lineTo(r * 2.6, 0);
        ctx.stroke();
        ctx.restore();

        const core = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        core.addColorStop(0, "#ffffff");
        core.addColorStop(0.5, "#ffd75e");
        core.addColorStop(1, "#b36b00");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TWO_PI);
        ctx.fill();

        if (this.bump > 0) {
            ctx.strokeStyle = `rgba(255,215,94,${this.bump})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + (1 - this.bump) * 22, 0, TWO_PI);
            ctx.stroke();
        }
    }
}

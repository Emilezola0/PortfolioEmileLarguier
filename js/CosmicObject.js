// CosmicObject.js
// Purchasable objects the player places on the map:
//  - planets / pulsars : extra bumpers for the shooting stars
//  - orbiters          : make the planets inside their radius turn around them
//  - black/white holes : bend star trajectories
//  - cannons           : fire comets along an aim the player can rotate

const TWO_PI = Math.PI * 2;

export const CANNON_INTERVAL = 1400; // ms between two shots
const CANNON_BARREL = 26;
const CANNON_HANDLE = 40;            // distance of the rotation handle

const PLANET_COLORS = ["#6fa8ff", "#ff8fa3", "#8fe3a0", "#ffc46b", "#c79bff", "#6fe0d6"];

export const COSMIC_TYPES = {
    planet: {
        label: "Planet",
        desc: "A simple planet, stars bounce on it",
        color: "#6fa8ff",
        radius: 14,
        bouncer: true,
        valueMult: 1,
        baseCost: 40,
        growth: 1.5,
        max: 12
    },
    orbiter: {
        label: "Orbiter",
        desc: "Planets in its radius turn around it",
        color: "#7fffd4",
        radius: 10,
        range: 220,
        spin: 0.0003, // rad / ms at 120px
        baseCost: 120,
        growth: 1.8,
        max: 4
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
    },
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
    // listed with the shooting stars in the shop
    cannon: {
        label: "Comet Cannon",
        desc: "Fires comets where you aim it. Chained bounces pay more",
        color: "#ffaa50",
        radius: 12,
        baseCost: 80,
        growth: 1.7,
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
        this.color = kind === "planet"
            ? PLANET_COLORS[Math.floor(Math.random() * PLANET_COLORS.length)]
            : this.def.color;

        this.angle = Math.random() * TWO_PI;
        this.bump = 0;       // bounce / shot feedback
        this.hovered = false;
        this.dragging = false;

        // Cannon only
        this.aim = -Math.PI / 4;
        this.fireTimer = 0;
        this.rotating = false;
        this.handleHovered = false;
    }

    isHovered(mx, my) {
        return Math.hypot(mx - this.x, my - this.y) < this.radius + 8;
    }

    // Cannon: tip of the barrel, where comets start
    muzzle() {
        return {
            x: this.x + Math.cos(this.aim) * CANNON_BARREL,
            y: this.y + Math.sin(this.aim) * CANNON_BARREL
        };
    }

    // Cannon: small handle used to rotate it
    isHandleHovered(mx, my) {
        if (this.kind !== "cannon") return false;
        const hx = this.x + Math.cos(this.aim) * CANNON_HANDLE;
        const hy = this.y + Math.sin(this.aim) * CANNON_HANDLE;
        return Math.hypot(mx - hx, my - hy) < 10;
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
        if (this.pull && (ghost || this.hovered || this.dragging)) {
            ctx.beginPath();
            ctx.arc(0, 0, this.range, 0, TWO_PI);
            ctx.strokeStyle = "rgba(255,255,255,0.12)";
            ctx.setLineDash([4, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (this.kind === "blackhole") this.drawBlackHole(ctx);
        else if (this.kind === "whitehole") this.drawWhiteHole(ctx);
        else if (this.kind === "pulsar") this.drawPulsar(ctx);
        else if (this.kind === "planet") this.drawPlanet(ctx);
        else if (this.kind === "orbiter") this.drawOrbiter(ctx, ghost);
        else this.drawCannon(ctx);

        ctx.restore();
    }

    drawBounceRing(ctx) {
        if (this.bump <= 0) return;
        ctx.save();
        ctx.globalAlpha *= this.bump;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + (1 - this.bump) * 22, 0, TWO_PI);
        ctx.stroke();
        ctx.restore();
    }

    drawPlanet(ctx) {
        const r = this.radius * (1 + this.bump * 0.2);

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TWO_PI);
        ctx.fill();

        // shading
        const shade = ctx.createRadialGradient(-r * 0.4, -r * 0.4, r * 0.1, 0, 0, r);
        shade.addColorStop(0, "rgba(255,255,255,0.35)");
        shade.addColorStop(1, "rgba(0,0,0,0.55)");
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TWO_PI);
        ctx.fill();

        ctx.strokeStyle = "rgba(200,200,255,0.25)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.5, r * 0.5, -0.3, 0, TWO_PI);
        ctx.stroke();

        this.drawBounceRing(ctx);
    }

    drawOrbiter(ctx, ghost) {
        const r = this.radius;
        const active = ghost || this.hovered || this.dragging;

        // radius of influence, slowly turning
        ctx.save();
        ctx.strokeStyle = active ? "rgba(127,255,212,0.35)" : "rgba(127,255,212,0.12)";
        ctx.setLineDash([10, 14]);
        ctx.lineDashOffset = -this.angle * 60;
        ctx.beginPath();
        ctx.arc(0, 0, this.range, 0, TWO_PI);
        ctx.stroke();
        ctx.restore();

        const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.4);
        halo.addColorStop(0, "rgba(255,255,255,0.9)");
        halo.addColorStop(0.3, "rgba(127,255,212,0.5)");
        halo.addColorStop(1, "rgba(127,255,212,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, r * 2.4, 0, TWO_PI);
        ctx.fill();

        // spiral arms
        ctx.strokeStyle = "rgba(127,255,212,0.7)";
        ctx.lineWidth = 1.5;
        for (let arm = 0; arm < 3; arm++) {
            const start = this.angle * 2 + arm * TWO_PI / 3;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.5, start, start + 1.2);
            ctx.stroke();
        }
    }

    drawCannon(ctx) {
        const handling = this.handleHovered || this.rotating;

        ctx.save();
        ctx.rotate(this.aim);

        // rotation handle
        ctx.strokeStyle = handling ? "rgba(255,170,80,0.9)" : "rgba(255,170,80,0.35)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(CANNON_BARREL, 0);
        ctx.lineTo(CANNON_HANDLE - 5, 0);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(CANNON_HANDLE, 0, 5, 0, TWO_PI);
        if (handling) {
            ctx.fillStyle = "rgba(255,170,80,0.9)";
            ctx.fill();
        }
        ctx.stroke();

        // barrel (recoils when firing)
        const recoil = this.bump * 5;
        ctx.fillStyle = "#3a3f55";
        ctx.strokeStyle = "#ffaa50";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(-recoil, -5, CANNON_BARREL, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffaa50";
        ctx.fillRect(CANNON_BARREL - 4 - recoil, -6.5, 4, 13);
        ctx.restore();

        // base
        ctx.fillStyle = "#22263a";
        ctx.strokeStyle = "#ffaa50";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, TWO_PI);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffaa50";
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, TWO_PI);
        ctx.fill();
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

        this.drawBounceRing(ctx);
    }
}

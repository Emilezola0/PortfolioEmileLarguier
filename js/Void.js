export class Void {
    constructor(x, y) {
        this.center = { x, y };
        this.radius = 30;
        this.angle = 0;
    }

    draw(ctx) {
        const { x, y } = this.center;

        // Animation
        this.angle += 0.01;

        // 1 Rotating external halo (stylish accretion disc)
        for (let i = 0; i < 3; i++) {
            const offset = i * 10;
            const gradient = ctx.createRadialGradient(x, y, this.radius + offset, x, y, this.radius + offset + 20);
            gradient.addColorStop(0, `rgba(255,255,255,${0.02 - i * 0.005})`);
            gradient.addColorStop(1, "rgba(0,0,0,0)");

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.angle + i * 0.5);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + offset + 10, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.restore();
        }

        // 2. Intense black core
        const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
        coreGradient.addColorStop(0, "black");
        coreGradient.addColorStop(1, "rgba(0, 0, 0, 0.6)");

        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();

        // 3 Slight external corrugation
        const rippleRadius = this.radius + 30 + Math.sin(this.angle * 2) * 3;
        const rippleGradient = ctx.createRadialGradient(x, y, rippleRadius - 10, x, y, rippleRadius);
        rippleGradient.addColorStop(0, "rgba(255,255,255,0.01)");
        rippleGradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.beginPath();
        ctx.arc(x, y, rippleRadius, 0, Math.PI * 2);
        ctx.fillStyle = rippleGradient;
        ctx.fill();
    }

    absorb(mob) {
        const dx = mob.x - this.center.x;
        const dy = mob.y - this.center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.radius) {
            mob.opacity -= 0.02;
            return mob.opacity <= 0;
        }
        return false;
    }

    grow(amount) {
        this.radius += amount;
    }

    setCenter(x, y) {
        if (!this.locked) {
            this.center.x = x;
            this.center.y = y;
        }
    }
}

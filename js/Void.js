export class Void {
    constructor(x, y) {
        this.center = { x, y };
        this.radius = 30;
    }

    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
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
        this.center.x = x;
        this.center.y = y;
    }
}

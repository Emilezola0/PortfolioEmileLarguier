export class VoidParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.speed = Math.random() * 0.5 + 0.2;
    }

    update(center) {
        const dx = center.x - this.x;
        const dy = center.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class Bullet {
    constructor(x, y, dx, dy, damage = 1, pierce = 1, speed = 5, source = null) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
        this.radius = 4;
        this.source = source;

        this.damage = damage;   // damage
        this.pierce = pierce;   // pierce
        this.hitCount = 0;      // how much mob was hit
    }

    update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    isOutOfBounds(canvas) {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }

    hits(mob) {
        const dx = this.x - mob.x;
        const dy = this.y - mob.y;
        return Math.hypot(dx, dy) < this.radius + mob.radius;
    }

    registerHit() {
        this.hitCount++;
        return this.hitCount >= this.pierce;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 2 + 1; // Random laser between
        this.color = color;
        this.life = 30;  // lifetime particle
        this.vx = (Math.random() - 0.5) * 2; // Random speed on x
        this.vy = (Math.random() - 0.5) * 2; // Random speed on y
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;  // lifetime reduction
    }

    draw(ctx) {
        ctx.globalAlpha = this.life / 30;  // Transparency depending of lifetime
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;  // Restore alpha after lifetime particle
    }
}

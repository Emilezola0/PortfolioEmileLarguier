export class Particle {
    constructor(x, y, color = "orange", angle = null, orbitRadius = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = 60;
        this.size = 2 + Math.random() * 2;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;

        this.angle = angle;
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = 0.03 + Math.random() * 0.02;
    }

    update(center) {
        this.life--;
        if (this.angle != null && this.orbitRadius != null) {
            this.angle += this.orbitSpeed;
            this.orbitRadius -= 0.5;
            this.x = center.x + this.orbitRadius * Math.cos(this.angle);
            this.y = center.y + this.orbitRadius * Math.sin(this.angle);
        } else {
            this.x += this.vx;
            this.y += this.vy;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

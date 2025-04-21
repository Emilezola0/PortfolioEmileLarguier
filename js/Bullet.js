export class Bullet {
    constructor(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.speed = 5;
        this.radius = 4;
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
        return Math.hypot(dx, dy) < this.radius + mob.radius; // Optimisation avec Math.hypot
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 2 + 1; // Rayon aléatoire entre 1 et 3
        this.color = color;
        this.life = 30;  // Durée de vie de la particule
        this.vx = (Math.random() - 0.5) * 2; // Vitesse aléatoire sur x
        this.vy = (Math.random() - 0.5) * 2; // Vitesse aléatoire sur y
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;  // Réduction de la durée de vie
    }

    draw(ctx) {
        ctx.globalAlpha = this.life / 30;  // Gestion de la transparence en fonction de la durée de vie
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;  // Restaurer la valeur de alpha après le dessin de la particule
    }
}

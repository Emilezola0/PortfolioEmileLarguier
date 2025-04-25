// Background.js
export class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // Étoiles fixes
        this.stars = [];
        this.numStars = 150;

        // Étoiles filantes
        this.shootingStars = [];

        // Dust et nébuleuses
        this.cosmicDust = this.generateDust();
        this.nebulae = [
            {
                x: this.canvas.width * 0.3,
                y: this.canvas.height * 0.3,
                radius: 300,
                color: "rgba(200,200,255,0.04)"
            },
            {
                x: this.canvas.width * 0.7,
                y: this.canvas.height * 0.6,
                radius: 250,
                color: "rgba(255,200,255,0.035)"
            }
        ];

        this.initStars();
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.5 + 0.3,
                alpha: Math.random() * 0.5 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.005
            });
        }
    }

    generateDust() {
        const dust = [];
        const count = 20;

        for (let i = 0; i < count; i++) {
            dust.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 200 + 100,
                color: Math.random() < 0.5 ? "rgba(255,255,255,0.03)" : "rgba(180,180,255,0.025)"
            });
        }

        return dust;
    }

    spawnShootingStar() {
        if (Math.random() < 5) {
            const angle = Math.random() * (Math.PI / 4) + Math.PI / 8; // entre 22.5° et 67.5°
            const speed = Math.random() * 1 + 2;

            const startX = Math.random() < 0.5 ? -50 : this.canvas.width + 50;
            const startY = Math.random() * this.canvas.height * 0.3;

            const vx = Math.cos(angle) * (startX < 0 ? speed : -speed);
            const vy = Math.sin(angle) * speed;

            this.shootingStars.push({
                x: startX,
                y: startY,
                vx: -vx,
                vy: vy,
                life: 100,
                length: Math.random() * 80 + 40,
                alpha: 1
            });
        }
    }

    update() {
        // Twinkle stars
        for (const star of this.stars) {
            star.alpha += star.twinkleSpeed;
            if (star.alpha > 1 || star.alpha < 0.2) star.twinkleSpeed *= -1;
        }

        // Update shooting stars
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const s = this.shootingStars[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.5;
            s.alpha = s.life / 100; // gradually decreases  
            if (s.life <= 0) this.shootingStars.splice(i, 1);
        }

        this.spawnShootingStar();
    }

    draw() {
        const ctx = this.ctx;

        // Cosmic dust
        for (const d of this.cosmicDust) {
            const gradient = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.radius);
            gradient.addColorStop(0, d.color);
            gradient.addColorStop(1, "rgba(0,0,0,0)");

            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Nebulae
        for (const n of this.nebulae) {
            const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
            gradient.addColorStop(0, n.color);
            gradient.addColorStop(1, "rgba(0,0,0,0)");

            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Static stars
        for (const star of this.stars) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
        }

        // Shooting stars
        for (const s of this.shootingStars) {
            const endX = s.x - s.vx * s.length * 0.1;
            const endY = s.y - s.vy * s.length * 0.1;

            const gradient = ctx.createLinearGradient(s.x, s.y, endX, endY);
            gradient.addColorStop(0, `rgba(255,255,255,${s.alpha})`);
            gradient.addColorStop(1, "rgba(255,255,255,0)");

            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    onResize() {
        this.initStars();
        this.cosmicDust = this.generateDust(); // Regenerate cosmic dust
    }
}

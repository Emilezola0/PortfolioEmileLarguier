export class Scrap {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.collected = false;
        this.speed = 0.3 + Math.random() * 0.3;
        this.easeProgress = 0.02;
        this.radius = 12;
        this.alpha = 0; // apparition progressive
    }

    update(collector) {
        // Apparition progressive
        if (this.alpha < 1) {
            this.alpha += 0.05;
        }

        const dx = collector.x - this.x;
        const dy = collector.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
            this.easeProgress += 0.04;
            const ease = Math.min(1, this.easeProgress);

            this.x += dx * ease * this.speed;
            this.y += dy * ease * this.speed;

            // Seuil final pour le collecter
            if (dist < 15) {
                return "collected";
            }
        }

        return "flying";
    }

    draw(ctx, image) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.drawImage(image, this.x - this.radius / 2, this.y - this.radius / 2, this.radius, this.radius);
        ctx.restore();
    }
}

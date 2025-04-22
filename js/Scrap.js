export class Scrap {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.reached = false;

        this.scale = 0.2;
        this.maxScale = 1;
        this.spawnTimer = 20;
        this.opacity = 0;
    }

    update(collector) {
        // Apparition animée
        if (this.spawnTimer > 0) {
            this.spawnTimer--;
            this.scale += 0.05;
            this.opacity += 0.05;
            if (this.scale > this.maxScale) this.scale = this.maxScale;
            if (this.opacity > 1) this.opacity = 1;
        }

        // Calcul vers le collector
        const dx = collector.x - this.x;
        const dy = collector.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > collector.radius) return;

        // Easing vers le centre du collector
        const t = 1 - dist / collector.radius;
        const ease = t * t * t; // cubic ease-in
        this.x += dx * ease * 0.2;
        this.y += dy * ease * 0.2;

        // Collected
        if (dist < 10 && !this.reached) {
            this.reached = true;
            return "collected";
        }
    }

    draw(ctx, image) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        const size = 32 * this.scale;
        ctx.drawImage(image, this.x - size / 2, this.y - size / 2, size, size);
        ctx.restore();
    }
}

export class Scrap {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.reached = false;

        this.delay = 0;           // pour un délai si nécessaire
        this.scale = 0.2;         // commence petit, grossit
        this.maxScale = 1;
        this.spawnTimer = 20;     // durée de l'animation d'apparition

        this.opacity = 0;
    }

    update(collector) {
        if (this.delay > 0) {
            this.delay--;
            return;
        }

        // Animation d’apparition
        if (this.spawnTimer > 0) {
            this.spawnTimer--;
            this.scale += 0.05;
            this.opacity += 0.05;
            if (this.scale > this.maxScale) this.scale = this.maxScale;
            if (this.opacity > 1) this.opacity = 1;
        }

        const dx = collector.x - this.x;
        const dy = collector.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > collector.radius) return;

        // Mouvement vers le collecteur
        const speed = 0.05 * (1 - dist / collector.radius);
        this.x += dx * speed;
        this.y += dy * speed;

        // Détection de collecte
        if (dist < collector.radius && !this.reached) {
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

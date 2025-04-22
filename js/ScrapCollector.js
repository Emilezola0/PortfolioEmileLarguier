export class ScrapCollector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 100;
        this.dragging = false;

        this.img = new Image();
        this.img.src = "assets/scrap.png";
    }

    draw(ctx) {
        // 1. Effet de halo si on est en train de le drag
        if (this.dragging) {
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 40, 0, Math.PI * 2);
            ctx.fillStyle = "#ffff00";
            ctx.fill();
            ctx.restore();
        }

        // 2. Dessin de l'image du collector
        if (this.image && this.image.complete) {
            ctx.drawImage(this.image, this.x - 24, this.y - 24, 48, 48);
        } else {
            // Fallback si jamais l’image n’est pas chargée
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
            ctx.fillStyle = "yellow";
            ctx.fill();
            ctx.restore();
        }
    }

    isHovered(mx, my) {
        const dx = this.x - mx;
        const dy = this.y - my;
        return dx * dx + dy * dy < this.radius * this.radius;
    }

    update(mouseX, mouseY) {
        if (this.dragging) {
            this.x += (mouseX - this.x) * 0.2;
            this.y += (mouseY - this.y) * 0.2;
        }
    }
}

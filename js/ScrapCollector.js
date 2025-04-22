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
        ctx.save();

        if (this.dragging) {
            ctx.beginPath();
            ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
            ctx.shadowBlur = 20;
            ctx.restore();
        }

        // Si l'image est complètement chargée, on l'affiche
        if (this.folderImg.complete) {
            ctx.drawImage(this.folderImg, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        } else {
            // Si l'image n'est pas encore chargée, dessiner un rectangle temporaire
            ctx.fillStyle = "#ccc";
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }

        // Zone de détection (cercle) pour visualiser le rayon
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.detectionRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.stroke();

        ctx.restore();
    }

    isHovered(mouseX, mouseY) {
        const distX = mouseX - this.x;
        const distY = mouseY - this.y;
        return Math.sqrt(distX * distX + distY * distY) <= this.detectionRadius;
    }

    update(mouseX, mouseY) {
        if (this.dragging) {
            this.x += (mouseX - this.x) * 0.2;
            this.y += (mouseY - this.y) * 0.2;
        }
    }
}

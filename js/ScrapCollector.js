export class ScrapCollector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 100;
        this.dragging = false;

        this.img = new Image();
        this.img.src = "assets/scrap.png";
        this.scrapsImg = new Image();
        this.scrapsImg.src = "assets/scrapCollect.png";
    }

    draw(ctx, numberOfScraps) {
        ctx.save();

        if (this.dragging) {
            ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
            ctx.shadowBlur = 25;
        }

        // Draw detection circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw image of ScrapCollector
        const size = 50;
        ctx.drawImage(this.img, this.x - size / 2, this.y - size / 2, size, size);

        // Dessiner le texte sous le dossier
        ctx.fillStyle = "white";
        document.fonts.ready.then(() => {
            ctx.font = "8px 'Press Start 2P', monospace";
        });
        ctx.textAlign = "center";

        // Show number
        ctx.fillText(numberOfScraps, this.x - 6, this.y + 30);

        // When loaded draw image next to it
        if (this.scrapImg != null) {
            ctx.drawImage(scrapsImg, this.x + 4, this.y + 18, 12, 12); // x, y, width, height
        }

        ctx.restore();
    }

    isHovered(mouseX, mouseY) {
        const distX = mouseX - this.x;
        const distY = mouseY - this.y;
        return Math.sqrt(distX * distX + distY * distY) <= this.radius;
    }

    update(mouseX, mouseY) {
        if (this.dragging) {
            this.x += (mouseX - this.x) * 0.2;
            this.y += (mouseY - this.y) * 0.2;
        }
    }
}

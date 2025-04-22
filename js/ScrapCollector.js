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

        // Draw detection circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw image of ScrapCollector
        const size = 50;
        ctx.drawImage(this.img, this.x - size / 2, this.y - size / 2, size, size);

        ctx.restore();
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

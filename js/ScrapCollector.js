export class ScrapCollector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 30;
        this.dragging = false;

        this.img = new Image();
        this.img.src = "assets/scrap.png";
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.drawImage(this.img, this.x - 12, this.y - 12, 24, 24);
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

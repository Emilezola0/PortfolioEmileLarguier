export class FakeWindow {
    constructor(x, y, width = 200, height = 150, title = "Window") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.title = title;

        this.open = false;
        this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.mouseDownPos = null;
    }

    update(mouse) {
        if (this.dragging && mouse.isDown) {
            this.x = mouse.x - this.offsetX;
            this.y = mouse.y - this.offsetY;
        }
    }

    draw(ctx) {
        if (!this.open) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Background
        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, this.width, this.height);

        // Title bar
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, this.width, 30);
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Arial";
        ctx.fillText(this.title, 10, 20);

        // Close button
        ctx.fillStyle = "red";
        ctx.fillRect(this.width - 20, 5, 15, 15);
        ctx.fillStyle = "white";
        ctx.fillText("X", this.width - 17, 17);

        // Custom content
        if (this.drawContent) {
            this.drawContent(ctx);
        }

        ctx.restore();
    }

    handleMouseDown(mouse) {
        if (!this.open) return;

        const localX = mouse.x - this.x;
        const localY = mouse.y - this.y;

        if (localY <= 30 && localX <= this.width && localX >= 0) {
            this.dragging = true;
            this.offsetX = localX;
            this.offsetY = localY;
            this.mouseDownPos = { x: mouse.x, y: mouse.y };
        }
    }

    handleMouseUp(mouse) {
        if (!this.open) return;

        this.dragging = false;

        const localX = mouse.x - this.x;
        const localY = mouse.y - this.y;

        const dist = Math.hypot(mouse.x - this.mouseDownPos?.x || 0, mouse.y - this.mouseDownPos?.y || 0);
        this.mouseDownPos = null;

        // Check close button
        if (localX >= this.width - 20 && localX <= this.width - 5 && localY >= 5 && localY <= 20) {
            this.open = false;
            return;
        }

        // Delegate to subclass or specific logic
        if (dist < 5 && this.handleClickInside) {
            this.handleClickInside(localX, localY);
        }
    }

    isHovered(mx, my) {
        return this.open &&
            mx >= this.x && mx <= this.x + this.width &&
            my >= this.y && my <= this.y + this.height;
    }
}

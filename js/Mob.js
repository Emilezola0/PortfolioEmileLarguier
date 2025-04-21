const mobImg = new Image();
mobImg.src = "assets/object1.png";

export class Mob {
    constructor(canvas) {
        this.radius = 16;
        this.hp = 100;
        this.opacity = 1;

        const side = Math.floor(Math.random() * 4);
        switch (side) {
            case 0: this.x = 0; this.y = Math.random() * canvas.height; break;
            case 1: this.x = canvas.width; this.y = Math.random() * canvas.height; break;
            case 2: this.x = Math.random() * canvas.width; this.y = 0; break;
            case 3: this.x = Math.random() * canvas.width; this.y = canvas.height; break;
        }

        this.speed = 0.5;
    }

    update(center) {
        const dx = center.x - this.x;
        const dy = center.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
    }

    draw(ctx) {
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(mobImg, this.x - this.radius, this.y - this.radius, 32, 32);
        ctx.globalAlpha = 1;
    }
}

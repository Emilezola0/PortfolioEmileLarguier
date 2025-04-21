import { Bullet } from "./Bullet.js";

const folderImg = new Image();
folderImg.src = "assets/folder.png";

export class Folder {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.cooldown = 0;
    }

    draw(ctx) {
        ctx.drawImage(folderImg, this.x - 16, this.y - 16, 32, 32);
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x, this.y + 28);
    }

    update(mobs, bullets) {
        if (this.cooldown > 0) {
            this.cooldown--;
            return;
        }

        const target = mobs.find(m => m.hp > 0);
        if (!target) return;

        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 250) {
            bullets.push(new Bullet(this.x, this.y, dx / dist, dy / dist));
            this.cooldown = 50;
        }
    }

    isHovered(mx, my) {
        return mx >= this.x - 16 && mx <= this.x + 16 && my >= this.y - 16 && my <= this.y + 16;
    }
}

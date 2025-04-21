import { Bullet } from "./Bullet.js";

const folderImg = new Image();
folderImg.src = "assets/folder.png";

export class Folder {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.cooldown = 0;

        this.absorbing = false;
        this.absorbAngle = 0;
        this.opacity = 1;
        this.initialDistance = 0; // distance initiale au moment de l'absorption
    }

    update(mobs, bullets, voidCenter, voidRadius) {
        if (this.absorbing) {
            this.absorbAngle += 0.05;
            const dist = voidRadius - 10;
            this.x = voidCenter.x + dist * Math.cos(this.absorbAngle);
            this.y = voidCenter.y + dist * Math.sin(this.absorbAngle);
            this.opacity -= 0.01;
            return;
        }

        const dx = this.x - voidCenter.x;
        const dy = this.y - voidCenter.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < voidRadius + 30) {
            this.absorbing = true;
            this.absorbAngle = Math.random() * Math.PI * 2;
            return;
        }

        // Tir
        if (this.cooldown > 0) {
            this.cooldown--;
            return;
        }

        let closest = null;
        let closestDist = Infinity;

        for (const mob of mobs) {
            const dx = mob.x - this.x;
            const dy = mob.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 300 && dist < closestDist) {
                closest = mob;
                closestDist = dist;
            }
        }

        if (closest) {
            const dx = closest.x - this.x;
            const dy = closest.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            bullets.push(new Bullet(this.x, this.y, dx / dist, dy / dist));
            this.cooldown = 30;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        if (this.absorbing) {
            ctx.rotate(this.absorbAngle);
        }
        ctx.drawImage(folderImg, -16, -16, 32, 32);
        ctx.restore();

        if (!this.absorbing) {
            ctx.fillStyle = "white";
            ctx.font = "10px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.name, this.x, this.y + 28);
        }
    }



    isHovered(mx, my) {
        return mx >= this.x - 16 && mx <= this.x + 16 &&
            my >= this.y - 16 && my <= this.y + 16;
    }
}

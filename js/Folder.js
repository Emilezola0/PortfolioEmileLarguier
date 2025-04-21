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

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(folderImg, this.x - 16, this.y - 16, 32, 32);
        ctx.restore();

        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x, this.y + 28);
    }

    update(mobs, bullets, voidCenter, voidRadius) {
        if (this.absorbing) {
            this.absorbAngle += 0.05;
            this.opacity -= 0.01;
            if (this.opacity <= 0) {
                this.opacity = 0;
            }
            const orbitRadius = Math.max(10, this.initialDistance -= 1.5); // spirale vers l'intérieur
            this.x = voidCenter.x + orbitRadius * Math.cos(this.absorbAngle);
            this.y = voidCenter.y + orbitRadius * Math.sin(this.absorbAngle);
            return;
        }

        // Vérifie la distance au Void
        const dxVoid = this.x - voidCenter.x;
        const dyVoid = this.y - voidCenter.y;
        const distToVoid = Math.sqrt(dxVoid * dxVoid + dyVoid * dyVoid);
        if (distToVoid < voidRadius + 30) {
            this.absorbing = true;
            this.initialDistance = distToVoid;
            this.absorbAngle = Math.atan2(dyVoid, dxVoid);
            return;
        }

        if (this.cooldown > 0) {
            this.cooldown--;
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

        if (closest && this.cooldown <= 0) {
            const dx = closest.x - this.x;
            const dy = closest.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            bullets.push(new Bullet(this.x, this.y, dx / dist, dy / dist));
            this.cooldown = 30;
        }
    }

    isHovered(mx, my) {
        return mx >= this.x - 16 && mx <= this.x + 16 &&
            my >= this.y - 16 && my <= this.y + 16;
    }
}

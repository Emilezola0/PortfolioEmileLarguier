import { Bullet } from "./Bullet.js";
import { SoundManager } from './SoundManager.js';

export class Folder {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.cooldown = 0;
        this.absorbing = false;
        this.absorbAngle = 0;
        this.opacity = 1;
        this.initialDistance = 0;

        // Apparence & interaction
        this.dragging = false;
        this.width = 32;
        this.height = 32;

        // === STATS personnalisables ===
        this.stats = {
            atkSpeed: 30,        // Moins = plus rapide
            atkDamage: 1,
            range: 100,
            bulletSpeed: 4,
            pierce: 1
        };

        // Image
        this.folderImg = new Image();
        this.folderImg.src = "assets/folder.png";

        // Sound
        this.projectileAudio = new Audio("assets/projectileSoundEffect.mp3");
        this.volume = 0.6;
    }

    update(mobs, bullets, voidCenter, voidRadius, soundEnabled) {
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
        const d = Math.hypot(dx, dy);
        if (d < voidRadius + 30) {
            this.absorbing = true;
            this.absorbAngle = Math.random() * Math.PI * 2;
            return;
        }

        if (this.cooldown > 0) {
            this.cooldown--;
            return;
        }

        let closest = null;
        let closestDist = Infinity;

        for (const mob of mobs) {
            const dx = mob.x - this.x;
            const dy = mob.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < this.stats.range && dist < closestDist) {
                closest = mob;
                closestDist = dist;
            }
        }

        if (closest) {
            const dx = closest.x - this.x;
            const dy = closest.y - this.y;
            const dist = Math.hypot(dx, dy);

            const vx = (dx / dist) * this.stats.bulletSpeed;
            const vy = (dy / dist) * this.stats.bulletSpeed;

            bullets.push(new Bullet(this.x, this.y, vx, vy, this.stats.atkDamage, this.stats.pierce));
            SoundManager.play(this.projectileAudio, this.volume);
            this.cooldown = this.stats.atkSpeed;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);

        if (this.absorbing) ctx.rotate(this.absorbAngle);

        const scale = this.dragging ? 1.2 : 1.0;
        ctx.scale(scale, scale);

        if (this.dragging) {
            ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
            ctx.shadowBlur = 20;
        }

        if (this.folderImg.complete) {
            ctx.drawImage(this.folderImg, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = "#ccc";
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        ctx.restore();

        if (!this.absorbing) {
            ctx.fillStyle = "white";
            ctx.font = "10px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.name, this.x, this.y + 28);
        }

        // Débogage : rayon de détection
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.stats.range, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.stroke();
    }

    isHovered(mx, my) {
        return mx >= this.x - this.width / 2 && mx <= this.x + this.width / 2 &&
            my >= this.y - this.height / 2 && my <= this.y + this.height / 2;
    }
}

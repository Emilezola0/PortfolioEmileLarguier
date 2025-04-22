import { debrisTypes } from "./debrisTypes.js";
import { MobDeathParticle } from "./MobDeathParticle.js";

export class Mob {
    constructor(canvas, wave = 1, forcedType = null) {
        const validTypes = forcedType
            ? [forcedType]
            : debrisTypes.filter(type => {
                const min = type.waveMin || 1;
                const max = type.waveMax === undefined ? -1 : type.waveMax;
                return wave >= min && (max === -1 || wave <= max);
            });

        const type = validTypes[Math.floor(Math.random() * validTypes.length)];
        this.type = type;

        this.hp = type.hp;
        this.maxHp = type.hp;
        this.nutrition = type.nutrition || 1;
        this.scrapNumber = type.scrapNumber || 1;
        this.scale = type.scale || 1;

        this.image = new Image();
        this.image.src = `assets/${type.image}`;

        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() * 0.005 + 0.0025) * (Math.random() < 0.5 ? 1 : -1);
        this.radius = 16 * this.scale;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.opacity = 1;

        const side = Math.floor(Math.random() * 4);
        switch (side) {
            case 0: this.x = 0; this.y = Math.random() * canvas.height; break;
            case 1: this.x = canvas.width; this.y = Math.random() * canvas.height; break;
            case 2: this.x = Math.random() * canvas.width; this.y = 0; break;
            case 3: this.x = Math.random() * canvas.width; this.y = canvas.height; break;
        }

        const baseSpeed = type.speed || 0.5;
        this.speed = baseSpeed * (0.9 + Math.random() * 0.2);

        this.dead = false;
        this.deathParticles = [];
    }

    update(center) {
        if (!this.dead) {
            const dx = center.x - this.x;
            const dy = center.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
            this.rotation += this.rotationSpeed;
        }

        this.deathParticles.forEach(p => p.update());
        this.deathParticles = this.deathParticles.filter(p => !p.isDead());
    }

    draw(ctx) {
        if (!this.dead) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            ctx.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
            ctx.restore();
            ctx.globalAlpha = 1;

            ctx.fillStyle = "red";
            const barWidth = 40 * this.scale;
            ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 10, barWidth * (this.hp / this.maxHp), 4);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(this.x - barWidth / 2, this.y - this.radius - 10, barWidth, 4);
        }

        this.deathParticles.forEach(p => p.draw(ctx));
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0 && !this.dead) {
            this.hp = 0;
            this.die();
        }
    }

    die() {
        this.dead = true;
        for (let i = 0; i < 10; i++) {
            this.deathParticles.push(new MobDeathParticle(this.x, this.y));
        }
    }

    isReadyToRemove() {
        return this.dead && this.deathParticles.length === 0;
    }

    isInVoid(voidZone) {
        const dx = this.x - voidZone.center.x;
        const dy = this.y - voidZone.center.y;
        return Math.sqrt(dx * dx + dy * dy) < voidZone.radius;
    }
}

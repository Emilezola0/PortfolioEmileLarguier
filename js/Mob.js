import { debrisTypes } from "./debrisTypes.js";
import { MobDeathParticle } from "./MobDeathParticle.js";

export class Mob {
    constructor(mobData, x, y, wave = 1) {
        const type = mobData || debrisTypes[0]; // fallback

        this.type = type;

        // --- SCALING exponentiel toutes les 5 vagues ---
        const scalingHp = 1.15 ** Math.floor(wave / 5);
        const scalingSpeed = 1.10 ** Math.floor(wave / 5);

        this.hp = type.hp * scalingHp;
        this.maxHp = this.hp;
        this.nutrition = type.nutrition || 1;
        this.scrapNumber = type.scrapNumber || 1;
        this.scale = type.scale || 1;

        this.image = new Image();
        this.image.src = `assets/mobs/${type.image}`;
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.image.onerror = () => {
            console.error(`Failed to load image: ${this.image.src}`);
        };

        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() * 0.005 + 0.0025) * (Math.random() < 0.5 ? 1 : -1);
        this.radius = 16 * this.scale;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.opacity = 1;

        this.x = x;
        this.y = y;

        const baseSpeed = type.speed || 0.5;
        this.speed = baseSpeed * scalingSpeed * (0.9 + Math.random() * 0.2);

        this.dead = false;
        this.deathParticles = [];

        // Aura/effets visuels par type
        this.portalType = type.portalType || "basic"; // utile pour auraColor()

        if (wave >= 20) {
            this.anomalyClass = "heavyAnomaly";
        } else if (wave >= 10) {
            this.anomalyClass = "lightAnomaly";
        } else {
            this.anomalyClass = null;
        }
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

            if (this.imageLoaded) {
                ctx.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
            }

            ctx.restore();
            ctx.globalAlpha = 1;

            // Barre de vie
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

    getAuraColor() {
        switch (this.portalType) {
            case 'basic': return 'rgba(255, 255, 255, 0.5)';
            case 'fast': return 'rgba(0, 255, 255, 0.5)';
            case 'tank': return 'rgba(0, 255, 0, 0.5)';
            default: return 'rgba(255, 255, 255, 0.5)';
        }
    }
}

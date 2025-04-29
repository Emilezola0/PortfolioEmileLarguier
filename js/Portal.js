import { mobTypes } from './mobTypes.js';
import { Mob } from './Mob.js';

export class Portal {
    constructor(x, y, type, wave) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.wave = wave;

        this.radius = 30 + Math.random() * 20;
        this.opacity = 1;
        this.dead = false;
        this.disappearing = false;
        this.respawnable = true;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.001;

        this.floatAngle = Math.random() * Math.PI * 2;
    }

    update(mobs, deltaTime) {
        if (this.dead) return;

        this.rotation += this.rotationSpeed * deltaTime;
        this.floatAngle += 0.001 * deltaTime;
        this.x += Math.cos(this.floatAngle) * 0.05 * deltaTime;
        this.y += Math.sin(this.floatAngle) * 0.05 * deltaTime;

        if (this.disappearing) {
            this.opacity -= 0.0015 * deltaTime;
            if (this.opacity <= 0) {
                this.dead = true;
            }
        }
    }

    /**
     * Lance la disparition du portail. Si `isFinal` est vrai, il ne sera pas respawné.
     */
    startDisappearing(isFinal = false) {
        if (this.disappearing) return; // eviter double appel
        this.disappearing = true;
        this.respawnable = !isFinal;
    }

    spawnMob(mobs) {
        const typeList = mobTypes[this.type];
        if (!typeList) return;

        const mobData = typeList[Math.floor(Math.random() * typeList.length)];
        const mob = new Mob(mobData, this.x, this.y, this.wave);
        mobs.push(mob);
    }

    draw(ctx) {
        if (this.dead) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        if (this.type === 'basic') {
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
            gradient.addColorStop(1, "rgba(0, 255, 255, 0.2)");
        } else if (this.type === 'fast') {
            gradient.addColorStop(0, "rgba(255, 0, 255, 0.8)");
            gradient.addColorStop(1, "rgba(0, 0, 255, 0.2)");
        } else if (this.type === 'tank') {
            gradient.addColorStop(0, "rgba(0, 255, 0, 0.8)");
            gradient.addColorStop(1, "rgba(0, 100, 0, 0.2)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const angle = i * Math.PI / 5;
            const r = this.radius * (i / 10);
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.stroke();

        ctx.restore();
    }
}

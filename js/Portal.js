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

        // Spawn parameters
        this.spawnInterval = 500; // 0.5 sec
        this.spawnTimer = 0;
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

        // Handle mob spawning
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnMob(mobs);
        }
    }

    startDisappearing(isFinal = false) {
        if (this.disappearing) return;
        this.disappearing = true;
        this.respawnable = !isFinal;
    }

    spawnMob(mobs) {
        const typeList = mobTypes[this.type];
        debug.log("spawnMob type list : " + typeList);
        if (!typeList) return;

        const baseMobData = typeList[Math.floor(Math.random() * typeList.length)];
        debug.log("spawnMob mob data : " + baseMobData);
        const mobData = this.scaleMobData(baseMobData, this.wave);

        const mob = new Mob(mobData, this.x, this.y, this.wave);
        mobs.push(mob);
    }

    scaleMobData(data, wave) {
        const scaled = structuredClone(data); // deep copy

        const growth = data.growth || {};
        const w = wave - 1; // vague 1 = base

        // HP
        if (data.hp?.base) {
            const base = data.hp.base;
            const flat = growth.hp?.flat ?? 0;
            const percent = growth.hp?.percent ?? 0;
            scaled.hp = base + (flat * w) + base * (percent / 100) * w;
        }

        // Scrap
        if (data.scrap?.base !== undefined) {
            const base = data.scrap.base;
            const flat = growth.scrap?.flat ?? 0;
            const percent = growth.scrap?.percent ?? 0;
            scaled.scrap = base + (flat * w) + base * (percent / 100) * w;
        }

        // Speed
        if (data.speed?.base !== undefined) {
            const base = data.speed.base;
            const flat = growth.speed?.flat ?? 0;
            const percent = growth.speed?.percent ?? 0;
            let value = base + (flat * w) + base * (percent / 100) * w;
            if (data.speed.max !== undefined) {
                value = Math.min(value, data.speed.max);
            }
            scaled.speed = value;
        }

        return scaled;
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

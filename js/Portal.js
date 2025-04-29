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
        this.spawnInterval = Math.max(1000, 3000 - (wave - 1) * 200); // scale selon la vague
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
        if (!typeList) return;

        const baseMobData = typeList[Math.floor(Math.random() * typeList.length)];
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

        // Centre pulsant
        const pulse = 0.8 + 0.2 * Math.sin(Date.now() / 200);
        const innerRadius = this.radius * 0.4 * pulse;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);

        if (this.type === 'basic') {
            gradient.addColorStop(0, "rgba(0, 255, 255, 0.9)");
            gradient.addColorStop(0.3, "rgba(0, 200, 255, 0.4)");
            gradient.addColorStop(1, "rgba(0, 100, 255, 0.1)");
        } else if (this.type === 'fast') {
            gradient.addColorStop(0, "rgba(255, 0, 255, 0.9)");
            gradient.addColorStop(0.3, "rgba(200, 0, 200, 0.4)");
            gradient.addColorStop(1, "rgba(100, 0, 150, 0.1)");
        } else if (this.type === 'tank') {
            gradient.addColorStop(0, "rgba(0, 255, 100, 0.9)");
            gradient.addColorStop(0.3, "rgba(0, 180, 80, 0.4)");
            gradient.addColorStop(1, "rgba(0, 100, 60, 0.1)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Centre lumineux
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.arc(this.x, this.y, innerRadius, 0, Math.PI * 2);
        ctx.fill();

        // Anneaux rotatifs
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (4 - i)})`;
            ctx.lineWidth = 1;
            ctx.arc(0, 0, this.radius * (i / 3), 0, Math.PI * 2);
            ctx.stroke();
        }

        // Sparks effet rétro
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI / 4) + this.rotation * 2;
            const r = this.radius * 0.95;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;

            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`;
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

}

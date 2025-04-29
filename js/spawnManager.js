// spawnManager.js
import { Portal } from './Portal.js';
import { Mob } from './Mob.js';

export const spawnManager = {
    timer: 0,
    interval: 1 * 1000,
    wave: 1,
    pause: true,
    pauseDuration: 10 * 1000,
    pauseTimer: 0,

    mobsToSpawn: 10,
    mobsSpawned: 0,

    portalCount: 6,
    portals: [],
    respawningPortals: [],
    portalsDisappearing: false,

    update(mobs, voidRadius, canvas, deltaTime) {
        if (this.pause) {
            this.pauseTimer += deltaTime;
            this.updateSlider();

            if (this.pauseTimer >= this.pauseDuration) {
                this.pause = false;
                this.pauseTimer = 0;
                this.wave++;
                this.mobsToSpawn = 5 + Math.floor(this.wave * 1.5);
                this.mobsSpawned = 0;
                this.portalsDisappearing = false;

                const container = document.getElementById('waveSliderContainer');
                if (container) container.classList.add('hidden');

                this.spawnPortals(canvas);
                this.waveChangeEvent();
            }
            return;
        }

        this.timer += deltaTime;

        // Update portals
        for (let portal of this.portals) {
            portal.update(mobs, deltaTime);
        }

        // Remove dead portals and track respawns
        this.portals = this.portals.filter(portal => {
            if (portal.dead && !this.pause) {
                this.schedulePortalRespawn(canvas);
                return false;
            }
            return true;
        });

        // Respawn logic
        for (let i = this.respawningPortals.length - 1; i >= 0; i--) {
            const p = this.respawningPortals[i];
            p.timer -= deltaTime;
            if (p.timer <= 0) {
                this.createSinglePortal(canvas);
                this.respawningPortals.splice(i, 1);
            }
        }
        // Mob spawn
        if (this.timer >= this.interval && this.mobsSpawned < this.mobsToSpawn && this.portals.length > 0) {
            this.timer = 0;
            const spawnChance = Math.min(1, voidRadius / 300);
            if (Math.random() < spawnChance) {
                const portal = this.portals[Math.floor(Math.random() * this.portals.length)];
                portal.spawnMob(mobs);
                this.mobsSpawned++;
            }
        }

        // End of wave logic
        if (this.mobsSpawned >= this.mobsToSpawn && !this.portalsDisappearing) {
            this.startPortalsDisappearing();
        }

        // Check if all portals gone, start pause
        if (this.portalsDisappearing && this.portals.length === 0) {
            this.pause = true;
        }
    },

    startPortalsDisappearing() {
        this.portalsDisappearing = true;
        for (let portal of this.portals) {
            portal.startDisappearing();
        }
    },

    schedulePortalRespawn(canvas) {
        if (this.pause) return;
        this.respawningPortals.push({
            timer: 2000 + Math.random() * 3000, // 2–5 sec avant re-spawn
            canvas: canvas
        });
    },

    spawnPortals(canvas) {
        this.portals = [];
        this.respawningPortals = [];
        const types = ['basic', 'fast', 'tank'];

        for (let i = 0; i < this.portalCount; i++) {
            this.createSinglePortal(canvas, types);
        }
    },

    createSinglePortal(canvas, types = ['basic', 'fast', 'tank']) {
        const type = types[Math.floor(Math.random() * types.length)];
        const side = Math.floor(Math.random() * 4);
        let x, y;
        switch (side) {
            case 0: x = Math.random() * canvas.width; y = Math.random() * 100; break;
            case 1: x = Math.random() * canvas.width; y = canvas.height - Math.random() * 100; break;
            case 2: x = Math.random() * 100; y = Math.random() * canvas.height; break;
            case 3: x = canvas.width - Math.random() * 100; y = Math.random() * canvas.height; break;
        }
        this.portals.push(new Portal(x, y, type, this.wave));
    },

    draw(ctx) {
        for (let portal of this.portals) {
            portal.draw(ctx);
        }
    },

    isPaused() {
        return this.pause;
    },

    getPauseProgress() {
        return this.pauseTimer / this.pauseDuration;
    },

    getWave() {
        return this.wave;
    },

    waveChangeEvent() {
        const event = new CustomEvent("waveChange", { detail: { wave: this.wave } });
        window.dispatchEvent(event);
    },

    updateSlider() {
        const slider = document.getElementById('waveSlider');
        const container = document.getElementById('waveSliderContainer');
        if (slider && container) {
            container.classList.remove('hidden');
            slider.max = this.pauseDuration;
            slider.value = this.pauseTimer;
            const percentage = (this.pauseTimer / this.pauseDuration) * 100;
            slider.style.background = `linear-gradient(to right, #00ffcc ${percentage}%, #222 ${percentage}%)`;
        }
    }
};

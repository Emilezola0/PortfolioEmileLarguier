import { Portal } from './Portal.js';

export const spawnManager = {
    timer: 0,
    wave: 1,
    pause: true,
    pauseDuration: 10 * 1000,
    pauseTimer: 0,

    portalCount: 6,
    portals: [],
    respawningPortals: [],
    portalsDisappearing: false,

    update(mobs, deltaTime) {
        if (this.pause) {
            this.pauseTimer += deltaTime;
            this.updateSlider();

            if (this.pauseTimer >= this.pauseDuration) {
                this.pause = false;
                this.pauseTimer = 0;
                this.wave++;
                this.portalsDisappearing = false;

                const container = document.getElementById('waveSliderContainer');
                if (container) container.classList.add('hidden');

                this.spawnPortals();
                this.waveChangeEvent();
            }
            return;
        }

        // Update portals
        for (let portal of this.portals) {
            portal.update(mobs, deltaTime);
        }

        // Remove dead portals and track respawns
        this.portals = this.portals.filter(portal => {
            if (portal.dead && !this.pause && portal.respawnable) {
                this.schedulePortalRespawn();
                return false;
            }
            return true;
        });

        // Handle portal respawn
        for (let i = this.respawningPortals.length - 1; i >= 0; i--) {
            const p = this.respawningPortals[i];
            p.timer -= deltaTime;
            if (p.timer <= 0) {
                this.createSinglePortal();
                this.respawningPortals.splice(i, 1);
            }
        }

        // Check if all portals gone, start pause
        if (this.portalsDisappearing && this.portals.length === 0) {
            this.pause = true;
        }
    },

    startPortalsDisappearing() {
        this.portalsDisappearing = true;
        for (let portal of this.portals) {
            portal.startDisappearing(true);
        }
    },

    schedulePortalRespawn() {
        this.respawningPortals.push({
            timer: 2000 + Math.random() * 3000
        });
    },

    spawnPortals() {
        this.portals = [];
        this.respawningPortals = [];
        const types = ['basic', 'fast', 'tank'];
        for (let i = 0; i < this.portalCount; i++) {
            this.createSinglePortal(types);
        }
    },

    createSinglePortal(types = ['basic', 'fast', 'tank']) {
        const type = types[Math.floor(Math.random() * types.length)];
        const side = Math.floor(Math.random() * 4);
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        let x, y;

        switch (side) {
            case 0: x = Math.random() * screenWidth; y = Math.random() * 100; break;
            case 1: x = Math.random() * screenWidth; y = screenHeight - Math.random() * 100; break;
            case 2: x = Math.random() * 100; y = Math.random() * screenHeight; break;
            case 3: x = screenWidth - Math.random() * 100; y = Math.random() * screenHeight; break;
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

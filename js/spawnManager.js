// spawnManager.js
import { Portal } from './Portal.js';
import { Mob } from './Mob.js';

export const spawnManager = {
    timer: 0,
    interval: 1 * 1000,
    wave: 1,
    pause: false,
    pauseDuration: 10 * 1000,
    pauseTimer: 0,

    mobsToSpawn: 10,
    mobsSpawned: 0,

    portals: [],
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

                const container = document.getElementById('waveSliderContainer');
                if (container) {
                    container.classList.add('hidden');
                }

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

        // Supprimer les portails morts
        this.portals = this.portals.filter(portal => !portal.dead);

        if (this.timer >= this.interval && this.mobsSpawned < this.mobsToSpawn) {
            this.timer = 0;
            const spawnChance = Math.min(1, voidRadius / 300);
            if (Math.random() < spawnChance && this.portals.length > 0) {
                // On choisit un portail au hasard pour faire spawn un mob
                const portal = this.portals[Math.floor(Math.random() * this.portals.length)];
                portal.spawnMob(mobs);
                this.mobsSpawned++;
            }
        }

        // Fin de vague : tous les mobs spawnés
        if (this.mobsSpawned >= this.mobsToSpawn && !this.portalsDisappearing) {
            this.startPortalsDisappearing(); // on lance la disparition
        }
    },

    startPortalsDisappearing() {
        this.portalsDisappearing = true;
        for (let portal of this.portals) {
            portal.startDisappearing();
        }
    },

    spawnPortals(canvas) {
        this.portals = [];
        this.portalsDisappearing = false;

        const types = ['basic', 'fast', 'tank'];
        const numberOfPortals = 2 + Math.floor(this.wave / 5);

        for (let i = 0; i < numberOfPortals; i++) {
            const type = types[Math.floor(Math.random() * types.length)];

            // Generer proche bordures
            const side = Math.floor(Math.random() * 4); // haut, bas, gauche, droite
            let x, y;
            switch (side) {
                case 0:
                    x = Math.random() * canvas.width;
                    y = Math.random() * 100;
                    break;
                case 1:
                    x = Math.random() * canvas.width;
                    y = canvas.height - Math.random() * 100;
                    break;
                case 2:
                    x = Math.random() * 100;
                    y = Math.random() * canvas.height;
                    break;
                case 3:
                    x = canvas.width - Math.random() * 100;
                    y = Math.random() * canvas.height;
                    break;
            }

            this.portals.push(new Portal(x, y, type, this.wave));
        }
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
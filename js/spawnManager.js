import { Mob } from "./Mob.js";
import { debrisTypes } from "./debrisTypes.js";

export const spawnManager = {
    timer: 0,
    interval: 10 * 1000, // seconds * millisecondes
    wave: 1,
    pause: false,
    pauseDuration: 10 * 1000, // seconds * millisecondes
    pauseTimer: 0,

    mobsToSpawn: 10, // nombre de mobs par vague
    mobsSpawned: 0,

    update(mobs, voidRadius, canvas, deltaTime) {
        if (this.pause) {
            this.pauseTimer += deltaTime;

            this.updateSlider();

            if (this.pauseTimer >= this.pauseDuration) {
                this.pause = false;
                this.pauseTimer = 0;
                this.wave++;

                const container = document.getElementById('waveSliderContainer');
                if (container) {
                    container.classList.add('hidden');
                }

                this.mobsToSpawn = 5 + Math.floor(this.wave * 1.5);
                this.mobsSpawned = 0;

                this.waveChangeEvent();
            }
            return;
        }

        this.timer += deltaTime;
        if (this.timer >= this.interval && this.mobsSpawned < this.mobsToSpawn) {
            this.timer = 0;

            const spawnChance = Math.min(1, voidRadius / 300);
            if (Math.random() < spawnChance) {
                mobs.push(new Mob(canvas, this.wave));
                this.mobsSpawned++;
            }
        }

        if (this.mobsSpawned >= this.mobsToSpawn) {
            this.pause = true;
            this.pauseTimer = 0;
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
            container.classList.remove('hidden'); // Montre le slider pendant la pause

            slider.max = this.pauseDuration;
            slider.value = this.pauseTimer;

            const percentage = (this.pauseTimer / this.pauseDuration) * 100;
            slider.style.background = `linear-gradient(to right, #00ffcc ${percentage}%, #222 ${percentage}%)`;
        }
    }
};

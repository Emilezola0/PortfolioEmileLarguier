import { Mob } from "./Mob.js";
import { debrisTypes } from "./debrisTypes.js";

export const spawnManager = {
    timer: 0,
    interval: 60, // 1 mob/seconde
    wave: 1,
    pause: false,
    pauseDuration: 10 * 60, // 10s à 60fps
    pauseTimer: 0,

    mobsToSpawn: 10, // nombre de mobs par vague
    mobsSpawned: 0,

    update(mobs, voidRadius, canvas) {
        if (this.pause) {
            this.pauseTimer++;

            if (this.pauseTimer >= this.pauseDuration) {
                this.pause = false;
                this.pauseTimer = 0;
                this.wave++;

                // Nouvelle vague
                this.mobsToSpawn = 5 + Math.floor(this.wave * 1.5); // scalabilité
                this.mobsSpawned = 0;
            }
            return;
        }

        this.timer++;
        if (this.timer >= this.interval && this.mobsSpawned < this.mobsToSpawn) {
            this.timer = 0;

            const spawnChance = Math.min(1, voidRadius / 300);
            if (Math.random() < spawnChance) {
                mobs.push(new Mob(canvas, this.wave));
                this.mobsSpawned++;
            }
        }

        // Fin de la vague
        if (this.mobsSpawned >= this.mobsToSpawn) {
            this.pause = true;
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
    }
};

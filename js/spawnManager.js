import { Mob } from "./Mob.js";
import { debrisTypes } from "./debrisTypes.js";

export const spawnManager = {
    timer: 0,
    interval: 120,
    wave: 1,
    waveDuration: 1000, // frames
    frameCount: 0,
    mobsPerWave: 5,
    spawnedThisWave: 0,

    update(mobs, voidRadius, canvas) {
        this.timer++;
        this.frameCount++;

        // Nouvelle vague
        if (this.frameCount >= this.waveDuration) {
            this.wave++;
            this.frameCount = 0;
            this.spawnedThisWave = 0;
            this.interval = Math.max(30, this.interval - 5); // On accélère légèrement les spawns
            this.mobsPerWave += 2; // Plus de mobs par vague
            console.log(`Nouvelle vague ${this.wave} commence !`);
        }

        // Spawn selon intervalle
        if (this.timer >= this.interval && this.spawnedThisWave < this.mobsPerWave) {
            this.timer = 0;

            const validTypes = debrisTypes.filter(type => {
                const min = type.waveMin ?? 1;
                const max = type.waveMax ?? -1;
                return this.wave >= min && (max === -1 || this.wave <= max);
            });

            if (validTypes.length > 0) {
                const type = validTypes[Math.floor(Math.random() * validTypes.length)];
                mobs.push(new Mob(canvas, type));
                this.spawnedThisWave++;
            }
        }
    }
};

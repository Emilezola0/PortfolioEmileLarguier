import { Mob } from "./Mob.js";

export const spawnManager = {
    timer: 0,
    interval: 120,

    update(mobs, voidRadius, canvas) {
        this.timer++;
        if (this.timer >= this.interval) {
            this.timer = 0;
            const spawnChance = Math.min(1, voidRadius / 300);
            if (Math.random() < spawnChance) {
                mobs.push(new Mob(canvas));
            }
        }
    }
};

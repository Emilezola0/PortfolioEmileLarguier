import { FakeWindow } from "./FakeWindow.js";
import { upgradeFolder } from "./upgrades.js";

export class ShopWindow extends FakeWindow {
    constructor(x, y) {
        super(x, y, 200, 190, "Upgrade Shop");
        this.buttons = [
            { name: "ATK Speed", y: 40, key: "attackSpeed", cost: 10 },
            { name: "Damage", y: 70, key: "attackDamage", cost: 15 },
            { name: "Range", y: 100, key: "range", cost: 20 },
            { name: "Bullet Speed", y: 130, key: "bulletSpeed", cost: 12 },
            { name: "Pierce", y: 160, key: "pierce", cost: 25 }
        ];
        this.playerStats = null;
        this.folders = null;
    }

    setContext(playerStats, folders) {
        this.playerStats = playerStats;
        this.folders = folders;
    }

    drawContent(ctx) {
        ctx.font = "12px Arial";
        for (const btn of this.buttons) {
            ctx.fillStyle = "#555";
            ctx.fillRect(10, btn.y - 10, 180, 25);
            ctx.fillStyle = "white";
            ctx.fillText(`Upgrade ${btn.name} (${btn.cost})`, 20, btn.y + 7);
        }
    }

    handleClickInside(localX, localY) {
        for (const btn of this.buttons) {
            if (localX >= 10 && localX <= 190 && localY >= btn.y - 10 && localY <= btn.y + 15) {
                const target = this.getClosestFolder(this.folders);
                if (target && this.playerStats.scrap >= btn.cost) {
                    this.playerStats.scrap -= btn.cost;
                    upgradeFolder(target, btn.key);
                }
            }
        }
    }

    getClosestFolder(folders) {
        let closest = null;
        let minDist = Infinity;
        for (const folder of folders) {
            const dx = this.x - folder.x;
            const dy = this.y - folder.y;
            const dist = Math.hypot(dx, dy);
            if (dist < minDist) {
                closest = folder;
                minDist = dist;
            }
        }
        return closest;
    }
}

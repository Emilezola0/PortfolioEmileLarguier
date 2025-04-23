import { FakeWindow } from "./FakeWindow.js";
import { upgradeFolder } from "./upgrades.js";

const scrapIcon = new Image();
scrapIcon.src = "assets/scrapCollect.png";

export class ShopWindow extends FakeWindow {
    constructor(x, y) {
        super(x, y, 220, 220, "Upgrade Shop");

        this.buttons = [
            { name: "ATK Speed", y: 40, key: "attackSpeed", cost: 10 },
            { name: "Damage", y: 80, key: "attackDamage", cost: 15 },
            { name: "Range", y: 120, key: "range", cost: 20 },
            { name: "Bullet Speed", y: 160, key: "bulletSpeed", cost: 12 },
            { name: "Pierce", y: 200, key: "pierce", cost: 25 }
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
            // BG bouton
            ctx.fillStyle = "#444";
            ctx.fillRect(10, btn.y - 20, 200, 30);

            // Texte à gauche
            ctx.fillStyle = "white";
            ctx.fillText(btn.name, 20, btn.y);

            // Prix à droite avec icône
            ctx.fillStyle = "white";
            ctx.fillText(`${btn.cost}`, 160, btn.y);

            if (scrapIcon.complete) {
                ctx.drawImage(scrapIcon, 180, btn.y - 12, 16, 16);
            }
        }
    }

    handleClickInside(localX, localY) {
        for (const btn of this.buttons) {
            if (localX >= 10 && localX <= 210 && localY >= btn.y - 20 && localY <= btn.y + 10) {
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

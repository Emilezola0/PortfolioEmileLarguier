export class Shop {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.iconSize = 32;
        this.shopImg = new Image();
        this.shopImg.src = "assets/shop.png";
        this.wasDragged = false;

        this.playerStats = null;
        this.folders = null;
        this.connectionProgress = 0;
        this.buttons = [
            { name: "ATK Speed", key: "attackSpeed", cost: 10 },
            { name: "Damage", key: "attackDamage", cost: 15 },
            { name: "Range", key: "range", cost: 20 },
            { name: "Bullet Speed", key: "bulletSpeed", cost: 12 },
            { name: "Pierce", key: "pierce", cost: 25 }
        ];
    }

    setContext(playerStats, folders) {
        this.playerStats = playerStats;
        this.folders = folders;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.shopImg.complete) {
            ctx.drawImage(this.shopImg, -16, -16, this.iconSize, this.iconSize);
        } else {
            ctx.fillStyle = "gray";
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    handleClick(mouse) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 20 && !mouse.holding) {
            this.openShopPopup();
        }
    }

    openShopPopup() {
        const popup = document.getElementById("shop-popup");
        popup.classList.remove("hidden");

        const container = document.getElementById("shop-content");
        container.innerHTML = "";

        for (const btn of this.buttons) {
            const div = document.createElement("div");
            div.className = "shop-item";
            div.innerHTML = `
                <span>${btn.name}</span>
                <span>${btn.cost} <img src="assets/scrapCollect.png" alt="scrap icon"></span>
            `;
            div.onclick = () => {
                const target = this.getClosestFolder(this.folders);
                if (target && this.playerStats.scrap >= btn.cost) {
                    this.playerStats.scrap -= btn.cost;
                    upgradeFolder(target, btn.key);
                    closeShop();
                }
            };
            container.appendChild(div);
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

    // Movement
    isHovered(mx, my) {
        return Math.hypot(this.x - mx, this.y - my) < 20;
    }

    updatePosition(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.connectionProgress = 0;
    }

    handleMouseUp() {
        // Click without moving => open the shop
        if (!this.wasDragged) {
            this.openShopPopup();
        }
        this.wasDragged = false;
    }

    drawConnectionLine(ctx) {
        const folder = this.getClosestFolder(this.folders);
        if (!folder) return;

        // Incrément progressif vers 1
        if (this.connectionProgress < 1) {
            this.connectionProgress += 0.02; // Vitesse d’animation
        }

        const progress = Math.min(this.connectionProgress, 1);

        // Interpolation linéaire
        const xEnd = this.x + (folder.x - this.x) * progress;
        const yEnd = this.y + (folder.y - this.y) * progress;

        ctx.save();
        ctx.strokeStyle = "white";
        ctx.setLineDash([4, 2]); // Style rétro
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
        ctx.restore();
    }

}

window.closeShop = function () {
    document.getElementById("shop-popup").classList.add("hidden");
};


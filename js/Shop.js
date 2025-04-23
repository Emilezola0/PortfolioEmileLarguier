export class Shop {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.iconSize = 32;
        this.shopImg = new Image();
        this.shopImg.src = "assets/shop.png";
        this.wasDragged = false;

        // Effects
        this.pulse = 0;
        this.pulseDirection = 1;

        this.playerStats = null;
        this.folders = null;
        this.targetFolder = null;
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

        // === Halo pulsed ===
        if (this.targetFolder) {
            this.pulse += this.pulseDirection * 0.5;
            if (this.pulse > 10 || this.pulse < 0) {
                this.pulseDirection *= -1;
            }

            const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 20 + this.pulse);
            gradient.addColorStop(0, "rgba(0,255,255,0.2)");
            gradient.addColorStop(1, "rgba(0,255,255,0)");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, 20 + this.pulse, 0, Math.PI * 2);
            ctx.fill();
        }

        // === Shop icon ===
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
            // Script for button
            div.onclick = () => {
                const target = this.targetFolder;
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
        if (!Array.isArray(folders)) return null;
        let closest = null;
        let minDist = Infinity;
        for (const folder of folders) {
            const dx = this.x - folder.x;
            const dy = this.y - folder.y;
            const dist = Math.hypot(dx, dy);
            if (dist < minDist) {
                closest = folder;
                this.targetFolder = closest;
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
        if (!Array.isArray(this.folders)) return;

        this.targetFolder = this.getClosestFolder(this.folders); // Update Target Folder

        if (!this.targetFolder) return;

        if (this.connectionProgress < 1) {
            this.connectionProgress += 0.02;
        }

        const progress = Math.min(this.connectionProgress, 1);

        const xEnd = this.x + (this.targetFolder.x - this.x) * progress;
        const yEnd = this.y + (this.targetFolder.y - this.y) * progress;

        ctx.save();
        ctx.strokeStyle = "white";
        ctx.setLineDash([4, 2]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
        ctx.restore();
    }

    update(particles) {
        // Ajoute des particules de connexion si en lien avec un dossier
        if (this.targetFolder && Math.random() < 0.15) {
            const angle = Math.random() * 2 * Math.PI;
            const radius = 20 + Math.random() * 10;
            const px = this.x + Math.cos(angle) * radius;
            const py = this.y + Math.sin(angle) * radius;

            particles.push(new Particle(px, py, "cyan", angle, radius, 0.02));
        }
    }



}

window.closeShop = function () {
    document.getElementById("shop-popup").classList.add("hidden");
};


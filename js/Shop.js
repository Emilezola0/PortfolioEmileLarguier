import { upgradeFolder, getUpgradeCost } from "./upgrades.js";
import { spendScrap } from "./main.js";

const powerUpAudio = new Audio("assets/audio/powerUp.mp3");
powerUpAudio.volume = 0.6; // ajuste si besoin

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

        this.lastTargetFolder = null;
        this.shopIsOpen = false;

        this.numberOfScraps = 0;
        this.folders = null;
        this.targetFolder = null;
        this.connectionProgress = 0;
        this.buttons = [
            { name: "ATK Speed", key: "atkSpeed", cost: 10 },
            { name: "Damage", key: "atkDamage", cost: 15 },
            { name: "Range", key: "range", cost: 20 },
            { name: "Bullet Speed", key: "bulletSpeed", cost: 12 },
            { name: "Pierce", key: "pierce", cost: 25 }
        ];
    }

    setContext(totalNumberOfScrap, folders) {
        this.numberOfScraps = totalNumberOfScrap;
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
        // Si folders est null ou vide, on ferme le shop
        if (!Array.isArray(this.folders) || this.folders.length === 0) {
            closeShop(this);
            this.shopIsOpen = false;
            return;
        }

        this.shopIsOpen = true;

        const popup = document.getElementById("shop-popup");
        popup.classList.remove("hidden");

        const container = document.getElementById("shop-content");
        container.innerHTML = "";

        this.targetFolder = this.getClosestFolder(this.folders); // Important : update folder target

        for (const btn of this.buttons) {
            const level = this.targetFolder.upgradeLevels?.[btn.key] || 0;
            const cost = getUpgradeCost(this.targetFolder, btn.key);

            const div = document.createElement("div");
            div.className = "shop-item";
            div.innerHTML = `
        <span>${btn.name} (Lvl ${level})</span>
        <span>${Math.floor(cost)} <img src="assets/scrapCollect.png" alt="scrap icon"></span>
    `;

            // === Style special par palier ===
            if (level >= 5) {
                const tier = Math.floor(level / 5); // 5-9 => 1, 10-14 => 2, etc.
                div.classList.add(`upgrade-tier-${tier}`);
            }

            if (this.numberOfScraps >= cost) {
                div.onclick = () => {
                    const target = this.targetFolder;
                    if (target) {
                        this.numberOfScraps -= cost;
                        spendScrap(cost);
                        const oldLevel = target.upgradeLevels?.[btn.key] || 0;
                        upgradeFolder(target, btn.key);
                        const newLevel = target.upgradeLevels?.[btn.key] || 0;

                        // If we reach new step
                        if (Math.floor(newLevel / 5) > Math.floor(oldLevel / 5)) {
                            powerUpAudio.currentTime = 0;
                            powerUpAudio.play();
                        }
                        this.refreshShopPopup();
                    }
                };
            } else {
                div.style.borderColor = "#ff4444";
                div.style.color = "#ff9999";
                div.style.cursor = "not-allowed";
            }

            container.appendChild(div);
        }

        if (this.targetFolder) {
            const statsDiv = document.createElement("div");
            statsDiv.className = "folder-stats";
            statsDiv.innerHTML = `
        <hr style="border: 0; border-top: 1px dashed #333; margin: 8px 0;">
        <strong>Stats:</strong><br>
        ATK Speed: ${this.targetFolder.stats.atkSpeed}<br>
        Damage: ${this.targetFolder.stats.atkDamage}<br>
        Range: ${this.targetFolder.stats.range}<br>
        Bullet Speed: ${this.targetFolder.stats.bulletSpeed}<br>
        Pierce: ${this.targetFolder.stats.pierce}
    `;
            container.appendChild(statsDiv);
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

        // Reset if new Target Folder detected
        if (!this.lastTargetFolder || this.lastTargetFolder !== this.targetFolder) {
            this.connectionProgress = 0;
            this.lastTargetFolder = this.targetFolder;
            this.refreshShopPopup();
        }

        if (this.connectionProgress < 1) {
            this.connectionProgress += 0.015;
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

        if (this.connectionProgress >= 1) {
            // === Effet de flux "ping-pong" ===
            const now = Date.now() / 1000;
            const packetCount = 4;  // Nombre de "paquets"
            const packetSpacing = 0.25; // Decalage de depart entre chaque

            for (let i = 0; i < packetCount; i++) {
                // Deux directions : vers Folder et vers Shop
                const directions = [1, -1]; // 1 = Shop -> Folder, -1 = Folder -> Shop

                for (const dir of directions) {
                    const offset = i * packetSpacing;
                    const phase = (now * 0.5 + offset) % 1; // speed is 0.5
                    const t = dir === 1 ? phase : 1 - phase;

                    const x = this.x + (this.targetFolder.x - this.x) * t;
                    const y = this.y + (this.targetFolder.y - this.y) * t;

                    ctx.save();
                    ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }
    }

    drawConnectionWithScrapCollector(ctx, scrapCollector) {
        if (!scrapCollector) return;

        if (this.connectionProgress < 1) {
            this.connectionProgress += 0.02;
        }

        const progress = Math.min(this.connectionProgress, 1);

        const xEnd = this.x + (scrapCollector.x - this.x) * progress;
        const yEnd = this.y + (scrapCollector.y - this.y) * progress;

        // === Ligne de connexion ===
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
        ctx.restore();

        // === Effet de flux ping-pong ===
        if (this.connectionProgress >= 1) {
            const now = Date.now() / 1000;
            const packetCount = 3;
            const packetSpacing = 0.3;

            for (let i = 0; i < packetCount; i++) {
                const directions = [1, -1];

                for (const dir of directions) {
                    const offset = i * packetSpacing;
                    const phase = (now * 0.5 + offset) % 1;
                    const t = dir === 1 ? phase : 1 - phase;

                    const x = this.x + (scrapCollector.x - this.x) * t;
                    const y = this.y + (scrapCollector.y - this.y) * t;

                    ctx.save();
                    ctx.fillStyle = "rgba(255, 255, 0, 0.9)";
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }
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

    refreshShopPopup() {
        console.log(this.shopIsOpen);
        if (this.shopIsOpen == true) {
            closeShop(this);
            this.openShopPopup();
            return;
        } else {
            return;
        }
    }
}

window.closeShop = function (shopInstance) {
    // Cache le popup
    document.getElementById("shop-popup").classList.add("hidden");
    shopInstance.shopIsOpen = false;
}

window.makeShopPopupDraggable = function () {
    const popup = document.getElementById("shop-popup");
    const header = document.querySelector(".shop-header");

    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - popup.offsetLeft;
        offsetY = e.clientY - popup.offsetTop;
        document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            popup.style.left = `${e.clientX - offsetX}px`;
            popup.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        document.body.style.userSelect = "";
    });
};

window.makeShopPopupDraggable(); // Call once during the chargement


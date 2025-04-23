// Shop.js
import { upgradeFolder } from "./upgrades.js"; // We create this module next to it

export class Shop {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 120;
        this.height = 30; // Hauteur de la barre du haut (like a fake window)
        this.open = false;
        this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.shopImg = new Image();
        this.shopImg.src = "assets/shop.png";
    }

    update(mouse) {
        if (!this.open && this.dragging && mouse.isDown) {
            this.x = mouse.x - this.offsetX;
            this.y = mouse.y - this.offsetY;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Dragging
        const scale = this.dragging ? 1.2 : 1.0;
        ctx.scale(scale, scale);

        if (this.dragging) {
            ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
            ctx.shadowBlur = 20;
        }

        // Draw shop icon
        if (!this.open) {
            if (this.shopImg.complete) {
                ctx.drawImage(this.shopImg, -16, -16, 32, 32);
            } else {
                ctx.fillStyle = "gray";
                ctx.beginPath();
                ctx.arc(0, 0, 16, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Shop Window
            ctx.fillStyle = "#222";
            ctx.fillRect(0, 0, 200, 160);

            // Title Bar
            ctx.fillStyle = "#333";
            ctx.fillRect(0, 0, 200, 30);
            ctx.fillStyle = "white";
            ctx.font = "bold 12px Arial";
            ctx.fillText("Upgrade Shop", 10, 20);

            // Close Button (right corner)
            ctx.fillStyle = "red";
            ctx.fillRect(180, 5, 15, 15);
            ctx.fillStyle = "white";
            ctx.fillText("X", 183, 17);

            // Upgrade Button
            const buttons = [
                { name: "ATK Speed", y: 40, key: "attackSpeed" },
                { name: "Damage", y: 70, key: "attackDamage" },
                { name: "Range", y: 100, key: "range" },
                { name: "Bullet Speed", y: 130, key: "bulletSpeed" },
                { name: "Pierce", y: 160, key: "pierce" }
            ];

            ctx.font = "12px Arial";
            for (const btn of buttons) {
                ctx.fillStyle = "#555";
                ctx.fillRect(10, btn.y - 10, 180, 25);
                ctx.fillStyle = "white";
                ctx.fillText(`Upgrade ${btn.name}`, 20, btn.y + 7);
            }
        }

        ctx.restore();
    }

    handleClick(mouse, folders, playerStats) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;

        // Si le shop est fermé
        if (!this.open) {
            const distance = Math.hypot(dx, dy);

            // check click on shop icon
            if (distance < 20) {
                // nothing in hand then can hold
                if (!mouse.holding) {
                    this.open = true;
                }
            }

            // Autoriser le drag uniquement si rien n'est en main
            if (!mouse.holding && dx > -16 && dx < 16 && dy > -16 && dy < 16) {
                this.dragging = true;
                this.offsetX = dx;
                this.offsetY = dy;
            }

            return;
        }

        // SHOP OUVERT : click in the fake window
        const localX = mouse.x - this.x;
        const localY = mouse.y - this.y;

        // Bouton de fermeture (X)
        if (localX >= 180 && localX <= 195 && localY >= 5 && localY <= 20) {
            this.open = false;
            return;
        }

        // Boutons d'upgrade
        const upgrades = ["attackSpeed", "attackDamage", "range", "bulletSpeed", "pierce"];
        const costs = { attackSpeed: 10, attackDamage: 15, range: 20, bulletSpeed: 12, pierce: 25 };

        upgrades.forEach((key, i) => {
            const y = 40 + i * 30;
            if (localX >= 10 && localX <= 190 && localY >= y - 10 && localY <= y + 15) {
                const target = this.getClosestFolder(folders);
                if (target && playerStats.scrap >= costs[key]) {
                    playerStats.scrap -= costs[key];
                    upgradeFolder(target, key);
                }
            }
        });
    }


    handleMouseUp() {
        this.dragging = false;
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

    isHovered(mx, my) {
        return mx >= this.x - this.width / 2 && mx <= this.x + this.width / 2 &&
            my >= this.y - this.height / 2 && my <= this.y + this.height / 2;
    }
}
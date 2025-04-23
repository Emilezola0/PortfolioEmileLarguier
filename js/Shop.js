// Shop.js
import { upgradeFolder } from "./upgrades.js"; // On crée ce module à côté

export class Shop {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 120;
        this.height = 30; // Hauteur de la barre du haut (comme une fausse fenêtre)
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

        // Dessin de l'icône du shop
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
            // Fenêtre du shop
            ctx.fillStyle = "#222";
            ctx.fillRect(0, 0, 200, 160);

            // Barre de titre
            ctx.fillStyle = "#333";
            ctx.fillRect(0, 0, 200, 30);
            ctx.fillStyle = "white";
            ctx.font = "bold 12px Arial";
            ctx.fillText("Upgrade Shop", 10, 20);

            // Bouton fermer (coin en haut à droite)
            ctx.fillStyle = "red";
            ctx.fillRect(180, 5, 15, 15);
            ctx.fillStyle = "white";
            ctx.fillText("X", 183, 17);

            // Boutons d'amélioration
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

    handleClick(mouse, folders) {
        if (!this.open) {
            // Si on clique pour ouvrir
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            if (Math.hypot(dx, dy) < 20) {
                this.open = true;
            } else if (dx > -16 && dx < 16 && dy > -16 && dy < 16) {
                this.dragging = true;
                this.offsetX = dx;
                this.offsetY = dy;
            }
        } else {
            const localX = mouse.x - this.x;
            const localY = mouse.y - this.y;

            // Fermeture
            if (localX >= 180 && localX <= 195 && localY >= 5 && localY <= 20) {
                this.open = false;
                return;
            }

            // Détection du bouton cliqué
            const upgrades = ["attackSpeed", "attackDamage", "range", "bulletSpeed", "pierce"];
            upgrades.forEach((key, i) => {
                const y = 40 + i * 30;
                if (localX >= 10 && localX <= 190 && localY >= y - 10 && localY <= y + 15) {
                    const target = this.getClosestFolder(folders);
                    if (target) {
                        upgradeFolder(target, key);
                    }
                }
            });
        }
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
}
import { ShopWindow } from "./ShopWindow.js";
import { FakeWindow } from "./FakeWindow.js";

export class Shop extends FakeWindow {
    constructor(x, y) {
        super(x, y, 32, 32, ""); // Pas besoin de titre ici
        this.iconSize = 32;
        this.shopImg = new Image();
        this.shopImg.src = "assets/shop.png";
        this.window = new ShopWindow(x + 50, y); // Décalé à droite

        this.playerStats = null;
        this.folders = null;
    }

    setContext(playerStats, folders) {
        this.playerStats = playerStats;
        this.folders = folders;
        this.window.setContext(playerStats, folders);
    }

    draw(ctx) {
        // Si la fenêtre est ouverte, on la dessine
        if (this.window.open) {
            this.window.draw(ctx);
        }

        // Dessine l'icône déplaçable du shop
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
            this.window.open = true;
        }
    }

    isHovered(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.hypot(dx, dy) < 20;
    }

    handleMouseUp() {
        this.window?.handleMouseUp?.(); // Passe au cas où tu veux faire des choses dans ShopWindow
    }

    updatePosition(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.window.x += dx;
        this.window.y += dy;
    }
}

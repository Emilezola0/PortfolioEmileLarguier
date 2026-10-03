import { STAR_TYPES } from "./ShootingStar.js";
import { COSMIC_TYPES } from "./CosmicObject.js";
import { SoundManager } from './SoundManager.js';
import { t, tr, onLangChange } from './i18n.js';

export function formatDust(n) {
    if (n < 1000) return String(Math.floor(n));
    if (n < 1e6) return (n / 1e3).toFixed(1) + "K";
    if (n < 1e9) return (n / 1e6).toFixed(2) + "M";
    return (n / 1e9).toFixed(2) + "B";
}

// Stardust shop: more stars, new star behaviours, cosmic objects to place.
// `game` is the API exposed by main.js:
//   getDust(), spend(n), starCount(type), canAddStar(), addStar(type),
//   cosmicCount(kind), startPlacing(kind, cost)
export class Shop {
    constructor(game) {
        this.game = game;
        this.popup = document.getElementById("shop-popup");
        this.container = document.getElementById("shop-content");
        this.rows = [];
        this.build();
        onLangChange(() => this.build());
    }

    // --- Prices ---
    starCost(type) {
        const def = STAR_TYPES[type];
        const owned = this.game.starCount(type);
        if (owned === 0 && def.unlockCost > 0) return def.unlockCost;
        const bought = owned - def.free - (def.unlockCost > 0 ? 1 : 0);
        return Math.floor(def.baseCost * Math.pow(def.growth, Math.max(0, bought)));
    }

    cosmicCost(kind) {
        const def = COSMIC_TYPES[kind];
        return Math.floor(def.baseCost * Math.pow(def.growth, this.game.cosmicCount(kind)));
    }

    // --- DOM (built once, then only refreshed in place) ---
    build() {
        this.container.innerHTML = "";
        this.rows = [];

        this.addSection(t("shopStars"));
        for (const type of Object.keys(STAR_TYPES)) {
            const def = STAR_TYPES[type];
            const color = `rgb(${def.rgb.join(",")})`;
            this.addRow(color, tr(def.desc), {
                label: () => {
                    const owned = this.game.starCount(type);
                    return owned === 0 ? `${t("unlock")} ${tr(def.label)}` : `${tr(def.label)} x${owned}`;
                },
                cost: () => this.starCost(type),
                available: () => this.game.canAddStar(),
                buy: (cost) => {
                    const unlocking = this.game.starCount(type) === 0;
                    if (!this.game.spend(cost)) return;
                    this.game.addStar(type);
                    SoundManager.play(unlocking ? 'powerUp' : 'click');
                }
            });
        }

        this.addCosmicRow("cannon");

        this.addSection(t("shopCosmic"));
        for (const kind of Object.keys(COSMIC_TYPES)) {
            if (kind !== "cannon") this.addCosmicRow(kind);
        }

        this.refresh();
    }

    // Objects placed on the map: paid when actually dropped
    addCosmicRow(kind) {
        const def = COSMIC_TYPES[kind];
        this.addRow(def.color, tr(def.desc), {
            label: () => `${tr(def.label)} ${this.game.cosmicCount(kind)}/${def.max}`,
            cost: () => this.cosmicCost(kind),
            available: () => this.game.cosmicCount(kind) < def.max,
            buy: (cost) => {
                SoundManager.play('click');
                this.game.startPlacing(kind, cost);
                this.close();
            }
        });
    }

    addSection(title) {
        const div = document.createElement("div");
        div.className = "shop-section";
        div.textContent = title;
        this.container.appendChild(div);
    }

    addRow(color, desc, row) {
        const div = document.createElement("div");
        div.className = "shop-item";

        const left = document.createElement("span");
        left.className = "shop-item-info";
        const dot = document.createElement("span");
        dot.className = "shop-item-dot";
        dot.style.background = color;
        dot.style.boxShadow = `0 0 6px ${color}`;
        const name = document.createElement("span");
        name.className = "shop-item-name";
        const small = document.createElement("span");
        small.className = "shop-item-desc";
        small.textContent = desc;
        left.append(dot, name, small);

        const price = document.createElement("span");
        price.className = "shop-item-cost";

        div.append(left, price);
        div.addEventListener("click", () => {
            const cost = row.cost();
            if (!row.available() || this.game.getDust() < cost) return;
            row.buy(cost);
            this.refresh();
        });

        this.container.appendChild(div);
        this.rows.push({ div, name, price, ...row });
    }

    refresh() {
        const dust = this.game.getDust();
        for (const row of this.rows) {
            const available = row.available();
            const cost = row.cost();
            row.name.textContent = row.label();
            row.price.textContent = available ? `${formatDust(cost)} ✦` : t("max");
            row.div.classList.toggle("shop-item-disabled", !available || dust < cost);
        }
    }

    isOpen() {
        return !this.popup.classList.contains("hidden");
    }

    open() {
        this.refresh();
        this.popup.classList.remove("hidden");
    }

    close() {
        this.popup.classList.add("hidden");
    }

    toggle() {
        if (this.isOpen()) this.close();
        else this.open();
    }
}

window.closeShop = function () {
    document.getElementById("shop-popup").classList.add("hidden");
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

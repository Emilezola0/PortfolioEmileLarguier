import { Bullet } from "./Bullet.js";
import { SoundManager } from './SoundManager.js';

export class Folder {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.cooldown = 0;
        this.absorbing = false;
        this.absorbAngle = 0;
        this.opacity = 1;
        this.initialDistance = 0;

        // Apparence & interaction
        this.dragging = false;
        this.mouseDownPos = null;
        this.width = 32;
        this.height = 32;

        // === STATS personnalisables ===
        this.stats = {
            atkSpeed: 60,        // Moins = plus rapide
            atkDamage: 1,
            range: 100,
            bulletSpeed: 4,
            pierce: 1
        };

        // Image
        this.folderImg = new Image();
        this.folderImg.src = "assets/folder.png";

        // Sound
        this.projectileAudio = new Audio("assets/projectileSoundEffect.mp3");
        this.volume = 0.9;
    }

    update(mobs, bullets, voidCenter, voidRadius, soundEnabled) {
        if (this.absorbing) {
            this.absorbAngle += 0.05;
            const dist = voidRadius - 10;
            this.x = voidCenter.x + dist * Math.cos(this.absorbAngle);
            this.y = voidCenter.y + dist * Math.sin(this.absorbAngle);
            this.opacity -= 0.01;
            return;
        }

        const dx = this.x - voidCenter.x;
        const dy = this.y - voidCenter.y;
        const d = Math.hypot(dx, dy);
        if (d < voidRadius + 30) {
            this.absorbing = true;
            this.absorbAngle = Math.random() * Math.PI * 2;
            return;
        }

        if (this.cooldown > 0) {
            this.cooldown--;
            return;
        }

        let closest = null;
        let closestDist = Infinity;

        for (const mob of mobs) {
            const dx = mob.x - this.x;
            const dy = mob.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < this.stats.range && dist < closestDist) {
                closest = mob;
                closestDist = dist;
            }
        }

        if (closest) {
            const dx = closest.x - this.x;
            const dy = closest.y - this.y;
            const dist = Math.hypot(dx, dy);

            const vx = (dx / dist) * this.stats.bulletSpeed;
            const vy = (dy / dist) * this.stats.bulletSpeed;

            bullets.push(new Bullet(this.x, this.y, vx, vy, this.stats.atkDamage, this.stats.pierce));
            SoundManager.play(this.projectileAudio, this.volume);
            this.cooldown = this.stats.atkSpeed;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);

        // Appliquer une rotation si en absorption
        if (this.absorbing) ctx.rotate(this.absorbAngle);

        // Scale depending of state
        let scale = 1.0;
        if (this.dragging) {
            scale = 1.2;
        } else if (this.hovered) {
            scale = 1.1;
        }
        ctx.scale(scale, scale);

        // Shadow if drag or hover
        if (this.dragging) {
            ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
            ctx.shadowBlur = 20;
        } else if (this.hovered) {
            // Halo lumineux avec un flou plus intense
            ctx.shadowColor = "rgba(255, 255, 255, 0.75)"; // Blanc lumineux
            ctx.shadowBlur = 30; // Plus de flou pour créer l'effet de halo
            ctx.shadowOffsetX = 0; // Pas de décalage horizontal
            ctx.shadowOffsetY = 0; // Pas de décalage vertical
        }

        // Dessiner l’image du dossier ou un fallback
        if (this.folderImg.complete) {
            ctx.drawImage(this.folderImg, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = "#ccc";
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        ctx.restore();

        // Dessiner le texte sous le dossier
        if (!this.absorbing) {
            ctx.fillStyle = "white";
            ctx.font = "10px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.name, this.x, this.y + 28);
        }

        // Debogage : rayon de detection
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.stats.range, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.stroke();
    }


    isHovered(mx, my) {
        const isHovered = mx >= this.x - this.width / 2 && mx <= this.x + this.width / 2 &&
            my >= this.y - this.height / 2 && my <= this.y + this.height / 2;
        this.hovered = isHovered; // update state 'hovered'
        return isHovered;
    }

    handleClick(mouse) {
        this.mouseDownPos = { x: mouse.x, y: mouse.y };
    }

    handleMouseUp(mouse) {
        if (this.mouseDownPos) {
            const dx = mouse.x - this.mouseDownPos.x;
            const dy = mouse.y - this.mouseDownPos.y;
            const moved = Math.hypot(dx, dy) > 20;
            console.log(Math.hypot(dx, dy));

            if (!moved) {
                console.log("OPEN FOLDER");
                this.openFolderPopup();
            }
        }
        this.dragging = false;
        this.mouseDownPos = null;
    }

    openFolderPopup() {
        let popup = document.getElementById("folder-popup");

        // Si déjà ouvert, on le réaffiche
        if (popup) {
            popup.classList.remove("hidden");
            return;
        }

        // === Création du popup ===
        popup = document.createElement("div");
        popup.id = "folder-popup";
        popup.style.position = "absolute";
        popup.style.top = "100px";
        popup.style.left = "100px";
        popup.style.width = "300px";
        popup.style.height = "200px";
        popup.style.background = "#fff";
        popup.style.border = "1px solid #aaa";
        popup.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
        popup.style.resize = "none"; // désactiver le resize natif
        popup.style.overflow = "auto";
        popup.style.zIndex = "9999";
        popup.style.padding = "10px";

        // === Éléments internes ===
        const title = document.createElement("h2");
        title.id = "folder-title";
        popup.appendChild(title);

        const container = document.createElement("div");
        container.id = "folder-content";
        popup.appendChild(container);

        const nav = document.createElement("div");
        nav.id = "popup-nav";
        popup.appendChild(nav);

        // === Handle de resize ===
        const resizeHandle = document.createElement("div");
        resizeHandle.style.position = "absolute";
        resizeHandle.style.width = "16px";
        resizeHandle.style.height = "16px";
        resizeHandle.style.right = "0";
        resizeHandle.style.bottom = "0";
        resizeHandle.style.cursor = "se-resize";
        resizeHandle.style.background = "url('data:image/svg+xml;utf8,<svg width=\"16\" height=\"16\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"0\" y1=\"16\" x2=\"16\" y2=\"0\" stroke=\"gray\" stroke-width=\"2\" /></svg>')";
        resizeHandle.style.backgroundRepeat = "no-repeat";
        resizeHandle.style.backgroundPosition = "center";
        popup.appendChild(resizeHandle);

        let resizing = false;
        let startX, startY, startWidth, startHeight;

        resizeHandle.addEventListener("mousedown", (e) => {
            e.preventDefault();
            resizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(window.getComputedStyle(popup).width, 10);
            startHeight = parseInt(window.getComputedStyle(popup).height, 10);
            document.addEventListener("mousemove", resize);
            document.addEventListener("mouseup", stopResize);
        });

        function resize(e) {
            if (!resizing) return;
            popup.style.width = startWidth + (e.clientX - startX) + "px";
            popup.style.height = startHeight + (e.clientY - startY) + "px";
        }

        function stopResize() {
            resizing = false;
            document.removeEventListener("mousemove", resize);
            document.removeEventListener("mouseup", stopResize);
        }

        document.body.appendChild(popup);

        // === Chargement dynamique du contenu ===
        import(`./projects/project_${this.name}.js`)
            .then(module => {
                const data = module.getProjectContent();
                let currentIndex = 0;

                const updateSlide = () => {
                    const slide = data.slides[currentIndex];
                    container.innerHTML = `
                    <img src="${slide.img}" class="popup-image" />
                    <p>${slide.desc}</p>
                `;

                    nav.innerHTML = `
                    ${currentIndex > 0 ? '<button id="prev-slide"><-</button>' : ''}
                    ${currentIndex < data.slides.length - 1 ? '<button id="next-slide">-></button>' : ''}
                `;

                    if (currentIndex > 0)
                        document.getElementById("prev-slide").onclick = () => { currentIndex--; updateSlide(); };
                    if (currentIndex < data.slides.length - 1)
                        document.getElementById("next-slide").onclick = () => { currentIndex++; updateSlide(); };
                };

                title.textContent = data.title;
                updateSlide();
            })
            .catch(err => {
                title.textContent = "Erreur";
                container.innerHTML = "<p>Erreur de chargement du dossier.</p>";
                nav.innerHTML = "";
            });
    }


    updatePosition(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}

window.closeFolderPopup = function () {
    document.getElementById("folder-popup").classList.add("hidden");
};

window.makeFolderPopupDraggable = function () {
    const popup = document.getElementById("folder-popup");
    const header = document.querySelector(".popup-header");

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

window.makeFolderPopupDraggable();

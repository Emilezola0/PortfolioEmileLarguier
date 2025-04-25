import { Bullet } from "./Bullet.js";
import { SoundManager } from './SoundManager.js';

export class Folder {
    constructor(x, y, name, JsName, planetStyle = {}) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.JsName = JsName;
        this.cooldown = 0;
        this.absorbing = false;
        this.absorbAngle = 0;
        this.opacity = 1;
        this.initialDistance = 0;

        // Planete Style
        this.planetStyle = {
            baseColor: planetStyle.baseColor || "#44f",
            coreColor: planetStyle.coreColor || "#ccf",
            size: planetStyle.size || 16, // Rayon planète
            floatAmplitude: planetStyle.floatAmplitude || 1.5, // Flottement haut-bas
            floatSpeed: planetStyle.floatSpeed || 0.05, // Vitesse flottement
            rotationSpeed: planetStyle.rotationSpeed || 0.01, // Rotation planète
            ringRotationSpeed: planetStyle.ringRotationSpeed || 0.015 // Rotation anneau
        };
        this.floatOffset = Math.random() * Math.PI * 2; // pour décaler chaque planète
        this.planetRotation = 0;
        this.ringRotation = 0;

        // Apparence & interaction
        this.dragging = false;
        this.mouseDownPos = null;
        this.width = 32;
        this.height = 32;

        // === STATS personnalisables ===
        this.stats = {
            atkSpeed: 60,        // Moins = plus rapide
            atkDamage: 1,
            range: 75,
            bulletSpeed: 4,
            pierce: 1
        };

        // === Upgrade Levels ===
        this.upgradeLevels = {
            atkSpeed: 0,
            atkDamage: 0,
            range: 0,
            bulletSpeed: 0,
            pierce: 0,
        };


        // Image
        // this.folderImg = new Image();
        // this.folderImg.src = "assets/folder.png";

        // Sound
        this.projectileAudio = new Audio("assets/projectileSoundEffect.mp3");
        this.volume = 0.9;
    }

    // methode create button when folder dead
    createShortcutButton() {
        const container = document.getElementById("folder-shortcuts");

        const btn = document.createElement("button");
        btn.classList.add("folder-shortcut-button");
        btn.textContent = this.name;

        btn.onclick = () => {
            this.openFolderPopup();
        };

        container.appendChild(btn);
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
        if (d < voidRadius + 30 && !this.absorbing) {
            this.absorbing = true;
            this.absorbAngle = Math.random() * Math.PI * 2;
            this.createShortcutButton();
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

            const normDx = dx / dist;
            const normDy = dy / dist;

            bullets.push(new Bullet(
                this.x,
                this.y,
                normDx,
                normDy,
                this.stats.atkDamage,     // damage
                this.stats.pierce,        // pierce
                this.stats.bulletSpeed    // speed projectile
            ));
            SoundManager.play(this.projectileAudio, this.volume);
            this.cooldown = this.stats.atkSpeed;
        }

        // Planete rotation
        this.planetRotation += this.planetStyle.rotationSpeed;
        this.ringRotation += this.planetStyle.ringRotationSpeed;
        this.floatOffset += this.planetStyle.floatSpeed;

    }

    // draw planete
    drawPlanet(ctx) {
        const size = this.planetStyle.size;
        const floatY = Math.sin(this.floatOffset) * this.planetStyle.floatAmplitude;

        ctx.save();
        ctx.translate(0, floatY);
        ctx.rotate(this.planetRotation);

        // === Corps principal ===
        ctx.beginPath();
        ctx.fillStyle = this.planetStyle.baseColor;
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // === Ombre latérale pour le volume ===
        const shadow = ctx.createRadialGradient(-size * 0.4, -size * 0.4, size * 0.1, 0, 0, size);
        shadow.addColorStop(0, "rgba(0,0,0,0.05)");
        shadow.addColorStop(1, "rgba(0,0,0,0.4)");
        ctx.fillStyle = shadow;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // === Cratères (zones sombres avec halo) ===
        const numCraters = 6;
        for (let i = 0; i < numCraters; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = size * (0.3 + Math.random() * 0.6);
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            const craterSize = size * (0.03 + Math.random() * 0.04);

            // Ombre du cratère
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, craterSize * 1.5);
            gradient.addColorStop(0, "rgba(0,0,0,0.2)");
            gradient.addColorStop(1, "rgba(0,0,0,0)");

            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(x, y, craterSize * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Contour léger
            ctx.beginPath();
            ctx.strokeStyle = "rgba(255,255,255,0.05)";
            ctx.lineWidth = 0.5;
            ctx.arc(x, y, craterSize, 0, Math.PI * 2);
            ctx.stroke();
        }

        // === Glow central doux ===
        ctx.beginPath();
        const coreGlow = ctx.createRadialGradient(0, 0, size * 0.25, 0, 0, size);
        coreGlow.addColorStop(0, this.planetStyle.coreColor);
        coreGlow.addColorStop(1, "transparent");
        ctx.fillStyle = coreGlow;
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
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
            ctx.shadowBlur = 30; // Plus de flou pour cr er l'effet de halo
            ctx.shadowOffsetX = 0; // Pas de d calage horizontal
            ctx.shadowOffsetY = 0; // Pas de d calage vertical
        }

        this.drawPlanet(ctx);

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
        const popup = document.getElementById("folder-popup");
        const container = document.getElementById("folder-content");
        const title = document.getElementById("folder-title");

        import(`./projects/project_${this.JsName}.js`)
            .then(module => {
                const data = module.getProjectContent();
                let currentIndex = 0;

                const updateSlide = () => {
                    const slide = data.slides[currentIndex];

                    let mediaHTML = "";
                    if (slide.type === "image") {
                        mediaHTML = `<img src="${slide.img}" class="popup-image" />`;
                    } else if (slide.type === "video") {
                        const embedURL = convertToEmbedURL(slide.video);

                        if (embedURL.includes("youtube.com/embed/")) {
                            mediaHTML = `
                            <div class="video-container">
                            <iframe
                            src="${embedURL}"
                            title="YouTube video"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            ></iframe>
                            </div>
                            `;
                        } else {
                            const videoId =
                                (slide.video.includes("youtu.be/") && slide.video.split("youtu.be/")[1]) ||
                                (slide.video.includes("watch?v=") && slide.video.split("watch?v=")[1].split("&")[0]);

                            const thumbnailURL = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

                            mediaHTML = `
                            <a href="${slide.video}" target="_blank" class="video-link video-thumbnail-wrapper">
                            <img src="${thumbnailURL}" class="popup-image" alt="Video thumbnail" />
                            <div class="video-play-button">Play</div>
                            </a>`;
                        }
                    }

                    container.innerHTML = `
                    ${mediaHTML}
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
                const nav = document.getElementById("popup-nav");
                updateSlide();
                popup.classList.remove("hidden");
            })
            .catch(err => {
                title.textContent = "Erreur";
                container.innerHTML = "<p>Erreur de chargement du dossier.</p>";
                document.getElementById("popup-nav").innerHTML = "";
                popup.classList.remove("hidden");
            });
    }


    updatePosition(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}

function convertToEmbedURL(url) {
    if (!url) return "";

    if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1];
        return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes("watch?v=")) {
        const videoId = url.split("watch?v=")[1].split("&")[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }

    // Not a YouTube URL? Return as-is (will fallback to a clickable link)
    return url;
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

(function enablePopupResize() {
    const popup = document.getElementById("folder-popup");
    const resizeHandle = document.querySelector(".resize-handle");

    let isResizing = false;

    resizeHandle.addEventListener("mousedown", (e) => {
        isResizing = true;
        e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
        if (!isResizing) return;

        const rect = popup.getBoundingClientRect();
        const newWidth = e.clientX - rect.left;
        const newHeight = e.clientY - rect.top;

        popup.style.width = `${newWidth}px`;
        popup.style.height = `${newHeight}px`;
    });

    window.addEventListener("mouseup", () => {
        isResizing = false;
    });
})();
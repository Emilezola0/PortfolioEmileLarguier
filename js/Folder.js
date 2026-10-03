import { SoundManager } from './SoundManager.js';
import { openCustomPopup } from './PopupManager.js';

export class Folder {
    // options.icon      : image drawn instead of a planet
    // options.popupData : static popup content (instead of a project module)
    constructor(x, y, name, JsName, planetStyle = {}, options = {}) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.JsName = JsName;
        this.opacity = 1;

        // Planete Style
        this.planetStyle = {
            baseColor: planetStyle.baseColor || "#44f",
            coreColor: planetStyle.coreColor || "#ccf",
            size: planetStyle.size || 16, // Planet radius
            floatAmplitude: planetStyle.floatAmplitude || 1.5,
            floatSpeed: planetStyle.floatSpeed || 0.05,
            rotationSpeed: planetStyle.rotationSpeed || 0.01,
            ringRotationSpeed: planetStyle.ringRotationSpeed || 0.015
        };
        this.craters = this.getCraters(this.planetStyle.size);
        this.floatOffset = Math.random() * Math.PI * 2;
        this.planetRotation = 0;
        this.ringRotation = 0;

        this.popupData = options.popupData || null;
        this.icon = null;
        if (options.icon) {
            this.icon = new Image();
            this.icon.src = options.icon;
        }

        // Bounce surface for shooting stars
        this.radius = this.icon ? 18 : this.planetStyle.size * 1.2;
        this.color = this.planetStyle.baseColor;
        this.valueMult = 1;
        this.bump = 0; // 1 -> 0 after a bounce (visual feedback)

        // Interaction
        this.dragging = false;
        this.hovered = false;
    }

    update(dt) {
        const frames = dt / 16.67;

        if (this.bump > 0) this.bump = Math.max(0, this.bump - dt / 350);

        this.planetRotation += this.planetStyle.rotationSpeed * frames;
        this.ringRotation += this.planetStyle.ringRotationSpeed * frames;
        this.floatOffset += this.planetStyle.floatSpeed * frames;
    }

    // draw planete
    drawPlanet(ctx) {
        const size = this.planetStyle.size;
        const floatY = Math.sin(this.floatOffset) * this.planetStyle.floatAmplitude;

        ctx.save();
        ctx.translate(0, floatY);
        // ctx.rotate(this.planetRotation); // Rotation Desactivate

        // Position de la lumiere
        const lightX = Math.cos(this.planetRotation) * 0.5;
        const lightY = Math.sin(this.planetRotation) * 0.5;

        // === Halo lumineux autour de la planete ===
        const atmosphere = ctx.createRadialGradient(0, 0, size, 0, 0, size * 1.4);
        atmosphere.addColorStop(0, "rgba(255, 255, 255, 0.15)");
        atmosphere.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.fillStyle = atmosphere;
        ctx.arc(0, 0, size * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // === Corps principal ===
        ctx.beginPath();
        ctx.fillStyle = this.planetStyle.baseColor;
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // === Effet de volume/lumiere ===
        const volumeGradient = ctx.createRadialGradient(-lightX * size * 0.5, -lightY * size * 0.5, 0, 0, 0, size);
        volumeGradient.addColorStop(0, "rgba(255,255,255,0.1)");
        volumeGradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.beginPath();
        ctx.fillStyle = volumeGradient;
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // === Ombre dynamique ===
        const shadow = ctx.createRadialGradient(-size * 0.4, -size * 0.4, size * 0.1, lightX, lightY, size);
        shadow.addColorStop(0, "rgba(0,0,0,0.1)");
        shadow.addColorStop(1, "rgba(0,0,0,0.5)");

        ctx.beginPath();
        ctx.fillStyle = shadow;
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // === Noyau brillant (facultatif) ===
        ctx.beginPath();
        ctx.fillStyle = this.planetStyle.coreColor;
        ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // === Texture granuleuse / poussiere ===
        for (let i = 0; i < 30; i++) {
            const rx = (Math.random() - 0.5) * size * 1.6;
            const ry = (Math.random() - 0.5) * size * 1.6;
            const r = Math.random() * 0.8;

            ctx.beginPath();
            ctx.fillStyle = "rgba(255,255,255,0.05)";
            ctx.arc(rx, ry, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // === Crateres ===
        for (let i = 0; i < this.craters.length; i++) {
            const { x, y, craterSize } = this.craters[i];

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, craterSize * 1.5);
            gradient.addColorStop(0, "rgba(0,0,0,0.4)");
            gradient.addColorStop(1, "rgba(0,0,0,0)");

            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(x, y, craterSize * 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.lineWidth = 0.8;
            ctx.arc(x, y, craterSize, 0, Math.PI * 2);
            ctx.stroke();
        }

        // === Anneau autour de la planete ===
        ctx.beginPath();
        ctx.strokeStyle = "rgba(200,200,255,0.2)";
        ctx.lineWidth = 2;
        ctx.ellipse(0, 0, size * 1.4, size * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }


    // Fonction pour generer une fois les crateres
    getCraters(size) {
        const craters = [];
        const numCraters = Math.floor(Math.random() * 4) + 4; // Entre 4 et 7 crateres

        for (let i = 0; i < numCraters; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = size * (0.3 + Math.random() * 0.6);
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            const craterSize = size * (0.05 + Math.random() * 0.1); // Taille plus grande des crateres

            craters.push({ x, y, craterSize });
        }

        return craters;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);

        // Scale depending of state
        let scale = 1.0;
        if (this.dragging) {
            scale = 1.2;
        } else if (this.hovered) {
            scale = 1.1;
        }
        scale += this.bump * 0.15;
        ctx.scale(scale, scale);

        // Shadow if drag or hover
        if (this.dragging) {
            ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
            ctx.shadowBlur = 20;
        } else if (this.hovered) {
            ctx.shadowColor = "rgba(255, 255, 255, 0.75)";
            ctx.shadowBlur = 30;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        if (this.icon) {
            if (this.icon.complete && this.icon.naturalWidth) {
                ctx.drawImage(this.icon, -16, -16, 32, 32);
            }
        } else {
            this.drawPlanet(ctx);
        }

        ctx.restore();

        // Bounce ripple
        if (this.bump > 0) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + (1 - this.bump) * 26, 0, Math.PI * 2);
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = this.bump * 0.8;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Name under the planet
        ctx.fillStyle = "white";
        ctx.font = "14px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x, this.y + this.radius + 16);
    }

    isHovered(mx, my) {
        return Math.hypot(mx - this.x, my - this.y) < Math.max(this.radius, 18);
    }

    openFolderPopup() {
        const popup = document.getElementById("folder-popup");
        const container = document.getElementById("folder-content");
        const title = document.getElementById("folder-title");

        if (this.popupData) {
            openCustomPopup(this.popupData);
            return;
        }

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
                SoundManager.play('click');
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
    SoundManager.play('click');
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
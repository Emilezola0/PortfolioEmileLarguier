import { SoundManager } from './SoundManager.js';
export class Planet {
    constructor(x, y, name, JsName, planetStyle = {}) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.JsName = JsName;
        this.cooldown = 0;
        this.absorbing = false;
        this.absorbAngle = 0;
        this.initialDistance = 0;
        // Apparence & Interaction
        this.width = 32;
        this.height = 32;
        this.dragging = false;
        this.hovered = false;
        this.mouseDownPos = null;
        // ORBIT
        this.orbitRadius = 150; // Rayon d'orbite autour du centre
        this.orbitSpeed = 0.002 + Math.random() * 0.001; // Vitesse unique pour chaque plan�te
        this.orbitAngle = Math.random() * Math.PI * 2; // Angle initial random


        // Planete Style
        this.planetStyle = {
            baseColor: planetStyle.baseColor || "#44f",
            coreColor: planetStyle.coreColor || "#ccf",
            size: planetStyle.size || 16, // Rayon plan�te
            floatAmplitude: planetStyle.floatAmplitude || 1.5, // Flottement haut-bas
            floatSpeed: planetStyle.floatSpeed || 0.05, // Vitesse flottement
            rotationSpeed: planetStyle.rotationSpeed || 0.01, // Rotation plan�te
            ringRotationSpeed: planetStyle.ringRotationSpeed || 0.015 // Rotation anneau
        };
        this.craters = this.getCraters(planetStyle.size);
        this.floatOffset = Math.random() * Math.PI * 2; // pour d�caler chaque plan�te
        this.planetRotation = 0;
        this.ringRotation = 0;
        this.opacity = 1;
    }

    update(ctx) {
        this.floatOffset += this.planetStyle.floatSpeed;
        this.planetRotation += this.planetStyle.rotationSpeed;

        this.orbitAngle += this.orbitSpeed; // Fait tourner la planete doucement

        const floatY = Math.sin(this.floatOffset) * this.planetStyle.floatAmplitude;

        // Recalculer la position en cercle + flottement haut-bas
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        this.x = centerX + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.y = centerY + Math.sin(this.orbitAngle) * this.orbitRadius + floatY;
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
            ctx.font = "14px 'Press Start 2P', monospace"; // Mets le font ici directement
            ctx.textAlign = "center";
            ctx.fillText(this.name, this.x, this.y + 35);
        }
    }

    // Draw planet
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

    isHovered(mx, my) {
        const dx = mx - this.x;
        const dy = my - this.y;
        const dist = Math.hypot(dx, dy);
        return dist < this.planetStyle.size;
    }

    handleClick(mouse) {
        this.mouseDownPos = { x: mouse.x, y: mouse.y };
    }

    handleMouseUp(mouse) {
        if (this.mouseDownPos) {
            const dx = mouse.x - this.mouseDownPos.x;
            const dy = mouse.y - this.mouseDownPos.y;
            const moved = Math.hypot(dx, dy) > 2;
            console.log(Math.hypot(dx, dy));

            if (!moved) {
                SoundManager.play('click');
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

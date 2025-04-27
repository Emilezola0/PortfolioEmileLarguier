export class Planet {
    constructor(x, y, name, JsName, planetStyle = {}) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.JsName = JsName;
        this.width = 32;
        this.height = 32;
        this.dragging = false;
        this.hovered = false;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.planetRotation = 0;

        this.planetStyle = {
            baseColor: planetStyle.baseColor || "#44f",
            coreColor: planetStyle.coreColor || "#ccf",
            size: planetStyle.size || 16,
            floatAmplitude: planetStyle.floatAmplitude || 1.5,
            floatSpeed: planetStyle.floatSpeed || 0.05,
            rotationSpeed: planetStyle.rotationSpeed || 0.01,
        };

        console.log("GENERATE PLANET");
    }

    update() {
        this.floatOffset += this.planetStyle.floatSpeed;
        this.planetRotation += this.planetStyle.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Flottement
        const floatY = Math.sin(this.floatOffset) * this.planetStyle.floatAmplitude;
        ctx.translate(0, floatY);

        // Corps
        ctx.beginPath();
        ctx.fillStyle = this.planetStyle.baseColor;
        ctx.arc(0, 0, this.planetStyle.size, 0, Math.PI * 2);
        ctx.fill();

        // Coeur
        ctx.beginPath();
        ctx.fillStyle = this.planetStyle.coreColor;
        ctx.arc(0, 0, this.planetStyle.size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Nom
        ctx.fillStyle = "white";
        ctx.font = "10px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x, this.y + this.planetStyle.size + 12);
    }

    isHovered(mx, my) {
        const dx = mx - this.x;
        const dy = my - this.y;
        const dist = Math.hypot(dx, dy);
        return dist < this.planetStyle.size;
    }

    handleClick() {
        // Ici, ouvre ton popup, comme dans Folder.js
        const popup = document.getElementById("folder-popup");
        const container = document.getElementById("folder-content");
        const title = document.getElementById("folder-title");

        import(`./projects/project_${this.JsName}.js`)
            .then(module => {
                const data = module.getProjectContent();
                container.innerHTML = `<p>${data.title}</p><p>${data.slides[0]?.desc || ''}</p>`;
                title.textContent = data.title;
                popup.classList.remove("hidden");
            })
            .catch(() => {
                title.textContent = "Erreur";
                container.innerHTML = "<p>Erreur de chargement du projet.</p>";
                popup.classList.remove("hidden");
            });
    }
}

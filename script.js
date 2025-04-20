// Sélection des outils
const brushBtn = document.getElementById("brush");
const handBtn = document.getElementById("hand");
const bucketBtn = document.getElementById("bucket");
let currentTool = "brush";

// Activation des outils
brushBtn.onclick = () => {
    currentTool = "brush";
    setActiveTool(brushBtn);
};

handBtn.onclick = () => {
    currentTool = "hand";
    setActiveTool(handBtn);
};

bucketBtn.onclick = (e) => {
    currentTool = "bucket";
    setActiveTool(bucketBtn);
    triggerRipple(bucketBtn, e);

    // Fonction pour faire disparaître toutes les couches de poussière
    if (!fading) fadeAllDustLayers();

    // Révéler les dossiers après l'animation
    setTimeout(() => {
        document.querySelectorAll(".folder").forEach(folder => {
            folder.classList.add("revealed");
        });
    }, 1000);

    // Appliquer l'effet de creusage général avec le sceau
    applyDiggingEffect();
};

// Fonction pour appliquer l'effet de creusage sur toute la zone de fouille (sceau)
function applyDiggingEffect() {
    const diggedArea = document.createElement("div");
    diggedArea.classList.add("digged-area");
    diggedArea.style.left = "0px"; // Appliquer à toute la zone
    diggedArea.style.top = "0px";
    diggedArea.style.width = `${digWrapper.clientWidth}px`;
    diggedArea.style.height = `${digWrapper.clientHeight}px`;

    digWrapper.appendChild(diggedArea);
    diggedArea.classList.add("revealed");
}

// Fonction pour activer l'outil sélectionné
function setActiveTool(activeBtn) {
    [brushBtn, handBtn, bucketBtn].forEach(btn => btn.classList.remove("active"));
    activeBtn.classList.add("active");
}

// Fonction pour déclencher l'effet visuel du sceau (ripple)
function triggerRipple(target, e) {
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    const rect = target.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    ripple.style.width = ripple.style.height = "100px";
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// GESTION DES CANVAS EN COUCHES
const layers = [];
const layerCount = 6; // de 0 à 5
const digWrapper = document.getElementById("digZoneWrapper");

for (let i = 0; i < layerCount; i++) {
    const canvas = document.createElement("canvas");
    canvas.classList.add("dust-layer");
    digWrapper.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    // Définition de la couleur de la couche
    if (i === 0) {
        ctx.fillStyle = "rgba(169, 139, 92, 1)";  // Couleur terre
    } else {
        ctx.fillStyle = `rgba(169, 139, 92, ${1 - i * 0.15})`;  // Couche plus claire pour les couches inférieures
    }

    canvas.width = digWrapper.clientWidth;
    canvas.height = digWrapper.clientHeight;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    layers.push({ canvas, ctx });
}

window.addEventListener("resize", () => {
    layers.forEach(({ canvas, ctx }, i) => {
        canvas.width = digWrapper.clientWidth;
        canvas.height = digWrapper.clientHeight;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
});

// Fonction pour effacer les couches lors de l'utilisation du pinceau
let fading = false;
function fadeAllDustLayers() {
    fading = true;
    let step = 0;

    function fadeStep() {
        layers.slice(1).forEach(({ ctx, canvas }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 0.02 * step;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });

        step++;
        if (step < 50) {
            requestAnimationFrame(fadeStep);
        } else {
            fading = false;
        }
    }

    fadeStep();
}

// PINCEAU = CREUSER CERCLES
digWrapper.addEventListener("mousemove", (e) => {
    if (currentTool !== "brush" || e.buttons !== 1) return;

    const rect = digWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    createDustEffect(x, y);

    // On efface des couches de haut en bas
    for (let i = layerCount - 1; i > 0; i--) {
        const { ctx } = layers[i];
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        if (pixel[3] > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.clip();
            ctx.clearRect(x - 30, y - 30, 60, 60);
            ctx.restore();
            break; // Ne creuse qu'une couche à la fois
        }
    }
});

// Fonction pour créer l'effet de poussière lors du creusage avec le pinceau
function createDustEffect(x, y) {
    const dust = document.createElement("div");
    dust.className = "dust";
    dust.style.left = `${x - 10}px`;
    dust.style.top = `${y - 10}px`;
    digWrapper.appendChild(dust);
    setTimeout(() => dust.remove(), 500);
}

// LOADER DES DOSSIERS
fetch("public/projects.json")
    .then((res) => res.json())
    .then((projects) => {
        projects.forEach((p) => {
            const folder = document.createElement("div");
            folder.className = "folder";
            folder.textContent = `📁 ${p.name}`;
            folder.dataset.projectPath = p.path;
            folder.dataset.isEmpty = p.isEmpty;

            const x = Math.random() * (digWrapper.clientWidth - 100);
            const y = Math.random() * (digWrapper.clientHeight - 50);
            folder.style.left = `${x}px`;
            folder.style.top = `${y}px`;

            digWrapper.appendChild(folder);
            makeDraggable(folder);

            folder.onclick = () => {
                if (folder.dataset.isEmpty === "true") {
                    openFakeWindow(folder);
                } else {
                    alert(`Ouvrir le projet situé à ${folder.dataset.projectPath}`);
                }
            };
        });
    });

// DRAG AND DROP
function makeDraggable(elem) {
    let offsetX = 0, offsetY = 0;

    elem.addEventListener("mousedown", (e) => {
        if (elem.classList.contains("in-storage")) return;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        elem.style.zIndex = 1000;

        const move = (e) => {
            elem.style.left = `${e.pageX - offsetX}px`;
            elem.style.top = `${e.pageY - offsetY}px`;
        };

        const stop = (e) => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", stop);
            if (isInsideStorage(e.pageX, e.pageY)) {
                elem.style.position = "static";
                storageZone.appendChild(elem);
                elem.classList.add("in-storage");
            }
        };

        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", stop);
    });
}

function isInsideStorage(x, y) {
    const rect = storageZone.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function openFakeWindow(folder) {
    const window = document.createElement("div");
    window.className = "fake-window";
    window.innerHTML = `
        <div class="window-header">
            <span>${folder.textContent}</span>
            <button class="close-btn">✖</button>
        </div>
        <div class="window-body"></div>
    `;
    document.body.appendChild(window);

    window.querySelector(".close-btn").onclick = () => window.remove();
}

const storageZone = document.getElementById("storage");

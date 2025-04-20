const brushBtn = document.getElementById("brush");
const handBtn = document.getElementById("hand");
const bucketBtn = document.getElementById("bucket");

let currentTool = "brush"; // Définir l'outil initial comme pinceau
let dustLayers = []; // Tableau pour stocker les différentes couches de poussière
let maxDustOpacity = 0.5; // Opacité maximale de la poussière
let currentDustOpacity = 0.5; // Opacité actuelle de la poussière

// Sélection de l'outil pinceau
brushBtn.onclick = () => {
    currentTool = "brush";
    brushBtn.classList.add("active");
    handBtn.classList.remove("active");
    bucketBtn.classList.remove("active");
};

// Sélection de l'outil main
handBtn.onclick = () => {
    currentTool = "hand";
    handBtn.classList.add("active");
    brushBtn.classList.remove("active");
    bucketBtn.classList.remove("active");
};

// Sélection de l'outil sceau
bucketBtn.onclick = (e) => {
    currentTool = "bucket";
    bucketBtn.classList.add("active");
    brushBtn.classList.remove("active");
    handBtn.classList.remove("active");

    // Créer le ripple
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    const rect = bucketBtn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = ripple.style.height = "100px";

    bucketBtn.appendChild(ripple);

    // Supprimer après l'animation
    setTimeout(() => {
        ripple.remove();
    }, 600);

    // Déclencher le fondu de la poussière
    if (!fading) {
        fadeDust();
    }

    // Révéler les dossiers
    document.querySelectorAll(".folder").forEach((folder) => {
        setTimeout(() => {
            folder.dataset.revealed = "true";
            folder.classList.add("revealed");
        }, 50);
    });
};

let dustOpacity = 1; // Opacité initiale de la poussière
let fading = false;

// Fonction pour appliquer le fondu
function fadeDust() {
    if (dustOpacity <= 0) return;
    fading = true;
    dustOpacity -= 0.01; // Diminue progressivement l'opacité de la poussière
    ctx.globalAlpha = dustOpacity;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Applique la poussière avec opacité réduite

    if (dustOpacity > 0) {
        requestAnimationFrame(fadeDust); // Répéter l'animation
    } else {
        fading = false; // Une fois le fondu terminé
    }
}

// Fonction pour créer un effet de poussière à l'endroit où la souris passe
function createDustEffect(x, y) {
    const dust = document.createElement('div');
    dust.classList.add('dust'); // Assure-toi d'ajouter une classe pour la poussière
    dust.style.left = `${x - 10}px`;  // Un léger décalage pour centrer la poussière
    dust.style.top = `${y - 10}px`;
    dust.style.animation = "dustEffect 0.5s forwards"; // Animation pour faire disparaître la poussière

    document.body.appendChild(dust);

    // Supprimer l'élément de poussière après l'animation
    setTimeout(() => {
        dust.remove();
    }, 500);
}

// Zone de fouille
const canvas = document.getElementById("dustLayer");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 330;
canvas.height = window.innerHeight;

// Ajouter un dégradé clair pour la poussière
function createDustGradient() {
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#a98b5c"); // Couleur foncée pour le bas
    gradient.addColorStop(1, "#f2e2c4"); // Couleur claire pour le haut
    return gradient;
}

// Fonction pour dessiner les couches de poussière
function addDustLayer(x, y) {
    let dustLayer = document.createElement('canvas');
    dustLayer.width = canvas.width;
    dustLayer.height = canvas.height;
    let dustCtx = dustLayer.getContext("2d");

    // Créer un dégradé pour la poussière
    dustCtx.fillStyle = createDustGradient();
    dustCtx.globalAlpha = currentDustOpacity;
    dustCtx.beginPath();
    dustCtx.arc(x, y, 30, 0, Math.PI * 2);
    dustCtx.fill();

    dustLayers.push(dustLayer);
    currentDustOpacity = Math.max(0.1, currentDustOpacity - 0.1); // Réduire l'intensité de la poussière

    // Ajouter la poussière au canvas principal
    ctx.drawImage(dustLayer, 0, 0);
}

// Fonction pour créer un dégradé de poussière clair avec le sceau
function fillWithDust() {
    ctx.fillStyle = createDustGradient();
    ctx.globalAlpha = 1; // Rétablir l'opacité de remplissage
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Remplir le fond avec un dégradé
}

// Mise à jour du canvas lors du redimensionnement
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth - 330;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Réinitialiser le canvas
    fillWithDust(); // Garder la couleur de fond claire
});

// Gestion de la fouille (avec le pinceau)
canvas.addEventListener("mousemove", (e) => {
    if (currentTool === "brush" && e.buttons === 1) {
        // Ajouter plusieurs couches de poussière
        addDustLayer(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }
});

// Fonction pour gérer le déplacement des dossiers
function makeDraggable(elem) {
    let initialX = 0;
    let initialY = 0;

    elem.addEventListener("mousedown", (e) => {
        initialX = e.offsetX;
        initialY = e.offsetY;
        elem.style.zIndex = 1000;

        function move(e) {
            elem.style.left = e.pageX - initialX + "px";
            elem.style.top = e.pageY - initialY + "px";
        }

        function stop(e) {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", stop);

            if (isInsideStorage(e.pageX, e.pageY)) {
                elem.style.position = "static";
                elem.style.zIndex = "auto"; // Remettre son z-index normal
                storageZone.appendChild(elem);
                elem.classList.add("in-storage");
            }
        }

        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", stop);
    });
}

// Zone de stockage
const storageZone = document.getElementById("storage");

function isInsideStorage(x, y) {
    const rect = storageZone.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function openFolder(name) {
    alert(`📂 Contenu de ${name}`);
}

const brushBtn = document.getElementById("brush");
const handBtn = document.getElementById("hand");
let currentTool = "brush";

// Outils sélection
brushBtn.onclick = () => {
    currentTool = "brush";
    brushBtn.classList.add("active");
    handBtn.classList.remove("active");
};

handBtn.onclick = () => {
    currentTool = "hand";
    brushBtn.classList.remove("active");
    handBtn.classList.add("active");
};

const bucketBtn = document.getElementById("bucket");

bucketBtn.onclick = () => {
    currentTool = "bucket";
    bucketBtn.classList.add("active");
    brushBtn.classList.remove("active");
    handBtn.classList.remove("active");

    // Déclenche l'animation de fondu pour tout révéler
    if (!fading) {
        fadeDust();
    }

    // Révéler tous les dossiers progressivement pendant le fondu
    document.querySelectorAll(".folder").forEach((folder) => {
        setTimeout(() => {
            folder.dataset.revealed = "true";
            folder.classList.add("revealed");
        }, 50); // Délai pour une révélation progressive des dossiers
    });
};

folder.onclick = () => {
    alert(`Ouvrir le projet situé à ${folder.dataset.projectPath}`);
    // Tu peux afficher les fichiers spécifiques à ce projet, ou le charger dans une nouvelle fenêtre/section
};

let dustOpacity = 1; // opacité initiale de la poussière
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

fetch('projects.json')
    .then(response => response.json())
    .then(projects => {
        projects.forEach(project => {
            const folder = document.createElement('div');
            folder.className = 'folder';
            folder.textContent = `📁 ${project.name}`;
            folder.dataset.projectPath = project.path; // Enregistrer le chemin du projet
            folder.dataset.isEmpty = project.isEmpty; // Enregistrer si le dossier est vide

            // Position aléatoire des dossiers
            const x = Math.random() * (canvas.width - 100);
            const y = Math.random() * (canvas.height - 50);
            folder.style.left = `${x}px`;
            folder.style.top = `${y}px`;

            document.getElementById('digZoneWrapper').appendChild(folder);

            makeDraggable(folder);

            // Ajouter un événement au clic pour ouvrir un dossier
            folder.onclick = () => {
                if (folder.dataset.isEmpty === 'true') {
                    showErrorAnimation(folder);
                } else {
                    alert(`Ouvrir le projet situé à ${folder.dataset.projectPath}`);
                    // Tu peux ici ouvrir une nouvelle vue, une fenêtre modale, ou d'autres informations sur le projet
                }
            };
        });
    });

// Fonction pour afficher une animation d'erreur
function showErrorAnimation(folder) {
    folder.classList.add('error-animation'); // Ajouter une classe pour l'animation

    // Ajouter un message d'erreur après un délai pour l'animation
    setTimeout(() => {
        alert(`Le dossier ${folder.textContent} est vide !`);
        folder.classList.remove('error-animation'); // Supprimer la classe après l'animation
    }, 1000); // Attendre 1 seconde pour la fin de l'animation
}

// Zone de fouille
const canvas = document.getElementById("dustLayer");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 330;
canvas.height = window.innerHeight;

// Couche de poussière
ctx.fillStyle = "#a98b5c";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Grattage
canvas.addEventListener("mousemove", (e) => {
    if (currentTool !== "brush" || e.buttons !== 1) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(e.offsetX, e.offsetY, 30, 0, Math.PI * 2);
    ctx.fill();
    revealFolders(e.offsetX, e.offsetY);
    ctx.globalCompositeOperation = "source-over";
});

// Création des dossiers
fetch("projects.json")
    .then((res) => res.json())
    .then((projects) => {
        folder.dataset.name = project.name;
        const digZone = document.getElementById("digZoneWrapper");

        projects.forEach((project, i) => {
            const folder = document.createElement("div");
            folder.className = "folder";
            folder.textContent = "📁 " + project.name;

            const x = Math.random() * (canvas.width - 100);
            const y = Math.random() * (canvas.height - 50);

            folder.style.left = x + "px";
            folder.style.top = y + "px";

            folder.dataset.x = x;
            folder.dataset.y = y;
            folder.dataset.revealed = "false";

            makeDraggable(folder);
            digZone.appendChild(folder);
        });
    });

function revealFolders(x, y) {
    document.querySelectorAll(".folder").forEach((folder) => {
        const fx = parseFloat(folder.dataset.x);
        const fy = parseFloat(folder.dataset.y);

        const dx = fx - x;
        const dy = fy - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 50 && folder.dataset.revealed === "false") {
            folder.dataset.revealed = "true";
            folder.classList.add("revealed");
        }
    });
}

// Déplacement des dossiers avec la main
function makeDraggable(elem) {
    let offsetX = 0;
    let offsetY = 0;

    elem.addEventListener("mousedown", (e) => {
        if (currentTool !== "hand" || elem.dataset.revealed !== "true") return;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        elem.style.zIndex = 1000;

        function move(e) {
            elem.style.left = e.pageX - offsetX + "px";
            elem.style.top = e.pageY - offsetY + "px";
        }

        function stop(e) {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", stop);

            if (isInsideStorage(e.pageX, e.pageY)) {
                elem.style.position = "static";
                elem.style.zIndex = "auto";
                storageZone.appendChild(elem);
                elem.classList.add("in-storage");
                elem.onclick = () => openFolder(elem.dataset.name);
            }
        }

        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", stop);
    });
}

const storageZone = document.getElementById("storage");

function isInsideStorage(x, y) {
    const rect = storageZone.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function openFolder(name) {
    alert(`📂 Contenu de ${name}\n(Tu pourras bientôt afficher les fichiers ici 😄)`);
}
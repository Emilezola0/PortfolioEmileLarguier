const brushBtn = document.getElementById("brush");
const handBtn = document.getElementById("hand");
const bucketBtn = document.getElementById("bucket");

let currentTool = "brush"; // Définir l'outil initial comme pinceau

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

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth - 330;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Réinitialiser le canvas
    ctx.fillStyle = "#a98b5c"; // Redessiner la couche de poussière
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// Ajout des dossiers à partir du fichier JSON
fetch('public/projects.json')
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
                }
            };
        });
    })
    .catch((error) => {
        console.error('Erreur lors du chargement des projets :', error);
    });

// Fonction pour gérer le déplacement des dossiers
let offsetX = 0;
let offsetY = 0;
function makeDraggable(elem) {
    let initialX = 0;
    let initialY = 0;

    elem.addEventListener("mousedown", (e) => {
        // Empêcher le drag sur un dossier déjà dans le stockage
        if (elem.classList.contains('in-storage')) return;

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

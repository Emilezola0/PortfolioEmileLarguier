let currentTool = null;
let money = 0;
const digZone = document.getElementById('dig-zone');
const sellDrop = document.getElementById('sell-drop');
const moneyDisplay = document.getElementById('money');

// ---- OUTILS
document.getElementById('shovel').addEventListener('click', () => setTool('shovel'));
document.getElementById('brush').addEventListener('click', () => setTool('brush'));
document.getElementById('hand').addEventListener('click', () => setTool('hand'));

function setTool(tool) {
    currentTool = tool;

    // Retirer la classe "selected" et "ripple" de tous les outils
    document.querySelectorAll('.tool').forEach(t => {
        t.classList.remove('selected', 'ripple');
    });

    // Ajouter la classe à l'outil actif
    const activeTool = document.getElementById(tool);
    activeTool.classList.add('selected');

    // Ajouter effet ripple temporairement
    activeTool.classList.add('ripple');
    setTimeout(() => activeTool.classList.remove('ripple'), 600);
}

// ---- AFFICHER LES PROJETS
fetch('/public/projects.json')
    .then(res => res.json())
    .then(data => {
        const bar = document.getElementById('project-bar');
        data.projects.forEach(proj => {
            const div = document.createElement('div');
            div.className = 'project';
            div.textContent = proj.name;
            div.addEventListener('click', () => alert(`Projet ${proj.name} ouvert`));
            bar.appendChild(div);
        });
    });

// ---- CREUSER (PELLE)
digZone.addEventListener('click', (e) => {
    if (currentTool !== 'shovel') return;

    const { clientX, clientY } = e;
    const rect = digZone.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Afficher un trou visuel
    const hole = document.createElement('div');
    hole.className = 'hole';
    hole.style.left = `${x}px`;
    hole.style.top = `${y}px`;
    digZone.appendChild(hole);

    // Apparition aléatoire d’un minerai
    const mineral = generateMineral();
    if (mineral) {
        mineral.style.left = `${x}px`;
        mineral.style.top = `${y}px`;
        digZone.appendChild(mineral);
    }
});

// ---- GÉNÉRATION DES MINÉRAUX
function generateMineral() {
    const r = Math.random();
    let type = null;
    if (r < 0.5) type = 'stone';
    else if (r < 0.75) type = 'iron';
    else if (r < 0.9) type = 'gold';
    else if (r < 0.98) type = 'diamond';
    else return null;

    const mineral = document.createElement('img');
    mineral.src = `assets/minerals/${type}.png`;
    mineral.className = 'mineral';
    mineral.dataset.type = type;

    return mineral;
}

// ---- MAIN : SUIVI DU MINÉRAL À LA SOURIS
let draggedMineral = null;

digZone.addEventListener('mousedown', (e) => {
    if (currentTool !== 'hand') return;

    if (e.target.classList.contains('mineral')) {
        draggedMineral = e.target;
        draggedMineral.style.pointerEvents = 'none';
        draggedMineral.style.position = 'fixed';
        moveWithMouse(e);
    }
});

document.addEventListener('mousemove', (e) => {
    if (draggedMineral) moveWithMouse(e);
});

document.addEventListener('mouseup', (e) => {
    if (!draggedMineral) return;

    const sellRect = sellDrop.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
        x > sellRect.left && x < sellRect.right &&
        y > sellRect.top && y < sellRect.bottom
    ) {
        // VENDRE
        const type = draggedMineral.dataset.type;
        let value = 0;
        switch (type) {
            case 'stone': value = 1; break;
            case 'iron': value = 5; break;
            case 'gold': value = 10; break;
            case 'diamond': value = 50; break;
        }
        money += value;
        moneyDisplay.textContent = money;
        draggedMineral.remove();
    } else {
        // LE REPOSER DANS LA ZONE
        const digRect = digZone.getBoundingClientRect();
        const relX = x - digRect.left;
        const relY = y - digRect.top;
        draggedMineral.style.left = `${relX}px`;
        draggedMineral.style.top = `${relY}px`;
        draggedMineral.style.position = 'absolute';
        digZone.appendChild(draggedMineral);
    }

    draggedMineral.style.pointerEvents = 'auto';
    draggedMineral = null;
});

function moveWithMouse(e) {
    draggedMineral.style.left = `${e.clientX - 20}px`;
    draggedMineral.style.top = `${e.clientY - 20}px`;
}

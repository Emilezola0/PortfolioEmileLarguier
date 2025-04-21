let currentTool = null;
let money = 0;
const digZone = document.getElementById('dig-zone');
const digCover = document.getElementById('dig-cover');
const sellDrop = document.getElementById('sell-drop');
const moneyDisplay = document.getElementById('money');

// Outils
document.getElementById('shovel').addEventListener('click', () => setTool('shovel'));
document.getElementById('brush').addEventListener('click', () => setTool('brush'));
document.getElementById('hand').addEventListener('click', () => setTool('hand'));

function setTool(tool) {
    currentTool = tool;

    document.querySelectorAll('.tool').forEach(t => {
        t.classList.remove('selected');
        const ripple = t.querySelector('.ripple');
        if (ripple) ripple.remove();
    });

    const activeTool = document.getElementById(tool);
    activeTool.classList.add('selected');

    activeTool.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = activeTool.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        activeTool.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }, { once: true });
}

// Chargement des projets
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

// Génération de minerais à l'initialisation
function generateBackgroundMinerals() {
    const background = document.getElementById('dig-background');
    const width = background.offsetWidth;
    const height = background.offsetHeight;

    for (let i = 0; i < 30; i++) {
        const mineral = generateMineral();
        if (!mineral) continue;

        mineral.style.left = `${Math.random() * width}px`;
        mineral.style.top = `${Math.random() * height}px`;
        mineral.style.position = 'absolute';
        background.appendChild(mineral);
    }
}

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

window.addEventListener('DOMContentLoaded', generateBackgroundMinerals);

// Creusage (fouille visuelle)
digZone.addEventListener('click', (e) => {
    if (currentTool !== 'shovel') return;

    const { clientX, clientY } = e;
    const rect = digZone.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const reveal = document.createElement('div');
    reveal.className = 'reveal-spot';
    reveal.style.left = `${x}px`;
    reveal.style.top = `${y}px`;
    digCover.appendChild(reveal);
});

// Main pour déplacer minerais
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

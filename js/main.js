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
    console.log("Outil sélectionné :", tool);
}

// ---- PROJETS
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

// ---- ZONE DE FOUILLE
digZone.addEventListener('click', (e) => {
    if (currentTool !== 'shovel') return;
    const { offsetX, offsetY } = e;
    const mineral = generateMineral();
    if (mineral) {
        mineral.style.left = `${offsetX}px`;
        mineral.style.top = `${offsetY}px`;
        digZone.appendChild(mineral);
    }
});

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
    mineral.setAttribute('draggable', true);

    mineral.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('type', type);
        e.target.remove();
    });

    return mineral;
}

// ---- ZONE DE VENTE
sellDrop.addEventListener('dragover', (e) => e.preventDefault());
sellDrop.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    let value = 0;
    switch (type) {
        case 'stone': value = 1; break;
        case 'iron': value = 5; break;
        case 'gold': value = 10; break;
        case 'diamond': value = 50; break;
    }
    money += value;
    moneyDisplay.textContent = money;
});

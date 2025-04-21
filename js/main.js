let currentTool = null;
let digging = false;

// S�lection des outils
const shovel = document.getElementById('shovel');
const brush = document.getElementById('brush');
const hand = document.getElementById('hand');

const soil = document.getElementById('soil');
const storage = document.getElementById('storage');

// Fonction de changement d'outil
shovel.addEventListener('click', () => setTool('shovel'));
brush.addEventListener('click', () => setTool('brush'));
hand.addEventListener('click', () => setTool('hand'));

function setTool(tool) {
    currentTool = tool;
    updateToolAppearance();
}

function updateToolAppearance() {
    shovel.style.opacity = currentTool === 'shovel' ? 1 : 0.5;
    brush.style.opacity = currentTool === 'brush' ? 1 : 0.5;
    hand.style.opacity = currentTool === 'hand' ? 1 : 0.5;
}

// Gestion des �v�nements sur la zone de fouille
soil.addEventListener('click', (e) => {
    if (currentTool === 'brush') {
        // Logic de creuser � l'endroit cliqu�
        digAt(e.offsetX, e.offsetY);
    } else if (currentTool === 'shovel') {
        // R�v�ler tous les dossiers d'un coup
        revealAll();
    }
});

function digAt(x, y) {
    // Animation de creusage � l'endroit pr�cis
    const hole = document.createElement('div');
    hole.style.position = 'absolute';
    hole.style.left = `${x}px`;
    hole.style.top = `${y}px`;
    hole.style.width = '50px';
    hole.style.height = '50px';
    hole.style.backgroundColor = '#9e7b53';
    hole.style.borderRadius = '50%';
    soil.appendChild(hole);

    // Logique pour afficher un dossier d�couvert
    if (Math.random() > 0.7) { // D�tection al�atoire d'un dossier
        const project = createProject();
        storage.appendChild(project);
    }
}

function revealAll() {
    // D�voiler tous les dossiers � la fois
    const project = createProject();
    storage.appendChild(project);
}

function createProject() {
    const project = document.createElement('div');
    project.classList.add('project');
    project.textContent = 'Dossier D�couvert';
    project.setAttribute('draggable', 'true');
    project.addEventListener('dragstart', dragStart);
    return project;
}

// Fonction de gestion du drag and drop
function dragStart(e) {
    e.dataTransfer.setData('text', e.target.textContent);
}

storage.addEventListener('dragover', (e) => {
    e.preventDefault();
});

storage.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text');
    const droppedElement = document.createElement('div');
    droppedElement.textContent = data;
    storage.appendChild(droppedElement);
});

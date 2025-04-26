// Variables
export let gamePaused = false;

// Elements
const pauseButton = document.getElementById('pauseButton');
const pauseOverlay = document.getElementById('pauseOverlay');
const resumeButton = document.getElementById('resumeButton');
const planetContainer = document.getElementById('planetContainer');
const pauseMenu = document.getElementById('pauseMenu'); // <<< Important

// Creation du bouton Restart
const restartButton = document.createElement('button');
restartButton.textContent = 'Restart Game';
restartButton.style.padding = '10px 20px';
restartButton.style.fontFamily = 'PressStart2P, monospace';
restartButton.style.fontSize = '12px';
restartButton.style.color = '#00ffcc';
restartButton.style.background = 'black';
restartButton.style.border = '2px solid #00ffcc';
restartButton.style.borderRadius = '8px';
restartButton.style.cursor = 'pointer';
restartButton.style.marginTop = '10px';
restartButton.style.transition = 'all 0.2s ease';

restartButton.addEventListener('mouseover', () => {
    restartButton.style.background = '#00ffcc';
    restartButton.style.color = 'black';
});
restartButton.addEventListener('mouseout', () => {
    restartButton.style.background = 'black';
    restartButton.style.color = '#00ffcc';
});

// Action quand on clique sur Restart
restartButton.addEventListener('click', () => {
    SoundManager.play('click');
    window.location.reload();
});

pauseMenu.appendChild(restartButton);

// Event : Cliquer sur Pause
pauseButton.addEventListener('click', () => {
    SoundManager.play('click');
    gamePaused = true;
    pauseOverlay.classList.remove('hidden');
});

// Event : Cliquer sur Reprendre
resumeButton.addEventListener('click', () => {
    SoundManager.play('click');
    gamePaused = false;
    pauseOverlay.classList.add('hidden');
});

// Generation dynamique des planetes avec PlanetsManager
// Centre du cercle
const centerX = 0;
const centerY = 0;
// Rayon du cercle
const radius = 10;

// Nombre total de planètes
const totalPlanets = projects.length;

let projects = [];

fetch('./projects.json')
    .then(response => response.json())
    .then(data => {
        projects = data;
        projects.forEach((proj, index) => {
            // Calcule l'angle pour chaque planète
            const angle = (index / totalPlanets) * 2 * Math.PI; // de 0 to 2pi

            // Position en cercle
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            // Instancie ta planete
            const planet = new Planet(x, y, proj.name, proj.JsName, proj.planetStyle || {});
        });
    })
    .catch(error => {
        console.error("Erreur de chargement de projects.json :", error);
    });

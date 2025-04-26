// Variables
export let gamePaused = false;

// Elements
const pauseButton = document.getElementById('pauseButton');
const pauseOverlay = document.getElementById('pauseOverlay');
const resumeButton = document.getElementById('resumeButton');
const planetContainer = document.getElementById('planetContainer');
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

// Action quand on clique
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

// Liste des planètes et liens (à adapter à tes projets)
const planets = [
    { name: 'Projet A', link: 'https://exemple-projet-a.com' },
    { name: 'Projet B', link: 'https://exemple-projet-b.com' },
    { name: 'Projet C', link: 'https://exemple-projet-c.com' },
];

// Génération dynamique des planètes
planets.forEach(planet => {
    const planetElement = document.createElement('div');
    planetElement.className = 'planet';
    planetElement.title = planet.name;
    planetElement.addEventListener('click', () => {
        window.open(planet.link, '_blank');
    });
    planetContainer.appendChild(planetElement);
});

// Variables
export let gamePaused = false;

// Elements
const pauseButton = document.getElementById('pauseButton');
const pauseOverlay = document.getElementById('pauseOverlay');
const resumeButton = document.getElementById('resumeButton');
const planetContainer = document.getElementById('planetContainer');

// Event : Cliquer sur Pause
pauseButton.addEventListener('click', () => {
    gamePaused = true;
    pauseOverlay.classList.remove('hidden');
});

// Event : Cliquer sur Reprendre
resumeButton.addEventListener('click', () => {
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

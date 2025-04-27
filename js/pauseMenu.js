// Canvas
const canvas = document.getElementById("planetCanvas");
const ctx = canvas.getContext("2d");

// pauseMenu.js
import { SoundManager } from './SoundManager.js';
import { Planet } from './Planet.js';
import { resumeGame } from './main.js';

export let gamePaused = false;

// On garde une référence des planètes générées pour pouvoir les supprimer après
let generatedPlanets = [];

// Setup du pause menu
export function setupPauseMenu() {
    const pauseButton = document.getElementById('pauseButton');
    const pauseOverlay = document.getElementById('pauseOverlay');
    const resumeButton = document.getElementById('resumeButton');
    const planetContainer = document.getElementById('planetContainer');
    const pauseMenu = document.getElementById('pauseMenu');

    // Création du bouton Restart
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart Game';
    restartButton.classList.add('restart-button');

    restartButton.addEventListener('mouseover', () => {
        restartButton.style.background = '#00ffcc';
        restartButton.style.color = 'black';
    });
    restartButton.addEventListener('mouseout', () => {
        restartButton.style.background = 'black';
        restartButton.style.color = '#00ffcc';
    });
    restartButton.addEventListener('click', () => {
        SoundManager.play('click');
        window.location.reload();
    });

    if (pauseMenu) {
        pauseMenu.appendChild(restartButton);
    }

    let projects = [];

    // Fetch les projets une fois
    fetch('public/projects.json')
        .then(response => response.json())
        .then(data => {
            projects = data;
        })
        .catch(error => {
            console.error("Erreur de chargement de projects.json :", error);
        });

    // Event : Cliquer sur Pause
    pauseButton.addEventListener('click', () => {
        SoundManager.play('click');
        gamePaused = true;
        pauseOverlay.classList.remove('hidden');

        // generate planet when pause
        generatePlanets(projects);
    });

    // Event : Cliquer sur Reprendre
    resumeButton.addEventListener('click', () => {
        SoundManager.play('click');
        gamePaused = false;
        resumeGame();
        pauseOverlay.classList.add('hidden');

        // Retire toutes les planètes quand on reprend
        removeGeneratedPlanets();
    });

    function generatePlanets(projects) {
        console.log("generate planet");

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 150; // Plus grand pour bien séparer les planètes

        const totalPlanets = projects.length;

        projects.forEach((proj, index) => {
            const angle = (index / totalPlanets) * 2 * Math.PI;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const planet = new Planet(x, y, proj.name, proj.JsName, proj.planetStyle || {});
            generatedPlanets.push(planet);
        });
    }

    function removeGeneratedPlanets() {
        generatedPlanets.forEach(planet => {
            if (planet && planet.remove) {
                planet.remove(); // <- Assure-toi que ton objet Planet a une méthode remove() pour bien nettoyer
            }
        });
        generatedPlanets = [];
    }
}

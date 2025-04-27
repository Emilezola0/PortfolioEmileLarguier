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
        animatePlanets();
    });

    // Event : Cliquer sur Reprendre
    resumeButton.addEventListener('click', () => {
        SoundManager.play('click');
        gamePaused = false;
        resumeGame();
        pauseOverlay.classList.add('hidden');

        // Retire toutes les planetes quand on reprend
        removeGeneratedPlanets();
    });

    function generatePlanets(projects) {
        console.log("generate planet");

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 150;

        const totalPlanets = projects.length;

        projects.forEach((proj, index) => {
            const angle = (index / totalPlanets) * 2 * Math.PI;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const planet = new Planet(x, y, proj.name, proj.JsName, proj.planetStyle || {});
            planet.orbitRadius = radius;
            planet.orbitAngle = angle;
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

    function animatePlanets() {
        if (!gamePaused) return; // Stop si pas en pause

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let planet of generatedPlanets) {
            planet.update(ctx);
            planet.draw(ctx);
        }

        requestAnimationFrame(animatePlanets);
    }
}

let mouse = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
    if (!gamePaused) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    for (let planet of generatedPlanets) {
        if (planet.isHovered(mouse.x, mouse.y)) {
            planet.handleClick(mouse);
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (!gamePaused) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    for (let planet of generatedPlanets) {
        if (planet.isHovered(mouse.x, mouse.y)) {
            planet.handleMouseUp(mouse);
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!gamePaused) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    for (let planet of generatedPlanets) {
        planet.hovered = planet.isHovered(mouse.x, mouse.y);
    }
});

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Appel immediat au chargement

// pauseMenu.js
import { SoundManager } from './SoundManager.js';
import { Planet } from './Planet.js';
import { resumeGame } from './main.js';
import { PROJECTS } from './data/projects.js';
import { tr, applyStaticTexts } from './i18n.js';

// Canvas
const canvas = document.getElementById("planetCanvas");
const ctx = canvas.getContext("2d");

export let gamePaused = false;

// Planets shown while paused (removed on resume)
let generatedPlanets = [];

export function setupPauseMenu() {
    const pauseButton = document.getElementById('pauseButton');
    const pauseOverlay = document.getElementById('pauseOverlay');
    const resumeButton = document.getElementById('resumeButton');
    const pauseMenu = document.getElementById('pauseMenu');

    // Restart button
    const restartButton = document.createElement('button');
    restartButton.dataset.i18n = 'restart';
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
        applyStaticTexts();
    }

    pauseButton.addEventListener('click', () => {
        SoundManager.play('click');
        gamePaused = true;
        pauseOverlay.classList.remove('hidden');
        resizeCanvas();

        generatePlanets();
        animatePlanets();
    });

    resumeButton.addEventListener('click', () => {
        SoundManager.play('click');
        gamePaused = false;
        resumeGame();
        pauseOverlay.classList.add('hidden');
        generatedPlanets = [];
    });

    function generatePlanets() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const radius = 250;

        generatedPlanets = PROJECTS.map((proj, index) => {
            const angle = (index / PROJECTS.length) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const planet = new Planet(x, y, tr(proj.name), proj.id, proj.planet || {});
            planet.orbitRadius = radius;
            planet.orbitAngle = angle;
            return planet;
        });
    }

    function animatePlanets() {
        if (!gamePaused) return;

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
resizeCanvas();

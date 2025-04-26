import { Planet } from './Planet.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const planets = [];

planets.push(new Planet(100, 200, "Projet A", "a"));
planets.push(new Planet(300, 250, "Projet B", "b"));
planets.push(new Planet(500, 180, "Projet C", "c"));

let draggingPlanet = null;
let offsetX, offsetY;

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    planets.forEach(planet => {
        if (planet.isHovered(mouse.x, mouse.y)) {
            draggingPlanet = planet;
            offsetX = mouse.x - planet.x;
            offsetY = mouse.y - planet.y;
        }
    });
});

canvas.addEventListener('mouseup', (e) => {
    if (draggingPlanet) {
        draggingPlanet = null;
    } else {
        const rect = canvas.getBoundingClientRect();
        const mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };

        planets.forEach(planet => {
            if (planet.isHovered(mouse.x, mouse.y)) {
                planet.handleClick();
            }
        });
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (draggingPlanet) {
        const rect = canvas.getBoundingClientRect();
        const mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };

        draggingPlanet.x = mouse.x - offsetX;
        draggingPlanet.y = mouse.y - offsetY;
    }
});

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    planets.forEach(planet => {
        planet.update();
        planet.draw(ctx);
    });

    requestAnimationFrame(loop);
}

loop();

// mobTypes.js

export const mobTypes = {
    basic: [
        {
            name: "Mine",
            speed: 0.8,          // Un peu plus lent que basique
            scale: 1.0,
            hp: 12,              // Fragile mais pas 1-shot
            nutrition: 2,
            scrap: 1,
            color: "white",
            sprite: "mine.png"
        },
        {
            name: "Big Scrap",
            speed: 1.2,
            scale: 0.9,
            hp: 8,
            nutrition: 1,
            scrap: 2,
            color: "gray",
            sprite: "asteroid.png"
        }
    ],
    fast: [
        {
            name: "Runner",
            speed: 2.0,          // Vraiment rapide
            scale: 0.8,
            hp: 2,
            nutrition: 1,
            scrap: 1,
            color: "cyan",
            sprite: "rocket.png"
        },
        {
            name: "Ovni",
            speed: 2.5,
            scale: 1.0,
            hp: 6,
            nutrition: 5,
            scrap: 4,
            color: "purple",
            sprite: "ufo.png"
        }
    ],
    tank: [
        {
            name: "Big Asteroid",
            speed: 0.4,          // Lourd et lent
            scale: 2.5,          // Très gros
            hp: 30,
            nutrition: 10,
            scrap: 12,
            color: "green",
            sprite: "bigAsteroid.png"
        }
    ]
};

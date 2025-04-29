// mobTypes.js

export const mobTypes = {
    basic: [
        {
            name: "Mine",
            speed: { base: 0.8, max: 2.0 },
            scale: 1.0,
            hp: { base: 12 },
            nutrition: 2,
            scrap: { base: 1 },
            color: "white",
            image: "mine.png",
            growth: {
                hp: { flat: 5 },           // +5 HP par vague
                speed: { percent: 2 },     // +2% par vague
                scrap: { flat: 1 }         // +1 scrap par vague
            }
        },
        {
            name: "Big Scrap",
            speed: { base: 1.2, max: 2.5 },
            scale: 0.9,
            hp: { base: 8 },
            nutrition: 1,
            scrap: { base: 2 },
            color: "gray",
            image: "asteroid.png",
            growth: {
                hp: { percent: 10 },       // +10% par vague
                speed: { flat: 0.05 },
                scrap: { flat: 0.5 }
            }
        }
    ],
    fast: [
        {
            name: "Runner",
            speed: { base: 2.0, max: 3.5 },
            scale: 0.8,
            hp: { base: 2 },
            nutrition: 1,
            scrap: { base: 1 },
            color: "cyan",
            image: "rocket.png",
            growth: {
                hp: { flat: 1 },
                speed: { percent: 1.5 }
            }
        },
        {
            name: "Ovni",
            speed: { base: 2.5, max: 3.5 },
            scale: 1.0,
            hp: { base: 6 },
            nutrition: 5,
            scrap: { base: 4 },
            color: "purple",
            image: "ufo.png",
            growth: {
                hp: { percent: 4 },
                scrap: { flat: 2 }
            }
        }
    ],
    tank: [
        {
            name: "Big Asteroid",
            speed: { base: 0.4, max: 1.5 },
            scale: 2.5,
            hp: { base: 30 },
            nutrition: 10,
            scrap: { base: 12 },
            color: "green",
            image: "bigAsteroid.png",
            growth: {
                hp: { percent: 5 },
                speed: { percent: 2 }
            }
        }
    ]
};

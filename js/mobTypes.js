export const mobTypes = {
    basic: [
        {
            name: "Mine",
            speed: { base: 0.6, max: 1.5 },
            scale: 1.0,
            hp: { base: 2 },
            nutrition: 2,
            scrap: { base: 2 },
            color: "white",
            image: "mine.png",
            growth: {
                hp: { flat: 0.5 },               // croissance douce, reste fragile
                speed: { flat: 0.02 },           // tres leger buff
                scrap: { flat: 1 }
            }
        },
        {
            name: "Big Scrap",
            speed: { base: 0.5, max: 1.5 },
            scale: 0.9,
            hp: { base: 3 },
            nutrition: 1,
            scrap: { base: 3 },
            color: "gray",
            image: "asteroid.png",
            growth: {
                hp: { percent: 10 },             // devient costaud plus tard
                speed: { flat: 0.03 },
                scrap: { flat: 1.5 }
            }
        }
    ],
    fast: [
        {
            name: "Runner",
            speed: { base: 0.9, max: 3 },
            scale: 0.8,
            hp: { base: 1 },
            nutrition: 1,
            scrap: { base: 2 },
            color: "cyan",
            image: "rocket.png",
            growth: {
                hp: { flat: 0.3 },               // reste tres fragile
                speed: { flat: 0.1 },
                scrap: { flat: 1 }
            }
        },
        {
            name: "Ovni",
            speed: { base: 1, max: 3.5 },
            scale: 1.0,
            hp: { base: 2 },
            nutrition: 5,
            scrap: { base: 3 },
            color: "purple",
            image: "ufo.png",
            growth: {
                hp: { percent: 8 },              // devient une menace moderee
                speed: { flat: 0.12 },
                scrap: { flat: 2 }
            }
        }
    ],
    tank: [
        {
            name: "Big Asteroid",
            speed: { base: 0.3, max: 1.5 },
            scale: 2.5,
            hp: { base: 6 },
            nutrition: 10,
            scrap: { base: 10 },
            color: "green",
            image: "bigAsteroid.png",
            growth: {
                hp: { percent: 20 },             // scaling fort : boss
                speed: { flat: 0.02 },
                scrap: { flat: 4 }
            }
        }
    ]
};

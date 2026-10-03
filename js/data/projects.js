// projects.js
// ALL the portfolio content lives here. One block = one planet.
//
// === HOW TO ADD A PROJECT ===
// 1. Put your images in assets/projects/<your-folder>/
// 2. Copy the template below, paste it in the PROJECTS list and fill it in.
//    That's it: the planet, the tab in the project window and the pause menu
//    are all created from this list.
//
//    {
//        id: "my-project",                       // unique, no spaces
//        name: "My project",                     // short name under the planet
//        title: { en: "2025 - My project", fr: "2025 - Mon projet" },
//        planet: { baseColor: "#1e90ff", coreColor: "#ffffff", size: 22 },
//        slides: [
//            {
//                img: "assets/projects/my-project/picture1.png",
//                text: { en: "English text", fr: "Texte français" }
//            },
//            {
//                video: "https://youtu.be/XXXXXXXXXXX",   // YouTube link
//                text: { en: "Trailer", fr: "Bande-annonce" }
//            },
//            {
//                img: "assets/projects/my-project/picture2.png",
//                text: { en: "Play it!", fr: "Jouez-y !" },
//                link: { url: "https://...", label: "itch.io" }   // optional button
//            }
//        ]
//    },
//
// Any text can be { en: "...", fr: "..." } or a plain "..." (same in every language).
// Optional planet settings: floatAmplitude, floatSpeed, rotationSpeed, ringRotationSpeed.

export const PROJECTS = [
    {
        id: "2021",
        name: "Deeplace",
        title: "2021-2022 - Deeplace",
        planet: { baseColor: "#1e90ff", coreColor: "#ffffff", size: 20, floatAmplitude: 0.25, floatSpeed: 0.005, rotationSpeed: 0.0125, ringRotationSpeed: 0.0175 },
        slides: [
            {
                img: "assets/projects/2021/gameplay1.png",
                text: {
                    en: "Deeplace is a game made at LISAA in a team of 12 and developed over 2 months.",
                    fr: "Deeplace est un jeu réalisé à LISAA en équipe de 12, développé en 2 mois."
                }
            },
            {
                img: "assets/projects/2021/gameplay2.png",
                text: {
                    en: "It's a horror game in which you have to cross an abandoned bunker and find your colleagues.",
                    fr: "C'est un jeu d'horreur dans lequel il faut traverser un bunker abandonné et retrouver ses collègues."
                }
            },
            {
                img: "assets/projects/2021/gameplay3.png",
                text: {
                    en: "I was the lead, I also took care of the Game Design, Level Design, System Design, Communication and Programming.",
                    fr: "J'étais le lead, et je me suis aussi occupé du Game Design, du Level Design, du System Design, de la communication et de la programmation."
                }
            }
        ]
    },
    {
        id: "2022",
        name: "Scryptalking",
        title: "2022-2023 - Scryptalking",
        planet: { baseColor: "#00bfff", coreColor: "#f0f8ff", size: 22, floatAmplitude: 0.15, floatSpeed: 0.01, rotationSpeed: 0.01, ringRotationSpeed: 0.0125 },
        slides: [
            {
                img: "assets/projects/2022/gameplay1.png",
                text: {
                    en: "Scryptalking is a game made at LISAA in a team of 12 and developed over 2 months. This game is about debating and persuasion.",
                    fr: "Scryptalking est un jeu réalisé à LISAA en équipe de 12, développé en 2 mois. C'est un jeu de débat et de persuasion."
                }
            },
            {
                img: "assets/projects/2022/gameplay2.png",
                text: {
                    en: "We'll be able to talk to a variety of people and our choices will influence our progress.",
                    fr: "On peut parler à de nombreux personnages, et nos choix influencent notre progression."
                }
            },
            {
                img: "assets/projects/2022/gameplay1.png",
                text: {
                    en: "For this game I was responsible for game design, level design, programming, system design, communication and production.",
                    fr: "Sur ce jeu, j'étais responsable du game design, du level design, de la programmation, du system design, de la communication et de la production."
                }
            },
            {
                img: "assets/projects/2022/gameplay3.png",
                text: {
                    en: "I wanted to add another aspect to the game, beyond simple dialogue, with deck building and card battles.",
                    fr: "Je voulais ajouter une autre dimension au jeu, au-delà du simple dialogue, avec du deck building et des combats de cartes."
                }
            },
            {
                img: "assets/projects/2022/gameplay1.png",
                text: {
                    en: "To play, or look at more info:",
                    fr: "Pour jouer ou en savoir plus :"
                },
                link: { url: "https://emilezola.itch.io/scryptalking", label: "itch.io" }
            }
        ]
    },
    {
        id: "2023",
        name: "Revenge Fantasy",
        title: "2023-2024 - Revenge Fantasy",
        planet: { baseColor: "#ff69b4", coreColor: "#fff0f5", size: 24, floatAmplitude: 0.5, floatSpeed: 0.0125, rotationSpeed: 0.015, ringRotationSpeed: 0.02 },
        slides: [
            {
                img: "assets/projects/2023/gameplay1.png",
                text: {
                    en: "Revenge Fantasy is a game made at LISAA in a team of 12 and developed over 1 year.",
                    fr: "Revenge Fantasy est un jeu réalisé à LISAA en équipe de 12, développé en 1 an."
                }
            },
            {
                img: "assets/projects/2023/gameplay2.png",
                text: {
                    en: "This game is a Fast FPS, you can Jump, Slide, Wall Run.",
                    fr: "C'est un Fast FPS : on peut sauter, glisser et courir sur les murs."
                }
            },
            {
                img: "assets/projects/2023/gameplay3.png",
                text: {
                    en: "You can also use your weapon's special ability against mobs, but also when you're on the move.",
                    fr: "On peut aussi utiliser la capacité spéciale de son arme contre les ennemis, mais aussi pour se déplacer."
                }
            },
            {
                img: "assets/projects/2023/gameplay1.png",
                text: {
                    en: "I was in charge of communication, production, programming, game design, system design, UX, GDD and a bit of LD.",
                    fr: "J'étais en charge de la communication, de la production, de la programmation, du game design, du system design, de l'UX, du GDD et d'un peu de LD."
                }
            },
            {
                video: "https://youtu.be/SPM8yLMVjl0",
                text: { en: "Gameplay Trailer", fr: "Trailer de gameplay" }
            }
        ]
    },
    {
        id: "2024",
        name: "Jusant DLC",
        title: "2024-2025 - Jusant DLC",
        planet: { baseColor: "#ff4500", coreColor: "#ffd580", size: 26, floatAmplitude: 0.5, floatSpeed: 0.015, rotationSpeed: 0.015, ringRotationSpeed: 0.02 },
        slides: [
            {
                img: "assets/projects/2024/gameplay1.png",
                text: {
                    en: "Jusant DLC is a collaboration between LISAA and Don't Nod to create a sequel to Jusant.",
                    fr: "Jusant DLC est une collaboration entre LISAA et Don't Nod pour créer une suite à Jusant."
                }
            },
            {
                img: "assets/projects/2024/gameplay2.png",
                text: {
                    en: "We decided to start with the idea of a rift that we would have to climb with the help of our companion Rak.",
                    fr: "Nous sommes partis de l'idée d'une faille qu'il faudrait escalader avec l'aide de notre compagnon Rak."
                }
            },
            {
                img: "assets/projects/2024/gameplay3.png",
                text: {
                    en: "I took care of the game design, level design, system design, gameplay programming and a few tools to help set up the level design.",
                    fr: "Je me suis occupé du game design, du level design, du system design, de la programmation gameplay et de quelques outils pour faciliter la mise en place du level design."
                }
            },
            {
                video: "https://youtu.be/VVF55Wm70GU",
                text: { en: "Trailer", fr: "Bande-annonce" }
            }
        ]
    },
    {
        id: "Jam",
        name: "Game Jam",
        title: { en: "Game jams from 2021 to 2025", fr: "Game jams de 2021 à 2025" },
        planet: { baseColor: "#228b22", coreColor: "#7fff00", size: 25, floatAmplitude: 0.75, floatSpeed: 0.0175, rotationSpeed: 0.015, ringRotationSpeed: 0.02 },
        slides: [
            {
                video: "https://youtu.be/nnYTXif9Olg",
                text: {
                    en: "Spooder Dance gameplay trailer (game made with 6 people). If you have a controller, try it:",
                    fr: "Trailer de gameplay de Spooder Dance (jeu réalisé à 6). Si vous avez une manette, essayez-le :"
                },
                link: { url: "https://emilezola.itch.io/spooder-dance", label: "itch.io" }
            },
            {
                img: "assets/projects/Jam/arcadeStalker.png",
                text: {
                    en: "Arcade Stalker, a jam game made with my team ABM.",
                    fr: "Arcade Stalker, un jeu de jam réalisé avec mon équipe ABM."
                },
                link: { url: "https://emilezola.itch.io/arcade-stalker", label: "itch.io" }
            },
            {
                img: "assets/projects/Jam/mdl.png",
                text: {
                    en: "Maybe Die Less, a jam game made with ABM.",
                    fr: "Maybe Die Less, un jeu de jam réalisé avec ABM."
                },
                link: { url: "https://emilezola.itch.io/maybe-die-less", label: "itch.io" }
            },
            {
                img: "assets/projects/Jam/slasherHigh.png",
                text: {
                    en: "Slasher Highschool, a game made with ABM.",
                    fr: "Slasher Highschool, un jeu réalisé avec ABM."
                },
                link: { url: "https://emilezola.itch.io/baggy-bag", label: "itch.io" }
            },
            {
                img: "assets/projects/Jam/flammersUnmasked.png",
                text: {
                    en: "Flammers Unmasked, a game made with ABM.",
                    fr: "Flammers Unmasked, un jeu réalisé avec ABM."
                },
                link: { url: "https://emilezola.itch.io/flammers-unmasked", label: "itch.io" }
            },
            {
                img: "assets/projects/Jam/baggyBag.png",
                text: {
                    en: "Made with only game designers, in a team of 4-5 people.",
                    fr: "Réalisé uniquement entre game designers, en équipe de 4-5 personnes."
                },
                link: { url: "https://emilezola.itch.io/baggy-bag", label: "itch.io" }
            }
        ]
    },
    {
        id: "PersoProj",
        name: { en: "Personal projects", fr: "Projets perso" },
        title: { en: "Personal projects", fr: "Projets personnels" },
        planet: { baseColor: "#8a2be2", coreColor: "#dda0dd", size: 22, floatAmplitude: 0.5, floatSpeed: 0.0175, rotationSpeed: 0.015, ringRotationSpeed: 0.02 },
        slides: [
            {
                video: "https://youtu.be/Ibb5-nvUalc",
                text: {
                    en: "A mini game I created with a friend over 1 month.",
                    fr: "Un mini-jeu créé avec un ami en 1 mois."
                }
            },
            {
                img: "assets/projects/PersoProj/dodgingExpert.png",
                text: {
                    en: "A little challenge game where the aim is to make a game in a day on your own.",
                    fr: "Un petit jeu défi, où le but est de faire un jeu seul en une journée."
                },
                link: { url: "https://emilezola.itch.io/dodgingexpert", label: "itch.io" }
            },
            {
                img: "assets/projects/PersoProj/lilchal2.png",
                text: {
                    en: "Another little challenge game made in a day on my own.",
                    fr: "Un autre petit jeu défi réalisé seul en une journée."
                },
                link: { url: "https://emilezola.itch.io/fast-magic", label: "itch.io" }
            },
            {
                img: "assets/projects/PersoProj/lilchal3.png",
                text: {
                    en: "The last little challenge game made in a day on my own.",
                    fr: "Le dernier petit jeu défi réalisé seul en une journée."
                },
                link: { url: "https://emilezola.itch.io/try-your-luck", label: "itch.io" }
            }
        ]
    }
];

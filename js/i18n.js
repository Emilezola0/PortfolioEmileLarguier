// i18n.js
// Interface texts in every language + the language switch.
// To add a language: add a block in STRINGS, a button in index.html (#langSwitch),
// and the matching key ("es", ...) in the texts of data/projects.js.

const STRINGS = {
    en: {
        pause: "Pause",
        shop: "Shop",
        projects: "Projects",
        sound: "Sound",
        pauseTitle: "Pause Menu",
        resume: "Resume",
        restart: "Restart",
        shopTitle: "Stardust shop",
        shopStars: "Shooting stars",
        shopCosmic: "Cosmic objects",
        unlock: "Unlock",
        max: "MAX",
        placeHint: "Click to place - Esc to cancel",
        introName: "Emile Larguier",
        introRole: "Game Designer",
        introText: "Welcome to my universe: each planet is one of my projects.",
        introSeeProjects: "See my projects",
        introExplore: "Explore the universe",
        introHint1: "Click a planet to open its project",
        introHint2: "Drag planets and objects to move them",
        introHint3: "Shooting stars earn stardust: spend it in the shop to fill the sky",
        help: "Help",
        myProjects: "My projects",
        allProjects: "All projects",
        prevProject: "Previous project",
        nextProject: "Next project",
        viewerClose: "Close",
        viewerPrev: "Previous",
        viewerNext: "Next",
        openLink: "Open",
        linkedinTitle: "LinkedIn",
        linkedinText: "Find me on LinkedIn.",
        linkedinButton: "Open my LinkedIn",
        portfolioTitle: "Portfolio",
        portfolioText: "My complete portfolio, with all the details of my work.",
        portfolioButton: "Open my portfolio"
    },
    fr: {
        pause: "Pause",
        shop: "Boutique",
        projects: "Projets",
        sound: "Son",
        pauseTitle: "Menu pause",
        resume: "Reprendre",
        restart: "Recommencer",
        shopTitle: "Boutique",
        shopStars: "Étoiles filantes",
        shopCosmic: "Objets cosmiques",
        unlock: "Débloquer",
        max: "MAX",
        placeHint: "Cliquez pour placer - Échap pour annuler",
        introName: "Emile Larguier",
        introRole: "Game Designer",
        introText: "Bienvenue dans mon univers : chaque planète est un de mes projets.",
        introSeeProjects: "Voir mes projets",
        introExplore: "Explorer l'univers",
        introHint1: "Cliquez sur une planète pour ouvrir son projet",
        introHint2: "Glissez les planètes et les objets pour les déplacer",
        introHint3: "Les étoiles filantes rapportent de la poussière d'étoile : dépensez-la dans la boutique pour remplir le ciel",
        help: "Aide",
        myProjects: "Mes projets",
        allProjects: "Tous les projets",
        prevProject: "Projet précédent",
        nextProject: "Projet suivant",
        viewerClose: "Fermer",
        viewerPrev: "Précédent",
        viewerNext: "Suivant",
        openLink: "Ouvrir",
        linkedinTitle: "LinkedIn",
        linkedinText: "Retrouvez-moi sur LinkedIn.",
        linkedinButton: "Ouvrir mon LinkedIn",
        portfolioTitle: "Portfolio",
        portfolioText: "Mon portfolio complet, avec tout le détail de mon travail.",
        portfolioButton: "Ouvrir mon portfolio"
    }
};

const STORAGE_KEY = "portfolio-lang";
const listeners = [];

function detectLang() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && STRINGS[saved]) return saved;
    } catch (e) { /* storage unavailable */ }
    return (navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
}

let lang = detectLang();

export function getLang() {
    return lang;
}

// Interface text by key
export function t(key) {
    return STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
}

// Content text: either a plain string or { en: "...", fr: "..." }
export function tr(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    return value[lang] ?? value.en ?? Object.values(value)[0] ?? "";
}

export function onLangChange(callback) {
    listeners.push(callback);
}

// Fills every element carrying data-i18n="key" (and data-i18n-title)
export function applyStaticTexts() {
    document.documentElement.lang = lang;
    for (const el of document.querySelectorAll("[data-i18n]")) {
        el.textContent = t(el.dataset.i18n);
    }
    for (const el of document.querySelectorAll("[data-i18n-title]")) {
        el.title = t(el.dataset.i18nTitle);
        el.setAttribute("aria-label", el.title);
    }
    for (const btn of document.querySelectorAll("#langSwitch button")) {
        btn.classList.toggle("active", btn.dataset.lang === lang);
    }
}

export function setLang(next) {
    if (!STRINGS[next] || next === lang) return;
    lang = next;
    try {
        localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { /* storage unavailable */ }
    applyStaticTexts();
    for (const callback of listeners) callback(lang);
}

for (const btn of document.querySelectorAll("#langSwitch button")) {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
}
applyStaticTexts();

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
        introTitle: "Welcome to my portfolio!",
        introBody: `
  <p>
    Each <span style="color: #00ccff;"><strong>planet</strong></span> is one of my projects.<br>
    <strong>Click a planet</strong> to discover it, or use the
    <span style="color: #00ffcc;"><strong>Projects</strong></span> button to see them all.
  </p>
  <p>
    Around them, a small relaxing game: <strong>shooting stars</strong> bounce on the planets
    and earn <span style="color: #ffd75e;"><strong>stardust</strong></span> to spend in the
    <span style="color: #ffd75e;"><strong>shop</strong></span>.
  </p>
  <p>Nothing to lose: you can drag everything around.</p>`,
        start: "START",
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
        introTitle: "Bienvenue sur mon portfolio !",
        introBody: `
  <p>
    Chaque <span style="color: #00ccff;"><strong>planète</strong></span> est un de mes projets.<br>
    <strong>Cliquez sur une planète</strong> pour le découvrir, ou utilisez le bouton
    <span style="color: #00ffcc;"><strong>Projets</strong></span> pour tous les voir.
  </p>
  <p>
    Autour, un petit jeu relaxant : des <strong>étoiles filantes</strong> rebondissent sur les planètes
    et rapportent de la <span style="color: #ffd75e;"><strong>poussière d'étoile</strong></span>
    à dépenser dans la <span style="color: #ffd75e;"><strong>boutique</strong></span>.
  </p>
  <p>Rien à perdre : tout peut être déplacé à la souris.</p>`,
        start: "COMMENCER",
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

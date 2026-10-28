// ProjectViewer.js
// The project window, content comes from data/projects.js. Three views:
//  - overview : a grid with every project (the "Projects" button)
//  - project  : the slides of one project (image / video + text),
//               with "all projects" and previous / next project
//  - card     : a simple link card (LinkedIn, portfolio)
// The address bar follows the view (#projects, #project=2021), so a project
// can be shared with a link.
import { PROJECTS } from './data/projects.js';
import { t, tr, onLangChange } from './i18n.js';
import { SoundManager } from './SoundManager.js';

const viewer = document.getElementById("viewer");
const titleEl = document.getElementById("viewer-title");
const backBtn = document.getElementById("viewer-back");
const overviewEl = document.getElementById("viewer-overview");
const bodyEl = document.getElementById("viewer-body");
const stageEl = document.getElementById("viewer-stage");
const mediaEl = document.getElementById("viewer-media");
const prevBtn = document.getElementById("viewer-prev");
const nextBtn = document.getElementById("viewer-next");
const dotsEl = document.getElementById("viewer-dots");
const textEl = document.getElementById("viewer-text");
const linkEl = document.getElementById("viewer-link");
const footerEl = document.getElementById("viewer-footer");
const prevProjectBtn = document.getElementById("viewer-prev-project");
const nextProjectBtn = document.getElementById("viewer-next-project");
const closeBtn = document.getElementById("viewer-close");

let view = "overview"; // "overview" | "project" | "card"
let project = null;    // project being shown
let index = 0;         // current slide
let card = null;       // link card { title, text, url, label }

// === Progressive image loading ===
// Nothing is downloaded with the page. Images are fetched one at a time, in the
// background: first the opened project, then the first slide of the others.
const preloadQueue = [];
const preloaded = new Set();
let preloading = false;

function nextPreload() {
    const url = preloadQueue.shift();
    if (!url) {
        preloading = false;
        return;
    }
    preloading = true;
    const img = new Image();
    img.onload = img.onerror = nextPreload;
    img.src = url;
}

function preload(urls, first = false) {
    const fresh = urls.filter(url => url && !preloaded.has(url));
    for (const url of fresh) preloaded.add(url);
    if (first) preloadQueue.unshift(...fresh);
    else preloadQueue.push(...fresh);
    if (!preloading) nextPreload();
}

// Called once the game runs: the first picture of each project, quietly
export function preloadFirstSlides() {
    const connection = navigator.connection;
    if (connection && connection.saveData) return; // respect data saver
    preload(PROJECTS.map(p => p.slides[0] && p.slides[0].img));
}

// === Helpers ===
function youtubeId(url) {
    if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split(/[?&]/)[0];
    if (url.includes("watch?v=")) return url.split("watch?v=")[1].split("&")[0];
    return null;
}

// Picture used on the project card: first image, or the first video's thumbnail
function coverOf(p) {
    for (const slide of p.slides) {
        if (slide.img) return slide.img;
        const id = slide.video && youtubeId(slide.video);
        if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    return "";
}

function setHash(hash) {
    try {
        history.replaceState(null, "", hash ? "#" + hash : location.pathname + location.search);
    } catch (e) { /* file:// or sandboxed page */ }
}

function show(el, visible) {
    el.classList.toggle("hidden", !visible);
}

function showLink(url, label) {
    linkEl.href = url;
    linkEl.textContent = label + " ↗";
    show(linkEl, true);
}

// === Rendering ===
function renderOverview() {
    titleEl.textContent = t("myProjects");
    overviewEl.innerHTML = "";

    for (const p of PROJECTS) {
        const cardBtn = document.createElement("button");
        cardBtn.className = "project-card";
        cardBtn.style.setProperty("--accent", (p.planet && p.planet.baseColor) || "#00ffcc");

        const cover = document.createElement("div");
        cover.className = "project-card-cover";
        const src = coverOf(p);
        if (src) {
            const img = document.createElement("img");
            img.loading = "lazy";
            img.decoding = "async";
            img.alt = "";
            img.src = src;
            cover.appendChild(img);
        }

        const name = document.createElement("span");
        name.className = "project-card-name";
        name.textContent = tr(p.name);

        const sub = document.createElement("span");
        sub.className = "project-card-title";
        sub.textContent = tr(p.title);

        cardBtn.append(cover, name, sub);
        cardBtn.addEventListener("click", () => {
            SoundManager.play('click');
            openProject(p.id);
        });
        overviewEl.appendChild(cardBtn);
    }
}

function renderMedia(slide) {
    mediaEl.innerHTML = "";
    mediaEl.classList.remove("loading");

    if (slide.video) {
        const id = youtubeId(slide.video);
        if (id) {
            const frame = document.createElement("iframe");
            frame.src = `https://www.youtube.com/embed/${id}`;
            frame.title = "YouTube video";
            frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            frame.allowFullscreen = true;
            mediaEl.appendChild(frame);
        } else {
            const video = document.createElement("video");
            video.src = slide.video;
            video.controls = true;
            mediaEl.appendChild(video);
        }
    } else if (slide.img) {
        const img = document.createElement("img");
        img.alt = tr(project.title);
        mediaEl.classList.add("loading");
        img.onload = img.onerror = () => mediaEl.classList.remove("loading");
        img.src = slide.img;
        mediaEl.appendChild(img);
        if (img.complete) mediaEl.classList.remove("loading");
    }
}

function neighbour(step) {
    const i = PROJECTS.indexOf(project);
    return PROJECTS[(i + step + PROJECTS.length) % PROJECTS.length];
}

function renderProject() {
    titleEl.textContent = tr(project.title);

    const slides = project.slides;
    const slide = slides[index];
    renderMedia(slide);
    textEl.textContent = tr(slide.text);
    if (slide.link) showLink(slide.link.url, tr(slide.link.label) || t("openLink"));

    const several = slides.length > 1;
    show(prevBtn, several);
    show(nextBtn, several);
    show(dotsEl, several);
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === slides.length - 1;

    dotsEl.innerHTML = "";
    slides.forEach((s, i) => {
        const dot = document.createElement("button");
        dot.classList.toggle("active", i === index);
        dot.setAttribute("aria-label", `${i + 1} / ${slides.length}`);
        dot.addEventListener("click", () => goTo(i));
        dotsEl.appendChild(dot);
    });
    const counter = document.createElement("span");
    counter.textContent = `${index + 1} / ${slides.length}`;
    dotsEl.appendChild(counter);

    // previous / next project, always available
    const before = neighbour(-1);
    const after = neighbour(1);
    prevProjectBtn.textContent = "← " + tr(before.name);
    prevProjectBtn.title = t("prevProject");
    nextProjectBtn.textContent = tr(after.name) + " →";
    nextProjectBtn.title = t("nextProject");
    // last slide: invite to the next project
    nextProjectBtn.classList.toggle("highlight", index === slides.length - 1);
}

function render() {
    if (viewer.classList.contains("hidden")) return;

    show(overviewEl, view === "overview");
    show(bodyEl, view !== "overview");
    show(backBtn, view !== "overview");
    show(stageEl, view === "project");
    show(footerEl, view === "project" && PROJECTS.length > 1);
    show(linkEl, false);
    backBtn.textContent = "← " + t("allProjects");

    if (view === "overview") {
        renderOverview();
    } else if (view === "project") {
        renderProject();
    } else {
        titleEl.textContent = tr(card.title);
        show(dotsEl, false);
        textEl.textContent = tr(card.text);
        showLink(card.url, tr(card.label));
    }
}

function goTo(i) {
    if (!project || i < 0 || i >= project.slides.length || i === index) return;
    index = i;
    SoundManager.play('click');
    render();
}

function open() {
    viewer.classList.remove("hidden");
    render();
    // scroll back to the top when changing view
    bodyEl.scrollTop = 0;
    overviewEl.scrollTop = 0;
}

// === Public API ===
export function openOverview() {
    view = "overview";
    project = null;
    mediaEl.innerHTML = "";
    setHash("projects");
    open();
}

export function openProject(id) {
    const found = PROJECTS.find(p => p.id === id) || PROJECTS[0];
    if (!found) return;
    view = "project";
    project = found;
    index = 0;
    setHash("project=" + found.id);
    open();
    // the other slides of this project, ahead of everything else
    preload(project.slides.slice(1).map(slide => slide.img), true);
}

// data: { title, text, url, label } (texts can be { en, fr })
export function openLink(data) {
    view = "card";
    project = null;
    card = data;
    mediaEl.innerHTML = "";
    setHash("");
    open();
}

export function closeViewer() {
    if (viewer.classList.contains("hidden")) return;
    viewer.classList.add("hidden");
    mediaEl.innerHTML = ""; // stops a playing video
    setHash("");
}

export function isViewerOpen() {
    return !viewer.classList.contains("hidden");
}

// Opens what the address asks for (#projects, #project=2021). Returns true if it did.
export function openFromHash() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash === "projects") {
        openOverview();
        return true;
    }
    if (hash.startsWith("project=")) {
        const id = hash.slice("project=".length);
        if (PROJECTS.some(p => p.id === id)) {
            openProject(id);
            return true;
        }
    }
    return false;
}

// === Events ===
prevBtn.addEventListener("click", () => goTo(index - 1));
nextBtn.addEventListener("click", () => goTo(index + 1));
prevProjectBtn.addEventListener("click", () => {
    SoundManager.play('click');
    openProject(neighbour(-1).id);
});
nextProjectBtn.addEventListener("click", () => {
    SoundManager.play('click');
    openProject(neighbour(1).id);
});
backBtn.addEventListener("click", () => {
    SoundManager.play('click');
    openOverview();
});
closeBtn.addEventListener("click", () => {
    SoundManager.play('click');
    closeViewer();
});
// click on the dark area around the window
viewer.addEventListener("pointerdown", e => {
    if (e.target === viewer) closeViewer();
});

// swipe between slides (phones, trackpads)
let swipeStart = null;
mediaEl.addEventListener("pointerdown", e => {
    swipeStart = { x: e.clientX, y: e.clientY };
});
mediaEl.addEventListener("pointerup", e => {
    if (!swipeStart || view !== "project") return;
    const dx = e.clientX - swipeStart.x;
    const dy = e.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) goTo(index + (dx < 0 ? 1 : -1));
});

window.addEventListener("keydown", e => {
    if (!isViewerOpen()) return;
    if (e.key === "Escape") closeViewer();
    if (view !== "project") return;
    if (e.key === "ArrowLeft") goTo(index - 1);
    else if (e.key === "ArrowRight") goTo(index + 1);
});

// back / forward buttons of the browser
window.addEventListener("hashchange", () => {
    if (!openFromHash()) closeViewer();
});

onLangChange(render);

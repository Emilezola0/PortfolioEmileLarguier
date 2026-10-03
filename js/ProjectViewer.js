// ProjectViewer.js
// The window that shows a project (slides with image / video + text) or a
// simple link card (LinkedIn, portfolio). Content comes from data/projects.js.
import { PROJECTS } from './data/projects.js';
import { t, tr, onLangChange } from './i18n.js';
import { SoundManager } from './SoundManager.js';

const viewer = document.getElementById("viewer");
const titleEl = document.getElementById("viewer-title");
const tabsEl = document.getElementById("viewer-tabs");
const stageEl = document.getElementById("viewer-stage");
const mediaEl = document.getElementById("viewer-media");
const prevBtn = document.getElementById("viewer-prev");
const nextBtn = document.getElementById("viewer-next");
const dotsEl = document.getElementById("viewer-dots");
const textEl = document.getElementById("viewer-text");
const linkEl = document.getElementById("viewer-link");
const closeBtn = document.getElementById("viewer-close");

let project = null; // project being shown
let index = 0;      // current slide
let card = null;    // or a link card { title, text, url, label }

function youtubeId(url) {
    if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split(/[?&]/)[0];
    if (url.includes("watch?v=")) return url.split("watch?v=")[1].split("&")[0];
    return null;
}

function showLink(url, label) {
    linkEl.href = url;
    linkEl.textContent = label + " ↗";
    linkEl.classList.remove("hidden");
}

function renderMedia(slide) {
    mediaEl.innerHTML = "";

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
        img.src = slide.img;
        img.alt = tr(project.title);
        mediaEl.appendChild(img);
    }
}

function render() {
    if (viewer.classList.contains("hidden")) return;
    linkEl.classList.add("hidden");

    // --- Link card ---
    if (card) {
        titleEl.textContent = tr(card.title);
        tabsEl.classList.add("hidden");
        stageEl.classList.add("hidden");
        dotsEl.classList.add("hidden");
        textEl.textContent = tr(card.text);
        showLink(card.url, tr(card.label));
        return;
    }

    // --- Project ---
    titleEl.textContent = tr(project.title);
    tabsEl.classList.remove("hidden");
    stageEl.classList.remove("hidden");

    tabsEl.innerHTML = "";
    for (const p of PROJECTS) {
        const tab = document.createElement("button");
        tab.textContent = tr(p.name);
        tab.classList.toggle("active", p === project);
        tab.addEventListener("click", () => {
            SoundManager.play('click');
            openProject(p.id);
        });
        tabsEl.appendChild(tab);
    }

    const slides = project.slides;
    const slide = slides[index];
    renderMedia(slide);
    textEl.textContent = tr(slide.text);
    if (slide.link) showLink(slide.link.url, tr(slide.link.label) || t("openLink"));

    const several = slides.length > 1;
    prevBtn.classList.toggle("hidden", !several);
    nextBtn.classList.toggle("hidden", !several);
    dotsEl.classList.toggle("hidden", !several);
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
}

function goTo(i) {
    if (!project || i < 0 || i >= project.slides.length || i === index) return;
    index = i;
    SoundManager.play('click');
    render();
}

export function openProject(id) {
    const found = PROJECTS.find(p => p.id === id) || PROJECTS[0];
    if (!found) return;
    card = null;
    project = found;
    index = 0;
    viewer.classList.remove("hidden");
    render();
}

// data: { title, text, url, label } (texts can be { en, fr })
export function openLink(data) {
    project = null;
    card = data;
    viewer.classList.remove("hidden");
    render();
}

export function closeViewer() {
    if (viewer.classList.contains("hidden")) return;
    viewer.classList.add("hidden");
    mediaEl.innerHTML = ""; // stops a playing video
}

export function isViewerOpen() {
    return !viewer.classList.contains("hidden");
}

prevBtn.addEventListener("click", () => goTo(index - 1));
nextBtn.addEventListener("click", () => goTo(index + 1));
closeBtn.addEventListener("click", () => {
    SoundManager.play('click');
    closeViewer();
});
// click on the dark area around the window
viewer.addEventListener("pointerdown", e => {
    if (e.target === viewer) closeViewer();
});

window.addEventListener("keydown", e => {
    if (!isViewerOpen()) return;
    if (e.key === "Escape") closeViewer();
    else if (e.key === "ArrowLeft") goTo(index - 1);
    else if (e.key === "ArrowRight") goTo(index + 1);
});

onLangChange(render);

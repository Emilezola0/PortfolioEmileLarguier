export function openCustomPopup(popupData) {
    const popup = document.getElementById("folder-popup");
    const container = document.getElementById("folder-content");
    const title = document.getElementById("folder-title");
    const nav = document.getElementById("popup-nav");

    let currentIndex = 0;

    const updateSlide = () => {
        const slide = popupData.slides[currentIndex];

        let mediaHTML = "";
        if (slide.type === "image") {
            mediaHTML = `<img src="${slide.img}" class="popup-image" />`;
        } else if (slide.type === "video") {
            const embedURL = convertToEmbedURL(slide.video);

            if (embedURL.includes("youtube.com/embed/")) {
                mediaHTML = `
                <div class="video-container">
                <iframe
                src="${embedURL}"
                title="YouTube video"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                ></iframe>
                </div>`;
            } else {
                const videoId = (slide.video.includes("youtu.be/") && slide.video.split("youtu.be/")[1])
                    || (slide.video.includes("watch?v=") && slide.video.split("watch?v=")[1].split("&")[0]);

                const thumbnailURL = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

                mediaHTML = `
                <a href="${slide.video}" target="_blank" class="video-link video-thumbnail-wrapper">
                <img src="${thumbnailURL}" class="popup-image" alt="Video thumbnail" />
                <div class="video-play-button">Play</div>
                </a>`;
            }
        }

        container.innerHTML = `
        ${mediaHTML}
        <p>${slide.desc}</p>
        `;

        nav.innerHTML = `
        ${currentIndex > 0 ? '<button id="prev-slide"><-</button>' : ''}
        ${currentIndex < popupData.slides.length - 1 ? '<button id="next-slide">-></button>' : ''}
        `;

        if (currentIndex > 0)
            document.getElementById("prev-slide").onclick = () => { currentIndex--; updateSlide(); };
        if (currentIndex < popupData.slides.length - 1)
            document.getElementById("next-slide").onclick = () => { currentIndex++; updateSlide(); };
    };

    title.textContent = popupData.title || "Popup";
    updateSlide();
    popup.classList.remove("hidden");
}

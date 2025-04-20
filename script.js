const brushBtn = document.getElementById("brush");
const handBtn = document.getElementById("hand");
let currentTool = "brush";

// Outils sélection
brushBtn.onclick = () => {
    currentTool = "brush";
    brushBtn.classList.add("active");
    handBtn.classList.remove("active");
};

handBtn.onclick = () => {
    currentTool = "hand";
    brushBtn.classList.remove("active");
    handBtn.classList.add("active");
};

// Zone de fouille
const canvas = document.getElementById("dustLayer");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 330;
canvas.height = window.innerHeight;

// Couche de poussière
ctx.fillStyle = "#a98b5c";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Grattage
canvas.addEventListener("mousemove", (e) => {
    if (currentTool !== "brush" || e.buttons !== 1) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(e.offsetX, e.offsetY, 30, 0, Math.PI * 2);
    ctx.fill();
    revealFolders(e.offsetX, e.offsetY);
    ctx.globalCompositeOperation = "source-over";
});

// Création des dossiers
fetch("projects.json")
    .then((res) => res.json())
    .then((projects) => {
        const digZone = document.getElementById("digZoneWrapper");

        projects.forEach((project, i) => {
            const folder = document.createElement("div");
            folder.className = "folder";
            folder.textContent = "📁 " + project.name;

            const x = Math.random() * (canvas.width - 100);
            const y = Math.random() * (canvas.height - 50);

            folder.style.left = x + "px";
            folder.style.top = y + "px";

            folder.dataset.x = x;
            folder.dataset.y = y;
            folder.dataset.revealed = "false";

            makeDraggable(folder);
            digZone.appendChild(folder);
        });
    });

function revealFolders(x, y) {
    document.querySelectorAll(".folder").forEach((folder) => {
        const fx = parseFloat(folder.dataset.x);
        const fy = parseFloat(folder.dataset.y);

        const dx = fx - x;
        const dy = fy - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 50 && folder.dataset.revealed === "false") {
            folder.dataset.revealed = "true";
            folder.classList.add("revealed");
        }
    });
}

// Déplacement des dossiers avec la main
function makeDraggable(elem) {
    let offsetX = 0;
    let offsetY = 0;

    elem.addEventListener("mousedown", (e) => {
        if (currentTool !== "hand" || elem.dataset.revealed !== "true") return;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        elem.style.position = "absolute";
        elem.style.zIndex = 1000;

        function move(e) {
            elem.style.left = e.pageX - offsetX + "px";
            elem.style.top = e.pageY - offsetY + "px";
        }

        function stop() {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", stop);
        }

        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", stop);
    });
}
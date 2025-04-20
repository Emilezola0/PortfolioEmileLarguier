// Pinceau : On garde la logique de sélection et grattage
const brush = document.getElementById("brush");

brush.addEventListener("click", () => {
  brush.classList.toggle("active");
});

// Zone de fouille
const canvas = document.getElementById("digZone");
const ctx = canvas.getContext("2d");
const dustColor = "#b49b7f";
ctx.fillStyle = dustColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.globalCompositeOperation = "destination-out";

let isBrushing = false;

canvas.addEventListener("mousedown", () => isBrushing = true);
canvas.addEventListener("mouseup", () => isBrushing = false);
canvas.addEventListener("mouseleave", () => isBrushing = false);

canvas.addEventListener("mousemove", e => {
  if (!isBrushing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
});

// Fonction pour permettre aux dossiers d'être déplacés
const folders = document.querySelectorAll('.folder');
folders.forEach(folder => {
  folder.addEventListener('dragstart', (e) => {
    // On garde une référence au dossier qu'on déplace
    e.dataTransfer.setData('text', e.target.id);
  });
});

// Zone de dépôt où les dossiers peuvent être déposés
const dropZone = document.getElementById("dropZone");

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault(); // Permet au dossier d'être déposé dans la zone
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  const folderId = e.dataTransfer.getData('text'); // Récupère l'id du dossier
  const folder = document.getElementById(folderId);
  
  // Ajoute le dossier à la zone de dépôt
  dropZone.appendChild(folder);

  // Affiche un message indiquant que le dossier est ouvert
  dropZone.innerHTML = `<p>Dossier ouvert : ${folder.textContent}</p>`;
});

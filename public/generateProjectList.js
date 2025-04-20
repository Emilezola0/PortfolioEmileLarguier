const fs = require('fs');
const path = require('path');

// Dossier des projets
const projectsDir = path.join(__dirname, 'projects');

// Liste des projets
const projects = [];

// Lire les dossiers dans le dossier projects/
fs.readdirSync(projectsDir).forEach((folder) => {
    const folderPath = path.join(projectsDir, folder);

    // Vérifie si c'est un dossier (et pas un fichier)
    if (fs.statSync(folderPath).isDirectory()) {
        const filesInFolder = fs.readdirSync(folderPath);
        const isEmpty = filesInFolder.length === 0; // Vérifie si le dossier est vide

        projects.push({
            name: folder, // Le nom du dossier sera le nom du projet
            path: folderPath, // Le chemin complet du projet (utile si tu veux l'ouvrir)
            isEmpty: isEmpty // Ajoute un attribut pour savoir si le dossier est vide
        });
    }
});

// Écrire la liste des projets dans un fichier JSON
const outputPath = path.join(__dirname, 'public', 'projects.json');
fs.writeFileSync(outputPath, JSON.stringify(projects, null, 2));

console.log('projects.json généré avec succès !');

const fs = require('fs');
const path = require('path');

// Chemin vers le dossier 'public' o� tu veux g�n�rer le fichier projects.json
const publicDir = path.join(__dirname, 'public');

// Chemin vers le dossier 'projects' o� sont tes dossiers de projets
const projectsDir = path.join(__dirname, 'projects');

// Lire les dossiers dans 'projects'
fs.readdir(projectsDir, (err, files) => {
    if (err) {
        console.error("Erreur lors de la lecture du dossier 'projects':", err);
        return;
    }

    const projects = files.map((file) => {
        const projectPath = path.join(projectsDir, file);
        const isEmpty = fs.readdirSync(projectPath).length === 0; // V�rifier si le dossier est vide
        return {
            name: file,
            path: projectPath,
            isEmpty: isEmpty
        };
    });

    // G�n�rer le chemin vers le fichier 'projects.json' dans le dossier 'public'
    const outputFile = path.join(publicDir, 'projects.json');

    // �crire les projets dans un fichier JSON dans 'public'
    fs.writeFile(outputFile, JSON.stringify(projects, null, 2), (err) => {
        if (err) {
            console.error("Erreur lors de l'�criture du fichier 'projects.json':", err);
        } else {
            console.log("Fichier 'projects.json' g�n�r� dans 'public'");
        }
    });
});

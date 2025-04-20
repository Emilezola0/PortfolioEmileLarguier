const fs = require('fs');
const path = require('path');

// Chemin vers le dossier 'public' où tu veux générer le fichier projects.json
const publicDir = path.join(__dirname, 'public');

// Chemin vers le dossier 'projects' où sont tes dossiers de projets
const projectsDir = path.join(__dirname, 'projects');

// Lire les dossiers dans 'projects'
fs.readdir(projectsDir, (err, files) => {
    if (err) {
        console.error("Erreur lors de la lecture du dossier 'projects':", err);
        return;
    }

    const projects = files.map((file) => {
        const projectPath = path.join(projectsDir, file);
        const isEmpty = fs.readdirSync(projectPath).length === 0; // Vérifier si le dossier est vide
        return {
            name: file,
            path: projectPath,
            isEmpty: isEmpty
        };
    });

    // Générer le chemin vers le fichier 'projects.json' dans le dossier 'public'
    const outputFile = path.join(publicDir, 'projects.json');

    // Écrire les projets dans un fichier JSON dans 'public'
    fs.writeFile(outputFile, JSON.stringify(projects, null, 2), (err) => {
        if (err) {
            console.error("Erreur lors de l'écriture du fichier 'projects.json':", err);
        } else {
            console.log("Fichier 'projects.json' généré dans 'public'");
        }
    });
});

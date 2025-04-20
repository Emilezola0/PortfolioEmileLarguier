const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, 'projects');
const outputFile = path.join(__dirname, 'public', 'projects.json');

// Lire tous les dossiers dans /projects
const folders = fs.readdirSync(projectsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => ({
        name: dirent.name,
        path: `projects/${dirent.name}`
    }));

// Écrire dans projects.json
fs.writeFileSync(outputFile, JSON.stringify(folders, null, 2), 'utf-8');

console.log(`valide ${folders.length} projets trouvés et listés dans projects.json`);

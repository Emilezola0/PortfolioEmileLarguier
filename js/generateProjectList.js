const fs = require('fs');
const path = require('path');

const projects = [
    { name: 'Projet 1', path: 'projet1', isEmpty: false },
    { name: 'Projet 2', path: 'projet2', isEmpty: true }
];

const projectList = {
    projects: projects
};

fs.writeFileSync(path.join(__dirname, 'public', 'projects.json'), JSON.stringify(projectList, null, 2));
console.log('projects.json créé avec succès !');

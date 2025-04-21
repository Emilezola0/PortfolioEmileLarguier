const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const voidCenter = { x: canvas.width / 2, y: canvas.height / 2 };
let voidRadius = 30;

class Mob {
    constructor() {
        this.x = Math.random() < 0.5 ? 0 : canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = 10;
        this.speed = 0.5;
        this.hp = 100;
    }

    update() {
        const dx = voidCenter.x - this.x;
        const dy = voidCenter.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Folder {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.cooldown = 0;
    }

    draw() {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.fillText(this.name, this.x - 20, this.y + 25);
    }

    update(mob) {
        const dx = mob.x - this.x;
        const dy = mob.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (this.cooldown <= 0 && dist < 200) {
            bullets.push(new Bullet(this.x, this.y, dx / dist, dy / dist));
            this.cooldown = 50;
        }

        if (this.cooldown > 0) this.cooldown--;
    }
}

class Bullet {
    constructor(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.speed = 4;
        this.radius = 4;
    }

    update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
    }

    draw() {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    hits(mob) {
        const dx = this.x - mob.x;
        const dy = this.y - mob.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius + mob.radius;
    }
}

let folders = [];
const bullets = [];
const mob = new Mob();

function spawnFoldersFromProjects(projects) {
    const radius = 250;
    const angleStep = (2 * Math.PI) / projects.length;

    projects.forEach((project, i) => {
        const angle = i * angleStep;
        const x = voidCenter.x + radius * Math.cos(angle);
        const y = voidCenter.y + radius * Math.sin(angle);
        folders.push(new Folder(x, y, project.name));
    });

    update();
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Void
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(voidCenter.x, voidCenter.y, voidRadius, 0, Math.PI * 2);
    ctx.fill();

    // Folders
    folders.forEach(folder => {
        folder.update(mob);
        folder.draw();
    });

    // Mob
    mob.update();
    mob.draw();

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.update();
        b.draw();

        if (b.hits(mob)) {
            mob.hp -= 50;
            bullets.splice(i, 1);
        }
    }

    if (mob.hp <= 0) {
        console.log("Mob détruit");
    }

    requestAnimationFrame(update);
}

// Charger les projets depuis projects.json
fetch("public/projects.json")
    .then(res => res.json())
    .then(data => spawnFoldersFromProjects(data))
    .catch(err => console.error("Erreur chargement des projets :", err));

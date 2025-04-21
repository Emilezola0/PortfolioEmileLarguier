const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const voidCenter = { x: canvas.width / 2, y: canvas.height / 2 };
let voidRadius = 30;
let score = 0;

const bullets = [];
let folders = [];
let mob = null;

// Load images
const folderImg = new Image();
folderImg.src = "assets/folder.png";

const mobImg = new Image();
mobImg.src = "assets/object1.png";

const scrapImg = new Image();
scrapImg.src = "assets/scrap.png";

// Mob class
class Mob {
    constructor() {
        this.x = Math.random() < 0.5 ? 0 : canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = 16;
        this.speed = 0.5;
        this.hp = 100;
        this.alive = true;
        this.opacity = 1;
        this.inVoid = false;
    }

    update() {
        if (!this.alive) return;

        const dx = voidCenter.x - this.x;
        const dy = voidCenter.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // If inside the void
        if (dist < voidRadius) {
            this.inVoid = true;
        }

        if (this.inVoid) {
            this.opacity -= 0.02;
            if (this.opacity <= 0) {
                this.alive = false;
                voidRadius += 5;
            }
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }

    draw() {
        if (!this.alive) return;
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(mobImg, this.x - this.radius, this.y - this.radius, 32, 32);
        ctx.globalAlpha = 1;
    }
}

// Folder (tower) class
class Folder {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.cooldown = 0;
    }

    draw() {
        ctx.drawImage(folderImg, this.x - 16, this.y - 16, 32, 32);
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x, this.y + 28);
    }

    update(mob) {
        if (!mob || !mob.alive) return;

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

// Bullet class
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

    isOutOfBounds() {
        return (
            this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height
        );
    }

    hits(mob) {
        const dx = this.x - mob.x;
        const dy = this.y - mob.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius + mob.radius;
    }
}

// Generate folders based on projects
function spawnFoldersFromProjects(projects) {
    const radius = 250;
    const angleStep = (2 * Math.PI) / projects.length;

    projects.forEach((project, i) => {
        const angle = i * angleStep;
        const x = voidCenter.x + radius * Math.cos(angle);
        const y = voidCenter.y + radius * Math.sin(angle);
        folders.push(new Folder(x, y, project.name));
    });

    // Spawn initial mob
    mob = new Mob();

    // Start game loop
    update();
}

// Draw UI elements
function drawUI() {
    ctx.drawImage(scrapImg, canvas.width - 100, 20, 24, 24);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(score, canvas.width - 70, 38);
}

// Game loop
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the void
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(voidCenter.x, voidCenter.y, voidRadius, 0, Math.PI * 2);
    ctx.fill();

    // Update and draw folders
    folders.forEach(folder => {
        folder.update(mob);
        folder.draw();
    });

    // Update and draw mob
    if (mob) {
        mob.update();
        mob.draw();
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.update();
        b.draw();

        // Remove if off-screen
        if (b.isOutOfBounds()) {
            bullets.splice(i, 1);
            continue;
        }

        // Check for collision
        if (mob && mob.alive && b.hits(mob)) {
            mob.hp -= 50;
            bullets.splice(i, 1);
            if (mob.hp <= 0) {
                mob.alive = false;
                score += 1;
            }
        }
    }

    drawUI();
    requestAnimationFrame(update);
}

// Load project data
fetch("public/projects.json")
    .then(res => res.json())
    .then(data => spawnFoldersFromProjects(data))
    .catch(err => console.error("Error loading projects.json:", err));

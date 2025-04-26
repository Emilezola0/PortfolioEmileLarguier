class Item {
    constructor(x, y, folders, imagePath, bufferName) {
        this.x = x;
        this.y = y;
        this.folders = folders; // liste des folders du jeu

        // Apparence & interaction
        this.itemIcon = new Image();
        this.itemIcon.src = imagePath;
        this.dragging = false;
        this.mouseDownPos = null;
        this.width = 32;
        this.height = 32;
        this.bufferSourceName = bufferName;

        this.connectionProgress = 0;
        this.lastTargetFolder = null;
        this.targetFolder = null;

        this.buffApplied = false;

        this.buffs = []; // Liste des buffs appliqués par cet item
    }

    getClosestFolder(folders) {
        if (!folders || folders.length === 0) return null;

        let closest = null;
        let closestDist = Infinity;

        for (const folder of folders) {
            const dx = folder.x - this.x;
            const dy = folder.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < closestDist) {
                closest = folder;
                closestDist = dist;
            }
        }

        return closest;
    }

    applyBuffs() {
        if (!this.targetFolder) return;

        for (const buff of this.buffs) {
            buff(this.targetFolder); // Chaque buff est une fonction
        }
    }

    update() {
        this.targetFolder = this.getClosestFolder(this.folders);

        // Si aucun dossier cible n'est trouvé, on ne fait rien
        if (!this.targetFolder) return;

        // Si le dossier cible change (ou si c'est le premier changement), reset la progression
        if (!this.lastTargetFolder || this.lastTargetFolder !== this.targetFolder) {
            // Si un dossier était déjà cible, on retire ses buffs
            if (this.lastTargetFolder) {
                this.removeBuffsFromFolder(this.lastTargetFolder);
            }

            this.connectionProgress = 0;  // Reset de la progression de connexion
            this.buffApplied = false;      // IMPORTANT : reset pour le nouveau folder
            this.lastTargetFolder = this.targetFolder; // Mettre à jour l'ancien dossier cible
        }

        // On continue à avancer la progression de connexion
        if (this.connectionProgress < 1) {
            this.connectionProgress += 0.015;
        }

        // Lorsque la connexion est complète
        if (this.connectionProgress >= 1) {
            if (!this.buffApplied) {
                this.applyBuffs();
                this.buffApplied = true; // On note qu'on l'a appliqué une fois
            }
        }
    }

    // Fonction pour retirer les buffs d'un dossier
    removeBuffsFromFolder(folder) {
        if (folder.activeBuffs) {
            this.buffApplied = false; // Reinitialiser car on change de cible
            folder.activeBuffs = folder.activeBuffs.filter(buff => buff.source !== this.bufferSourceName);
        }
    }


    drawConnectionLine(ctx) {
        if (!this.targetFolder) return;

        const progress = Math.min(this.connectionProgress, 1);
        const xEnd = this.x + (this.targetFolder.x - this.x) * progress;
        const yEnd = this.y + (this.targetFolder.y - this.y) * progress;

        ctx.save();
        ctx.strokeStyle = "white";
        ctx.setLineDash([4, 2]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
        ctx.restore();

        if (this.connectionProgress >= 1) {
            // Effet "paquets"
            const now = Date.now() / 1000;
            const packetCount = 4;
            const packetSpacing = 0.25;

            for (let i = 0; i < packetCount; i++) {
                const directions = [1, -1];

                for (const dir of directions) {
                    const offset = i * packetSpacing;
                    const phase = (now * 0.5 + offset) % 1;
                    const t = dir === 1 ? phase : 1 - phase;

                    const x = this.x + (this.targetFolder.x - this.x) * t;
                    const y = this.y + (this.targetFolder.y - this.y) * t;

                    ctx.save();
                    ctx.fillStyle = "rgba(255, 0, 255, 0.8)";
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();             // Save contexte state
        ctx.translate(this.x, this.y);  // Move context to item pos

        // === icon ===
        if (this.itemIcon.complete) {
            ctx.drawImage(this.itemIcon, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = "gray";
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        this.drawConnectionLine(ctx);

        ctx.restore();           // restore context origin state
    }

    // Movement
    isHovered(mx, my) {
        const isHovered = mx >= this.x - this.width / 2 && mx <= this.x + this.width / 2 &&
            my >= this.y - this.height / 2 && my <= this.y + this.height / 2;
        this.hovered = isHovered; // update state 'hovered'
        return isHovered;
    }

    handleClick(mouse) {
        this.mouseDownPos = { x: mouse.x, y: mouse.y };
    }

    handleMouseUp(mouse) {
        if (this.mouseDownPos) {
            const dx = mouse.x - this.mouseDownPos.x;
            const dy = mouse.y - this.mouseDownPos.y;
            const moved = Math.hypot(dx, dy) > 2;
            console.log(Math.hypot(dx, dy));

            if (!moved) {
                SoundManager.play(this.clickSound, this.volume);
                this.openFolderPopup();
            }
        }
        this.dragging = false;
        this.mouseDownPos = null;
    }

    updatePosition(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}

export { Item };

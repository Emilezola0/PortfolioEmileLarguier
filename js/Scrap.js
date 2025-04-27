export class Scrap {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.collected = false;
        this.speed = 0.3 + Math.random() * 0.3;
        this.easeProgress = 0.02;
        this.radius = 12;
        this.alpha = 0; // apparition progressive
        this.size = 24; // taille de l'image à dessiner

        // Scraps
        const scrapImgCollect = new Image();
        scrapImgCollect.src = this.getRandomScrapImage(); // Attribuer la source à l'image

        this.image = scrapImgCollect; // Assigner l'objet Image, pas juste le chemin

        // Chargement de l'image avant de l'utiliser
        scrapImgCollect.onload = () => {
            // L'image est maintenant prête
            this.imageLoaded = true;
        };
        this.imageLoaded = false; // Au départ, l'image n'est pas encore chargée
    }

    getRandomScrapImage() {
        const scrapCollectImages = [
            "assets/scraps/scrap1.png",
            "assets/scraps/scrap2.png",
            "assets/scraps/scrap3.png",
            "assets/scraps/scrap4.png"
        ];
        const randomIndex = Math.floor(Math.random() * scrapCollectImages.length);
        return scrapCollectImages[randomIndex];
    }

    update(collector) {
        // Apparition progressive
        if (this.alpha < 1) {
            this.alpha += 0.05;
        }

        const dx = collector.x - this.x;
        const dy = collector.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
            this.easeProgress += 0.04;
            const ease = Math.min(1, this.easeProgress);

            this.x += dx * ease * this.speed;
            this.y += dy * ease * this.speed;

            // Seuil final pour le collecter
            if (dist < 15) {
                return "collected";
            }
        }

        return "flying";
    }

    draw(ctx) {
        if (!this.imageLoaded) return; // Ne pas dessiner tant que l'image n'est pas chargée

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.scale(this.alpha, this.alpha);

        const img = this.image;
        if (img && img.complete) {
            ctx.drawImage(img, -this.size / 2, -this.size / 2, this.size, this.size);
        }

        ctx.restore();
    }
}
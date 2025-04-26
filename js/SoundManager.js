// SoundManager.js
class SoundManager {
    static sounds = {
        scrapCollect: {
            sound: document.getElementById("scrapSound"),
            volume: 1 // volume haut
        },
        projectile: {
            sound: document.getElementById("projectileSound"),
            volume: 0.8 // volume standard
        },
        click: {
            sound: document.getElementById("clickSound"),
            volume: 1.0 // volume par défaut pour le clic
        },
        powerUp: {
            sound: document.getElementById("powerUp"),
            volume: 0.8 // volume plus bas pour power-up
        },
        explode: {
            sound: document.getElementById("explodeSound"),
            volume: 0.5 // volume un peu plus faible pour l'explosion
        }
    };

    static soundEnabled = true;
    static defaultVolume = 0.8;

    static play(soundName, volume = SoundManager.defaultVolume) {
        if (!SoundManager.soundEnabled) return;
        const soundObj = SoundManager.sounds[soundName];
        if (soundObj) {
            // Utilise le volume spécifique du son, si défini
            const actualVolume = soundObj.volume || volume;
            soundObj.sound.volume = actualVolume;
            soundObj.sound.currentTime = 0; // reset pour rejouer immédiatement
            soundObj.sound.play();
        }
    }

    static toggle(enable) {
        SoundManager.soundEnabled = enable;
    }
}

export { SoundManager };

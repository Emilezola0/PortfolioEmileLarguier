// SoundManager.js
class SoundManager {
    static sounds = {
        bounce: {
            sound: document.getElementById("scrapSound"),
            volume: 0.2 // soft, it plays often
        },
        click: {
            sound: document.getElementById("clickSound"),
            volume: 1.0
        },
        powerUp: {
            sound: document.getElementById("powerUp"),
            volume: 0.8
        }
    };

    static soundEnabled = true;
    static defaultVolume = 0.8;

    static play(soundName, volume = SoundManager.defaultVolume) {
        if (!SoundManager.soundEnabled) return;
        const soundObj = SoundManager.sounds[soundName];
        if (soundObj && soundObj.sound) {
            soundObj.sound.volume = soundObj.volume || volume;
            soundObj.sound.currentTime = 0; // replay immediately
            const playing = soundObj.sound.play();
            if (playing) playing.catch(() => { }); // autoplay may be blocked
        }
    }

    static toggle(enable) {
        SoundManager.soundEnabled = enable;
    }
}

export { SoundManager };

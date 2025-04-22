export const SoundManager = {
    soundEnabled: true,

    play(sound, volume = 0.7) {
        if (!this.soundEnabled) return;

        const sfx = sound.cloneNode();
        sfx.volume = volume;
        document.body.appendChild(sfx);
        sfx.play();
        sfx.addEventListener("ended", () => sfx.remove());
    }
};

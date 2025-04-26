import Item from './Item.js';

class CVBuffer extends Item {
    constructor(x, y, folders) {
        super(x, y, folders);

        // Définir le buff de dégâts +20%
        this.buffs.push((folder) => {
            if (!folder.activeBuffs) {
                folder.activeBuffs = [];
            }

            // Ajoute un buff spécifique
            folder.activeBuffs.push({
                type: 'atkDamage',   // Ou le nom de la stat que tu veux booster
                value: 0.2,          // +20% => 0.2
                source: 'CVBuffer'   // (facultatif) pour identifier l'origine du buff
            });
        });
    }

    setContext(folders) {
        this.folders = folders;
    }

    onClick() {
        // Action quand on clique : ouvrir ton CV
        window.open('https://emilelarguier2.wixsite.com/game-designer-portfo', '_blank');
    }
}

export default CVBuffer;

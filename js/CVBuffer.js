import { Item } from './Item.js';
import { openCustomPopup } from './PopupManager.js';

class CVBuffer extends Item {
    constructor(x, y, folders, shopRef) {
        super(x, y, folders, "assets/Items/CVBuffer.png", "CVBuffer", shopRef);

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

    openCustomPopup() {
        openCustomPopup({
            title: "CV",
            slides: [
                { type: "image", img: "assets/Items/CVBuffer.png", desc: "<br><a href='https://emilelarguier2.wixsite.com/game-designer-portfo' target='_blank'>Portfolio</a>" }
            ]
        });
    }

    setContext(folders) {
        this.folders = folders;
    }

}

export { CVBuffer };

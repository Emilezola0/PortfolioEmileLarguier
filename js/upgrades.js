export const upgrades = [
    {
        id: "atkSpeed",
        label: "Attack Speed",
        key: "atkSpeed",
        cost: 50,
        apply: folder => folder.stats.atkSpeed *= 0.9, // 10% plus rapide
    },
    {
        id: "atkDamage",
        label: "Damage",
        key: "atkDamage",
        cost: 100,
        apply: folder => folder.stats.atkDamage += 1,
    },
    {
        id: "range",
        label: "Range",
        key: "range",
        cost: 75,
        apply: folder => folder.stats.range += 15,
    },
    {
        id: "bulletSpeed",
        label: "Bullet Speed",
        key: "bulletSpeed",
        cost: 60,
        apply: folder => folder.stats.bulletSpeed += 1,
    },
    {
        id: "pierce",
        label: "Pierce",
        key: "pierce",
        cost: 120,
        apply: folder => folder.stats.pierce += 1,
    },
];

// Fonction d'application d'une upgrade à un folder donné
export function upgradeFolder(folder, upgradeKey) {
    const upgrade = upgrades.find(u => u.key === upgradeKey);
    if (!upgrade) {
        console.warn("Upgrade not found:", upgradeKey);
        return false;
    }

    upgrade.apply(folder);
    return true;
}
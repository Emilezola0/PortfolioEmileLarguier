export const upgrades = [
    {
        id: "atkSpeed",
        label: "Attack Speed",
        key: "attackSpeed",
        cost: 50,
        apply: folder => folder.stats.attackSpeed *= 0.9, // 10% plus rapide
    },
    {
        id: "damage",
        label: "Damage",
        key: "damage",
        cost: 100,
        apply: folder => folder.stats.damage += 1,
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

// Cette fonction applique une upgrade au folder
export function upgradeFolder(folder, upgrade) {
    upgrade.apply(folder); // Apply bonus
    return true;
}

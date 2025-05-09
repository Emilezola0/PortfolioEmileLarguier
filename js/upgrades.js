export const upgrades = [
    {
        id: "atkSpeed",
        label: "Attack Speed",
        key: "atkSpeed",
        baseCost: 8,
        growthFactor: 1.12,
        apply: folder => folder.stats.atkSpeed *= 0.85, // 15% plus rapide
    },
    {
        id: "atkDamage",
        label: "Damage",
        key: "atkDamage",
        baseCost: 12,
        growthFactor: 1.18,
        apply: folder => folder.stats.atkDamage += 1,
    },
    {
        id: "range",
        label: "Range",
        key: "range",
        baseCost: 10,
        growthFactor: 1.15,
        apply: folder => folder.stats.range += 12,
    },
    {
        id: "bulletSpeed",
        label: "Bullet Speed",
        key: "bulletSpeed",
        baseCost: 6,
        growthFactor: 1.1,
        apply: folder => folder.stats.bulletSpeed += 0.5,
    },
    {
        id: "pierce",
        label: "Pierce",
        key: "pierce",
        baseCost: 15,
        growthFactor: 1.2,
        apply: folder => folder.stats.pierce += 1,
    },
];

// Function for calculate the actual cost of an upgrade
export function getUpgradeCost(folder, upgradeKey) {
    const upgrade = upgrades.find(u => u.key === upgradeKey);
    if (!upgrade) return Infinity;

    const level = folder.upgradeLevels[upgradeKey] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.growthFactor, level));
}

// Function that apply the upgrade
export function upgradeFolder(folder, upgradeKey) {
    const upgrade = upgrades.find(u => u.key === upgradeKey);
    if (!upgrade) return false;

    folder.upgradeLevels[upgradeKey] = (folder.upgradeLevels[upgradeKey] || 0) + 1;
    upgrade.apply(folder);
    return true;
}

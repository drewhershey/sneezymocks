const { getRandomIntInclusive } = require('./misc');
const { plotStat } = require('./plotStat');

const { floor, abs, log, max, min } = Math;

function critSuccessChance({
  isPC,
  isUsingWeapon,
  weaponDamageType,
  critHittingValue,
  powerMoveValue,
  dexStatValue,
  karStatValue,
  attackerLevel,
  victimLevel,
  damage = 0,
}) {
  let base = 0;
  if (isPC)
    if (critHittingValue > 0) base = floor(100_000 - critHittingValue * 850);
    else if (powerMoveValue > 0) base = floor(100_000 - powerMoveValue * 800);
    else base = 100_000;
  else base = 1_000_000;

  let critChance = plotStat(dexStatValue, 10, 100, 63);
  critChance *= floor(plotStat(karStatValue, 80, 125, 100) / 100);

  const levelDifference = attackerLevel - victimLevel;

  if (levelDifference === 0) critChance *= 50;
  else {
    const absoluteLevelDifference = abs(levelDifference);
    const levelMod =
      50 +
      ((levelDifference * log(absoluteLevelDifference / 20 + 1)) /
        absoluteLevelDifference) *
        75;

    critChance = levelMod <= 0 ? 1 : floor(critChance * levelMod);
  }

  const levelMod =
    levelDifference > -10 && levelDifference < 10 ? 0 : levelDifference;

  let critNum =
    getRandomIntInclusive(1, 100) + getRandomIntInclusive(0, levelMod);
  critNum = max(1, critNum);
  critNum = min(100, critNum);

  if (isPC && !isUsingWeapon) {
    critNum = adjustCritRollForBarehand(critNum, weaponDamageType);
    if (critNum === 0) return 0;
  }

  let newDamage = 'N/A';
  if (critHittingValue > 0 && damage > 0)
    newDamage = floor(damage * (critHittingValue / 100 + 1));

  return {
    critChance,
    critChanceBase: base,
    chanceToCrit: `${((critChance / base) * 100).toPrecision(
      3
    )}% (critChance / critChanceBase)`,
    realChanceToCrit: `${(((0.05 * critChance) / base) * 100).toPrecision(
      3
    )}% (5% chance of GUARANTEED_SUCCESS * chanceToCrit`,
    moddedDamage: newDamage,
    maxCritSeverityBonus: levelMod,
  };
}

function adjustCritRollForBarehand(roll, weaponType) {
  if (
    weaponType === 'blunt' ||
    weaponType === 'pierce' ||
    roll <= 66 ||
    roll > 100
  ) {
    return roll;
  }

  const index = roll - 67;
  const slashAdjust = [...Array.from({ length: 34 })];
  for (let i = 0; i < slashAdjust.length; i++) {
    slashAdjust[i] = i + 67;
  }
  slashAdjust[69 - 67] = 0;
  slashAdjust[70 - 67] = 0;
  slashAdjust[72 - 67] = 0;
  slashAdjust[73 - 67] = 0;
  slashAdjust[76 - 67] = 0;
  slashAdjust[78 - 67] = 0;
  slashAdjust[80 - 67] = 0;
  slashAdjust[82 - 67] = 0;
  slashAdjust[85 - 67] = 0;
  slashAdjust[86 - 67] = 0;
  slashAdjust[87 - 67] = 0;
  slashAdjust[88 - 67] = 0;
  slashAdjust[89 - 67] = 0;
  slashAdjust[90 - 67] = 0;

  return slashAdjust[index];
}

module.exports = { critSuccessChance };

console.log(
  critSuccessChance({
    isPC: true,
    isUsingWeapon: false,
    weaponDamageType: 'blunt',
    critHittingValue: 100,
    powerMoveValue: 0,
    dexStatValue: 205,
    karStatValue: 205,
    attackerLevel: 60,
    victimLevel: 50,
    damage: 0,
  })
);

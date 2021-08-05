import { plotStat } from "./misc";

/* const defendRoundResult = defendRound({
  level,
  armor,
  isPc,
  oomlatValue,
  combatMode,
  defenseValue,
  chivalryValue,
  berserkValue,
  hasGuardianAura,
  agilityValue,
  isFlying,
  isRiding,
  isSitting,
}); */

const defendRoundResult = 0;
const attackRoundResult = 0;
const mod = attackRoundResult - defendRoundResult;

function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

interface DefendRoundParams {
  level: number;
  armor: number;
  isPc: boolean;
  oomlatValue: number;
  combatMode: string;
  defenseValue: number;
  chivalryValue: number;
  berserkValue: number;
  hasGuardianAura: boolean;
  agilityValue: number;
  isFlying: boolean;
  isRiding: boolean;
  isSitting: boolean;
}

function defendRound({
  level,
  armor,
  isPc,
  oomlatValue,
  combatMode,
  defenseValue,
  chivalryValue,
  berserkValue,
  hasGuardianAura,
  agilityValue,
  isFlying,
  isRiding,
  isSitting,
}: DefendRoundParams) {
  let bonus = 0;
  const myLev = Math.max(10, Math.floor(16.67 * DOUBLING_LEVELS[level]));
  armor = 1000 - armor;
  if (isPc) {
    armor += Math.floor((armor * oomlatValue) / 250);
    bonus = Math.floor((Math.max(armor - 500, 0) * 2) / 3);
  } else {
    bonus = Math.floor((Math.max(armor - 400, 0) * 5) / 6);
  }

  if (isPc) {
    if (combatMode === 'ATTACK_DEFENSE') bonus += Math.floor(myLev / 4);
    if (combatMode === 'ATTACK_OFFENSE') bonus -= Math.floor(myLev / 4);
    if (combatMode === 'ATTACK_BERSERK') {
      bonus -= Math.floor(myLev / 4);
      let amt = Math.floor(myLev / 2);
      amt *= Math.floor((100 - berserkValue) / 100);
      bonus -= amt;
    }
  }

  if (hasGuardianAura) bonus += 40;

  if (chivalryValue >= 0)
    bonus += Math.floor((159 * Math.max(10, chivalryValue)) / 100);

  const scaledDefenseBonus = (myLev * 4 * level) / 100;
  bonus -= Math.floor(scaledDefenseBonus);
  bonus += Math.floor((scaledDefenseBonus * defenseValue) / 100);

  bonus += Math.floor(335 * plotStat(agilityValue, 5, 205, 105) - 335);

  // Add blind check

  if (isSitting) bonus -= Math.floor(myLev / 3 + 1);
  if (isFlying) bonus += Math.floor(myLev / 3 + 1);
  if (isRiding) bonus += Math.floor(myLev / 4 + 1);

  return bonus;
}

function hits(mod: number) {
  const factor = Math.floor(Math.min(Math.max(600 + (9 * mod) / 5, 0), 1000));
  const roll = getRandomIntInclusive(0, 999);
  const result =
    roll < 50
      ? 'CRIT_SUCCESS'
      : roll >= 950
      ? 'CRIT_FAILURE'
      : roll < factor
      ? 'SUCCESS'
      : 'FAILURE';

  const chance = Math.min(factor / 1000, 0.95);
  return {
    result,
    chance,
  };
}

hits(mod); //?

const DOUBLING_LEVELS = {
  1: 0.3900000000000002,
  2: 0.7300000000000004,
  3: 1.0300000000000007,
  4: 1.300000000000001,
  5: 1.5400000000000011,
  6: 1.7600000000000013,
  7: 1.9700000000000015,
  8: 2.149999999999998,
  9: 2.3199999999999945,
  10: 2.479999999999991,
  11: 2.629999999999988,
  12: 2.759999999999985,
  13: 2.8899999999999824,
  14: 3.00999999999998,
  15: 3.1199999999999775,
  16: 3.2199999999999753,
  17: 3.319999999999973,
  18: 3.419999999999971,
  19: 3.4999999999999694,
  20: 3.5899999999999674,
  21: 3.659999999999966,
  22: 3.7399999999999642,
  23: 3.8099999999999627,
  24: 3.8799999999999613,
  25: 3.93999999999996,
  26: 3.9999999999999587,
  27: 4.059999999999958,
  28: 4.119999999999957,
  29: 4.1699999999999555,
  30: 4.2199999999999545,
  31: 4.269999999999953,
  32: 4.319999999999952,
  33: 4.369999999999951,
  34: 4.40999999999995,
  35: 4.4499999999999496,
  36: 4.489999999999949,
  37: 4.529999999999948,
  38: 4.569999999999947,
  39: 4.609999999999946,
  40: 4.6399999999999455,
  41: 4.679999999999945,
  42: 4.709999999999944,
  43: 4.739999999999943,
  44: 4.769999999999943,
  45: 4.799999999999942,
  46: 4.8299999999999415,
  47: 4.859999999999941,
  48: 4.88999999999994,
  49: 4.90999999999994,
  50: 4.939999999999939,
} as const;

function getDoublingLevel(realLevel: number) {
  const RESOLUTION = 0.01;
  const mobDoubleTable = new Map<number, number>();

  for (let k = 0; ; k += RESOLUTION) {
    const perc = (0.6 - k * 0.03) / (0.6 + k * 0.03);
    const lbla = Math.sqrt(2 * perc) - 1;
    const lookupLev = Math.floor(k / lbla / RESOLUTION);
    mobDoubleTable.set(lookupLev, k);
    if (Math.floor(lookupLev * RESOLUTION) >= 50) break;
  }

  let levelToFind = Math.floor(Math.max(realLevel, 1) / RESOLUTION);
  let kLev = 0;
  while (kLev === 0) {
    if (mobDoubleTable.has(levelToFind)) {
      kLev = mobDoubleTable.get(levelToFind) as number;
    } else {
      levelToFind -= 1;
    }
  }
  return kLev <= 0 ? 1 : kLev;
}

const doublingLevels = {};
function populateDoublingLevels() {
  for (let i = 1; i <= 50; i++) {
    doublingLevels[i] = getDoublingLevel(i);
  }
}
const { DOUBLING_LEVELS } = require('./get_doubling_level');
const { plotStat } = require('./plotStat');

const { max, min, floor } = Math;

const TEST_BUILD_ENABLED = false;

function defendRound({
  level,
  armor,
  isPc,  
  combatMode,
  oomlatValue,
  defenseValue,
  chivalryValue,
  berserkValue,
  blindFightingValue,
  groundfightingValue,
  hasGuardianAura,
  agilityValue,
  canSeeAttacker,
  isFlying,
  isRiding,
  isSitting,
  isCasting,
}) {
  let bonus = 0;
  const myLev = max(10, floor(16.67 * DOUBLING_LEVELS[level]));

  armor = 1000 - armor;

  if (isPc) {
    armor += floor((armor * oomlatValue) / 250);
    bonus = floor((max(armor - 500, 0) * 2) / 3);
    bonus = floor(min(bonus, (level * 1000) / 60) + myLev);
  } else {
    bonus = floor((max(armor - 400, 0) * 5) / 6);
  }

  if (isPc) {
    if (combatMode === 'ATTACK_DEFENSE') bonus += floor(myLev / 4);
    if (combatMode === 'ATTACK_OFFENSE') bonus -= floor(myLev / 4);
    if (combatMode === 'ATTACK_BERSERK') {
      bonus -= floor(myLev / 4);
      bonus -= floor(((myLev / 2) * (100 - berserkValue)) / 100);
    }
  }

  if (hasGuardianAura) bonus += 40;
  if (isRiding) bonus += floor((159 * max(10, chivalryValue)) / 100);

  if (TEST_BUILD_ENABLED) {
    const scaledDefenseBonus = (myLev * 4 * level) / 100;
    bonus -= floor(scaledDefenseBonus);
    bonus += floor((scaledDefenseBonus * defenseValue) / 100);
  } else bonus += floor((myLev * max(100, defenseValue)) / 100);

  if (!isCasting)
    bonus += floor(335 * plotStat(agilityValue, 5, 205, 105) - 335);

  if (!canSeeAttacker)
    bonus -= floor((myLev * (100 - blindFightingValue)) / 100);

  let positionBonus = 0;
  if (isSitting) positionBonus -= floor(myLev / 3 + 1);
  else if (isRiding) positionBonus += floor(myLev / 4 + 1);
  else if (isFlying) positionBonus += floor(myLev / 3 + 1);

  if (isSitting && positionBonus < 0) {
    positionBonus = floor((positionBonus * (100 - groundfightingValue)) / 100);
    positionBonus = min(positionBonus, -1);
  }
  bonus += positionBonus;

  return bonus;
}

module.exports = { defendRound };

const { DOUBLING_LEVELS } = require('./get_doubling_level');
const { plotStat } = require('./plotStat');

const { max, min, floor } = Math;

function attackRound({
  level,
  isPc,
  cintaiValue,
  combatMode,
  offenseValue,
  chivalryValue,
  advOffenseValue,
  dexterityValue,
  isFlying,
  isRiding,
  isSitting,
  npcCombatValue,
  totalHitroll,
  canSeeTarget,
  blindFightingValue,
  groundfightingValue,
  isCasting,
}) {
  let bonus = floor((level * 50) / 3);

  const myLev = max(10, floor(16.67 * DOUBLING_LEVELS[level]));

  if (combatMode === 'ATTACK_DEFENSE') bonus = floor(bonus + myLev / 2);

  if (combatMode === 'ATTACK_OFFENSE' || combatMode === 'ATTACK_BERSERK')
    bonus = floor(bonus + myLev / 4);

  if (chivalryValue > 0 && isRiding)
    bonus += floor((74 * max(10, chivalryValue)) / 100);

  if (cintaiValue > 0) bonus += floor((cintaiValue / 20) * 3);

  bonus -= floor((myLev * min(100, 4 * level)) / 100);
  bonus += isPc()
    ? floor((myLev * max(10, offenseValue)) / 100)
    : floor((myLev * max(10, npcCombatValue)) / 100);

  if (advOffenseValue > 0) bonus += floor((advOffenseValue / 4) * 3);

  bonus += floor(335 * plotStat(dexterityValue, 5, 205, 5) - 335);

  bonus += floor((5 * totalHitroll) / 3);

  if (!canSeeTarget) bonus -= floor((myLev * (100 - blindFightingValue)) / 100);

  if (isCasting) bonus -= floor((2 * myLev) / 3);

  let positionBonus = 0;
  if (isSitting) positionBonus = floor((-1 * myLev) / 4 + 1);
  else if (isRiding) positionBonus = floor(myLev / 4 + 1);
  else if (isFlying) positionBonus = floor(myLev / 3 + 1);

  if (positionBonus < 0 && groundfightingValue > 0) {
    positionBonus = floor((positionBonus * (100 - groundfightingValue)) / 100);
    positionBonus = min(positionBonus, -1);
  }

  bonus += positionBonus;

  return bonus;
}

module.exports = { attackRound };

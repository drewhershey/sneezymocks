import { DOUBLING_LEVELS } from "./get_doubling_level";
import { plotStat } from "./plotStat";

const { max, floor } = Math;

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

export function defendRound({
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
  const myLev = max(10, floor(16.67 * DOUBLING_LEVELS[level]));
  armor = 1000 - armor;
  if (isPc) {
    armor += floor((armor * oomlatValue) / 250);
    bonus = floor((max(armor - 500, 0) * 2) / 3);
  } else {
    bonus = floor((max(armor - 400, 0) * 5) / 6);
  }

  if (isPc) {
    if (combatMode === 'ATTACK_DEFENSE') bonus += floor(myLev / 4);
    if (combatMode === 'ATTACK_OFFENSE') bonus -= floor(myLev / 4);
    if (combatMode === 'ATTACK_BERSERK') {
      bonus -= floor(myLev / 4);
      let amt = floor(myLev / 2);
      amt *= floor((100 - berserkValue) / 100);
      bonus -= amt;
    }
  }

  if (hasGuardianAura) bonus += 40;

  if (chivalryValue >= 0)
    bonus += floor((159 * max(10, chivalryValue)) / 100);

  const scaledDefenseBonus = (myLev * 4 * level) / 100;
  bonus -= floor(scaledDefenseBonus);
  bonus += floor((scaledDefenseBonus * defenseValue) / 100);

  bonus += floor(335 * plotStat(agilityValue, 5, 205, 105) - 335);

  // TODO: Add blind check

  if (isSitting) bonus -= floor(myLev / 3 + 1);
  if (isFlying) bonus += floor(myLev / 3 + 1);
  if (isRiding) bonus += floor(myLev / 4 + 1);

  return bonus;
}
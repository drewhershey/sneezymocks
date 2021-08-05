import { defendRound } from './defendRound';
import { hits } from './hits';

// Defender Config
const level = 1;
const armor = -1000; // As negative value, from getArmor()
const isPc = false;
// Enum, ATTACK_OFFENSE, ATTACK_DEFENSE, ATTACK_BERSERK
const combatMode = 'ATTACK_OFFENSE';
const oomlatValue = 0;
const defenseValue = 0;
const chivalryValue = 0;
const berserkValue = 0;
const hasGuardianAura = false;
const agilityValue = 105; // 5 - 205
const isFlying = false;
const isSitting = false;
const isRiding = false;

export function specialAttack(skill: string, targetIsWary: boolean) {
  const offense = 0; // TODO: implement attackRound();
  const defense = defendRound({
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
  });

  let mod = offense - defense;

  if (
    (skill === 'SKILL_BACKSTAB' ||
      skill === 'SKILL_CUDGEL' ||
      skill === 'SKILL_RANGED_PROF') &&
    targetIsWary
  ) {
    mod -= 300;
  }

  return hits(mod);
}

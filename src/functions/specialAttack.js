const { attackRound } = require('./attackRound');
const { defendRound } = require('./defendRound');
const { hits } = require('./hits');

// Attacker Config
const attackerConfig = {
  level: 1,
  isPc: false,
  cintaiValue: 0,
  combatMode: 'ATTACK_OFFENSE',
  offenseValue: undefined,
  chivalryValue: 0,
  advOffenseValue: 100,
  dexterityValue: 105,
  isFlying: false,
  isRiding: false,
  isSitting: false,
  npcCombatValue: 100,
  totalHitroll: 0,
  canSeeTarget: true,
  blindFightingValue: 0,
  groundfightingValue: 0,
  isCasting: false,
};

const defenderConfig = {
  level: 1,
  armor: -1000, // As negative value, from getArmor()
  isPc: false,
  combatMode: 'ATTACK_OFFENSE',
  oomlatValue: 0,
  defenseValue: 0,
  chivalryValue: 0,
  berserkValue: 0,
  blindFightingValue: 0,
  groundfightingValue: 0,
  hasGuardianAura: false,
  agilityValue: 105,
  canSeeAttacker: true,
  isCasting: false,
  isFlying: false,
  isSitting: false,
  isRiding: false,
  isWary: false,
};

function specialAttack(skill) {
  const offense = attackRound(attackerConfig);
  const defense = defendRound(defenderConfig);

  let mod = offense - defense;

  if (
    (skill === 'SKILL_BACKSTAB' ||
      skill === 'SKILL_CUDGEL' ||
      skill === 'SKILL_RANGED_PROF') &&
    defenderConfig.isWary
  ) {
    mod -= 300;
  }

  return hits(mod);
}

module.exports = { specialAttack };

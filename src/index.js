import { getSkillDam } from './getSkillDam';

// Caster/Attacker Config
const attackerConfig = {
  casterOrAttackerLevel: 50,
  skillAdvDiscLearnedness: 100,
  maxSkillOrSpellLevel: 100, // Sometimes found in code for spell
  modifierStatValue: 205,
  skillOrSpellName: 'SKILL_BACKSTAB',
  hasTarget: true,
  targetLevel: 60,
  targetIsPc: false,
};

const levelToUse = Math.min(
  attackerConfig.casterOrAttackerLevel || attackerConfig.maxSkillOrSpellLevel
)

const result = getSkillDam({
  ...attackerConfig,
  maxSkillOrSpellLevel: levelToUse,
});

console.log(result);

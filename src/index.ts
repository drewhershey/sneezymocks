import { getSkillDam } from './getSkillDam';

// Caster/Attacker Info
const casterOrAttackerLevel = 50;
const skillAdvDiscLearnedness = 100;
const maxSkillOrSpellLevel = 100;
const modifierStatValue = 205;
const skillOrSpellName = 'SKILL_BACKSTAB';

// Victim Info
const hasTarget = true;
const targetLevel = 60;
const targetIsPc = false;

const result = getSkillDam({
  skillAdvDiscLearnedness,
  maxSkillOrSpellLevel: Math.min(casterOrAttackerLevel || maxSkillOrSpellLevel),
  modifierStatValue,
  skillOrSpellName,
  hasTarget,
  targetLevel,
  targetIsPc,
});

console.log(result);
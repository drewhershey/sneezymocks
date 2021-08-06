const { getSkillDam } = require('./getSkillDam');

// Caster/Attacker Config
const attackerConfig = {
  skillOrSpellName: 'SKILL_BACKSTAB',
  casterOrAttackerLevel: 50,
  targetLevel: 60,
  // % learnedness of advanced disc for chosen skill
  skillAdvDiscLearnedness: 100,
  // Sometimes found in code for individual spells
  maxSkillOrSpellLevel: 100, 
  // Attacker's stat value for whichever stat modifies
  // chosen skill
  modifierStatValue: 205,
  // Damage gets adjusted for targetted spells
  hasTarget: true,
  // Damage gets adjusted depending on whether
  // target is PC or mob  
  targetIsPc: false,
};

const levelToUse = Math.min(
  attackerConfig.casterOrAttackerLevel || attackerConfig.maxSkillOrSpellLevel
);

const result = getSkillDam({
  ...attackerConfig,
  maxSkillOrSpellLevel: levelToUse,
});

console.log(
  result === `SKILL NOT FOUND`
    ? `SKILL '${attackerConfig.skillOrSpellName}' NOT FOUND`
    : {
        skillName: attackerConfig.skillOrSpellName,
        ...result,
      }
);

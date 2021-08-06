const { getSkillDam } = require('./functions/getSkillDam');
const { min } = Math;

// Caster/Attacker Config
const attackerConfig = {
  // From data/spell-info-converted.json
  // Values in there were pulled from spell_info.cc
  skillOrSpellName: 'SPELL_GUST',
  casterOrAttackerLevel: 50,
  targetLevel: 60,
  // % learnedness of advanced disc for chosen skill
  skillAdvDiscLearnedness: 100,
  // Sometimes found in code for individual spells. 
  // If not found, just set to 100.
  maxSkillOrSpellLevel: 10,
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

const {
  skillOrSpellName,
  casterOrAttackerLevel,
  targetLevel,
  maxSkillOrSpellLevel,
} = attackerConfig;

if (result === 'SKILL NOT FOUND')
  console.log(`SKILL '${attackerConfig.skillOrSpellName}' NOT FOUND`);
else {
  console.log(`           Skill Name: ${skillOrSpellName}`);
  console.log(`       Attacker Level: ${casterOrAttackerLevel}`);
  // Damage formula uses lower of attacker actual level or
  // spell's maximum calculated level
  console.log(
    `    Actual Level Used: ${min(casterOrAttackerLevel, result.maxLev)}`
  );
  console.log(`         Target Level: ${targetLevel}`);
  // Target level at which damage starts scaling down
  console.log(`Damage Scaling Begins: ${maxSkillOrSpellLevel}`);
  console.log(`       Minimum Damage: ${result.min}`);
  console.log(`       Maximum Damage: ${result.max}`);
  // Minimum level skill will uses to calculate damage
  console.log(`     Skill Min. Level: ${result.minLev}`);
  // Maximum level skill will use to calculate damage
  console.log(`      Skill Max Level: ${result.maxLev}`);
}

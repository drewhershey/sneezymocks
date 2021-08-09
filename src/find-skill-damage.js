const SPELL_SCALING_LEVELS = require('../data/spell-scaling-levels.json');
const { getSkillDam } = require('./functions/getSkillDam');
const { min } = Math;

// Caster/Attacker Constants
const casterOrAttackerLevel = 50;
const skillAdvDiscLearnedness = 100;
const modifierStatValue = 105;
const hasTarget = true;
const targetLevel = 50;
const targetIsPc = false;
const skillOrSpellNames = [
  'SPELL_PILLAR_SALT',  
  'SPELL_CALL_LIGHTNING',
  'SPELL_SPONTANEOUS_COMBUST',
];

const results = skillOrSpellNames.map((skillOrSpellName) => {
  const spellScalingLevel = SPELL_SCALING_LEVELS[skillOrSpellName];

  const levelToUse = spellScalingLevel
    ? Math.min(spellScalingLevel, casterOrAttackerLevel)
    : casterOrAttackerLevel;

  const result = getSkillDam({
    skillOrSpellName,
    casterOrAttackerLevel,
    skillAdvDiscLearnedness,
    modifierStatValue,
    hasTarget,
    targetLevel,
    targetIsPc,
    maxSkillOrSpellLevel: levelToUse,
  });

  return result === 'SKILL NOT FOUND'
    ? `SKILL '${skillOrSpellName}' NOT FOUND`
    : {
        skillOrSpellName: skillOrSpellName,
        damageScalingLevel: levelToUse,
        ...result,
      };
});

for (const result of results) {
  if (typeof result === 'string') console.log(result);
  else {
    const {
      skillOrSpellName,
      damageScalingLevel,
      minDamage,
      maxDamage,
      minLev,
      maxLev,
    } = result;

    const skillOrSpell = new RegExp('^SPELL');

    console.log(`           Skill Name: ${skillOrSpellName}`);
    console.log(`       Attacker Level: ${casterOrAttackerLevel}`);
    console.log(`         Target Level: ${targetLevel}`);
    // Target level at which damage starts scaling down
    console.log(
      `Damage Scaling Begins: ${
        skillOrSpell.test(skillOrSpellName) ? damageScalingLevel : 'N/A'
      }`
    );
    console.log(`       Minimum Damage: ${minDamage}`);
    console.log(`       Maximum Damage: ${maxDamage}`);
    // Damage formula uses lower of attacker actual level or
    // spell's maximum calculated level
    console.log(`Calculated Level Used: ${min(casterOrAttackerLevel, maxLev)}`);
    // Minimum level skill will uses to calculate damage
    console.log(`     Skill Min. Level: ${minLev}`);
    // Maximum level skill will use to calculate damage
    console.log(`     Skill Max. Level: ${maxLev}`);
    console.log('\n');
  }
}

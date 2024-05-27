const SPELL_SCALING_LEVELS = require('../../data/spell-scaling-levels.json');
const { getSkillDam } = require('../functions/getSkillDam');
const { min } = Math;

// Caster/Attacker Constants
const casterOrAttackerIsPC = true;
const casterOrAttackerLevel = 50;
const skillAdvDiscLearnedness = 100;
const modifierStatValue = 105;
const hasTarget = true;
const targetLevel = 50;
const targetIsPC = false;
// E.g. ['SPELL_HARM_LIGHT', 'SPELL_HARM_SERIOUS', 'SPELL_HARM_CRITICAL']
const skillOrSpellNames = [];

const results = skillOrSpellNames.map((skillOrSpellName) => {
	const spellScalingLevel = SPELL_SCALING_LEVELS[skillOrSpellName];

	const levelToUse = spellScalingLevel
		? Math.min(spellScalingLevel, casterOrAttackerLevel)
		: casterOrAttackerLevel;

	const result = getSkillDam({
		casterOrAttackerIsPC,
		casterOrAttackerLevel,
		hasTarget,
		maxSkillOrSpellLevel: levelToUse,
		modifierStatValue,
		skillAdvDiscLearnedness,
		skillOrSpellName,
		targetIsPC,
		targetLevel,
	});

	return result === 'SKILL NOT FOUND'
		? `'${skillOrSpellName}' NOT FOUND\n\n`
		: {
				damageScalingLevel: levelToUse,
				skillOrSpellName: skillOrSpellName,
				...result,
			};
});

for (const result of results) {
	if (typeof result === 'string') console.log(result);
	else {
		const {
			damageScalingLevel,
			maxDamage,
			maxLev,
			minDamage,
			minLev,
			skillOrSpellName,
		} = result;

		const skillOrSpell = new RegExp('^SPELL');

		console.log(`           Skill Name: ${skillOrSpellName}`);
		console.log(`Caster/Attacker Level: ${casterOrAttackerLevel}`);
		console.log(`Caster/Attacker Is PC: ${casterOrAttackerIsPC}`);
		console.log(`         Target Level: ${targetLevel}`);
		console.log(`         Target Is PC: ${targetIsPC}`);

		// Target level at which damage starts scaling down
		console.log(
			`Damage Scaling Begins: ${
				skillOrSpellName.startsWith('SPELL') ? damageScalingLevel : 'N/A'
			}`,
		);

		// Minimum level skill will uses to calculate damage
		console.log(`     Skill Min. Level: ${minLev}`);

		// Maximum level skill will use to calculate damage
		console.log(`     Skill Max. Level: ${maxLev}`);

		// Damage formula uses lower of attacker actual level or
		// spell's maximum calculated level
		console.log(`    Actual Level Used: ${min(casterOrAttackerLevel, maxLev)}`);
		console.log(`       Minimum Damage: ${minDamage}`);
		console.log(`       Maximum Damage: ${maxDamage}`);
		console.log('');
	}
}

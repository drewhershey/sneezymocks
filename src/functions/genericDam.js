const SPELL_INFO = require('../../data/spell-info-converted.json');
const { getSkillDiffModifier, balanceCorrectionForLevel } = require('./misc');
const { plotStat } = require('./plotStat');

const { min, max, floor } = Math;

const GLOBAL_DAMAGE_MOD = 0.65;

function genericDam({
  casterOrAttackerIsPC,
  skillOrSpellName,
  maxSkillOrSpellLevel,
  baseDamageModifier,
  reduce,
  trim,
  skillAdvDiscLearnedness,
  modifierStatValue,
  hasTarget,
  targetIsPc,
  targetLevel,
}) {
  const skill = SPELL_INFO.find((s) => s.skill === skillOrSpellName);

  if (!skill) return 'SKILL NOT FOUND';

  const {
    discipline,
    advDiscipline,
    learn,
    start,
    lag,
    componentTypes,
    canTarget,
    difficulty,
  } = skill;

  const isTasked = componentTypes.includes('SPELL_TASKED');
  const isAOE = canTarget.includes('TAR_AREA');

  const IS_BASIC = discipline !== advDiscipline;

  function getSkillLevelRange() {
    let maxLev = 0;
    let minLev = 0;

    if (IS_BASIC) {
      maxLev = floor(((100 / learn + (start - 1)) * 30) / 100);
      minLev = floor((start * 30) / 100);
    } else {
      maxLev = floor(30 + ((100 / learn + (start - 1)) * 20) / 100);
      minLev = floor(30 + (start * 20) / 100);
    }

    minLev = max(minLev, 1);
    maxLev = max(maxLev, 1);

    let bumpLev = 1;
    if (IS_BASIC) bumpLev = 1 + (0.2 * skillAdvDiscLearnedness) / 100;
    minLev = floor(minLev * bumpLev);
    maxLev = floor(maxLev * bumpLev);

    return { minLev, maxLev };
  }

  let { minLev, maxLev } = getSkillLevelRange();

  const adjustedLevel = max(min(maxSkillOrSpellLevel, maxLev), minLev);
  let adjustedLag = lag;
  let adjustedModifier = baseDamageModifier;
  if (isTasked) {
    adjustedLag++;
    adjustedModifier *= 1.1;
  }

  let fixedAmount = adjustedModifier * adjustedLag * adjustedLevel;

  if (
    (!casterOrAttackerIsPC || trim) &&
    ((hasTarget && targetIsPc) || !hasTarget)
  )
    fixedAmount *= 0.9091 / 1.75;

  fixedAmount *= 100 / (getSkillDiffModifier(difficulty) - 15);

  if (isAOE) fixedAmount *= 0.75;

  if (hasTarget && reduce) {
    const def = min(targetLevel, 60) * 16.67;
    const off =
      min(max(maxSkillOrSpellLevel, adjustedLevel), 60) * 16.67 +
      max(0, max(maxSkillOrSpellLevel, adjustedLevel) - 60) * 5;
    const mod = def - off;

    if (mod > 0) {
      fixedAmount *= max(60 - (9 * mod) / 50, 5);
      fixedAmount /= 60;
    }
  }

  // Only for PC hitting NPC
  if (casterOrAttackerIsPC && hasTarget && !targetIsPc)
    fixedAmount *= balanceCorrectionForLevel(adjustedLevel);

  fixedAmount -= adjustedLevel / 4;

  let minDamage = floor(fixedAmount + 1);
  let maxDamage = floor(fixedAmount + adjustedLevel / 2);

  if (modifierStatValue) {
    minDamage = floor(minDamage * plotStat(modifierStatValue, 0.8, 1.25, 1));
    maxDamage = floor(maxDamage * plotStat(modifierStatValue, 0.8, 1.25, 1));
  }

  minDamage = floor(minDamage * GLOBAL_DAMAGE_MOD);
  maxDamage = floor(maxDamage * GLOBAL_DAMAGE_MOD);

  return {
    minDamage: max(1, minDamage),
    maxDamage: max(1, maxDamage),
    minLev,
    maxLev,
  };
}

module.exports = { genericDam };

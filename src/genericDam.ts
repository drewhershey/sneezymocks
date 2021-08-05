import * as SPELL_INFO from '../data/spell-info-converted.json';
import { getSkillDiffModifier } from './misc';
import { plotStat } from './plotStat';
import { GetSkillDamParams, SkillGroupValues } from './getSkillDam';

interface SpellOrSkillInfo {
  skill: string;
  type: string;
  discipline: string;
  advDiscipline: string;
  modifierStat: string;
  name: string;
  difficulty: string;
  lag: number;
  minPosition: string;
  manaCost: number;
  lifeforceCost: number;
  pietyCost: number;
  canTarget: string[];
  symbolStress: number;
  fadeAway: string;
  fadeAwayRoom: string;
  fadeAwaySoon: string;
  fadeAwaySoonRoom: string;
  start: number;
  learn: number;
  startLearnDo: number;
  amountLearnDo: number;
  secStartLearnDo: boolean;
  secAmountLearnDo: boolean;
  learnDoDiff: string;
  alignmentModifier: number;
  componentTypes: string[];
  toggle: string;
};

type GenericDamParams = GetSkillDamParams & SkillGroupValues;

const GLOBAL_DAMAGE_MOD = 0.65;

export function genericDam({
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
}: GenericDamParams) {
  const skill: SpellOrSkillInfo | undefined = SPELL_INFO.find(
    (s) => s.skill === skillOrSpellName
  );

  if (!skill) return 'Skill Not Found'; 

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
      maxLev = Math.floor(((100 / learn + (start - 1)) * 30) / 100); //?
      minLev = Math.floor((start * 30) / 100); //?
    } else {
      maxLev = Math.floor(30 + ((100 / learn + (start - 1)) * 20) / 100); //?
      minLev = Math.floor(30 + (start * 20) / 100); //?
    }

    minLev = Math.max(minLev, 1); //?
    maxLev = Math.max(maxLev, 1); //?

    let bumpLev = 1;
    if (IS_BASIC) bumpLev = 1 + (0.2 * skillAdvDiscLearnedness) / 100; //?
    minLev = Math.floor(minLev * bumpLev); //?
    maxLev = Math.floor(maxLev * bumpLev); //?

    return { minLev, maxLev };
  }

  let { minLev, maxLev } = getSkillLevelRange(); //?

  const adjustedLevel = Math.max(
    Math.min(maxSkillOrSpellLevel, maxLev),
    minLev
  ); //?
  let adjustedLag = lag; //?
  let adjustedModifier = baseDamageModifier; //?
  if (isTasked) {
    adjustedLag++; //?
    adjustedModifier *= 1.1; //?
  }

  let fixedAmount = adjustedModifier * adjustedLag * adjustedLevel; //?

  if (trim && ((hasTarget && targetIsPc) || !hasTarget))
    fixedAmount *= 0.9091 / 1.75; //?

  fixedAmount *= 100 / (getSkillDiffModifier(difficulty) - 15); //?

  if (isAOE) fixedAmount *= 0.75; //?

  if (hasTarget && reduce) {
    const def = Math.min(targetLevel, 60) * 16.67; //?
    const off =
      Math.min(Math.max(maxSkillOrSpellLevel, adjustedLevel), 60) * 16.67 +
      Math.max(0, Math.max(maxSkillOrSpellLevel, adjustedLevel) - 60) * 5; //?
    const mod = def - off; //?

    if (mod > 0) {
      fixedAmount *= Math.max(60 - (9 * mod) / 50, 5); //?
      fixedAmount /= 60; //?
    }
  }

  if (hasTarget && !targetIsPc)
    fixedAmount *= Math.min(Math.max((adjustedLevel - 25) * 0.1 + 1, 1), 2); //?

  fixedAmount -= adjustedLevel / 4; //?

  let minDamage = Math.floor(fixedAmount + 1); //?
  let maxDamage = Math.floor(fixedAmount + adjustedLevel / 2); //?

  if (modifierStatValue) {
    minDamage *= plotStat(modifierStatValue, 0.8, 1.25, 1.0);
    maxDamage *= plotStat(modifierStatValue, 0.8, 1.25, 1.0);
  } //?

  minDamage = Math.floor(minDamage * GLOBAL_DAMAGE_MOD); //?
  maxDamage = Math.floor(maxDamage * GLOBAL_DAMAGE_MOD); //?

  return {
    min: Math.max(1, minDamage),
    max: Math.max(1, maxDamage),
    minLev,
    maxLev,
  };
}
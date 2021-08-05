import * as SPELL_INFO from '../data/spell-info-fixed.json';
import { plotStat, getSkillDiffModifier, getRandomIntInclusive } from './misc';

const GLOBAL_DAMAGE_MOD = 0.65;
const HAS_SAVING_THROW = 4 / 3;
const HARD_TO_FIND_COMPONENT = 1.2;
const OUTDOOR_ONLY = 1.1;
const NEED_RAIN_SNOW_LIGHTNING = 1.05;
const NEED_RAIN_LIGHTNING = 1.075;

interface SkillGroupValues {  
  baseDamageModifier: number;
  reduce: boolean;
  trim: boolean;
}

const createSkillDamExtrasObj = (
  _expectedDisc: string,
  baseDamageModifier: number,
  reduce: boolean,
  trim: boolean
): SkillGroupValues => ({  
  baseDamageModifier,
  reduce,
  trim,
});

interface GetSkillDamParams {
  skillAdvDiscLearnedness: number;
  maxSkillOrSpellLevel: number;
  modifierStatValue: number;
  skillOrSpellName: string;
  hasTarget: boolean;
  targetIsPc: boolean;
  targetLevel: number;
}

export const getSkillDam = (getSkillDamParams: GetSkillDamParams) => {
  let skillGroupValues: SkillGroupValues;
  switch (getSkillDamParams.skillOrSpellName) {
    case 'SKILL_KICK':
    case 'SKILL_HEADBUTT':
    case 'SKILL_KNEESTRIKE':
    case 'SKILL_STOMP':
    case 'SKILL_BODYSLAM':
    case 'SKILL_SPIN':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_WARRIOR',
        0.2,
        false,
        false
      );
      break;
    case 'SKILL_DEATHSTROKE':
      // deathstroke fail has chance of being hit back
      // allow 2* normal dam
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_WARRIOR',
        'victimKnowsDeathstroke' ? 0.4 : 0.2,
        false,
        false
      );
      break;
    case 'SPELL_SAND_BLAST':
    case 'SPELL_HELLFIRE':
    case 'SPELL_ENERGY_DRAIN':
      // damage increased slightly due to component being hard to come by
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_MAGE',
        2.05 * HARD_TO_FIND_COMPONENT,
        true,
        false
      );
      break;
    case 'SPELL_DUST_STORM':
    case 'SPELL_PEBBLE_SPRAY':
    case 'SPELL_LAVA_STREAM':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_MAGE',
        2.05,
        true,
        false
      );
      break;
    case 'SPELL_TORNADO':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_MAGE',
        2.05 * OUTDOOR_ONLY,
        true,
        false
      );
      break;
    case 'SPELL_COLOR_SPRAY':
    case 'SPELL_ACID_BLAST':
    case 'SPELL_FLAMING_SWORD':
    case 'SPELL_STUNNING_ARROW':
      // for normal success, these spells provide a "save" that cuts dam in
      // half.  That is, 50% chance of dam in half.  The average would be 75%
      // hence we multiply by 4/3 to get the desired result
      // damage also increased due to difficulty in obtaining component
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_MAGE',
        2.05 * HARD_TO_FIND_COMPONENT * HAS_SAVING_THROW,
        true,
        false
      );
      break;
    case 'SPELL_ATOMIZE':
    case 'SPELL_BLAST_OF_FURY':
    case 'SPELL_MYSTIC_DARTS':
    case 'SPELL_GUSHER':
    case 'SPELL_TSUNAMI':
    case 'SPELL_ICE_STORM':
    case 'SPELL_GUST':
    case 'SPELL_ARCTIC_BLAST':
    case 'SPELL_ICY_GRIP':
    case 'SPELL_FIREBALL':
    case 'SPELL_INFERNO':
    case 'SPELL_HANDS_OF_FLAME':
    case 'SPELL_SLING_SHOT':
    case 'SPELL_GRANITE_FISTS':
      // for normal success, these spells provide a "save" that cuts dam in
      // half.  That is, 50% chance of dam in half.  The average would be 75%
      // hence we multiply by 4/3 to get the desired result
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_MAGE',
        2.05 * HAS_SAVING_THROW,
        true,
        false
      );
      break;
    case 'SPELL_METEOR_SWARM':
      // for normal success, these spells provide a "save" that cuts dam in
      // half.  That is, 50% chance of dam in half.  The average would be 75%
      // hence we multiply by 4/3 to get the desired result
      // meteor has an outdoor-only limitation:
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_MAGE',
        2.25 * HAS_SAVING_THROW * OUTDOOR_ONLY,
        true,
        false
      );
      break;
    case 'SPELL_HARM':
    case 'SPELL_PILLAR_SALT':
    case 'SPELL_RAIN_BRIMSTONE':
    case 'SPELL_EARTHQUAKE':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_CLERIC',
        1.667,
        true,
        false
      );
      break;
    case 'SPELL_SPONTANEOUS_COMBUST':
    case 'SPELL_FLAMESTRIKE':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_CLERIC',
        1.667 * HAS_SAVING_THROW,
        true,
        false
      );

      break;
    case 'SPELL_CALL_LIGHTNING':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_CLERIC',
        1.888 * HAS_SAVING_THROW * OUTDOOR_ONLY * NEED_RAIN_LIGHTNING,
        true,
        false
      );

      break;
    ////////////////////
    // SHAMAN STUFF
    ////////////////////
    case 'SPELL_STORMY_SKIES':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_SHAMAN',
        2.15 * HARD_TO_FIND_COMPONENT * NEED_RAIN_SNOW_LIGHTNING,
        true,
        false
      );
      break;
    case 'SPELL_CARDIAC_STRESS':
    case 'SPELL_AQUATIC_BLAST':
    case 'SPELL_BLOOD_BOIL':
    case 'SPELL_DEATHWAVE':
    case 'SPELL_RAZE':
    case 'SPELL_LICH_TOUCH':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_SHAMAN',
        2.15 * HARD_TO_FIND_COMPONENT,
        true,
        false
      );
      break;
    case 'SPELL_DISTORT':
    case 'SPELL_STICKS_TO_SNAKES':
    case 'SPELL_SOUL_TWIST':
    case 'SPELL_SQUISH':
    case 'SPELL_FLATULENCE':
    case 'SPELL_VAMPIRIC_TOUCH':
    case 'SPELL_LIFE_LEECH':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_SHAMAN',
        2.15 * HAS_SAVING_THROW,
        true,
        false
      );
      break;
    ///////////////////////
    // END SHAMAN STUFF
    ///////////////////////
    case 'SPELL_HARM_LIGHT':
    case 'SPELL_HARM_SERIOUS':
    case 'SPELL_HARM_CRITICAL':
      // other: paralyze lag is based on this logic manually in paralyze
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_CLERIC',
        1.667,
        true,
        false
      );

      break;
    case 'SPELL_BONE_BREAKER':
    case 'SPELL_PARALYZE_LIMB':
    case 'SPELL_NUMB':
    case 'SPELL_WITHER_LIMB':
      // these are torments, this gets called for anti-salve stuff
      // divide by scale factor to keep under control as castable multiple times
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_CLERIC',
        1.667 / 5.0,
        true,
        false
      );
      break;
    case 'SPELL_HEAL_LIGHT':
    case 'SPELL_HEAL_SERIOUS':
    case 'SPELL_HEAL_CRITICAL':
    case 'SPELL_HEAL':
    case 'SPELL_HEAL_FULL':
    case 'SPELL_HEAL_CRITICAL_SPRAY':
    case 'SPELL_HEAL_SPRAY':
    case 'SPELL_HEAL_FULL_SPRAY':
      // heal spells should NOT be reduced for casting over leve
      // also, lets let the modifier be 1.5* what it is for damage
      // however, in PC v PC case, do decrease the amount being healed
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_CLERIC',
        2.5,
        false,
        true
      );
      break;
    case 'SPELL_HEALING_GRASP':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_SHAMAN',
        2.5,
        false,
        true
      );
      break;
    case 'SKILL_KICK_THIEF':
    case 'SKILL_GARROTTE':
    case 'SKILL_STABBING':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_THIEF',
        1.033,
        false,
        false
      );
      break;
    // backstab has some limitations (sneak, opening only), so we allow it to
    // violate the rules slightly (arbitrary)
    case 'SKILL_BACKSTAB':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_THIEF',
        2.0,
        false,
        false
      );
      break;
    // made this slightly higher than backstab since it is in an advanced discipline
    case 'SKILL_THROATSLIT':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_THIEF',
        2.01,
        false,
        false
      );
      break;
    case 'SKILL_CHARGE':
      // limited to mounted and has other penalties  (3*normal dam)
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_DEIKHAN',
        0.9 * 3,
        false,
        false
      );
      break;
    case 'SKILL_SMITE':
      // this is limited to once a day, and has limits from weapon-use to
      // so lets let it do a LOT of damage
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_DEIKHAN',
        0.639 * 8,
        true,
        false
      );
      break;
    case 'SPELL_HARM_DEIKHAN':
      // a 4/3 factor added for save cutting into overall damage
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_DEIKHAN',
        0.639 * HAS_SAVING_THROW,
        true,
        false
      );
      break;
    case 'SPELL_HARM_LIGHT_DEIKHAN':
    case 'SPELL_HARM_SERIOUS_DEIKHAN':
    case 'SPELL_HARM_CRITICAL_DEIKHAN':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_DEIKHAN',
        0.639,
        true,
        false
      );
      break;
    case 'SPELL_NUMB_DEIKHAN':
      // these are torments, this gets called for anti-salve stuff
      // divide by scale factor to keep under control as castable multiple times
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_DEIKHAN',
        0.639 / 5.0,
        true,
        false
      );
      break;
    case 'SPELL_HEAL_LIGHT_DEIKHAN':
    case 'SPELL_HEAL_SERIOUS_DEIKHAN':
    case 'SPELL_HEAL_CRITICAL_DEIKHAN':
      // heal spells should NOT be reduced for casting over leve
      // also, lets let the modifier be 1.5* what it is for damage
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_DEIKHAN',
        0.959,
        false,
        true
      );
      break;
    case 'SPELL_ROOT_CONTROL':
      // 4/3 factor added here due to save cutting into avg damage
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_RANGER',
        0.529 * HAS_SAVING_THROW,
        true,
        false
      );
      break;
    case 'SKILL_KICK_MONK':
    case 'SKILL_CHOP':
    case 'SKILL_HURL':
    case 'SKILL_BONEBREAK':
    case 'SKILL_DEFENESTRATE':
    case 'SKILL_SHOULDER_THROW':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_MONK',
        0.233,
        false,
        false
      );
      break;
    case 'SKILL_CHI':
      // there is no hits() check on this, so treat like a spell
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_MONK',
        0.233,
        true,
        false
      );
      break;
    case 'SKILL_PSI_BLAST':
    case 'SKILL_MIND_THRUST':
    case 'SKILL_PSYCHIC_CRUSH':
    case 'SKILL_KINETIC_WAVE':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_PSIONICS',
        0.2,
        true,
        false
      );
      break;
    case 'SPELL_SKY_SPIRIT':
    case 'SPELL_EARTHMAW':
      skillGroupValues = createSkillDamExtrasObj(
        'DISC_ANIMAL',
        0.529 * OUTDOOR_ONLY,
        true,
        false
      );
      break;
    default:
      return 0;
  }
  return genericDam({
    ...getSkillDamParams,
    ...skillGroupValues,
  });
};

type SpellOrSkillInfo = {
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

function genericDam({
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
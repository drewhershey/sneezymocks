import { DOUBLING_LEVELS } from "./get_doubling_level";

const { max, min, floor } = Math;

interface AttackRoundParams {
  level: number;
  armor: number;
  isPc: boolean;
  oomlatValue: number;
  combatMode: string;
  defenseValue: number;
  chivalryValue: number;
  berserkValue: number;
  hasGuardianAura: boolean;
  agilityValue: number;
  isFlying: boolean;
  isRiding: boolean;
  isSitting: boolean;
}

export function attackRound({
  level,
  armor,
  isPc,
  oomlatValue,
  combatMode,
  defenseValue,
  chivalryValue,
  berserkValue,
  hasGuardianAura,
  agilityValue,
  isFlying,
  isRiding,
  isSitting,
})
{
  let bonus = floor(level * 50 / 3);
  
  const myLev = max(10, floor(16.67 * DOUBLING_LEVELS[level]));

  
  if (combatMode === 'ATTACK_DEFENSE')
      bonus = floor(bonus + myLev / 2);

  if (combatMode === 'ATTACK_OFFENSE' || combatMode === 'ATTACK_BERSERK')
      bonus = floor(bonus + myLev / 4);    

  if (doesKnowSkill(SKILL_CHIVALRY) && getPosition() == POSITION_MOUNTED) {
    // C.F. balance for the reasons on these numbers
    // we want to yield a hitrate that is 2/9 higher for fully learned
    // deikhan.  Assuming base hit rate of 60%, that means yielding
    // 13.3% more hits at 3% per level that translates into 4.4444
    // levels.  At a rate of 50/3 points per level, we should add 74.0741
    int amt = 74;
    amt *= max(10, (int) getSkillValue(SKILL_CHIVALRY));
    amt /= MAX_SKILL_LEARNEDNESS;
    bonus += amt;
  }

  //  Add CINTAI's benefit, 0-15
  if (doesKnowSkill(SKILL_CINTAI)) 
    bonus += (int)(((float) getSkillValue(SKILL_CINTAI) / 20.0) * 3.0);

  // offense skill should play decent role
  // mobs get combat (not offense)

  // don't let this skew the return: it goes up roughly 4*lev
  // lower it by the theoretical value
  int amt = my_lev;
  amt *= min(100, 4*GetMaxLevel());
  amt /= 100;
  bonus -= amt;

  // raise it by the actual learning
  if (isPc()) {
    if (doesKnowSkill(SKILL_OFFENSE)) {
      amt = my_lev;
      amt *= max(10, (int) getSkillValue(SKILL_OFFENSE));
      amt /= 100;
      bonus += amt;
    }
  } else {
    CDiscipline * cdisc = getDiscipline(DISC_COMBAT);
    if (cdisc) {
      amt = my_lev;
      amt *= max(10, (int) cdisc->getLearnedness());
      amt /= 100;
      bonus += amt;
    }
  }

  // Advanced Offense
  // For Monks and Thieves. This will be about the same as chivalry
  if (doesKnowSkill(SKILL_ADVANCED_OFFENSE))
    bonus += ((getSkillValue(SKILL_ADVANCED_OFFENSE) / 4.0) * 3.0);

  // treat DEX here as a modifier for +hitroll
  // From BALANCE: we want high DEX to yield 5/4 more hits
  // and low dex to yield 4/5 the hits
  // so assuming that "normal" is a 60% rate, high should be 75%, and low 48%
  // 1 lev = 16.67 pts of bonus = 3%
  // 1 pt of bonus = 0.18%
  // 75% rate would be extra 15% would be 83.3 pts
  // 48% rate would be loss of 12% would be 66.67 pts 
  //bonus += (int) plotStat(STAT_CURRENT, STAT_DEX, -67, 84, 0);

  // this does the same thing - just uses the standardized function - dash
  bonus += (int)(335 * getDexMod() - 335);

  // thaco adjustment
  // +10 hitroll should let me fight evenly with L+1 mob
  // a 1 lev diff is 1000/60 = 50/3 points
  // so each point of thaco should grant 5/3 to bonus
  bonus += 5 * (getHitroll() + getSpellHitroll())/3;

  // Check if you can see your target. (penalty)
  if (target && !canSee(target)){
    int amt = my_lev;
    if(doesKnowSkill(SKILL_BLINDFIGHTING)) {
      amt *= 100 - getSkillValue(SKILL_BLINDFIGHTING);
      amt /= 100;
    }
    bonus -= amt + 1;
  }

  // if casting, penalize
  // obviously, this probably affects mobs more than PCs (engaged)
  if (spelltask)
    bonus -= 2 * my_lev / 3;

  // positional modifiers
  // penalize for attacking on ground
  // note, we do not give a benefit for attacking a victim on ground here, we
  // do that in defend
  int val = 0;
  switch (getPosition()) {
    case POSITION_DEAD:
    case POSITION_MORTALLYW:
    case POSITION_INCAP:
    case POSITION_STUNNED:
    case POSITION_SLEEPING:
      val = -bonus;  // attack while asleep?
      break;
    case POSITION_RESTING:
      val = -(my_lev/3 +1);
      break;
    case POSITION_SITTING:
      val = -(my_lev/4 +1);
      break;
    case POSITION_ENGAGED:
    case POSITION_FIGHTING:
    case POSITION_CRAWLING:
    case POSITION_STANDING:
      break;
    case POSITION_MOUNTED:
      val = my_lev/4 +1;
      break;
    case POSITION_FLYING:
      val = my_lev/3 +1;
      break;
  }
  if (getPosition() < POSITION_STANDING &&
      awake() &&
      val < 0) {
    if(doesKnowSkill(SKILL_GROUNDFIGHTING)) {
      int gsv = getSkillValue(SKILL_GROUNDFIGHTING);
      val = val * (100 - gsv) / MAX_SKILL_LEARNEDNESS;
      val = min(val, -1);
    }
  }
  bonus += val;

  // we use to min/max this between 0-1200
  // I feel that if your modifiers make you REALLy suck, or really rock
  // you deserve to keep the bonus
  return bonus;
}
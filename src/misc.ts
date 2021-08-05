export function plotStat(
  statValue: number,
  minValue: number,
  maxValue: number,
  avg: number,
  power: number = 1.4
) {
  const MAX_STAT = 205;
  const MIN_STAT = 5;
  const MID_LINE = (MAX_STAT - MIN_STAT) / 2 + MIN_STAT; //?

  const cappedStatValue = Math.min(Math.max(statValue, MIN_STAT), MAX_STAT);

  return cappedStatValue >= MID_LINE
    ? ((maxValue - avg) / Math.pow(MAX_STAT - MID_LINE, power)) *
        Math.pow(cappedStatValue - MID_LINE, power) +
        avg
    : ((minValue - avg) / Math.pow(MID_LINE - MIN_STAT, power)) *
        Math.pow(MID_LINE - cappedStatValue, power) +
        avg;
}

export function getSkillDiffModifier(difficulty: string) {
  switch (difficulty) {
    case 'TASK_TRIVIAL':
      return 110;
    case 'TASK_EASY':
      return 100;
    case 'TASK_NORMAL':
      return 90;
    case 'TASK_DIFFICULT':
      return 80;
    case 'TASK_DANGEROUS':
      return 70;
    case 'TASK_HOPELESS':
      return 50;
    case 'TASK_IMPOSSIBLE':
      return 35;
    default:
      return 90;
  }
}

export function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
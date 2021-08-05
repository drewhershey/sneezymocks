const { min, max, pow } = Math;

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

  const cappedStatValue = min(max(statValue, MIN_STAT), MAX_STAT);

  return cappedStatValue >= MID_LINE
    ? ((maxValue - avg) / pow(MAX_STAT - MID_LINE, power)) *
        pow(cappedStatValue - MID_LINE, power) +
        avg
    : ((minValue - avg) / pow(MID_LINE - MIN_STAT, power)) *
        pow(MID_LINE - cappedStatValue, power) +
        avg;
}

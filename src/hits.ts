import { getRandomIntInclusive } from "./misc";

const { floor, min, max } = Math;

export function hits(mod: number) {
  const factor = floor(min(max(600 + (9 * mod) / 5, 0), 1000));
  const roll = getRandomIntInclusive(0, 999);
  const result =
    roll < 50
      ? 'CRIT_SUCCESS'
      : roll >= 950
      ? 'CRIT_FAILURE'
      : roll < factor
      ? 'SUCCESS'
      : 'FAILURE';

  const chance = min(factor / 1000, 0.95);
  
  return {
    result,
    chance,
  };
}

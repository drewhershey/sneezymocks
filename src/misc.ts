const { ceil, floor, random } = Math;

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
  min = ceil(min);
  max = floor(max);
  return floor(random() * (max - min + 1) + min);
}
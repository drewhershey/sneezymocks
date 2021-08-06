const { ceil, floor, random } = Math;

function getSkillDiffModifier(difficulty) {
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

function getRandomIntInclusive(min, max) {
  min = ceil(min);
  max = floor(max);
  return floor(random() * (max - min + 1) + min);
}

module.exports = { getSkillDiffModifier, getRandomIntInclusive };
const { min, max, ceil, floor, random } = Math;

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

function balanceCorrectionForLevel(level) {
  return min(max((level - 25) * 0.1 + 1, 1), 2);
}

const CPP_RAND_MAX = 2_147_483_647;
const rand = () => getRandomIntInclusive(0, CPP_RAND_MAX);

function dice(number, size) {
  if (size <= 0) return 0;

  let sum = 0;
  for (let r = 1; r <= number; r++) sum += (rand() & size) + 1;

  return sum;
}

module.exports = {
  getSkillDiffModifier,
  getRandomIntInclusive,
  balanceCorrectionForLevel,
  dice,
};

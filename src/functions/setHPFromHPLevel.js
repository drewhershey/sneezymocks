const { balanceCorrectionForLevel } = require('./misc');

const { floor, min } = Math;

function setHPFromHPLevel(level, protectionAmount) {
  let amount = {
    min: level * 1,
    max: level * 8,
    average: floor(level * 4.5),
  };

  amount = {
    min: amount.min + 11 * level,
    max: amount.max + 11 * level,
    average: amount.average + 11 * level,
  };

  if (level > 70) {
    amount = {
      min: amount.min + floor((11 * level * (level - 80) * (level - 80)) / 150),
      max: amount.max + floor((11 * level * (level - 80) * (level - 80)) / 150),
      average:
        amount.average +
        floor((11 * level * (level - 80) * (level - 80)) / 150),
    };
  }

  amount = {
    min: floor(amount.min * balanceCorrectionForLevel(level)),
    max: floor(amount.max * balanceCorrectionForLevel(level)),
    average: floor(amount.average * balanceCorrectionForLevel(level)),
  };

  const sancModifier = 100 / (100 - min(99, protectionAmount));

  amount = {
    min: floor(amount.min / sancModifier),
    max: floor(amount.max / sancModifier),
    average: floor(amount.average / sancModifier),
  };

  return amount;
}

module.exports = { setHPFromHPLevel };

// Create output file
/* const avgHp = [...Array.from({ length: 110 }).keys()]
  .map((level) => setHPFromHPLevel(level, 1).average.toString())
  .join(', ');
 */

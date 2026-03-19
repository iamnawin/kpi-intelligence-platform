function calculateConfidence({ thresholdBreached, checksCount }) {
  if (!thresholdBreached) return 0.3;

  if (checksCount >= 3) return 0.85;
  if (checksCount === 2) return 0.75;
  return 0.65;
}

module.exports = { calculateConfidence };
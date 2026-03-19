const { calculateConfidence } = require('../trust/confidence');

function evaluateKpi(config) {
  const current = config.input.current_value;
  const previous = config.input.previous_value;

  if (typeof current !== 'number' || typeof previous !== 'number' || previous === 0) {
    return {
      insight: null,
      actions: [],
      confidence: 0.1,
      error: 'Invalid KPI values provided'
    };
  }

  const change = ((current - previous) / previous) * 100;
  const absChange = Math.abs(change).toFixed(2);
  const threshold = config.analysis.threshold;

  const thresholdBreached = change < 0 && Math.abs(change) > threshold;
  const checksCount = config.reasoning?.checks?.length || 0;

  if (!thresholdBreached) {
    return {
      insight: 'No significant KPI drop detected',
      actions: [],
      confidence: calculateConfidence({ thresholdBreached, checksCount }),
      metrics: {
        percentageChange: Number(change.toFixed(2))
      }
    };
  }

  const insight = config.output.insight_template
    .replace('{{change}}', absChange)
    .replace('{{region}}', config.input.context.region);

  return {
    insight,
    actions: config.output.recommendation_templates || [],
    confidence: calculateConfidence({ thresholdBreached, checksCount }),
    metrics: {
      percentageChange: Number(change.toFixed(2))
    }
  };
}

module.exports = { evaluateKpi };
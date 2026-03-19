function generateExplanation(result, config) {
  if (!result?.insight) {
    return 'No detailed explanation available.';
  }

  return `The KPI engine detected a decline in ${config.input.kpi} for ${config.input.context.region}. Rule-based checks suggest operational review is needed.`;
}

module.exports = { generateExplanation };
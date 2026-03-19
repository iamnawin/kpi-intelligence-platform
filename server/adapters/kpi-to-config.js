function kpiToConfig(payload) {
  const kpiName = payload.kpi || 'KPI';
  const region = payload.context?.region || 'Global';

  return {
    input: {
      kpi: kpiName,
      current_value: payload.current_value,
      previous_value: payload.previous_value,
      context: {
        region,
        team: payload.context?.team || '',
        timeframe: payload.context?.timeframe || 'last_7_days',
      },
    },
    analysis: {
      method: 'percentage_change',
      threshold: payload.threshold ?? 10,
    },
    reasoning: {
      checks: payload.checks || [],
    },
    output: {
      insight_template: `${kpiName} dropped {{change}}% in {{region}}`,
      recommendation_templates: payload.recommendations || [],
    },
  };
}

module.exports = { kpiToConfig };

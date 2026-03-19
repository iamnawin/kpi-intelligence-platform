const { Router } = require('express');
const { evaluateKpi } = require('../../core/engine/evaluateKpi');
const { generateExplanation } = require('../../core/ai/explanation.stub');
const { kpiToConfig } = require('../adapters/kpi-to-config');
const { supabaseAdmin } = require('../lib/supabase-admin');

const router = Router();

// KPI metadata — mirrors src/lib/mock-data.ts so the API returns the same shape
const KPI_DEFINITIONS = [
  { id: 'revenue',         name: 'Monthly Revenue',             unit: '$',  category: 'revenue',    sparkline: [180, 190, 210, 205, 220, 235, 240] },
  { id: 'churn',           name: 'Churn Rate',                  unit: '%',  category: 'customer',   sparkline: [4.0, 3.9, 3.8, 3.6, 3.4, 3.3, 3.2] },
  { id: 'nps',             name: 'NPS Score',                   unit: '',   category: 'customer',   sparkline: [60, 61, 63, 64, 65, 67, 68] },
  { id: 'cac',             name: 'Customer Acquisition Cost',   unit: '$',  category: 'growth',     sparkline: [415, 418, 422, 419, 421, 420, 420] },
  { id: 'mrr-growth',      name: 'MRR Growth',                  unit: '%',  category: 'revenue',    sparkline: [6, 6.5, 7, 7.2, 7.8, 8.1, 8.4] },
  { id: 'support-tickets', name: 'Open Support Tickets',        unit: '',   category: 'operations', sparkline: [180, 170, 160, 155, 145, 140, 134] },
];

// POST /api/evaluate — evaluate a single KPI payload
// Optional body fields: workspace_id, kpi_id — when present, persists insight to DB
router.post('/evaluate', (req, res) => {
  const { kpi, current_value, previous_value, workspace_id, kpi_id } = req.body;

  if (!kpi || current_value === undefined || previous_value === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: kpi, current_value, previous_value',
    });
  }

  const config = kpiToConfig(req.body);
  const result = evaluateKpi(config);
  const explanation = generateExplanation(result, config);

  // Persist insight to DB when workspace context is provided (fire-and-forget)
  if (workspace_id && kpi_id && result.insight) {
    supabaseAdmin
      .from('insights')
      .insert({
        workspace_id,
        kpi_id,
        insight_type: 'engine_evaluation',
        content: result.insight,
        confidence: result.confidence,
        engine_version: '1.0',
      })
      .then(() => {})
      .catch(() => {});
  }

  res.json({ ...result, explanation });
});

// GET /api/kpis — all KPIs enriched with engine evaluation
router.get('/kpis', (req, res) => {
  const kpis = KPI_DEFINITIONS.map((def) => {
    const previous = def.sparkline[0];
    const current = def.sparkline[def.sparkline.length - 1];

    const config = kpiToConfig({
      kpi: def.name,
      current_value: current,
      previous_value: previous,
      threshold: 5,
      context: { region: 'Global', team: def.category },
    });

    const engineResult = evaluateKpi(config);
    const change = engineResult.metrics?.percentageChange ?? 0;
    const trend = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable';

    return {
      id: def.id,
      name: def.name,
      value: current,
      unit: def.unit,
      trend,
      changePercent: change,
      category: def.category,
      sparkline: def.sparkline,
      engineResult,
    };
  });

  res.json(kpis);
});

module.exports = router;

const { loadConfig } = require('./loadConfig');
const { evaluateKpi } = require('./evaluateKpi');

try {
  const config = loadConfig('./engine/decision_engine.yaml');
  const result = evaluateKpi(config);

  console.log('=== KPI ENGINE OUTPUT ===');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Engine failed to run:');
  console.error(error.message);
}
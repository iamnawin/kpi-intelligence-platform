const fs = require('fs');
const yaml = require('js-yaml');

function loadConfig(path = './engine/decision_engine.yaml') {
  const file = fs.readFileSync(path, 'utf8');
  return yaml.load(file);
}

module.exports = { loadConfig };
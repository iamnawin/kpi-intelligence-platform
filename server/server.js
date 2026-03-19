const express = require('express');
const cors = require('cors');
const kpiRoutes = require('./routes/kpi');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api', kpiRoutes);

app.listen(PORT, () => {
  console.log(`KPI API server running on http://localhost:${PORT}`);
});

module.exports = app;

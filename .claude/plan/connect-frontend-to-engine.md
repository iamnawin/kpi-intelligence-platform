# 📋 实施计划：Connect Frontend to Core KPI Engine

## Task Type
- [x] 全栈 (Frontend + Backend, parallel)

---

## Context Summary

### Core Engine (already working)
- `core/engine/evaluateKpi.js` — takes a plain `config` object, returns `{insight, actions, confidence, metrics.percentageChange}`
- `core/engine/loadConfig.js` — YAML loader (not needed for API path)
- `core/trust/confidence.js` — rule-based confidence scoring
- `core/ai/explanation.stub.js` — explanation stub
- `core/schemas/output.schema.json` — defines output contract
- CommonJS (`"type": "commonjs"`)

### Frontend (already working)
- Next.js 15, TypeScript, Tailwind
- `src/lib/mock-data.ts` — defines `KPI` type + 6 mock KPIs
- `src/app/page.tsx` — dashboard grid (uses mockKPIs directly)
- `src/app/kpis/[id]/page.tsx` — KPI detail with navigation

---

## Architecture

```
Next.js UI (port 3000)
    │
    │  /api/* rewrites (next.config.ts)
    ▼
Express Server (port 3001)   ← app/server.js
    │
    │  require('../core/engine/evaluateKpi')
    ▼
Core Engine (core/)
    │
    └─ returns { insight, actions, confidence, metrics }
```

**Single API endpoint for Step 2:**
- `POST /api/evaluate` — evaluate one KPI, return engine output
- `GET /api/kpis` — return all KPIs enriched with engine insights

---

## Data Flow

```
UI → fetch('/api/evaluate', { body: KPIPayload })
   → Next.js rewrite → http://localhost:3001/api/evaluate
   → app/routes/kpi.js → kpi-to-config adapter
   → evaluateKpi(config)
   → { insight, actions, confidence, metrics }
   → JSON response → UI renders insight strip / detail page
```

### API Payload Contract

**Request** `POST /api/evaluate`:
```json
{
  "kpi": "sales",
  "current_value": 12000,
  "previous_value": 15000,
  "threshold": 10,
  "context": {
    "region": "Texas",
    "team": "Retail",
    "timeframe": "last_7_days"
  }
}
```

**Response** (engine output schema):
```json
{
  "insight": "Sales dropped 20.00% in Texas",
  "actions": ["Increase rep visits...", "Audit inventory..."],
  "confidence": 0.85,
  "metrics": { "percentageChange": -20 }
}
```

---

## Required Files

| File | Operation | Description |
|------|-----------|-------------|
| `app/server.js` | CREATE | Express entry point, port 3001 |
| `app/routes/kpi.js` | CREATE | Route handlers for /api/evaluate + /api/kpis |
| `app/adapters/kpi-to-config.js` | CREATE | Maps KPI JSON payload → evaluateKpi config shape |
| `src/lib/api.ts` | CREATE | Frontend API client (replaces direct mock-data use) |
| `next.config.ts` | MODIFY | Add `/api/*` rewrites → Express |
| `package.json` (root) | MODIFY | Add express, cors, concurrently; add `dev:server` script |
| `src/app/page.tsx` | MODIFY | Fetch from API, fallback to mock on error |
| `src/app/kpis/[id]/page.tsx` | MODIFY | Fetch insight from API for detail page |

---

## Implementation Steps

### Step 1 — Add server dependencies (root package.json)
```json
"dependencies": {
  "express": "^4.18.2",
  "cors": "^2.8.5"
},
"devDependencies": {
  "concurrently": "^8.2.2"
},
"scripts": {
  "dev": "concurrently \"next dev\" \"node app/server.js\"",
  "dev:server": "node app/server.js"
}
```

### Step 2 — Create `app/adapters/kpi-to-config.js`
Maps flat API payload → nested engine config.
Engine expects:
```js
{
  input: { kpi, current_value, previous_value, context: { region, team, timeframe } },
  analysis: { method: 'percentage_change', threshold },
  reasoning: { checks: [] },          // empty = confidence 0.65
  output: {
    insight_template: 'KPI dropped {{change}}% in {{region}}',
    recommendation_templates: []
  }
}
```
This adapter is the ONLY place that knows about the engine's internal config shape.

### Step 3 — Create `app/routes/kpi.js`
Two routes:
1. `POST /api/evaluate` — validate body, run adapter + evaluateKpi, return result
2. `GET /api/kpis` — run evaluateKpi for each of the 6 mock KPIs using sensible defaults, merge with static KPI metadata (sparkline, unit, category), return `KPI[]` with `engineResult` attached

### Step 4 — Create `app/server.js`
```js
const express = require('express');
const cors = require('cors');
const kpiRoutes = require('./routes/kpi');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/api', kpiRoutes);
app.listen(3001, () => console.log('KPI API running on :3001'));
```

### Step 5 — Update `next.config.ts` (add rewrites)
```ts
async rewrites() {
  return [
    { source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' }
  ]
}
```

### Step 6 — Create `src/lib/api.ts`
```ts
export async function evaluateKPI(payload: EvaluatePayload): Promise<EngineResult>
export async function fetchKPIs(): Promise<KPI[]>  // with graceful fallback to mockKPIs
```

### Step 7 — Update `src/app/page.tsx`
- Convert to async Server Component (or use `useEffect` if staying client)
- Call `fetchKPIs()` from api.ts
- Falls back to `mockKPIs` if API unavailable (dev resilience)

### Step 8 — Update `src/app/kpis/[id]/page.tsx`
- On KPI detail page: call `evaluateKPI()` with current/previous values
- Display returned `insight` in the AI Insight section
- Show `confidence` and `actions` list

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| ESM/CJS conflict (Next.js vs core/) | Express server is plain Node.js (CJS), separate from Next.js build; no interop needed |
| Engine `insight_template` is hardcoded for sales/region | Adapter builds a generic template per KPI name/context |
| `GET /api/kpis` engine results depend on having previous values | Use `sparkline[0]` as previous_value, `sparkline[6]` as current_value from mock data |
| CORS issues in dev | cors() middleware on Express with `origin: 'http://localhost:3000'` |
| API unavailable during frontend-only dev | `fetchKPIs()` catches errors and returns `mockKPIs` as fallback |

---

## SESSION_ID（供 /ccg:execute 使用）
- CODEX_SESSION: N/A (plan synthesized by Claude from codebase read)
- GEMINI_SESSION: N/A (plan synthesized by Claude from codebase read)

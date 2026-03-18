project: KPI Intelligence Platform

goal:
  Build an AI-powered KPI dashboard with insights and drill-down.

rules:
  - Always follow docs in /docs
  - Do not invent new KPIs
  - Build one feature at a time
  - Start with UI before backend
  - Keep components modular and reusable

architecture:
  frontend: Next.js
  backend: API (to be added later)
  data: mock first, real later

workflow:
  - Step 1: UI skeleton
  - Step 2: One KPI end-to-end
  - Step 3: Add backend
  - Step 4: Add AI insights

agents:
  frontend:
    use: gemini
  backend:
    use: codex
  orchestrator:
    use: claude
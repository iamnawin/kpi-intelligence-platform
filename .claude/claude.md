project: KPI Intelligence Platform

goal:
  Build a KPI intelligence platform that evaluates business metrics,
  exposes insights through an API, and displays them in a dashboard UI.

current_phase: connected_mvp

current_status:
  - Core KPI engine is working locally
  - Express API is connected to the core engine
  - Next.js frontend is connected to the API
  - Dashboard and KPI detail pages are rendering
  - Backend folder was renamed from /app to /server to avoid Next.js App Router conflicts

docs_reference:
  - /docs/architecture.md
  - /docs/core-engine.md
  - /docs/api-contracts.md
  - /docs/roadmap.md

context:
  - Frontend uses Next.js App Router under /src/app
  - Backend uses Express under /server
  - Core engine under /core is the source of truth for KPI reasoning
  - Detail pages display engine insight, actions, and confidence
  - Frontend can fall back to mock data if API is unavailable
  - The backend folder must remain /server to avoid conflict with Next.js App Router

rules:
  - Do NOT rewrite the core engine unless necessary
  - Do NOT move business logic into frontend or API routes
  - Do NOT replace deterministic reasoning with LLM-based reasoning
  - Extend existing architecture instead of rebuilding it
  - Prefer small, testable changes over large refactors
  - Follow docs in /docs before making architectural decisions

architecture:
  frontend: Next.js in /src
  backend: Express API in /server
  core:
    engine: KPI evaluation logic
    trust: confidence scoring
    schemas: contracts
    ai: optional explanation/enhancement layer, never the source of truth for KPI reasoning
  data_flow:
    - UI -> API -> core engine -> API response -> UI

workflow:
  - Step 1: stabilize connected MVP
  - Step 2: add multi-KPI support
  - Step 3: validate input/output contracts
  - Step 4: add optional AI explanation layer
  - Step 5: integrate real external data sources

priorities:
  - Stabilize and verify connected MVP first
  - Fix bugs before adding major new features
  - Keep changes incremental and reversible

testing_expectations:
  - Validate API routes before frontend integration changes
  - Test both success and fallback behavior
  - Check edge cases for KPI evaluation inputs
  - Prefer lightweight verification before broad refactors

anti_patterns:
  - Do not duplicate KPI logic across layers
  - Do not hardcode KPI reasoning in pages or routes
  - Do not introduce LangChain or LangGraph at this stage
  - Do not use /app as backend folder name at project root

agents:
  frontend:
    role: UI rendering, API consumption, detail views
  backend:
    role: routes, adapters, server setup
  core:
    role: KPI reasoning and confidence scoring
  orchestrator:
    role: planning and coordination
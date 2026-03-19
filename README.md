# KPI Intelligence Platform

> **Understand WHY your KPIs change — not just WHAT changed.**

A decision intelligence platform that transforms raw business metrics into structured insights, goal tracking, and evidence-backed outcomes — built for teams that want to move beyond dashboards into real accountability.

---

## What is this?

Most BI tools show numbers. This platform explains them.

- **Why did this metric change?**
- **Which goal does it serve?**
- **What evidence supports the claim?**
- **What action should we take next?**

This is not a dashboard. It's a **goal-driven KPI intelligence system** with trust levels, hierarchy, and evidence attached to every outcome.

---

## Core Features

| Feature | Status |
|---|---|
| KPI tracking with trends and sparklines | Live |
| Goal hierarchy (parent / sub-goals) | Live |
| Goal detail with progress, status, and trust level | Live |
| Task rollup per goal (counts + status) | Live |
| Evidence layer (notes, links, files, metrics) | Live |
| Trust level system (draft → locked proof) | Live |
| Workspace-scoped auth with Supabase RLS | Live |
| KPI drill-down with insight and confidence | Live |
| AI insight layer | Planned |
| Trend alerts and anomaly detection | Planned |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | Express.js |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (cookie-based SSR sessions) |
| Core engine | Custom KPI evaluation and confidence scoring |
| Icons | Lucide React |

---

## Architecture

```
kpi-intelligence-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login / signup pages
│   │   └── (app)/           # Protected app shell
│   │       ├── page.tsx     # Dashboard
│   │       ├── kpis/        # KPI list + detail
│   │       └── goals/       # Goals list + detail
│   ├── components/
│   │   ├── layout/          # Sidebar, shell
│   │   ├── kpi/             # KPI cards, trend badges, sparklines
│   │   └── goal/            # GoalRow, GoalCard, TaskRow, EvidenceCard, badges
│   └── lib/
│       ├── kpi-data.ts      # Server-side KPI data layer
│       ├── goal-data.ts     # Server-side Goals data layer
│       └── supabase-server.ts
├── server/                  # Express API + core engine adapter
├── core/                    # KPI evaluation engine (source of truth)
├── supabase/
│   └── migrations/          # Schema migrations
└── docs/                    # Architecture, API contracts, roadmap
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Domain Model

```
Workspace
└── Goals (hierarchical — parent / sub-goals)
    ├── Status: not_started | in_progress | at_risk | completed | cancelled
    ├── Trust Level: draft → self_reported → imported → reviewer_approved → system_verified → locked_proof
    ├── Owner (workspace member)
    ├── Tasks (todo | in_progress | blocked | done | cancelled)
    ├── Linked KPIs (with sparklines, trend, and change %)
    └── Evidence (note | link | file | metric — each with its own trust level)
```

---

## Milestones

| Milestone | Description | Status |
|---|---|---|
| M1 | UI skeleton — dashboard, sidebar, mock data | Done |
| M2 | KPI detail page with insight and confidence | Done |
| M3 | Core engine integration with Express API | Done |
| M4 | Workspace auth with Supabase RLS | Done |
| M5 | Real KPI data layer (replace mocks) | Done |
| M6 | Goals list and detail pages with KPI linking | Done |
| M7 | Evidence layer on goal detail | Done |
| M8a | Hierarchical goals list with owner, tasks, due date | Done |
| M8b | Task rollup on goal detail page | Done |
| M8c | Sub-goals on goal detail page | Next |
| M9 | AI insight layer (explain KPI changes) | Planned |
| M10 | Trend alerts and anomaly detection | Planned |

---

## Author

Built by **Naveen** — AI + Product + Salesforce

---

If this is useful to you, a star helps a lot.

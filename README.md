# ProofPath

**Portable, evidence-backed performance intelligence for modern work.**

---

## The Problem

Every company uses tools — Jira, CRMs, OKR platforms, spreadsheets, HR systems.

These tools track fragments of work. But none of them answer the questions that actually matter:

- What did this person actually contribute?
- How does their work connect to team and company goals?
- What evidence proves that contribution?
- What outcomes changed because of their work?
- When they leave or move roles — what carries forward?

Today, when an employee moves or leaves, most of their real work history disappears into tickets, dashboards, manager memory, and disconnected systems.

**That's the gap ProofPath fills.**

---

## What ProofPath Is

ProofPath is an AI-native **performance intelligence and proof layer** that sits above the tools companies already use.

It connects:

- goals and sub-goals
- tasks and milestones
- outcomes and KPIs
- evidence — notes, links, files, metrics
- role context and ownership

And transforms that into:

- trusted contribution records
- AI-powered performance insights
- role-aware dashboards (employee, manager, executive)
- portable, permissioned proof of work

It is not a dashboard. It is not an OKR tool. It is not another task manager.

> ProofPath is the intelligence layer between work systems, human performance, and career proof.

---

## Who It's For

### Employees
Real work deserves more than vague resume bullets.

ProofPath helps individuals see how their work maps to goals, get AI coaching on priorities and blockers, and build a trustworthy record of contribution they can carry forward — into promotions, internal moves, or new opportunities.

### Managers
Status reports and intuition are not enough.

ProofPath helps managers identify who is contributing most, spot stalled goals before they become misses, and run evidence-backed performance conversations instead of guesswork.

### Companies
Existing tools show activity. Not trusted contribution intelligence.

ProofPath helps organizations map work to outcomes, retain performance context when people move, reduce bias and ambiguity in reviews, and connect individual work to strategic goals.

---

## The Trust System

Not all performance data is equal. ProofPath treats trust as a first-class property of every record.

| Level | Name | What it means |
|---|---|---|
| 0 | Draft | Not yet submitted |
| 1 | Self-Reported | Manual entry |
| 2 | Imported | Uploaded from file or system |
| 3 | Reviewer Approved | Validated by a manager |
| 4 | System Verified | Data from a connected system |
| 5 | Locked Proof | Tamper-proof, signed record |

ProofPath does not say "this is true." It says "this is how trustworthy this is."

Every goal, KPI, and evidence record carries its trust level. More evidence linked to a record raises its trust. Integrations raise it further. Portability is permission-based.

---

## How It Works

```
Work Systems (Jira, CRM, OKR tools, spreadsheets)
        ↓
    Ingestion Layer — import, manual entry, integrations
        ↓
    Mapping Layer — goals → tasks → outcomes → KPIs → evidence
        ↓
    Performance Graph — structured relationships across all work
        ↓
    Intelligence Layer — AI summaries, coaching, risk signals
        ↓
    Experience Layer — employee / manager / executive views
        ↓
    Portability Layer — approved, permissioned career proof exports
```

---

## AI Strategy

AI in ProofPath is not decoration. It interprets the performance graph differently for each role.

- **Employee AI** — explains progress, suggests priorities, summarizes achievements
- **Manager AI** — highlights contributors, detects blockers, summarizes team performance
- **Executive AI** — gives org-level insights, identifies strategic risks

All AI is grounded in real evidence. It does not generate flattering summaries from nothing. It cites linked data. It distinguishes fact from inference. It respects role permissions.

---

## Current Build — MVP

The platform is being built milestone by milestone against the full product vision.

| Milestone | Description | Status |
|---|---|---|
| M1 | UI skeleton — dashboard, sidebar, mock data | Done |
| M2 | KPI detail page with insight and confidence | Done |
| M3 | Core engine integration with Express API | Done |
| M4 | Workspace auth with Supabase RLS | Done |
| M5 | Real KPI data layer | Done |
| M6 | Goals list and detail pages with KPI linking | Done |
| M7 | Evidence layer on goal detail | Done |
| M8a | Hierarchical goals list with owner, tasks, due date | Done |
| M8b | Task rollup on goal detail page | Done |
| M8c | Sub-goals on goal detail page | Next |
| M9 | AI insight layer | Planned |
| M10 | Trend alerts and anomaly detection | Planned |
| M11 | Manager dashboard | Planned |
| M12 | Portable proof profile | Planned |

---

## Domain Model

```
Workspace
└── Goals (hierarchical — objectives → goals → sub-goals)
    ├── Status: not_started | in_progress | at_risk | completed | cancelled
    ├── Trust Level: draft → self_reported → imported → reviewer_approved → system_verified → locked_proof
    ├── Owner
    ├── Tasks (todo | in_progress | blocked | done | cancelled)
    │   └── Assignee, due date, status
    ├── KPIs (linked metrics with sparklines, trend, change %)
    └── Evidence (note | link | file | metric — each with its own trust level)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | Express.js |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth — cookie-based SSR sessions |
| Core engine | Custom KPI evaluation and confidence scoring |
| Icons | Lucide React |

---

## Project Structure

```
kpi-intelligence-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login / signup
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
│       ├── goal-data.ts     # Server-side Goals + Tasks + Evidence data layer
│       └── supabase-server.ts
├── server/                  # Express API + core engine adapter
├── core/                    # KPI evaluation engine (source of truth)
├── supabase/migrations/     # Schema migrations
└── docs/                    # Architecture, product foundation, roadmap
```

---

## Getting Started

```bash
npm install

# Configure Supabase credentials
cp .env.example .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Business Model

ProofPath is a B2B SaaS platform with three revenue layers:

- **Company workspace subscriptions** — primary revenue, per seat pricing
- **Talent intelligence layer** — recruiters and hiring teams accessing verified candidate profiles
- **Individual premium** — employees paying for portable proof exports and AI summaries

The first wedge: turn scattered goal, task, and outcome data into trusted employee and manager performance intelligence with portable proof.

---

## Positioning

> "We don't replace your tools — we connect them and prove contribution."

ProofPath is built for the world where work is distributed, careers are non-linear, and performance conversations need to be backed by something more than memory and self-reporting.

---

Built by **Naveen** — AI + Product 

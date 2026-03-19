<div align="center">

```
██████╗ ██████╗  ██████╗  ██████╗ ███████╗██████╗  █████╗ ████████╗██╗  ██╗
██╔══██╗██╔══██╗██╔═══██╗██╔═══██╗██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██║  ██║
██████╔╝██████╔╝██║   ██║██║   ██║█████╗  ██████╔╝███████║   ██║   ███████║
██╔═══╝ ██╔══██╗██║   ██║██║   ██║██╔══╝  ██╔═══╝ ██╔══██║   ██║   ██╔══██║
██║     ██║  ██║╚██████╔╝╚██████╔╝██║     ██║     ██║  ██║   ██║   ██║  ██║
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
```

### `[ PERFORMANCE INTELLIGENCE · TRUST LAYER · PORTABLE PROOF ]`

**Work happened. Now prove it.**

---

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/status-active_development-brightgreen?style=flat-square)]()
[![AI Native](https://img.shields.io/badge/AI-native-blueviolet?style=flat-square&logo=openai&logoColor=white)]()

</div>

---

## `> WHAT IS THIS`

Most companies track work. None of them prove it.

Tools like Jira, CRMs, OKR platforms, and spreadsheets capture fragments — tasks, numbers, activity. But they never answer the question that actually matters:

> **What did this person contribute, and what evidence proves it?**

**ProofPath** is an AI-native **performance intelligence and proof layer** that sits above existing work systems.

It ingests goals, tasks, outcomes, KPIs, and evidence — then transforms them into trusted contribution records, role-aware AI insights, and portable proof that employees can carry forward across their careers.

```
 activity  →  contribution  →  evidence  →  trusted proof  →  career value
```

---

## `> THE PROBLEM`

When someone moves roles or leaves a company, their real work history disappears into:

```
 ├── closed tickets
 ├── dashboards no one exports
 ├── manager memory
 ├── scattered Google Docs
 └── LinkedIn summaries they wrote themselves
```

There is no system that connects **what you did → what it affected → what proves it**.

ProofPath is that system.

---

## `> HOW IT WORKS`

```
 ┌─────────────────────────────────────────────────────────┐
 │                    WORK SYSTEMS                         │
 │         Jira · CRM · OKR tools · Spreadsheets          │
 └───────────────────────┬─────────────────────────────────┘
                         │
                         ▼
 ┌─────────────────────────────────────────────────────────┐
 │  [ INGESTION ]  manual entry · CSV · integrations       │
 └───────────────────────┬─────────────────────────────────┘
                         │
                         ▼
 ┌─────────────────────────────────────────────────────────┐
 │  [ MAPPING ]   goals → tasks → outcomes → KPIs → proof  │
 └───────────────────────┬─────────────────────────────────┘
                         │
                         ▼
 ┌─────────────────────────────────────────────────────────┐
 │  [ PERFORMANCE GRAPH ]  structured contribution map     │
 └───────────────────────┬─────────────────────────────────┘
                         │
                         ▼
 ┌─────────────────────────────────────────────────────────┐
 │  [ AI INTELLIGENCE ]  summaries · coaching · risk       │
 └───────────────────────┬─────────────────────────────────┘
                         │
                 ┌───────┴────────┐
                 ▼                ▼
 ┌───────────────────┐  ┌─────────────────────────────────┐
 │  [ DASHBOARDS ]   │  │  [ PORTABLE PROOF ]             │
 │  employee·manager │  │  verified achievement exports   │
 │  executive views  │  │  permission-controlled profile  │
 └───────────────────┘  └─────────────────────────────────┘
```

---

## `> TRUST SYSTEM`

Not all data is equal. ProofPath treats trust as a first-class property of every record.

```
 ░ DRAFT              →  not yet submitted
 ▒ SELF_REPORTED      →  manual input, no verification
 ▓ IMPORTED           →  uploaded from file or system
 █ REVIEWER_APPROVED  →  manager validated
 █ SYSTEM_VERIFIED    →  connected system data
 █ LOCKED_PROOF       →  tamper-proof, signed, immutable
```

> ProofPath does not say *"this is true."*
> It says *"this is how trustworthy this is."*

Every goal, KPI, and evidence record carries its trust level. More evidence raises it. Integrations raise it further. Portability is permission-based.

---

## `> WHO IT'S FOR`

| Persona | Pain | What ProofPath gives them |
|---|---|---|
| **Employee** | Real work vanishes into vague bullets | Contribution map + AI coaching + portable proof |
| **Manager** | Status reports and intuition | Evidence-backed team intelligence + risk signals |
| **Executive** | Activity ≠ outcomes | Org-wide goal alignment + strategic risk view |
| **HR / Ops** | Performance is opinion | Structured, trustworthy records with audit trails |

---

## `> DOMAIN MODEL`

```
 Workspace
 └── Goals  (hierarchical — objectives → goals → sub-goals)
     ├── status: not_started | in_progress | at_risk | completed | cancelled
     ├── trust_level: draft → locked_proof
     ├── owner  (workspace member)
     ├── Tasks
     │   └── status: todo | in_progress | blocked | done | cancelled
     │       assignee · due_date
     ├── KPIs  (sparklines · trend · change %)
     └── Evidence  (note | link | file | metric)
         └── trust_level per record · uploader · source
```

---

## `> BUILD STATUS`

| # | Milestone | Status |
|---|---|---|
| M1 | UI skeleton — dashboard, sidebar, mock data | `DONE` |
| M2 | KPI detail page with insight and confidence | `DONE` |
| M3 | Core engine integration with Express API | `DONE` |
| M4 | Workspace auth with Supabase RLS | `DONE` |
| M5 | Real KPI data layer | `DONE` |
| M6 | Goals list and detail with KPI linking | `DONE` |
| M7 | Evidence layer on goal detail | `DONE` |
| M8a | Hierarchical goals list with owner, tasks, due date | `DONE` |
| M8b | Task rollup on goal detail page | `DONE` |
| M8c | Sub-goals on goal detail page | `NEXT` |
| M9 | AI insight layer — explain KPI changes | `PLANNED` |
| M10 | Trend alerts and anomaly detection | `PLANNED` |
| M11 | Manager dashboard | `PLANNED` |
| M12 | Portable proof profile and export | `PLANNED` |

---

## `> STACK`

```
 Frontend   →  Next.js 15 (App Router) · TypeScript · Tailwind CSS
 Backend    →  Express.js
 Database   →  Supabase (PostgreSQL + Row Level Security)
 Auth       →  Supabase Auth — cookie-based SSR sessions
 Engine     →  Custom KPI evaluation and confidence scoring
 AI Layer   →  Claude API  (planned — grounded in evidence graph)
 Icons      →  Lucide React
```

---

## `> QUICK START`

```bash
git clone https://github.com/iamnawin/kpi-intelligence-platform
cd kpi-intelligence-platform
npm install

cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL · SUPABASE_ANON_KEY · SUPABASE_SERVICE_ROLE_KEY

npm run dev
```

Open → `http://localhost:3000`

---

## `> PROJECT STRUCTURE`

```
kpi-intelligence-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/          # login · signup
│   │   └── (app)/           # protected shell
│   │       ├── page.tsx     # dashboard
│   │       ├── kpis/        # KPI list + detail
│   │       └── goals/       # goals list + detail
│   ├── components/
│   │   ├── layout/          # sidebar · shell
│   │   ├── kpi/             # cards · trend badges · sparklines
│   │   └── goal/            # GoalRow · TaskRow · EvidenceCard · badges
│   └── lib/
│       ├── kpi-data.ts      # server-side KPI data layer
│       └── goal-data.ts     # goals · tasks · evidence data layer
├── server/                  # Express API + engine adapter
├── core/                    # KPI evaluation engine (source of truth)
├── supabase/migrations/     # schema migrations
└── docs/                    # architecture · product foundation · roadmap
```

---

## `> VISION`

```
 "We don't replace your tools — we connect them and prove contribution."
```

ProofPath is built for the world where work is distributed, careers are non-linear, and performance conversations need to be backed by something more than memory and self-reporting.

The end state: a portable, permissioned **proof graph** of human contribution — one that survives tool changes, role changes, and company changes.

---

## `> BUSINESS MODEL`

```
 ├── B2B SaaS          →  company workspace subscriptions (primary)
 ├── Talent Layer      →  recruiter access to verified candidate profiles
 └── Individual Pro    →  portable proof exports + AI summaries
```

---

<div align="center">

```
 [ BUILT BY NAVEEN ]  ·  AI + PRODUCT 
```

*ProofPath is in active development. Star the repo if the vision resonates.*

</div>

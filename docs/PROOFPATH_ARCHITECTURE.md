# ProofPath — Product Architecture & Restructuring Plan

> **Status:** Active — Phase 1 in progress
> **Date:** 2026-03-22
> **Direction:** Lightweight portable proof-of-work layer

---

## Product Direction

ProofPath is a lightweight **proof-of-work layer** that sits above existing tools and work systems. It ingests work signals (goals, tasks, outcomes, evidence) and transforms them into **trusted, portable achievement records** that employees can carry across roles, performance cycles, and careers.

**Core motto:** *"Don't track more work. Prove the work that already happened."*

### What ProofPath IS
- A lightweight performance proof layer
- A trust and validation layer over existing work systems
- A platform that turns work history into structured achievement records
- A portable, permissioned proof profile for employees
- An evidence-backed contribution system for companies

### What ProofPath is NOT
- Not a task manager (not replacing Jira/Linear)
- Not a KPI dashboard (not replacing Looker/Metabase)
- Not an HR platform (not replacing Workday/BambooHR)
- Not an OKR tool (not replacing Lattice/Leapsome)

### Who It Serves

| Role | Core Need |
|------|-----------|
| Employee | "I want verifiable proof of what I accomplished" |
| Manager | "I want to approve and validate what my team actually delivered" |
| Company | "I want portable, trusted contribution records when people move teams/roles" |

---

## Keep / Legacy / Rewrite

### ✅ Keep & Reuse

| What | Why |
|------|-----|
| `TrustBadge` component | Trust levels are ProofPath's core UI primitive |
| `EvidenceCard` component | Evidence is a first-class entity |
| `GoalStatusBadge` | Achievement status maps directly |
| Trust level enum (`draft/self_reported/imported/reviewer_approved/system_verified/locked_proof`) | Perfect alignment with ProofPath trust model |
| Supabase + RLS setup | Keep entire auth + multi-tenant architecture |
| `core/trust/confidence.js` | Trust scoring engine is directly reusable |
| Auth pages (login/signup/onboarding) | Already redesigned — keep as-is |
| Sidebar layout + AppShell | Keep shell, replace nav items |
| `import-form.tsx` + `import-parser.ts` | Evidence ingestion is core |
| Server Actions pattern | Good architecture, keep |
| Supabase migrations 001–005 | Core schema is reusable |
| Vitest test infrastructure | Keep all testing setup |

### 🗂 Move to Legacy

| What | Why |
|------|-----|
| KPI dashboard components (HeroKPI, KPICard, KPISection) | ProofPath doesn't surface raw metrics |
| OKR-heavy UI (Objectives page, KeyResultRow, ProgressRing) | Superseded by Achievement/Proof model |
| `core/engine/decision_engine.yaml` | KPI evaluation rules, not proof generation |
| `server/routes/kpi.js` | KPI route, not core product |
| `AIInsightStrip` | Post-MVP feature |
| `mock-data.ts` KPI mock data | Replace with proof-focused mocks |
| `migration 006_okr_extensions.sql` | OKR schema superseded |

### 🔄 Rewrite / Rename

| Current | Becomes |
|---------|---------|
| Goals → | **Achievements** |
| Goal detail page → | **Achievement Record page** |
| GoalCard → | **AchievementCard** |
| Dashboard page → | **Proof Feed** |
| Objectives page → | **Proof Profile** |
| Settings/Integrations → | **Connections** |
| `goal-data.ts` → | `achievement-data.ts` |
| `goal-actions.ts` → | `achievement-actions.ts` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      APP LAYER                          │
│  Next.js 15 App Router — Routes, Server Actions, UI     │
│  /proof-feed  /achievements  /profile  /connections     │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   INGESTION LAYER                       │
│  Receives work signals from:                            │
│  - Manual entry (goals, tasks, milestones)              │
│  - CSV/JSON import                                      │
│  - Connected tools (GitHub, Linear, Jira, Asana)        │
│  Normalizes everything into Signal records              │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                    PROOF LAYER                          │
│  Core logic: Signal → Evidence → Achievement Record     │
│  Aggregates evidence, computes proof completeness       │
│  Generates portable AchievementRecord snapshots         │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                    TRUST LAYER                          │
│  (reuse core/trust/confidence.js)                       │
│  Evaluates trust level per evidence item                │
│  Computes overall trust score per Achievement           │
│  Enforces approval gates before portability             │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                 PROFILE / EXPORT LAYER                  │
│  Assembles approved records into ProofProfile           │
│  Generates shareable, permissioned proof exports        │
│  Manager review + approval workflow                     │
└─────────────────────────────────────────────────────────┘
```

---

## Core Data Model

### Entities & Relationships

```
Workspace
  └── has many Members (users)
  └── has many Achievements
  └── has many SourceConnections

Member (User in workspace)
  └── has many Achievements (owned)
  └── has one ProofProfile

Achievement                           ← was: Goal
  ├── id, title, description
  ├── type: 'delivered' | 'led' | 'contributed' | 'improved'
  ├── status: 'draft' | 'in_progress' | 'completed' | 'approved'
  ├── period_label (e.g. "Q1 2026", "H1 2026")
  ├── outcome_summary (free text — what actually happened)
  ├── progress_pct
  ├── owner_id → Member
  ├── trust_level → TrustMetadata.level
  └── has many Evidence items
  └── has one AchievementRecord (when approved)

Evidence
  ├── id, achievement_id
  ├── source_type: 'manual' | 'import' | 'github' | 'jira' | 'linear' | 'asana'
  ├── source_url (optional external link)
  ├── body (text or attachment reference)
  ├── verified: boolean
  └── created_at

TrustMetadata
  ├── achievement_id (1:1)
  ├── level: 'draft' | 'self_reported' | 'imported' | 'reviewer_approved' | 'system_verified' | 'locked'
  ├── evidence_count
  ├── reviewer_id (nullable → Member)
  ├── reviewed_at
  └── portability_approved: boolean

AchievementRecord                     ← new core entity
  ├── id
  ├── achievement_id
  ├── member_id
  ├── snapshot_data (JSONB — frozen proof at approval time)
  ├── approved_by → Member
  ├── approved_at
  ├── is_portable: boolean
  └── export_token (for shareable link)

ProofProfile
  ├── member_id (1:1)
  ├── display_name, role_title
  ├── total_achievements, approved_achievements
  ├── trust_score (0–100)
  └── has many AchievementRecords (approved + portable)

SourceConnection                      ← was: workspace_integrations
  ├── workspace_id
  ├── provider: 'github' | 'jira' | 'linear' | 'asana'
  ├── access_token, refresh_token
  ├── synced_at
  └── is_active
```

---

## Core Product Flow

```
SIGNAL INPUTS
    ├── Manual entry (employee describes achievement)
    ├── CSV/JSON import (bulk historical records)
    └── Tool sync (GitHub PRs, Jira tickets, Linear issues)
    ↓
ACHIEVEMENT DRAFT
    Employee creates Achievement: title + outcome_summary + period + type
    ↓
EVIDENCE ATTACHMENT
    Employee attaches Evidence: links, docs, synced work items, outcomes
    ↓
TRUST EVALUATION (auto)
    System computes trust_level based on evidence count + source types
    → self_reported → imported → system_verified
    ↓
MANAGER REVIEW
    Manager reviews Achievement + Evidence → approves or requests changes
    → trust_level → reviewer_approved
    ↓
ACHIEVEMENT RECORD CREATION
    Frozen AchievementRecord snapshot created
    → trust_level → locked_proof
    → is_portable set based on manager/company approval
    ↓
PROOF PROFILE
    Employee's ProofProfile aggregates all locked AchievementRecords
    ↓
EXPORT / PORTABILITY
    Shareable link (token-based) or downloadable proof package
    Only exports what company has approved as portable
```

---

## User Experience Model

### Employee

| Screen | Route | Purpose |
|--------|-------|---------|
| Proof Feed | `/` | My achievements this period — drafts, in-progress, approved |
| Achievement Detail | `/achievements/[id]` | Full view: outcome, evidence, trust level, timeline |
| New Achievement | `/achievements/new` | Create draft |
| Proof Profile | `/profile` | All approved achievements, trust score, export |
| Connections | `/connections` | Connected tools (GitHub, Jira, etc.) |

### Manager

| Screen | Route | Purpose |
|--------|-------|---------|
| Team Feed | `/?view=team` | Team achievements pending review |
| Review Achievement | `/achievements/[id]/review` | Approve / request changes + note |

---

## MVP Scope

### Must Build (V1)

| Feature | Priority |
|---------|---------|
| Achievement CRUD | P0 |
| Evidence attachment (manual: text/link) | P0 |
| Trust level display (auto-computed) | P0 |
| Manager review + approve flow | P0 |
| AchievementRecord (locked snapshot) | P0 |
| Proof Profile page | P0 |
| CSV import | P1 |
| GitHub sync (one integration) | P1 |
| Export shareable link | P1 |

### Excluded from V1

| Feature | Reason |
|---------|---------|
| PDF export | V2 |
| All 4 integrations | Build GitHub first, validate |
| Analytics dashboard | Out of scope |
| KPI raw metric tracking | Out of product scope |
| AI-generated summaries | Post-MVP |
| Public profile discovery | Requires trust model maturity |

---

## Repo Structure

```
src/
├── app/
│   ├── (app)/
│   │   ├── page.tsx                    ← Proof Feed
│   │   ├── achievements/               ← was: goals/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   ├── import/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── edit/page.tsx
│   │   │       └── review/page.tsx     ← NEW: manager review
│   │   ├── profile/                    ← NEW: was: objectives/
│   │   │   └── page.tsx
│   │   └── connections/                ← was: settings/integrations/
│   │       └── page.tsx
│   └── api/
│       ├── integrations/               ← keep OAuth routes
│       └── export/
│           └── [token]/route.ts        ← NEW: proof export
├── components/
│   ├── achievement/                    ← was: goal/
│   ├── proof/                          ← NEW
│   ├── review/                         ← NEW
│   ├── forms/
│   └── connections/                    ← was: integrations/
├── lib/
│   ├── achievement-data.ts             ← was: goal-data.ts
│   ├── proof-data.ts                   ← NEW
│   └── integrations/                   ← keep
└── actions/
    ├── achievement-actions.ts          ← was: goal-actions.ts
    ├── evidence-actions.ts             ← NEW
    └── review-actions.ts               ← NEW

legacy/                                 ← archived KPI/OKR work
├── core-engine/
├── server/
└── components/

supabase/migrations/
├── 001–007_*.sql                       ← existing
├── 008_proofpath_schema.sql            ← Phase 1
└── 009_achievement_records.sql         ← Phase 3
```

---

## Build Sequence

### Phase 1 — Foundation Reframe
Rename and reroute without breaking what works.
1. Move KPI/OKR components to `legacy/`
2. DB migration: add `outcome_summary`, `period_label`, `achievement_type` to goals table; add `achievement_records` table stub
3. Rename `goal-data.ts` → `achievement-data.ts`, update all imports
4. Rename routes: `/goals/*` → `/achievements/*`
5. Update sidebar nav items
6. Update all tests

### Phase 2 — Evidence & Trust
1. Build `evidence-form.tsx` — inline evidence attachment
2. Build `evidence-actions.ts` server action
3. Auto-compute trust level from evidence count + source type
4. Surface trust level prominently on AchievementCard + Detail

### Phase 3 — Manager Review Flow
1. Build `/achievements/[id]/review` route
2. Build `review-panel.tsx` — approve / request changes + note
3. Build `review-actions.ts` server action
4. On approval: create `AchievementRecord` frozen snapshot
5. Update trust_level to `locked_proof`

### Phase 4 — Proof Profile
1. Build `/profile` page
2. Build `ProofProfileCard` component
3. Build `AchievementRecordCard` (read-only locked view)
4. Trust score computation in `proof-data.ts`

### Phase 5 — Export & Portability
1. `export_token` + `is_portable` on `achievement_records`
2. `GET /api/export/[token]` — public proof view
3. `ProofExportButton` — manager-gated shareable link

### Phase 6 — Signal Ingestion
1. GitHub sync → creates Evidence items from PRs/commits
2. CSV import → bulk Achievement creation
3. Linear/Jira sync → task evidence

---

## Design Principles

1. **Proof First** — Main value is proof generation, not activity tracking
2. **Portable by Design** — Easy for employees to carry approved proof forward
3. **Lightweight** — Do not rebuild company workflow systems
4. **Trust-Aware** — Every achievement shows trust level and source
5. **Reuse Before Rebuild** — Preserve useful existing work
6. **Permissioned** — Portable proof respects company approval flows
7. **Higher-Level Abstraction** — Meaningful contribution summaries, not raw clutter

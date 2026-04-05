# ProofPath Product Phases

Date: 2026-04-05
Status: Active execution plan

## Product Thesis

ProofPath is a contribution-proof layer on top of the tools where work already happens.

Core loop:

1. capture an achievement
2. attach evidence and work signals
3. raise trust through import and review
4. lock strong outcomes into portable proof

Short version:

`do work -> capture achievement -> attach evidence -> raise trust -> export proof`

## Current Position

- ProofPath is now the primary shipped surface.
- Achievements, profile, proof export, and connections are real.
- KPI-era infrastructure still exists, but it is no longer the product center.
- The biggest remaining gap is product clarity: the app still does not explain its own workflow clearly enough.

## Phase A - Clarify The User Journey

Objective: make the UI explain the workflow without requiring outside context.

Work:
- explain that achievements are the center of the app
- explain that connections provide work signals, not a full external mirror
- explain that profile is the proof output of the system

Primary files:
- `src/app/(app)/achievements/page.tsx`
- `src/app/(app)/profile/page.tsx`
- `src/app/(app)/connections/page.tsx`
- `src/components/integrations/integration-card.tsx`

## Phase B - Make Integrations Coherent

Objective: align integration behavior with the product story.

Work:
- separate workspace sync from achievement evidence import
- show users what sync actually does
- make "connect -> configure -> sync -> attach to achievement" explicit

## Phase C - Stabilize The Proof Loop

Objective: make the record-to-proof path mechanically reliable.

Work:
- create achievement
- attach / import evidence
- review and lock
- export portable proof

## Phase D - Contain Legacy KPI Weight

Objective: keep KPI-era code from confusing the current product.

Work:
- isolate KPI-heavy analytics to secondary/admin surfaces
- keep the shipped story centered on proof and contribution

## Phase E - Remove Avoidable Load Latency

Objective: reduce duplicated auth/workspace queries after sign-in.

Work:
- consolidate auth/session lookups
- reduce repeated Supabase round trips in layout and dashboard data

## Immediate Execution

Start with Phase A.

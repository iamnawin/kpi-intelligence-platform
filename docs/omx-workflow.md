# OMX Workflow For ProofPath

`oh-my-codex` is used here as a dev workflow layer for building ProofPath and the KPI Intelligence Platform. It is not part of the shipped app runtime.

## Rules

- Do not add OMX imports to `src/`, `server/`, `core/`, or runtime config.
- Do not add `oh-my-codex` to this repo's app dependencies unless there is a specific runtime reason.
- Keep OMX outputs under `.omx/`.
- Commit durable planning artifacts when useful. Ignore OMX runtime logs and state.

## What This Means

- No frontend or backend performance cost from OMX itself
- No user-facing bundle impact
- No server request latency impact
- OMX is only used to plan, coordinate, review, and execute development work

## Recommended Setup

Install OMX globally or in your developer environment, not as an app dependency:

```bash
npm install -g @openai/codex oh-my-codex
omx setup
omx --madmax --high
```

## Recommended Build Flow

Use OMX to drive feature work for ProofPath:

```text
$deep-interview "clarify the feature or product change"
$ralplan "produce the implementation plan and tradeoffs"
$ralph "carry the approved plan to completion"
```

Use team mode only when the task is large enough to justify parallel work:

```text
$team 3:executor "implement the approved ProofPath feature"
```

## Verification Standard For This Repo

Before closing work, run the checks that match the change:

```bash
npm run typecheck
npm run test
npm run build
```

For small documentation-only changes, skip runtime verification if nothing executable changed.

## Product Framing

When using OMX in this repo, default to this framing:

- Product name: `ProofPath`
- Repo/app context: `KPI Intelligence Platform`
- Core promise: prove contribution with evidence, trust, and portable proof
- Constraint: keep OMX as developer tooling, not application runtime

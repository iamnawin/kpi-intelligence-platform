# OMX Workspace Notes

This project uses `oh-my-codex` as a developer workflow layer, not as part of the app runtime.

What belongs here:
- `plans/` for implementation plans and test specs we want to keep around
- other durable OMX artifacts that help project execution

What should stay out of git:
- `logs/`
- `state/`
- `metrics.json`

Runtime rule:
- nothing in `.omx/` should be imported by the Next.js app, Express server, or shared runtime code

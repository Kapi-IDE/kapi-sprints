# Sprint v1 — Core Skills + Self-Hosted Demo

**Goal**: Ship kapi-sprints as a self-demonstrating OSS tool. A PM or dev team can clone it, run `/prd v2`, and immediately have a working sprint workflow — powered by the same skills and blackboard the tool renders.

**Sprint window**: 1 day

---

## Why This Sprint

The dashboard UI is built. The file parsing works. The blackboard renders. But the tool has no workflow skills — the `/prd`, `/dev`, and `/test` commands that make the sprint loop actually run are missing. Without them, kapi-sprints is a viewer, not a workflow tool.

This sprint ships the three core skills and replaces the placeholder demo data with real development sprint artifacts — so the tool demonstrates itself.

---

## Scope

### In

- `/prd` skill — interactive sprint planner (brainstorm → scope → tasks.md + prd.md)
- `/dev` skill — TDD task runner (reads board → agent init → pick task → TDD cycle → commit)
- `/test` skill — QA gate (build + lint + push to dev)
- Replace placeholder demo data with real sprint artifacts (this sprint)
- Update `status.md` and `scorecard.md` to reflect actual product state

### Out

- `/resume` skill (v2 — needs more board history to be useful)
- `/checkpoint` skill (v2)
- Signal routing / escalation (v2 — HITL research backlog)
- Auth, payments, database (not applicable — kapi-sprints has no backend)

---

## Acceptance Criteria

- [ ] `/prd v2` runs in a fresh kapi-sprints clone and produces `sprints/v2/prd.md` + `sprints/v2/tasks.md`
- [ ] `/dev v2` picks the first task, posts `available` to board.md, and begins TDD loop
- [ ] `/test v2` runs build + lint and reports pass/fail
- [ ] Dashboard at `localhost:3000/v1` shows real sprint data (this sprint's tasks + blackboard)
- [ ] `status.md` accurately describes what's built and what's not

---

## Risks

- Skills reference kapi-platform patterns — need to strip Kapi-specific context (blueprints, 8-layer arch) and replace with kapi-sprints context
- Keep skills small and readable — kapi-sprints is OSS, skills should be forkable

---

## Decisions

- Skills live in `.claude/skills/` — same pattern as kapi-platform
- `/dev` agent init: first step writes `/post available` so agent appears in Team sidebar
- No Playwright in `/dev` for v1 — skill file creation doesn't need browser tests

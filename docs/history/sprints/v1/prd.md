# Sprint v1 — Core Skills + Self-Hosted Demo

**Goal**: Ship kapi-sprints as a self-demonstrating OSS tool. A PM or dev team can clone it, run `npm run dev`, and see a working sprint dashboard — powered by the same skills and blackboard the tool renders.

**Sprint window**: 1 day

---

## Why This Sprint

The dashboard UI is built. The file parsing works. The blackboard renders. But the tool has no workflow skills — the `/prd`, `/dev`, and `/test` commands that make the sprint loop actually run are missing. Without them, kapi-sprints is a viewer, not a workflow tool.

This sprint ships the core skills and replaces the placeholder demo data with real development sprint artifacts — so the tool demonstrates itself.

---

## Scope

### In

- `/prd` skill — interactive sprint planner (brainstorm → scope → tasks.md + prd.md)
- `/dev` skill — TDD task runner (reads board → agent init → pick task → TDD cycle → commit)
- `/test` skill — QA gate (build + lint + push to dev)
- `/post` skill — structured blackboard writes from terminal (finding, decision, blocker, etc.)
- Replace placeholder demo data with real sprint artifacts (this sprint)
- Update `status.md` and `scorecard.md` to reflect actual product state
- README, NOTICE, guides — marketing and educational content for OSS launch

### Out

- `/resume` skill (v2 — needs more board history to be useful)
- `/checkpoint` skill (v2)
- `/sprint init` with Foundation Gate (v2)
- Signal routing / escalation (v2+ — see hitl-evaluation.md)
- Real-time file watching / SSE (v2 — dashboard reads on page load for now)
- CLI packaging / npx (v2)
- Plugin marketplace packaging (v2)

---

## Acceptance Criteria

- [x] `/prd v2` runs and produces `sprints/v2/prd.md` + `sprints/v2/tasks.md`
- [x] `/dev v1` picks the first task, posts `available` to board.md, and begins TDD loop
- [x] `/test v1` runs build + lint and reports pass/fail
- [x] `/post` writes structured entries to board.md and entries/
- [x] Dashboard at `localhost:3000/v1` shows real sprint data — no placeholder auth app references
- [x] `status.md` accurately describes what's built and what's not
- [x] README tells the blackboard story and links to Kapi AI
- [x] NOTICE file exists with Apache 2.0 attribution
- [x] `docs/guides/` contains Blackboard Pattern and Backwards Build guides

---

## Decisions

- Skills live in `.claude/skills/` — same pattern as kapi-platform
- `/dev` agent init: first step writes `/post available` so agent appears in Team sidebar
- No Playwright in `/dev` for v1 — skill file creation doesn't need browser tests
- README follows story structure, not feature list — the repo IS the marketing

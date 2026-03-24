# Backlog

Ideas and future work that haven't been scheduled into a sprint yet.
Use `/post queue [idea]` from Claude Code to add items here.

---

## Inbox

[ ] **Real-time file watching** — replace page-load reads with chokidar + SSE so dashboard updates within 1-2 seconds of any `.md` change
[ ] **CLI packaging** — `npx kapi-sprints dashboard` launches on port 3838, discovers `kapi-sprints.config.md` in caller's project
[ ] **Plugin marketplace structure** — `plugin/` directory with `plugin.json` + `marketplace.json`, installable via `claude plugin marketplace add kapihq/kapi-sprints`
[ ] **Generalize skills into `plugin/skills/`** — copy from `.claude/skills/`, strip kapi-platform-specific references
[ ] **`/resume` skill** — start-of-session briefing (reads board + git log, answers "where was I?")
[ ] **`/checkpoint` skill** — end-of-session debrief, prunes board.md, archives old entries
[ ] **`/sprint init` with Foundation Gate** — scans for docs/foundation/{vision,market,spec}.md, generates each conversationally if missing, validates for completeness
[ ] **`/scorecard` with config-based layers** — reads layers from `kapi-sprints.config.md` instead of hardcoded values
[ ] **Extend `/post` signal types** — add `stuck` (→ Active Blockers), `offer` (→ Activity), `notice` (→ Findings) to complete the HITL Signal framework
[ ] **Signal type rendering** — `available`/`stuck`/`handoff` entries visually distinct in Team sidebar
[ ] **Align design docs with reality** — architecture.md and dashboard.md describe a monorepo that doesn't exist; add Current State / Target State sections
[ ] **`/dev` edge case** — handle "no unchecked tasks" gracefully (print "Sprint complete. Run /test.")
[ ] **`/test` portability** — document or detect remote name and branch assumptions for OSS users
[ ] **Self-host Geist font** for privacy/performance
[ ] **Staging deploy** for kapi-sprints itself (currently runs locally only)
[ ] **Configurable sprint duration** — currently hardcoded 3 hours
[ ] **Per-category competence tracking** — track agent reliability per task category (e.g. refactoring, testing, API design). Compute competence scores from approve/reject/edit history. Feed into autonomy ramp formula: `review_rate = max(baseline, initial * e^(-competence * time))`. See vision.md §Autonomy Ramp.
[ ] **Shadow mode infrastructure** — agents shadow human decisions silently: both decide, system compares. When agreement >95% in a category, promote agent to autonomous for that category. Novel tasks (72% agreement) stay in review. High-stakes actions always require approval gate. See vision.md §Shadow Mode.
[ ] **Active learning loop** — every human approve/reject/edit on a queued item becomes a labeled training example (+1, -1, diff). Store as structured dataset in `docs/operations/decisions/`. Use for DPO fine-tune (correction pairs) and prompt optimization (few-shot from approved). Sprint system generates its own improvement data. See vision.md §Active Learning Loop.

---

## Done

[x] Dashboard UI — sprint tasks, blackboard, stage nav, overview panel — v1
[x] `/prd` skill — interactive sprint planner — v1
[x] `/dev` skill — TDD task runner with agent init — v1
[x] `/test` skill — QA gate: build + types + lint + push — v1
[x] `/post` skill — structured blackboard writes from terminal — v1
[x] Agent init protocol — `/dev` writes `available` entry on startup — v1
[x] Self-hosting demo data — v1 describes itself — v1
[x] README — story-driven, links to Kapi AI — v1
[x] NOTICE — Apache 2.0 attribution — v1
[x] Blackboard Pattern guide — v1
[x] Backwards Build guide — v1

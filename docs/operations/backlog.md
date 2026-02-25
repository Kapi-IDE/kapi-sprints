# Backlog

Ideas and future work that haven't been scheduled into a sprint yet.
Use `/post queue [idea]` from Claude Code to add items here.

---

## Inbox

<!-- Items added via /post queue or promoted from decisions -->
[ ] Implement `/sprint init` — scans for docs/foundation/{vision,market,spec}.md, generates each conversationally if missing, validates for completeness (thin = ⚠️), then scaffolds sprint structure
[ ] Build `/sprint` command dispatcher — routes `init`, `prd`, `preflight`, `post`, `review` subcommands
[x] **Structured signal protocol for humans + agents** — `/post` skill created in `.claude/skills/post/`. Humans and agents both use `/post [type] [message]` from terminal. CLAUDE.md updated to ban raw markdown writes to board.md.
[x] **Agent init protocol** — `/dev` skill now writes `available` entry on startup, populating Team sidebar
[ ] **Extend `/post` signal types** — add `stuck` (→ Active Blockers), `offer` (→ Activity), `notice` (→ Findings) to complete the HITL Signal framework. See docs/guides/hitl-evaluation.md.
[ ] `/resume` skill — start-of-session briefing (reads board + git log, answers "where was I?")
[ ] `/checkpoint` skill — end-of-session debrief, prunes board.md, archives old entries
[ ] Signal type rendering — `available`/`stuck`/`handoff` entries visually distinct in Team sidebar
[ ] Self-host Geist font for privacy/performance
[ ] Staging deploy for kapi-sprints itself (currently runs locally only)

---

## Done

[x] Core dashboard UI — sprint tasks, blackboard, stage nav, overview panel — v1
[x] `/post` skill — structured blackboard writes from terminal — v1
[x] `/prd` skill — interactive sprint planner — v1
[x] `/dev` skill — TDD task runner with agent init — v1
[x] `/test` skill — QA gate: build + types + lint + push — v1

# Project Status

*Last updated: feb 24*

## What's Safe to Demo Today

- Sprint dashboard at `/[version]/` — tasks, stage nav (Plan/Build/QA/Review/Done), overview panel
- Overview panel — Spec Status, Sprint Velocity, QA Quality donut, Blockers, Open Decisions, Findings, Queue, Directives
- Blackboard at `board.md` — all sections render live on overview
- Stream entries in `entries/` — individual posts with frontmatter parsed and rendered
- Team sidebar — Dev/PM with active/idle status from Agent Status section
- Doc viewer at `/docs/[...path]` — markdown + Mermaid diagram rendering
- Right panel — git stats per author (lines added/removed/commits)
- Foundation Gate at `/get-started` — onboarding walkthrough page
- `/prd` skill — interactive sprint planner, writes prd.md + tasks.md
- `/dev` skill — TDD task runner with agent init (posts `available` on startup)
- `/test` skill — build + type check + lint + push QA gate
- `/post` skill — structured blackboard writes from terminal (finding, decision, blocker, etc.)

## Known Gaps

- **No real-time updates** — dashboard reads files on page load, not via SSE/WebSocket. Manual refresh needed.
- **No CLI** — `npx kapi-sprints dashboard` doesn't exist yet. Must clone repo and `npm run dev`.
- **No plugin packaging** — skills are in `.claude/skills/`, not a distributable `plugin/` directory
- **No `/resume` skill** — start-of-session briefing
- **No `/checkpoint` skill** — end-of-session debrief
- **No `/sprint init`** — Foundation Gate exists as a `/get-started` page but not as a Claude Code command
- **No `/scorecard`** — config-based layer auditing not implemented
- **Signal routing** — `available`/`stuck`/`handoff` entries parsed but not visually distinct in sidebar
- **Design doc drift** — architecture.md and dashboard.md describe a monorepo structure that doesn't exist yet

## Sprint History

### v1 — Core Skills + Self-Hosted Demo + OSS Content (feb 24)

Shipped: `/prd`, `/dev`, `/test`, `/post` skills. Replaced placeholder demo data. README rewritten as story. NOTICE file. Blackboard Pattern + Backwards Build guides. project.config.ts updated.

11/11 tasks · 3 blocks · 1 day · 0 blockers

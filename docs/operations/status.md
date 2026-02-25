# Project Status

*Last updated: feb 24*

## What's Safe to Demo Today

- Sprint dashboard at `/[version]/` — tasks, stage nav, blackboard, overview panel
- Blackboard at `board.md` — blockers, decisions, directives, findings, agent status, activity
- Stream entries in `entries/` — individual posts with frontmatter parsed and rendered
- Doc viewer at `/docs/[...path]` — markdown + Mermaid diagram rendering
- Right panel — git stats per author (lines added/removed/commits), cost.md parsing
- Foundation Gate at `/get-started` — onboarding walkthrough
- `/post` skill — humans and agents post to blackboard from the terminal
- `/prd` skill — interactive sprint planner, writes prd.md + tasks.md
- `/dev` skill — TDD task runner with agent init (posts `available` on startup)
- `/test` skill — build + type check + lint + push QA gate

## Known Gaps

- No `/resume` skill — start-of-session briefing (reads board + git log)
- No `/checkpoint` skill — end-of-session debrief
- Signal routing — `available`/`stuck`/`handoff` entries parsed but not visually distinct in sidebar
- Token stats in right panel — need `cost.md` populated via `/cost` command
- No staging/prod deployment configured for kapi-sprints itself

## Sprint History

### v1 — Distributable Product (in progress)

Goal: real-time file watching (chokidar + SSE), `npx kapi-sprints dashboard` CLI, plugin structure for Claude marketplace.

6 tasks · 0/6 complete

# Blackboard

*Last updated: 2026-02-24*

The blackboard is the single source of truth for sprint coordination. All agents and humans post here. The UI reads this file on every page load.

---

## Active Blockers

- **SSE implementation needs Node.js custom server** — Next.js App Router doesn't support persistent connections in route handlers natively. Need to evaluate `next-sse` package or custom Express wrapper. Blocks T01 of v2.
- **Plugin marketplace schema undocumented** — Anthropic's official plugin.json spec has no public JSON schema. Building from examples only. Risk of rejection on submission.

---

## Open Decisions

- **Should `/test` auto-push to dev after passing, or prompt user first?** — Default: auto-push (matches kapi-platform pattern). Revisit if OSS users report surprise pushes.
- **Scorecard layers: config file or inline in CLAUDE.md?** — config file is cleaner but adds a new file to manage. CLAUDE.md is already read by Claude Code on every session.

---

## Directives

- Keep skills small and readable — kapi-sprints is OSS, agents from any team should be able to fork and understand them
- No Playwright in `/dev` for v1 — skill file creation doesn't need browser tests
- README tells a story, not a feature list — the repo IS the marketing

---

## Findings

- **Overview as default landing** — removed Blackboard tab; Overview panel shows all blackboard intel in compact form. Each card links to its source `.md` file → `entries/2026-02-24-1200-dev-finding.md`
- **`/post` skill created** — humans and agents both use `/post [type] [message]` from terminal; CLAUDE.md updated to ban raw markdown writes to board.md
- **`/dev` edge case** — skill doesn't handle "no unchecked tasks" (sprint already done). Should print clear message. Fix in v2.
- **`/test` assumption** — `git push origin dev` assumes remote is `origin` and branch is `dev`. Document for OSS portability in v2.

---

## Queued

- Investigate chokidar vs fs.watch for cross-platform file watching reliability
- Write `/resume` skill — needs board.md + git log + tasks.md as context inputs
- Add dark/light theme toggle to dashboard — currently dark-only

---

## Agent Status

- **Dev** (v1) — idle feb 24, all 11 tasks committed
- **PM** (v2) — idle mar 12 10am, PRD + tasks written, handoff to Dev

---

## Activity

- **Human:Balaji** — kicked off v1 sprint, approved scope — feb 24 9am
- **PM** (v1) — PRD locked: 11 tasks, 3 blocks (Skills + Demo Data + OSS Content) — feb 24 9am
- **Dev** (v1) — Block A complete: /prd /dev /test /post skills created — feb 24 12pm
- **Dev** (v1) — Block B complete: demo data coherent, auth app removed — feb 24 2pm
- **Dev** (v1) — Block C complete: README, NOTICE, guides shipped — feb 24 4pm
- **PM** (v2) — PRD locked: 9 tasks, 3 blocks, goal: decision capture + competence scoring as HITL foundation — mar 12 10am

---

## Resolved

- **Apache 2.0 license** — accepted feb 24. Enterprise-friendly, mandatory NOTICE attribution, patent grant. → `entries/2026-02-24-0900-pm-decision.md`

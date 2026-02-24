# Blackboard

*Last updated: 2026-01-15*

The blackboard is the single source of truth for sprint coordination. All agents and humans post here. The UI reads this file on every page load.

---

## Active Blockers

(none)

---

## Open Decisions

- **Database for local dev** — Should we use Postgres (prod parity) or SQLite (zero setup)? → pick before T04 starts

---

## Directives

(none)

---

## Findings

- **Auth token storage** — `localStorage` is XSS-vulnerable; switch to `httpOnly` cookie before any prod deploy → `entries/2026-01-15-1200-dev-finding.md`
- **CI pipeline** — GitHub Actions free tier is sufficient for this project size; no need for self-hosted runners

---

## Agent Status

- **Dev** (v1, T01) — active jan 15 10am, setting up project structure and CI pipeline
- **PM** (v1) — idle jan 15 9am, PRD + tasks written, handoff to Dev

---

## Activity

- **Human:Balaji** — kicked off v1 sprint, approved scope jan 15 9am
- **PM** — created PRD and task breakdown for v1 Foundation sprint

---

## Resolved

(none)

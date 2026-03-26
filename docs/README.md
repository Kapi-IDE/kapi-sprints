# Kapi Sprints — Documentation

A multiagent sprint coordination system built on 30 years of classical MAS research. Two subsystems, three memory tiers, four skills.

## Concepts

The 16 pillars of multiagent systems, implemented. Start here.

- [Vision: 16 Pillars in Practice](concepts/vision.md) — the full mapping of classical MAS research to kapi-sprints
- [The Blackboard Pattern](concepts/blackboard.md) — Pillars 1, 4, 5, 8: shared state, result sharing, communication, memory
- [Backwards Build](concepts/backwards-build.md) — Pillar 16: the engineering methodology
- [Human-in-the-Loop](concepts/hitl.md) — Pillars 9, 10, 12, 13: earned autonomy, trust, learning, governance

## Product Definition

What we're building and for whom.

- [Vision & Mission](foundation/vision.md) — one-page summary
- [Market](foundation/market.md) — ICP, alternatives, willingness to pay
- [Spec](foundation/spec.md) — core flows, MVP scope, success criteria

## Architecture & Design

Internal design decisions and OSS strategy.

- [Architecture](design/architecture.md) — system overview, blackboard server, MCP shim, skills, dashboard, data flow
- [Launch Strategy](design/launch-strategy.md) — distribution, licensing (Apache 2.0), content strategy, LinkedIn series
- [Onboarding](design/onboarding.md) — foundation gate flow (`/sprint init`)

## Sprint History

Archived sprint records.

- **[v1](history/sprints/v1/)** — completed Feb 24, 2026. Shipped 4 skills, demo data, OSS packaging.
  - [PRD](history/sprints/v1/prd.md) · [Tasks](history/sprints/v1/tasks.md) · [Review](history/sprints/v1/review.md) · [Code Review](history/sprints/v1/code-review.md)
- **[v2](history/sprints/v2/)** — planned, never executed. Decision capture + competence scoring.
  - [PRD](history/sprints/v2/prd.md) · [Tasks](history/sprints/v2/tasks.md)
- [Scorecard (v1)](history/scorecard-v1.md) — platform health snapshot from Feb 24
- [Board (v1)](history/board-v1.md) — blackboard state snapshot from Feb 24
- [Blackboard entries](history/entries/) — 3 posts from v1 sprint

## Research

The classical MAS foundations that inform the system's design.

- [book.pdf](references/book.pdf) — *The Engineering Handbook for Multiagent Systems* by Dr. Balaji Viswanathan
- [Classical References](references/CLASSICAL-REFERENCES.md) — 40+ years of MAS research mapped to 16 pillars
- [Prep Material](references/prep-material.md) — 16 pillars deep dive with failure scenarios and solutions
- [Syllabus](references/SYLLABUS.md) — MAS workshop learning design (14 modules, 2 days)
- [Content Status](references/CONTENT-STATUS.md) — workshop content delivery audit
- [Findings](references/FINDINGS.md) — content gap analysis

## Live State

The `kapi/` directory (not in docs/) holds live sprint state:

```
kapi/
├── blackboard-live.yaml   # Source of truth (managed by blackboard server)
├── backlog.md             # Inbox items
├── status.md              # Demo-safe features, known gaps
├── entries/               # Narrative posts (findings, decisions, blockers)
├── agents/                # Agent profile .md files
└── sprints/               # Active sprint files
```

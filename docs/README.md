# Kapi Sprints — Documentation

A multiagent sprint coordination system built on 30 years of classical MAS research. Two subsystems, three memory tiers, four skills.

## Concepts

The 16 pillars of multiagent systems, implemented. Start here.

- [Vision: 16 Pillars in Practice](concepts/vision.md) — the full mapping of classical MAS research to kapi-sprints
- [The 16 Pillars](concepts/pillars.md) — each pillar: failure it prevents, classical root, kapi-sprints implementation
- [The Blackboard Pattern](concepts/blackboard.md) — Pillars 1, 4, 5, 8: shared state, result sharing, communication, memory
- [Backwards Build](concepts/backwards-build.md) — Pillar 16: the engineering methodology
- [Human-in-the-Loop](concepts/hitl.md) — Pillars 9, 10, 12, 13: earned autonomy, trust, learning, governance

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


## Live State

The `kapi/` directory (not in docs/) holds live sprint state. Each file answers a question and feeds a dashboard page:

```
kapi/
├── snapshot.yaml          # "Where are we?"      → /dashboard command center
├── decisions.yaml         # "What did we decide?" → /decisions page (ADRs + reviews)
├── backlog.md             # "What's next?"        → /backlog page
├── board.md               # "What's happening?"   → /board (blockers, findings, status)
├── lessons.md             # "What did we learn?"  → /lessons page (append-only)
├── blackboard-live.yaml   # Agent coordination    → /agents page (managed by server)
├── entries/               # "What happened?"       → Stream view (one .md per event)
├── agents/                # Who's connected?       → Agent profiles (auto-created)
└── sprints/               # Sprint records         → /sprints/v1 detail view
    └── v1/tasks.md        #   Current sprint tasks + prd.md
```

### The five questions

| Question | File | Page | Writer |
|----------|------|------|--------|
| Where are we? | `snapshot.yaml` | `/dashboard` | PM agent |
| What did we decide? | `decisions.yaml` | `/decisions` | Any agent, `/review` skill |
| What's next? | `backlog.md` | `/backlog` | `/post queue`, backlog API |
| What's happening? | `board.md` | `/board` | `/post`, agents |
| What did we learn? | `lessons.md` | `/lessons` | Agents + humans (append-only) |

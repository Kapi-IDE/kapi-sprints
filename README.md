# Kapi Sprints

> **Multi-agent coordination for Claude Code human-agent teams.**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)

Run multiple Claude Code terminals simultaneously — each as a specialist agent (PM, Dev, Test) — coordinated through a shared filesystem blackboard. Every agent reads the board, posts findings, and signals status. Humans stay in the loop on the decisions that matter.

![Kapi Sprints Dashboard](kapi-sprints-dashboard-walkthrough.gif)

---

## The Vision

Most teams are bolting AI onto how they already work. They add a copilot here, an agent there. Six months later the agents are ignored or causing problems — confidently wrong, silently drifting, reviewed so obsessively that humans are doing more work than before.

**The models aren't the problem. The coordination is.**

We're building toward something different: teams where AI agents announce availability, post findings, signal when stuck, and earn more autonomy as they prove reliable — all on a shared blackboard that every agent and human reads. Where humans review the 10% that genuinely needs human judgment, not 100% out of anxiety. Where context survives session boundaries and agents pick up exactly where they left off.

This is what an AI-native team looks like:

```
                    HUMAN PM
                       │
            ┌──────────┼──────────┐
            │          │          │
         reads       reviews    approves
         board       ~10% of    deploys
                     responses
                        │
         ┌──────────────┼──────────────────────┐
         │              │                      │
    PM AGENT      DEV AGENT(S)          TEST AGENT
    ─────────     ─────────────         ──────────
    /prd scope    /dev tasks            /test QA gate
    posts PRD     announces available   posts findings
    updates board  signals stuck        pushes to staging
    asks human     commits per-task     updates board
    for decisions  reads board
         │              │                      │
         └──────────────┼──────────────────────┘
                        │
                   BLACKBOARD
                   ──────────
                   board.md + entries/
                   agents read and write
                   dashboard renders live
```

kapi-sprints is the open-source infrastructure that makes this possible. Not a SaaS. Not an abstraction layer. A coordination system you run in your own repo, against your own files, in your own terminals.

---

## The Problem We're Solving

AI coding assistants are powerful but chaotic at scale:

- **They forget everything between sessions.** Start a new terminal and your agent has no idea what happened yesterday.
- **They can't coordinate.** Run 3 terminals on the same codebase and they step on each other.
- **There's no structure for trust.** Agents act autonomously from day one — with the same review rate whether they've been reliable for 6 months or started 5 minutes ago.
- **It's all vibes.** No scorecards, no preflight checks, no signals, no audit trail. Prompt and pray.

The result: teams that should be shipping at 10x are actually shipping at 1x, spending the difference on rework, context recovery, and keeping tabs on what each agent is doing.

---

## The Three Systems

Getting to AI-native requires three things working together:

### 1. Blackboard — Shared State

Inspired by Hearsay-II (1980) and BB1 (1985): a shared knowledge store where multiple specialist agents contribute findings, read each other's state, and coordinate toward a common goal. No central orchestrator. No message passing. Just a shared surface.

```
Claude Code terminals          Markdown files              Dashboard
┌──────────────┐
│ Terminal 1   │──writes──▶  docs/operations/
│  /dev v1     │             ├── blackboard/
├──────────────┤             │   ├── board.md      ◀──reads──  localhost:3000
│ Terminal 2   │──writes──▶  │   └── entries/
│  /test v1    │             ├── sprints/v1/
├──────────────┤             │   ├── tasks.md      ◀──reads──  Sprint progress
│ Terminal 3   │──writes──▶  │   └── review.md     ◀──reads──  Review narrative
│  /prd v2     │             └── status.md
└──────────────┘
```

Agents speak to each other through typed signals — not chat, not tickets:

| Signal | Meaning |
|--------|---------|
| `available` | Agent initialized, ready for work |
| `finding` | Discovered something that changes direction |
| `decision` | Resolved an open question |
| `blocker` | Cannot proceed — needs human |
| `stuck` | Degraded but working — may need help |
| `handoff` | Passing ownership to next agent |
| `queue` | Idea to capture before it's lost |
| `idle` | Work complete, stepping back |

### 2. Sprint Workflow — Structured Cadence

A health-check → plan → build → QA → review cycle where each phase is a Claude Code skill. Context is never lost between sessions. Every sprint produces a complete paper trail.

```
/resume    → "Where was my head?" (context recovery after time away)
/preflight → Go/no-go: git, build, architecture drift, UX
/scorecard → Honest health percentages — no optimism, just reality
/prd       → Scope negotiation. PRD + tasks written. Board updated.
/dev       → Pick task → TDD → commit → repeat. Board updated.
/test      → Build + types + lint + code review → push to staging
/walkthrough → Per-task narrative of what was built and why
/checkpoint → End of day. Intent captured for tomorrow's agents.
```

### 3. HITL Protocol — Earned Autonomy

Not a veto button. A trust protocol. Based on Sheridan's 10-level autonomy model (1978), agents should move along the control spectrum as they earn trust:

```
Level 4: Agent proposes, human decides        ← /prd scope negotiation
Level 5: Agent executes, human can veto first ← approval gate
Level 6: Agent executes, posts to board       ← blackboard signals
Level 7: Agent acts, human reads board        ← autonomous with audit trail
```

Agents earn more autonomy over time as they demonstrate reliability:

```
Review rate
  100% │▓▓▓▓▓▓▓▓   ← New agent (Day 1)
       │        ▓▓▓▓▓
   75% │             ▓▓▓▓
       │                 ▓▓▓
   25% │                    ▓▓▓▓▓▓▓▓▓▓▓▓
    5% │─────────────────────────────────▷ baseline
       └──────────────────────────────────
        Day 1    Week 2    Month 1   Month 6
```

Every human decision — approve, reject, edit — is a labeled training example. Over time, the team's review burden drops. Agents improve. Autonomy is earned, not assumed.

→ **[Read the full vision](docs/guides/vision.md)**

---

## Quick Start

```bash
git clone https://github.com/kapihq/kapi-sprints.git
cd kapi-sprints
npm install
npm run dev
# → http://localhost:3000
```

Open the dashboard. You'll see Sprint v1 — the sprint that built kapi-sprints itself.

---

## What's Inside

### Claude Code Skills (`.claude/skills/`)

| Skill | What it does |
|-------|-------------|
| `/prd v1` | Plan a sprint interactively — reads backlog + board, brainstorms scope, writes `prd.md` + `tasks.md` |
| `/dev v1` | Implement tasks with TDD — posts `available` to team sidebar, picks next task, commits per task |
| `/test v1` | QA gate — build + type check + lint. Stops on first failure. Pushes to staging. |
| `/post` | Post to the blackboard — `finding`, `decision`, `blocker`, `available`, `handoff`, `queue` |

### Dashboard

| View | What you see |
|------|-------------|
| **Overview** | Spec status, sprint velocity, QA quality, blockers, decisions, findings, queue |
| **Build** | Task blocks with checkboxes — click to toggle, persists to `tasks.md` |
| **QA** | Test results and code review output |
| **Review** | Sprint walkthrough narrative |
| **Stream** | Filterable timeline of all blackboard entries |
| **Docs** | Markdown + Mermaid rendering of any file in `docs/` |

### File Structure

```
docs/operations/
├── blackboard/
│   ├── board.md            ← The blackboard — all agents and humans post here
│   └── entries/            ← One .md per decision/finding/milestone
├── sprints/
│   └── v1/
│       ├── tasks.md        ← Task list (checkboxes persist on click)
│       ├── prd.md          ← Sprint goals and acceptance criteria
│       ├── preflight.md    ← Pre-sprint health check
│       ├── code-review.md  ← QA review output
│       └── review.md       ← Sprint walkthrough narrative
├── backlog.md              ← Unscheduled ideas
├── scorecard.md            ← Platform health grades
└── status.md               ← What works, what doesn't, sprint history
```

---

## Guides

| Guide | What it covers |
|-------|---------------|
| [Vision](docs/guides/vision.md) | The full vision — blackboard theory, sprint workflow, HITL autonomy ramps, target state |
| [Blackboard Pattern](docs/guides/blackboard-pattern.md) | Hearsay-II and BB1 — the 1980s AI research behind this coordination model |
| [Backwards Build](docs/guides/backwards-build.md) | Start from done. Every intermediate state is deployable. |
| [Principles](docs/guides/principles.md) | Durable engineering and product beliefs that shape all decisions |

---

## Configuration

Edit `project.config.ts` to brand the dashboard for your project:

```typescript
export const PROJECT = {
  name: 'My Project',
  short: 'mp',
  description: 'One-line description',
  repo: 'https://github.com/you/your-repo',
}
```

---

## Roadmap

- [ ] Real-time file watching (SSE — dashboard updates within 1-2 seconds of any `.md` change)
- [ ] CLI packaging (`npx kapi-sprints dashboard`)
- [ ] Claude Code plugin marketplace distribution
- [ ] `/resume` — session recovery: "where was my head?"
- [ ] `/checkpoint` — session debrief + board pruning
- [ ] `/sprint init` — Foundation Gate as a Claude Code command
- [ ] `/scorecard` — config-based quality layer auditing
- [ ] Per-category competence tracking (autonomy ramp implementation)
- [ ] Shadow mode infrastructure (earn autonomy before acting autonomously)
- [ ] Active learning loop (human decisions → labeled dataset → prompt optimization)

---

## Built by Kapi

This is how we build [Kapi](https://getkapi.com) — an AI agent platform where blueprints ship all 8 layers: UI, Graph, Integrations, Knowledge, Memory, HITL, Evals, and Observability.

The blackboard pattern and HITL protocol you see in kapi-sprints are the same coordination model that powers Kapi's multi-agent orchestration. Teams who use kapi-sprints are learning the methodology firsthand — and building exactly the kind of AI-native workflow that makes Kapi's enterprise features make sense.

---

## Contributing

Contributions welcome. Read [docs/guides/principles.md](docs/guides/principles.md) first — the design philosophy shapes all decisions.

```bash
git checkout -b feat/your-feature
npm run dev    # test locally
npm run build  # must pass
# Submit PR
```

---

## License

Apache 2.0 — see [LICENSE](LICENSE) and [NOTICE](NOTICE)

Built by [Kapi AI](https://getkapi.com)

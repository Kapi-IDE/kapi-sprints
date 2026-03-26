# The Vision: 16 Pillars in Practice

*kapi-sprints is a living implementation of the coordination patterns from 30 years of multiagent systems research.*

---

## The Problem

Every company is racing to "add AI to their workflow." They buy a copilot. They plug in an LLM. They run a few demos. Six months later, the agents are either ignored or causing problems — confidently wrong, silently failing, or reviewed so obsessively that the humans are doing more work than before.

The models aren't the problem. The models are astonishing.

The problem is that teams treat AI agents the way they treated offshore contractors in 2005: dump work over the wall, hope for the best, fire-fight when things go wrong. There's no coordination system. No trust protocol. No way for agents to earn more autonomy over time. No shared memory between sessions.

**AI agents fail because teams haven't figured out how to work with them.** Not because the AI isn't good enough.

---

## The 16 Pillars

Classical MAS research — from Hearsay-II (1980) through Ostrom (1990, Nobel Prize) to modern agent frameworks — identified 16 engineering pillars that make multiagent systems work. Skip any of them and your agents break in predictable ways.

kapi-sprints implements these pillars as a coordination system for human-agent software teams. Here's the mapping:

| # | Pillar | Classical Root | kapi-sprints Implementation |
|---|--------|---------------|---------------------------|
| 1 | **Shared State & Blackboard** | Nii 1986 | `blackboard-live.yaml` — all agents read/write shared state |
| 2 | **Task Allocation** | Smith 1980 (Contract Net) | `/prd` decomposes work; agents bid via `available` signals |
| 3 | **Team Design** | Horling & Lesser 2004 | PM + Dev + Test topology; hybrid supervisor-pipeline |
| 4 | **Planning & Result Sharing** | Durfee 1999 | Mid-sprint `finding` posts; agents adjust based on each other's discoveries |
| 5 | **Communication** | FIPA 1993 | Typed signals: `blocker`, `finding`, `decision`, `handoff`, `available` |
| 6 | **Negotiation** | Rosenschein 1994 | `/prd` scope negotiation — human and agent converge on sprint scope |
| 7 | **Agent Architecture (BDI)** | Bratman 1987 | Skills as persistent intentions; tasks.md as commitment structure |
| 8 | **Memory & Context** | Tulving 1983 | Three tiers: working (directives), episodic (entries), semantic (tasks/backlog) |
| 9 | **Learning & Adaptation** | Dorigo 1992 | Competence tracking from git stats + resolution history |
| 10 | **Human-in-the-Loop** | Bainbridge 1983 | Autonomy spectrum (L4–L7); earned trust; alert fatigue mitigation |
| 11 | **Embodied / Irreversible** | Brooks 1991 | TDD + QA gates before any deploy; `/test` as irreversibility checkpoint |
| 12 | **Trust & Reputation** | Gambetta 1989 | Agent profiles; per-category competence scores |
| 13 | **Governance & Norms** | Ostrom 1990 | Blackboard rules; security-first principles; norm enforcement via skills |
| 14 | **Simulation & Testing** | Epstein & Axtell 1996 | `/preflight` health checks; build gates catch emergent failures |
| 15 | **Evaluation** | Campbell 1976 | Scorecard; sprint review; coordination quality, not just output quality |
| 16 | **Frameworks & Engineering** | Wooldridge 2002 | Backwards Build methodology — spec before code, every state deployable |

*Source: "The Engineering Handbook for Multiagent Systems" (Viswanathan, 2026)*

---

## The Three Systems

The 16 pillars cluster into three reinforcing systems. A blackboard without workflow is noise. Workflow without HITL produces agents that drift. HITL without shared state means reviewers lack context.

### System 1: Blackboard — Shared State

*Implements Pillars 1, 4, 5, 8*

From Hearsay-II (1980) and BB1 (1985): a shared knowledge store where multiple specialist agents contribute findings, read each other's state, and coordinate toward a common goal. No central orchestrator. No message passing. Just a shared surface.

```
Three components:
┌──────────────────────────────────────────┐
│            BLACKBOARD                    │
│  (shared state all agents read/write)    │
├──────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │   PM    │  │   Dev   │  │  Test   │  │
│  │ findings │  │ findings│  │ findings│  │
│  └─────────┘  └─────────┘  └─────────┘  │
├──────────────────────────────────────────┤
│         CONTROL SHELL                    │
│  (decides who goes next based on state)  │
└──────────────────────────────────────────┘
```

**Three memory tiers** implement Pillar 8 (Memory & Context):

| Memory Tier | Implementation | Persistence |
|-------------|---------------|-------------|
| **Working** | Blackboard directives | Ephemeral — active only while task is in progress |
| **Episodic** | `entries/`, checkpoints | Durable — one file per event, survives sessions |
| **Semantic** | `tasks.md`, `backlog.md`, `status.md` | Permanent — organized knowledge, git-tracked |

**Typed signals** implement Pillar 5 (Communication):

| Signal | Pillar | Meaning |
|--------|--------|---------|
| `available` | P2 (Task Allocation) | Agent ready for work — enables bidding |
| `finding` | P4 (Result Sharing) | Discovery that changes direction — mid-execution sharing |
| `decision` | P6 (Negotiation) | Resolved an open question — commitment recorded |
| `blocker` | P10 (HITL) | Cannot proceed — escalation to human |
| `stuck` | P10 (HITL) | Degraded but working — may need help |
| `handoff` | P3 (Team Design) | Passing ownership — topology-aware transfer |
| `queue` | P4 (Planning) | Idea captured for next sprint |

→ **[Deep dive: The Blackboard Pattern](blackboard.md)**

### System 2: Sprint Workflow — Structured Cadence

*Implements Pillars 2, 3, 4, 7, 16*

The sprint cycle is not just project management. It's the implementation of five MAS pillars:

- **Pillar 2 (Task Allocation)**: `/prd` decomposes work into sized tasks. Agents self-select via `available` signals.
- **Pillar 3 (Team Design)**: PM → Dev → Test pipeline. Each role has defined inputs, outputs, and handoff protocols.
- **Pillar 4 (Planning & Result Sharing)**: Sprint files (`prd.md`, `tasks.md`) are the plan. `finding` posts are mid-execution result sharing.
- **Pillar 7 (BDI Architecture)**: Each skill is a persistent intention. `tasks.md` checkboxes are the commitment structure — the agent knows what it's committed to doing right now.
- **Pillar 16 (Backwards Build)**: Define done before writing code. Every intermediate state is deployable.

```
The sprint as a trust protocol:

/preflight  →  /prd  →  /dev  →  /test  →  /walkthrough
                 │         │        │
              scope     TDD per   QA gate
              negotiation  task    before
              (P6)      (P7,P11)  deploy
                           │
                        posts findings
                        mid-execution (P4)
```

**The lifecycle** — where each pillar activates:

```
TODO           READY          DOING              DONE
backlog.md     tasks.md [ ]   blackboard         tasks.md [x]
               ─────────────  directives         ─────────────
P4: Planning   P2: Allocation P1: Shared State   P15: Evaluation
                              P5: Communication  sprint review
                              P7: BDI commitment
                              P10: HITL if stuck
```

→ **[Deep dive: Backwards Build](backwards-build.md)**

### System 3: HITL Protocol — Earned Autonomy

*Implements Pillars 9, 10, 12, 13*

Most teams treat human oversight as binary: either approve everything (bottleneck) or let agents act freely (uncontrolled). Both fail. The answer is a spectrum — and agents should move along it as they earn trust.

**Pillar 10 — The Autonomy Spectrum** (Sheridan 1978):

```
←── More Human Control ──────────────── More Agent Control ──→

Level 4: Agent proposes, human decides        ← /prd scope negotiation
Level 5: Agent executes, human can veto       ← deploy approval gate
Level 6: Agent executes, posts to board       ← blackboard signals
Level 7: Agent acts, human reads board        ← autonomous with audit trail
```

kapi-sprints targets Levels 4–7. Never levels 8–10. Silent autonomy in a system touching real code is how incidents happen.

**Pillar 12 — Earned Trust** (Maes 1994):

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

**Pillar 9 — Learning** (Dorigo 1992): Stigmergic learning from accumulated quality signals. Per-agent competence scores by task type. Routing improves without explicit training loops — just accumulated quality signals.

**Pillar 13 — Governance** (Ostrom 1990): Blackboard rules, skill constraints, security-first principles. The norm lifecycle: create → propagate → enforce → revise. Not just system prompts that are set once and never checked.

→ **[Deep dive: Human-in-the-Loop](hitl.md)**

---

## The Target State

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
                   all agents read/write
                   dashboard renders live
                   three memory tiers
```

No agent has special knowledge that isn't on the blackboard. No human has to hold context in their head. Agents earn autonomy. Decisions get captured. The sprint cycle closes clean.

---

## Engineering Beliefs

These follow directly from the 16 pillars:

1. **Backwards Build** (P16) — Define done before writing code. Every intermediate state is deployable.
2. **Blackboard coordination** (P1) — If it matters, it goes on the board. No information lives only in a chat message.
3. **TDD** (P11) — Irreversible actions (deploys, commits) demand quality gates. Tests define the contract.
4. **Ship continuously** (P14) — Every task produces a deployable state. Catch emergent failures early.
5. **Small sprints** (P3) — 3 hours max. Tight cycles force tight coordination. Wrong topology shows up fast.
6. **Security first** (P13) — Governance norms are not optional. Every security issue fixed before production.
7. **No clever code** (P15) — Coordination quality matters more than output elegance. Boring, obvious, well-named.

---

## What's Built, What's Next

| Pillar Cluster | Status | What Exists |
|---------------|--------|-------------|
| **Shared State** (P1, P4, P5, P8) | Shipped | Blackboard server, typed signals, three memory tiers, WebSocket live updates |
| **Sprint Workflow** (P2, P3, P7, P16) | Shipped | `/prd /dev /test /post`, task lifecycle, agent roles, backwards build |
| **HITL Basics** (P10) | Shipped | Autonomy levels 4–7, blocker escalation, human-on-board |
| **Trust & Learning** (P9, P12) | Seed data | Git stats per author, agent profiles. Competence inference not yet built. |
| **Governance** (P13) | Partial | Skill constraints, security principles. Runtime norm enforcement not yet built. |
| **Evaluation** (P15) | Partial | Scorecard, sprint review. Coordination quality metrics planned. |
| **Simulation** (P14) | Basic | Preflight checks. Full emergent-behavior simulation not yet built. |

The blackboard and sprint workflow are proven. Trust, learning, and governance are the next frontier.

---

*Sources: Nii (1986), Smith (1980), Bratman (1987), Bainbridge (1983), Sheridan (1978), Maes (1994), Ostrom (1990), Dorigo (1992), Durfee (1999), Wooldridge (2002). Full treatment in "The Engineering Handbook for Multiagent Systems" (Viswanathan, 2026).*

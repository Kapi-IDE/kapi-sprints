# Human-in-the-Loop: Earned Autonomy

> Implements **Pillar 10** (HITL), **Pillar 12** (Trust & Reputation), **Pillar 9** (Learning & Adaptation), **Pillar 13** (Governance & Norms)

Not a veto button. A trust protocol. Agents earn autonomy as they prove reliable. Humans stay sharp on the decisions that genuinely need them.

---

## The Trap Nobody Sees (Pillar 10)

Bainbridge's Irony of Automation (1983): the more reliable the system, the less vigilant the human overseer, the more catastrophic the failure when the system errs.

A law firm's contract agent is right 96% of the time. By clause 80, the associate is skimming. Clause 112 has a jurisdictional error exposing the client to unlimited liability. Approved in four seconds.

**The fix is not more oversight. It's smarter oversight.**

---

## The Autonomy Spectrum (Pillar 10)

Sheridan's 10-level taxonomy (1978) remains the clearest framing:

```
←── More Human Control ──────────────── More Agent Control ──→

Level 1:  Human does everything
Level 2:  Agent offers options, human selects
Level 3:  Agent narrows to small set, human selects
Level 4:  Agent suggests one, human can change             ← /prd scope proposal
Level 5:  Agent executes, human can veto first             ← approval gate
Level 6:  Agent executes, tells human (who can still stop) ← escalation gate
Level 7:  Agent executes, tells human only if asked        ← autonomous with log
Level 8:  Agent self-decides when to inform human
Level 9:  Agent acts, informs only if human requests
Level 10: Full autonomous, no notification
```

kapi-sprints targets **Levels 4–7**. Never 8–10. Silent autonomy in a system touching real code is how incidents happen.

| Level | kapi-sprints Feature | When It Activates |
|-------|---------------------|-------------------|
| 4 | `/prd` scope negotiation | Agent proposes sprint scope, human accepts or modifies |
| 5 | Deploy approval gate | Human reviews before production push |
| 6 | Blackboard signals | Agent posts findings proactively, human reads at own pace |
| 7 | Autonomous task execution | Agent commits per-task with full audit trail on board |

---

## Earned Trust (Pillar 12)

Maes (1994) showed that agents should earn more autonomy over time. Static review patterns — set at deploy time, never adjusted — are wrong.

```
Review rate
  100% │▓▓▓▓▓▓▓▓   ← New agent (Day 1: review everything)
       │        ▓▓▓▓▓
   75% │             ▓▓▓▓
       │                  ▓▓▓
   50% │                     ▓▓
       │                       ▓▓
   25% │                         ▓▓▓
       │                             ▓▓▓▓▓▓▓▓▓▓▓
    5% │─────────────────────────────────────────▷ baseline
       └──────────────────────────────────────────
        Day 1    Week 2    Month 1   Month 6

Formula: review_rate = max(baseline, initial × e^(-competence × time))
```

An agent that ships without bugs for 6 months shouldn't get the same review rate as a new agent on day one. The target: **per-category competence scores, autonomy that adjusts automatically**.

### The Five-Component Trust Model (Castelfranchi & Falcone)

| Component | In kapi-sprints |
|-----------|----------------|
| **Competence belief** — Can they do it? | Git stats per author, task completion rate |
| **Disposition belief** — Will they try? | Agent `available` signals, response to directives |
| **Dependence** — Do I need them? | Team topology, role coverage |
| **Fulfillment** — Did they deliver before? | Sprint review history, entries trail |
| **Willingness to risk** — What's at stake? | Task size (S/M), reversibility of action |

---

## Alert Fatigue

Bliss (1995) documented the failure mode that kills HITL systems: when every response is routed to a reviewer, the approval rate climbs to 99% within weeks. Reviewers habituate. The queue becomes theater.

The signal taxonomy prevents this:

```
Mitigations:
  1. Only queue genuinely uncertain items (tune conditions, not volume)
  2. Sample 5% of autonomous responses for quality audit
  3. Show reviewers WHY something was queued (context, not just content)
  4. Track rubber-stampers — a reviewer with >98% approve rate isn't reviewing
```

`blocker` is not `finding`. `stuck` is not `idle`. Different signals route to different review paths at different urgency levels.

---

## Shadow Mode: The Path Forward (Pillar 9)

The production pattern for building trust without risk:

```
Phase 1: Shadow Mode
─────────────────────────────────────────────────
  Human makes decision     Agent also decides (hidden)
         │                         │
         └─────────────────────────┘
                    │
              Compare: do they agree?
                    │
         ┌──────────┴──────────┐
        Yes (>95%)            No (<95%)
         │                     │
   Promote agent to        Stay in review
   autonomous for          (retrain / tune)
   this task category

Phase 2: Earned Autonomy
─────────────────────────────────────────────────
  Routine task, 95% agreement in shadow → AUTONOMOUS
  Novel task, 72% agreement in shadow  → REVIEW REQUIRED
  High-stakes action, always           → APPROVAL GATE
```

Result: ~65% autonomous rate, per category. Humans review only the genuinely uncertain cases.

---

## The Active Learning Loop (Pillar 9)

Every human decision on a queued item is training data:

```
Agent response → HITL queue → Human decision
                                    │
           ┌────────────────────────┼─────────────────────┐
           │                        │                     │
        approve                  reject              edit + send
           │                        │                     │
        label: +1               label: -1          label: diff
           │                        │                     │
           └────────────────────────┴─────────────────────┘
                                    │
                           Labeled dataset grows
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
              DPO fine-tune              Prompt optimization
              (correction pairs)         (few-shot from approved)
```

Every `/post decision` on the blackboard isn't just coordination. It's a labeled training example. The sprint system generates its own improvement data.

---

## Governance (Pillar 13)

Ostrom's 8 design principles for governing commons (Nobel Prize, 2009) map directly to multi-agent governance:

| Ostrom Principle | kapi-sprints Implementation |
|-----------------|---------------------------|
| Clearly defined boundaries | Agent roles (PM, Dev, Test), skill constraints |
| Proportional sanctions | Build failures block deploys, not all work |
| Conflict resolution | Human PM resolves blockers on the board |
| Nested governance | Sprint rules → blackboard rules → agent rules |
| Monitoring | Scorecard, sprint review, dashboard |

System prompts are **creation-only governance** — set once, never enforced at runtime. The full lifecycle: **create → propagate → enforce → revise**. kapi-sprints' skill constraints and blackboard rules implement the first three. Runtime revision is next.

---

## The Four-Concept Operating Loop

Signal, Structure, Learn, and Govern form a continuous cycle:

```
Signal → Structure → Learn → Govern → (back to Signal)
```

| Concept | What it solves | Pillars |
|---------|---------------|---------|
| **Signal** | When anyone needs help — graduated, bidirectional | P5, P10 |
| **Structure** | How to work together — collaboration patterns, not gates | P3, P6 |
| **Learn** | Adapt team composition — trust is mutual | P9, P12 |
| **Govern** | Monitor team health — all participants, not just agents | P13, P15 |

---

## Current State

| Capability | Status | What Exists |
|-----------|--------|-------------|
| Autonomy levels 4–7 | **Shipped** | `/prd` proposals, blackboard signals, audit trail |
| Typed signal protocol | **Shipped** | `blocker`, `finding`, `decision`, `handoff`, `available`, `stuck` |
| Bidirectional signals (human → agent) | **Shipped** | Directives via `/agents` dashboard |
| Git stats per author (trust seed data) | **Shipped** | Right panel shows lines added/removed/commits |
| Per-category competence scores | Planned | Inference from git stats + resolution history |
| Shadow mode | Planned | Compare human/agent decisions, promote on agreement |
| Active learning loop | Planned | Decisions stored but not yet consumed for training |
| Alert fatigue detection | Planned | Flag reviewers with >98% approve rate |

---

*Sources: Bainbridge (1983), Sheridan & Verplank (1978), Maes (1994), Bliss (1995), Castelfranchi & Falcone (2010), Ostrom (1990), Gambetta (1989). Full treatment in "The Engineering Handbook for Multiagent Systems" (Viswanathan, 2026), Chapters 9, 10, 12, 13.*

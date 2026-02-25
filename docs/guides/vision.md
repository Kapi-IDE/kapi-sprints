# The Vision: AI-Native Teams

*What we're building toward — and why every piece connects*

---

## The Problem Nobody Talks About

Every company is racing to "add AI to their workflow." They buy a copilot. They plug in an LLM. They run a few demos. Six months later, the agents are either ignored or causing problems — confidently wrong, silently failing, or reviewed so obsessively that the humans are doing more work than before.

The models aren't the problem. The models are astonishing.

The problem is that teams treat AI agents the way they treated offshore contractors in 2005: dump work over the wall, hope for the best, fire-fight when things go wrong. There's no coordination system. No trust protocol. No way for agents to earn more autonomy over time. No shared memory between sessions. No structured way for humans to stay in the loop without becoming bottlenecks.

**AI agents fail because teams haven't figured out how to work with them.** Not because the AI isn't good enough.

kapi-sprints exists to solve this. Not by building another tool, but by establishing the patterns that make AI-native teams work.

---

## What an AI-Native Team Actually Looks Like

Imagine a sprint where:

- A PM agent reads the backlog at 9am, asks clarifying questions, and proposes a scope
- A developer agent picks the first unchecked task, writes a failing test, implements, verifies, and commits — then moves to the next
- A test agent runs the full QA gate and pushes to staging
- A human PM reviews only the decisions that genuinely need human judgment
- Every agent announces availability, posts findings, and signals when stuck — on a shared blackboard that every other agent and human reads
- At end of day, the human runs a 5-minute checkpoint that captures their intent for tomorrow's agents
- The next morning, agents resume exactly where they left off

This isn't science fiction. This is what kapi-sprints is designed to make possible.

---

## The Three Systems

Getting to AI-native requires three things working together:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   BLACKBOARD                                                     │
│   ──────────────────────────────────────────────────────────    │
│   Shared knowledge store. Every agent and human reads and        │
│   writes here. Single source of coordination truth.             │
│                                                                  │
│   board.md  ←→  entries/  ←→  terminal dashboard               │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   SPRINT WORKFLOW                                                │
│   ──────────────────────────────────────────────────────────    │
│   Structured cadence: Health → Plan → Build → QA → Review.      │
│   Each phase is a skill. Each skill reads from and writes to     │
│   the blackboard. Context is never lost between sessions.        │
│                                                                  │
│   /preflight → /prd → /dev → /test → /walkthrough               │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   HUMAN-IN-THE-LOOP                                              │
│   ──────────────────────────────────────────────────────────    │
│   Not a veto button. A trust protocol. Agents signal what they  │
│   need reviewed, earn more autonomy as they prove reliable, and  │
│   surface only the decisions worth a human's time.              │
│                                                                  │
│   available → working → stuck → handoff → idle                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

These three systems reinforce each other. A blackboard without workflow is noise. Workflow without HITL produces autonomous agents that drift and compound mistakes. HITL without shared state means reviewers lack context — and rubber-stamp everything.

---

## The Blackboard: More Than a File

The blackboard pattern comes from 1980s AI research (Hearsay-II, BB1). A shared knowledge store where multiple specialist agents contribute partial results, read each other's findings, and coordinate toward a common goal. No central orchestrator. No message passing. Just a shared surface everyone reads and writes.

For AI development teams, the blackboard is more powerful than message passing because:

- **It survives context loss.** Agents die. Sessions end. Models get swapped. The blackboard persists.
- **It's inspectable by humans.** Any team member — human or agent — can read the current state in plain text.
- **It scales to N agents.** A new agent joining a sprint reads board.md and has full context in seconds.
- **It creates audit trails.** Every entry is timestamped, attributed, and typed. You know who said what and when.

The signal types aren't arbitrary. They map to real coordination needs:

| Signal | Meaning | Who Reads It |
|--------|---------|-------------|
| `available` | Agent initialized and ready for work | PM, other agents |
| `finding` | Discovered something that changes direction | Everyone |
| `decision` | Resolved an open question | Future agents, reviewers |
| `blocker` | Cannot proceed, need help | Human PM immediately |
| `stuck` | Degraded — working but struggling | Team, may escalate |
| `handoff` | Passing ownership of context | Next agent in chain |
| `queue` | Idea to capture before it's forgotten | `/prd` in next sprint |
| `idle` | Work complete, stepping back | Capacity tracker |

This is a typed coordination protocol. Not chat. Not tickets. A shared signal space that every agent speaks fluently.

---

## The Workflow: Sprint as Structured Trust

The sprint cycle isn't just project management. It's a trust protocol between humans and agents.

```
Day 0: Health + Plan
────────────────────────────────────────────────────────
/resume        → "Where was my head?" (context recovery after time away)
/preflight     → Go/no-go: git, build, architecture drift, UX audit
/scorecard     → Honest wiring percentages — no optimism, just reality
/prd           → Scope negotiation. PRD + tasks written. Blackboard updated.

Day 1-N: Build
────────────────────────────────────────────────────────
/dev           → Agent picks task, announces available, implements with TDD,
                 posts findings if something surprising happens,
                 signals stuck if blocked, commits per-task

/post queue    → Human externalizes mid-session ideas before they're lost
/checkpoint    → End of day. 5-min debrief. Intent captured for tomorrow.

Every 2-3 blocks: QA checkpoint
────────────────────────────────────────────────────────
/test          → Build + lint + types + code review + push to dev

Day N+1: Close
────────────────────────────────────────────────────────
/walkthrough   → Per-task narrative, what was built and why
/checkpoint    → Final debrief. Queued items → next sprint or deleted.
```

Each step has a precise handoff. `/preflight` only runs if the branch is clean. `/prd` reads the blackboard's Queued section for mid-session ideas that surfaced during the last sprint. `/test` auto-posts critical findings. `/checkpoint` prunes the board and captures intent so `/resume` can reconstruct it tomorrow.

The workflow encodes **what to do when** so the human doesn't have to hold it in their head.

---

## The HITL Protocol: Earning Autonomy

Here's where it gets deep.

Most teams treat human oversight as a binary: either the human approves everything (bottleneck) or the agent acts autonomously (uncontrolled). Both fail. The right answer is a spectrum — and agents should move along it as they earn trust.

### Sheridan's 10 Levels of Autonomy

Thomas Sheridan's 1978 taxonomy is still the clearest framing:

```
←── More Human Control ─────────────────── More Machine Control ──→

Level 1:  Human does everything
Level 2:  Computer offers options, human selects
Level 3:  Computer narrows to small set, human selects
Level 4:  Computer suggests one, human can change             ← /prd scope proposal
Level 5:  Computer executes, human can veto first             ← approval gate
Level 6:  Computer executes, tells human (who can still stop) ← escalation gate
Level 7:  Computer executes, tells human only if asked        ← autonomous log
Level 8:  Computer executes, self-decides when to tell human
Level 9:  Computer executes, tells human only if requested after
Level 10: Computer acts autonomously, no notification
```

A sprint system should cover levels 4-7. Level 4 is `/prd`: agent proposes scope, human accepts or modifies. Level 5 is deploy approval. Level 6 is the blackboard: agent posts findings proactively, human reads at their own pace. Level 7 is autonomous task execution with Langfuse tracing.

What we should **never** build toward: levels 8-10. Silent autonomy in a system touching real code and real customers is how incidents happen.

### The Autonomy Ramp

Maes (1994) showed that agents should **earn** more autonomy over time:

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

This is the math behind trust. An agent that ships without bugs for 6 months shouldn't get the same review rate as a new agent on day one. The current model — static pattern set at deploy time — is wrong. The target: per-category competence scores, autonomy that adjusts automatically.

### Alert Fatigue

Bliss (1995) documented the failure mode that kills HITL systems: alert fatigue. When every response is routed to a reviewer, the approval rate climbs to 99% within weeks. Reviewers habituate. The queue becomes theater.

```
Mitigations:
  1. Only queue genuinely uncertain items (tune conditions, not volume)
  2. Sample 5% of autonomous responses for quality audit
  3. Show reviewers WHY something was queued (context, not just content)
  4. Track rubber-stampers — a reviewer with >98% approve rate isn't reviewing
```

This is why the blackboard signal types matter. `blocker` is not `finding`. `stuck` is not `idle`. The signal taxonomy prevents everything from being routed the same way.

### Shadow Mode: The Path to Earned Autonomy

The production pattern for building trust without risk:

```
Phase 1: Shadow Mode
─────────────────────────────────────────────────────
  Human makes decision     Agent also decides (hidden)
         │                         │
         └─────────────────────────┘
                    │
              Compare: do they agree?
                    │
         ┌──────────┴──────────┐
        Yes (>95%)            No (<95%)
         │                     │
         ▼                     ▼
   Promote agent to        Stay in review
   autonomous for          (retrain / tune)
   this task category

Phase 2: Earned Autonomy
─────────────────────────────────────────────────────
  Routine task, 95% agreement in shadow → AUTONOMOUS
  Novel task, 72% agreement in shadow  → REVIEW REQUIRED
  High-stakes action, always           → APPROVAL GATE
```

Result: 65% autonomous rate, per category. Humans review only the genuinely uncertain cases.

### The Active Learning Loop

Every human decision on a queued item is training data:

```
Agent response → HITL queue → Human decision
                                    │
           ┌────────────────────────┼─────────────────────┐
           │                        │                     │
        approve                  reject              edit + send
           │                        │                     │
        label: +1               label: -1          label: diff(original, edited)
           │                        │                     │
           └────────────────────────┴─────────────────────┘
                                    │
                           Labeled dataset grows
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
              DPO fine-tune              Prompt optimization
              (correction pairs)         (few-shot from approved)
                    │
                    ▼
           Agent improves over time → autonomy ramp accelerates
```

Every `/post decision` in the blackboard isn't just coordination. It's a labeled training example. The sprint system generates its own improvement data.

---

## The Target State

Here's what the fully realized system looks like:

```
                    HUMAN PM
                       │
            ┌──────────┼──────────┐
            │          │          │
         reads       reviews    approves
         board       10% of     deploys
                     responses
                        │
           ─────────────────────────────────────
                        │
         ┌──────────────┼──────────────────────┐
         │              │                      │
    PM AGENT      DEV AGENT(S)          TEST AGENT
    ─────────     ─────────────         ──────────
    /prd scope    /dev tasks            /test QA gate
    posts PRD     announces available   posts findings
    updates board  signals stuck        pushes to staging
    asks human     commits per-task     triggers walkthrough
    for decisions  reads board
         │              │                      │
         └──────────────┼──────────────────────┘
                        │
                   BLACKBOARD
                   ──────────
                   board.md + entries/
                   all agents read/write
                   dashboard renders live
                        │
                   DASHBOARD
                   ──────────
                   Real-time via SSE
                   Human sees all signals
                   Links to entry files
                   Sprint progress
                   Agent status
```

No agent has special knowledge that isn't on the blackboard. No human has to hold context in their head. Agents earn autonomy. Decisions get captured. The sprint cycle closes clean.

---

## Where We Are Today

kapi-sprints v1 proves the core:

| Layer | Shipped | Grade |
|-------|---------|-------|
| Blackboard pattern | board.md + entries/ + signal types | ✅ |
| Sprint skills | `/prd /dev /test /post` | ✅ |
| Context recovery | `/checkpoint /resume` (kapi-platform only) | Partial |
| Dashboard | tasks, overview, doc viewer, team sidebar | ✅ |
| Real-time updates | SSE/WebSocket | ❌ |
| Distribution | `npx kapi-sprints` / plugin | ❌ |
| Autonomy ramp | Static patterns, no competence tracking | ❌ |
| Active learning | Decisions stored, never consumed | ❌ |

The blackboard and sprint workflow are proven. The HITL protocol — earning autonomy, shadow mode, active learning — is the next frontier.

---

## The Build Order

The research points to a clear sequence:

**Now (v1 — shipped)**
- Blackboard coordination (board.md + entries/)
- Sprint skill cycle (/prd /dev /test /post)
- Signal protocol (available/stuck/blocker/finding/decision/handoff/queue/idle)

**Soon (v2)**
- Real-time dashboard (SSE — humans see signals within 1-2 seconds)
- Context recovery (/resume + /checkpoint)
- Signal routing (stuck → visual alert, blocker → escalation)
- Distribution (npx kapi-sprints, plugin marketplace)

**Next (v3)**
- Per-category competence tracking
- Autonomy ramp (review rate decays as agent proves reliable)
- Alert fatigue detection (flag reviewers with >98% approve rate)
- Plan-validate-execute separation (review plan before any action taken)

**Eventually (v4)**
- Shadow mode infrastructure
- Active learning loop (human decisions → labeled dataset → prompt optimization)
- Multi-tier escalation ladder (L1 → L2 specialist → L3 manager + engineer)
- Mid-graph pause (interrupt() at node boundaries, not post-completion)

---

## Why This Matters Beyond Tooling

The sprint workflow and blackboard pattern are methodology, not just tooling. The HITL protocol is ethics, not just engineering.

Teams that figure this out first will have agents that genuinely work alongside humans — not as tools to be wielded, but as members of a team with a defined role, clear accountability, and earned trust.

The alternative — agents that act silently, drift autonomously, and surface problems only after they compound — is what most teams are building right now. They're going to have a bad time.

kapi-sprints is the answer to that. Not because it's a clever dashboard. Because it encodes the right coordination model: shared state, structured trust, and autonomy that's earned rather than assumed.

**The team that gets this right builds at 10x. Not because their agents are faster. Because their humans stop being bottlenecks.**

---

*Sources: Sheridan & Verplank (1978), Parasuraman (2000), Bliss (1995), Maes (1994), FIPA protocol specs, LangGraph interrupt() docs, Salesforce Agentforce (2025), Anthropic agentic patterns guidance, Sutra HITL survey (2025)*

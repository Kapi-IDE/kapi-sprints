# The Blackboard Pattern

> Implements **Pillar 1** (Shared State), **Pillar 4** (Result Sharing), **Pillar 5** (Communication), **Pillar 8** (Memory & Context)

A coordination architecture for AI-assisted development, adapted from 1980s multi-agent systems research.

---

## Origin

The blackboard architecture was introduced in **Hearsay-II** (Erman et al., 1980) for speech recognition and formalized in **BB1** (Hayes-Roth, 1985) as a general problem-solving framework. The core idea: multiple independent **knowledge sources** collaborate by reading from and writing to a shared **blackboard** data structure, coordinated by a **control mechanism** that decides what runs next.

It was the dominant multi-agent coordination pattern for a decade — then largely forgotten as the field moved to direct message-passing architectures. We believe it's the right pattern for AI-assisted software development.

---

## Why It Fits AI Coding (Pillar 1)

When you run multiple Claude Code terminals on the same codebase, you have the same problem Hearsay-II solved: independent agents working on different parts of a shared problem, with no built-in way to coordinate.

The challenges:

- **No shared state.** Terminal 1 doesn't know Terminal 2 just found a blocker.
- **No persistence.** Close a terminal and the context is gone.
- **No visibility.** You can't see what all your agents are doing without checking each terminal.
- **No audit trail.** Decisions happen in chat messages that disappear.

A blackboard solves all four: agents write to shared files, the files persist across sessions, a dashboard watches the files, and every post is an auditable entry.

---

## Three Components

### 1. Knowledge Sources (Terminals)

Each Claude Code terminal running a skill is a knowledge source. It reads the blackboard to understand the current state, does its work, and posts results back.

```
Terminal 1:  /dev v1    → reads board for blockers → implements T03 → posts "done"
Terminal 2:  /test v1   → reads tasks.md for progress → runs build → posts "pass"
Terminal 3:  /prd v2    → reads backlog.md → brainstorms with PM → writes prd.md + tasks.md
```

They never communicate directly. They communicate through the blackboard.

### 2. Blackboard (Shared State)

The shared data structure. In kapi-sprints, it's the `kapi/` directory:

```
kapi/
├── blackboard-live.yaml ← The live blackboard (managed by server)
├── entries/             ← One file per post (decision, finding, blocker, milestone)
├── sprints/{version}/
│   ├── tasks.md         ← Task progress
│   └── prd.md           ← Sprint plan
├── agents/              ← Agent profile .md files
├── backlog.md           ← Queue of future work
└── status.md            ← What's built, what's missing
```

### 3. Control Shell (Skills + Human)

The most valuable component — and the one modern frameworks skip (Pillar 1's key insight).

In classical blackboard systems, a control module decides which knowledge source runs next. In kapi-sprints, control is split:

- **Skills** define what each agent does and when it posts to the blackboard
- **Humans** make decisions, resolve blockers, and steer the sprint
- **Directives** target specific agents: `@dev fix auth`, `Test: verify T03`

The `/post` skill is the primary control interface:

```
/post blocker "API rate limit blocking T04"
/post decision "Using Postgres for prod parity"
/post finding "XSS risk in localStorage"
/post available "Dev ready for v1 T03"
```

---

## Three Memory Tiers (Pillar 8)

Classical MAS research (Tulving 1983) distinguishes episodic memory (what happened) from semantic memory (what is true). kapi-sprints implements three tiers:

| Tier | Implementation | Persistence | Pillar 8 Term |
|------|---------------|-------------|---------------|
| **Working** | Blackboard directives | Ephemeral — active during task | Short-term / working |
| **Episodic** | `entries/`, checkpoints | Durable — one file per event | Episodic |
| **Semantic** | `tasks.md`, `backlog.md`, `status.md` | Permanent — git-tracked | Semantic / long-term |

The key design rule: **"In Progress" is the only state that lives on the blackboard.** Every other state (TODO, READY, DONE) lives in the sprint files. The blackboard is "right now." Sprint files are "forever."

```
TODO           READY          DOING              DONE
backlog.md     tasks.md [ ]   blackboard         tasks.md [x]
                              (working memory)
persist        persist        ephemeral           persist
forever        forever        while active        forever
```

---

## Typed Signals (Pillar 5)

Classical MAS research (FIPA 1993) showed that untyped messages cause coordination failures — the same content can be a proposal, a commitment, or just information. kapi-sprints uses typed signals:

| Signal | Coordination Act | Who Reads It |
|--------|-----------------|-------------|
| `available` | Agent ready for work (Contract Net bid) | PM, other agents |
| `finding` | Mid-execution result sharing (Pillar 4) | Everyone |
| `decision` | Commitment recorded (Pillar 6) | Future agents, reviewers |
| `blocker` | Escalation to human (Pillar 10) | Human PM immediately |
| `stuck` | Degraded — may need help | Team, may escalate |
| `handoff` | Ownership transfer (Pillar 3) | Next agent in chain |
| `queue` | Future work captured (Pillar 4) | `/prd` in next sprint |

This is a typed coordination protocol. Not chat. Not tickets. A shared signal space that every agent speaks fluently.

---

## Result Sharing (Pillar 4)

Most frameworks share tasks (decompose → dispatch → collect outputs). Few share results mid-execution. kapi-sprints does both:

- **Task sharing**: `/prd` decomposes work into tasks, agents claim them
- **Result sharing**: A `finding` post mid-sprint lets other agents adjust their approach before completion

Example: Dev agent discovers a library doesn't support the planned approach. Posts a `finding`. Test agent reads it and adjusts test expectations. PM agent factors it into the next sprint's scope. All without direct communication — just the blackboard.

---

## Why Files, Not Messages

The blackboard is files, not a message bus or database. This is intentional:

- **Git-tracked.** Every board state is in version history.
- **Human-readable.** Open any file in any text editor.
- **Tool-agnostic.** Any process that can write a file can post to the blackboard.
- **Zero infrastructure.** No server, no database, no message queue. Just files.
- **Survives everything.** Terminal crashes, network outages, session timeouts.

---

## Comparison to Other Patterns

| Pattern | Persistence | Visibility | Pillar 1 Coverage |
|---------|-------------|------------|-------------------|
| **Direct messaging** | None | Only participants | No shared state |
| **Event bus** | Implementation-dependent | Requires monitoring | Shared state, no control shell |
| **Shared database** | Yes | Requires query tools | Shared state, no typed signals |
| **Blackboard (files)** | Yes (git-tracked) | Human-readable | Full: state + control + signals |

---

## Further Reading

- Erman, L.D. et al. (1980). "The Hearsay-II Speech-Understanding System." *Computing Surveys*.
- Hayes-Roth, B. (1985). "A Blackboard Architecture for Control." *Artificial Intelligence*.
- Nii, H.P. (1986). "Blackboard Systems." *AI Magazine*.
- Tulving, E. (1983). *Elements of Episodic Memory*. Oxford University Press.
- FIPA (1993). Agent Communication Language specifications.
- Viswanathan, B. (2026). *The Engineering Handbook for Multiagent Systems*. Chapters 1, 4, 5, 8.

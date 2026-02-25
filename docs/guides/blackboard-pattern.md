# The Blackboard Pattern

> A coordination architecture for AI-assisted development, adapted from 1980s multi-agent systems research.

---

## Origin

The blackboard architecture was introduced in **Hearsay-II** (Erman et al., 1980) for speech recognition and formalized in **BB1** (Hayes-Roth, 1985) as a general problem-solving framework. The core idea: multiple independent **knowledge sources** collaborate by reading from and writing to a shared **blackboard** data structure, coordinated by a **control mechanism** that decides what runs next.

It was the dominant multi-agent coordination pattern for a decade — then largely forgotten as the field moved to direct message-passing architectures. We believe it's the right pattern for AI-assisted software development.

---

## Why It Fits AI Coding

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

In kapi-sprints, these are Claude Code sessions running `/dev`, `/prd`, `/test`, or `/post`:

```
Terminal 1:  /dev v1    → reads board.md for blockers → implements T03 → posts "done" to board.md
Terminal 2:  /test v1   → reads tasks.md for progress → runs build → posts "pass" to board.md  
Terminal 3:  /prd v2    → reads backlog.md → brainstorms with PM → writes prd.md + tasks.md
```

They never communicate directly. They communicate through the blackboard.

### 2. Blackboard (Markdown Files)

The shared data structure. In kapi-sprints, it's a set of markdown files in `docs/operations/`:

```
docs/operations/
├── blackboard/
│   ├── board.md         ← The live blackboard
│   └── entries/         ← One file per post (decision, finding, blocker, milestone)
├── sprints/v1/
│   ├── tasks.md         ← Task progress
│   └── prd.md           ← Sprint plan
├── backlog.md           ← Queue of future work
└── status.md            ← What's built, what's missing
```

**`board.md`** is the central coordination file. It has structured sections:

```markdown
## Active Blockers
- API rate limit blocking T04 — need to pick a provider before proceeding

## Open Decisions  
- Should we use Postgres or SQLite? → pick before T04 starts

## Findings
- localStorage is XSS-vulnerable — switch to httpOnly cookies before prod

## Agent Status
- **Dev** (v1) — active feb 24, working on T03
- **PM** (v2) — idle, PRD locked

## Activity
- **Dev** (v1) — T01-T03 done, Block A complete — feb 24 12pm
```

Every post also creates an **entry file** in `entries/` with YAML frontmatter:

```markdown
---
type: finding
role: Dev
timestamp: feb 24 12pm
title: localStorage is XSS-vulnerable
---

# Finding: localStorage is XSS-vulnerable

## Detail
The initial implementation stores JWT in localStorage...

## Recommendation
Switch to httpOnly cookies before any production deploy.
```

### 3. Control (Skills + Human)

In classical blackboard systems, a control module decides which knowledge source runs next. In kapi-sprints, control is split:

- **Skills** define what each agent does and when it posts to the blackboard
- **Humans** make decisions, resolve blockers, and steer the sprint

The `/post` skill is the primary control interface. Both humans and agents use it:

```
/post blocker "API rate limit blocking T04"
/post decision "Using Postgres for prod parity"
/post finding "XSS risk in localStorage"
/post available "Dev ready for v1 T03"
```

The human reads the dashboard, sees blockers and decisions, resolves them, and the agents proceed. No direct communication needed.

---

## Why Files, Not Messages

The blackboard is files, not a message bus or database. This is intentional:

- **Git-tracked.** Every board state is in version history. You can diff blackboard changes across commits.
- **Human-readable.** Open `board.md` in any text editor. No special tooling required.
- **Tool-agnostic.** Any process that can write a file can post to the blackboard. Claude Code, shell scripts, CI/CD pipelines.
- **Zero infrastructure.** No server, no database, no message queue. Just files.
- **Survives everything.** Terminal crashes, network outages, session timeouts — the files are still there.

---

## The Dashboard

The kapi-sprints dashboard watches these files and renders them as a command center:

- **Overview** — blockers, decisions, findings, sprint velocity, QA quality
- **Build tab** — task blocks with live checkbox status
- **Stream** — chronological feed of all entries
- **Team sidebar** — which agents are active, idle, or stuck

The dashboard is read-only from the blackboard's perspective. It never writes. It only renders what the files contain.

---

## Comparison to Other Patterns

| Pattern | How agents communicate | Persistence | Visibility |
|---------|----------------------|-------------|------------|
| **Direct messaging** | Agent A sends to Agent B | None (chat disappears) | Only participants see it |
| **Event bus** | Publish/subscribe | Depends on implementation | Requires monitoring tooling |
| **Shared database** | Read/write to tables | Yes | Requires query tooling |
| **Blackboard (files)** | Read/write to shared files | Yes (git-tracked) | Human-readable, any editor |

The file-based blackboard trades real-time performance for maximum simplicity, auditability, and resilience.

---

## Getting Started

If you're using kapi-sprints:

1. **Read `board.md`** at the start of every session to see what's happening
2. **Use `/post`** to write findings, decisions, and blockers — never edit `board.md` directly
3. **Check the dashboard** for the visual overview
4. **Read entries** for full context on any decision or finding

If you're adapting the pattern for your own tools:

1. Define your blackboard sections (what categories of information do agents share?)
2. Define your entry format (what metadata does each post carry?)
3. Build a dashboard that watches the files (chokidar + your UI framework of choice)
4. Enforce the rule: all coordination goes through the blackboard, not direct agent-to-agent communication

---

## Further Reading

- Erman, L.D. et al. (1980). "The Hearsay-II Speech-Understanding System: Integrating Knowledge to Resolve Uncertainty." *Computing Surveys*.
- Hayes-Roth, B. (1985). "A Blackboard Architecture for Control." *Artificial Intelligence*.
- [kapi-sprints source code](https://github.com/kapihq/kapi-sprints) — a working implementation of this pattern

---

*This guide is part of [Kapi Sprints](https://github.com/kapihq/kapi-sprints), an open-source sprint workflow system for Claude Code teams. Built by [Kapi AI](https://getkapi.com).*

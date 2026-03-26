# Backwards Build

> Implements **Pillar 16** (Frameworks & Engineering) — the methodology that prevents demo-driven development.
>
> Start from done. Work backwards to the first action. Every intermediate state is deployable.

---

## The Anti-Pattern: Vibe Coding

Most AI-assisted development looks like this:

```
"Build me a task manager"
  → AI generates 2,000 lines of code
    → Something works, something doesn't
      → "Fix the bug in the auth"
        → AI generates 500 more lines
          → New bug introduced
            → Repeat until frustrated or shipped
```

No specification. No quality criteria. No audit trail. No way to know if you're 20% done or 80% done. Forrester predicts 75% of companies will face severe technical debt crises by 2026 from exactly this pattern.

We call this **vibe coding** — prompt and pray.

---

## The Alternative: Backwards Build

Backwards Build reverses the process. Instead of starting with code, you start with the definition of done and work backwards:

```
What does done look like?
  → Define acceptance criteria
    → What tasks produce those criteria?
      → What's the smallest first task that's independently deployable?
        → Build that. Ship it. Move to the next.
```

Every task produces a working state. Every working state is demoable. You can stop after any task and have something real.

---

## The Three Foundations

Before any sprint, you need three documents. Without them, you're building a solution to an undefined problem.

### 1. Vision & Mission

**Why does this exist?**

Not a business plan. Four short sections:

- **Vision** — one sentence describing the world you're creating
- **Mission** — one sentence describing how you get there
- **Why Now** — what changed that makes this possible or urgent
- **Why You** — what unfair advantage you have

If you can't fill these out in 10 minutes, you're not ready to build.

### 2. Market & Users

**Who is this for and what have they tried?**

- **Ideal Customer Profile** — specific role, company size, pain trigger
- **Current Alternatives** — what they use today and why it fails
- **Willingness to Pay** — evidence or hypothesis
- **Market Size** — even a rough estimate forces clarity

The most important section is **Current Alternatives**. If you can't name what people do today without your product, you don't understand the problem.

### 3. Product Spec

**What exactly are you building?**

- **Core Flows** — the 3-5 things a user does, in sequence
- **MVP Scope** — what ships first
- **Out of Scope** — what you're saying no to (this is as important as what you're building)
- **Success Criteria** — how you know it's working

Out of Scope prevents scope creep. Write it before you write the first line of code.

---

## The Sprint Loop

With foundations in place, every sprint follows this loop:

```
/preflight  →  /prd  →  /dev  →  /test  →  /review
    ↑                                          |
    └──────────── next sprint ─────────────────┘
```

### 1. Preflight

Check if you're ready to sprint: clean git state, build passes, no open blockers, tasks defined. If preflight fails, fix the issues before starting.

### 2. PRD (Plan)

Define the sprint goal. Read the backlog, read the blackboard, brainstorm with the PM (human or agent), push back on scope, write `prd.md` + `tasks.md`.

The PRD is a contract: "This is what done looks like. These are the acceptance criteria. This is what's explicitly out of scope."

### 3. Dev (Build)

Pick the first unchecked task. Write the failing test. Implement until it passes. Mark done. Commit. Pick the next task. Repeat.

Every task produces a deployable state. No task leaves the codebase broken.

### 4. Test (QA)

Run the full QA gate: build, type check, lint. If anything fails, stop and fix before proceeding. This gate protects the main branch.

### 5. Review

Write the sprint narrative: what was built, how long each task took, what was learned, what's next. This becomes institutional memory that survives team changes.

---

## Worked Example: kapi-sprints v1

kapi-sprints used Backwards Build to build itself. Here's what that looked like:

**Foundation:** The vision (sprint dashboard for Claude Code teams), market (developers using AI coding tools with no coordination), and spec (blackboard + skills + dashboard) were defined before any sprint.

**Sprint v1 goal:** "Ship kapi-sprints as a self-demonstrating OSS tool."

**Working backwards from done:**
- Done = a stranger clones the repo and understands the product in 5 minutes
- That requires = coherent demo data + README + guides
- That requires = real sprint artifacts, not placeholders
- That requires = working skills that produce real artifacts
- First task = build `/prd` skill

**The 11 tasks, in order:**

| Task | What it produced | Deployable after? |
|------|-----------------|-------------------|
| T01: `/prd` skill | Sprint planner that writes prd.md + tasks.md | ✅ Yes — can plan sprints |
| T02: `/dev` skill | Task runner with agent init | ✅ Yes — can execute tasks |
| T03: `/test` skill | QA gate | ✅ Yes — can validate builds |
| T04: `/post` skill | Blackboard writes from terminal | ✅ Yes — agents visible on dashboard |
| T05: Replace demo data | v1 describes itself | ✅ Yes — dashboard shows real sprint |
| T06: Update status/scorecard | Accurate product state | ✅ Yes — no stale data |
| T07: README | Story-driven marketing | ✅ Yes — stranger can understand product |
| T08: NOTICE | Apache 2.0 compliance | ✅ Yes — legally distributable |
| T09: Blackboard guide | Educational content | ✅ Yes — standalone shareable |
| T10: Backwards Build guide | Educational content | ✅ Yes — standalone shareable |
| T11: Fix config | Correct branding | ✅ Yes — dashboard says "Kapi Sprints" |

Every row is independently deployable. You could stop after T04 and have a working product. You could stop after T07 and have a distributable product. The later tasks add polish and content, but nothing breaks if they're not done.

That's Backwards Build.

---

## Key Principles

1. **Define done before starting.** Write acceptance criteria. Write out of scope. Write success criteria.

2. **Every task is deployable.** If a task leaves the codebase in a broken state, the task is too big. Split it.

3. **Specification is the source code.** The PRD and tasks.md are as important as the implementation. They're the contract everyone works against.

4. **Out of Scope prevents scope creep.** Explicitly writing what you're NOT building is the most powerful planning tool. It forces hard conversations early.

5. **The review is institutional memory.** Sprint narratives survive team changes, context switches, and time. Six months from now, you can read the review and understand exactly what happened.

---

## Contrast: Vibe Coding vs Backwards Build

| | Vibe Coding | Backwards Build |
|---|---|---|
| **Starts with** | "Build me a thing" | "Here's what done looks like" |
| **Planning** | None | PRD + tasks + acceptance criteria |
| **Progress visibility** | "I think it's almost done" | 7/11 tasks, 64% complete |
| **Quality** | "It works on my machine" | Preflight + test gate + code review |
| **Audit trail** | Chat messages that disappear | board.md, entries/, review.md |
| **Coordination** | "Don't touch that file" | Blackboard + agent status |
| **After 6 months** | "What did we build and why?" | Read the sprint reviews |

---

## Getting Started

If you're using kapi-sprints, Backwards Build is built into the workflow:

1. **`/get-started`** — Foundation Gate checks for vision, market, and spec docs
2. **`/prd v1`** — Plans the sprint with acceptance criteria and out-of-scope
3. **`/dev v1`** — Executes tasks in order, each independently deployable
4. **`/test v1`** — QA gate before pushing
5. **Review** — Sprint narrative captures what was built and why

If you're adapting the methodology for your own workflow, start with one rule: **define done before you write the first line of code.** Everything else follows from that.

---

*Sources: Wooldridge (2002), GAIA methodology, Prometheus methodology. Full treatment in "The Engineering Handbook for Multiagent Systems" (Viswanathan, 2026), Chapter 16.*

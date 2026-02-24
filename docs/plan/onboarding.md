# Onboarding: Backwards Build Flow

> `/sprint init` and `/sprint spec` — the Kapi pitch in disguise.

---

## Core Insight

The plugin IS the backwards build experience:
- `/sprint spec` teaches PMs to specify before building
- `/scorecard` teaches them to define quality layers
- `/checkpoint` teaches them the blackboard pattern

By the time they look at Kapi, they already think this way.

---

## First-Time Experience

```
User installs plugin → runs /sprint init
         ↓
"Where are your specs?"
         ↓
    ┌─────────────────────────────────────┐
    │  Option A: "I have a PRD/spec"      │ → Point to file(s)
    │  Option B: "Start from scratch"     │ → /sprint spec (backwards build)
    └─────────────────────────────────────┘
         ↓
    Plugin reads spec → generates:
    - kapi-sprints.config.md
    - docs/operations/sprints/v1/
    - docs/operations/blackboard/
    - scorecard layers from spec
         ↓
    "Run /preflight v1 when ready"
```

---

## Option A: "I have a PRD/spec"

User points to an existing file:

```
> /sprint init

Where are your specs?

  A) I have a PRD/spec file    ← user picks this
  B) Start from scratch

Point me to it: docs/product-spec.md

Reading... Found:
  - 4 major features
  - API + frontend + auth concerns
  - No explicit quality layers

I'll set up your sprint structure. What quality layers matter for this project?

  Suggested based on your spec:
  1. API — routes, validation, error handling
  2. Auth — session management, permissions
  3. Frontend — components, responsiveness
  4. Tests — coverage, integration

  [Accept] or customize?

Generating...
  ✓ kapi-sprints.config.md
  ✓ docs/operations/sprints/v1/
  ✓ docs/operations/blackboard/

Run /preflight v1 when ready.
💡 Dashboard: npx kapi-sprints dashboard (in another terminal)
```

---

## Option B: "Start from scratch" (`/sprint spec`)

The backwards build flow — conversational PRD generation:

```
> /sprint spec

What are you building?
> A task management app with AI prioritization

Tell me more about the users and core flows:
> PMs who need to triage backlogs. The AI should suggest priority
> based on dependencies, deadlines, and team capacity.

Here's what I understand:

  ## Task AI Prioritizer
  
  **Users:** Product Managers
  **Core flows:**
  1. Import backlog (Jira, CSV, manual)
  2. AI analyzes dependencies + deadlines
  3. Suggested priority ranking
  4. PM accepts/rejects/adjusts
  5. Export back to source
  
  [Looks good] or [Revise]?

What quality layers matter? (What should /scorecard audit?)
> API reliability, the AI scoring accuracy, and clean UI

Setting up:
  1. API — routes, validation, error handling
  2. AI Scoring — accuracy, explainability, edge cases
  3. UI — components, accessibility, responsiveness
  4. Data — models, migrations, import/export
  5. Tests — coverage, e2e, integration

What coding conventions matter?
> TypeScript strict, Tailwind, Vitest

Generating...
  ✓ kapi-sprints.config.md
  ✓ docs/operations/sprints/v1/
  ✓ docs/operations/blackboard/
  ✓ docs/spec.md (your PRD)
  ✓ scorecard layers configured

Run /preflight v1 to validate readiness.
Run /prd v1 to plan your first sprint.
💡 Dashboard: npx kapi-sprints dashboard (in another terminal)
```

---

## Generated Config

`kapi-sprints.config.md`:

```markdown
# Project: Task AI Prioritizer

## Spec
docs/spec.md

## Layers (what /scorecard audits)
1. API — routes, validation, error handling
2. AI Scoring — accuracy, explainability, edge cases
3. UI — components, accessibility, responsiveness
4. Data — models, migrations, import/export
5. Tests — coverage, e2e, integration

## Conventions
- TypeScript strict mode
- Tailwind for styling
- Vitest for unit tests

## Sprint Directory
docs/operations/sprints

## Blackboard Directory
docs/operations/blackboard
```

---

## Why This Is Strategic

| What user experiences | What it teaches | Kapi equivalent |
|----------------------|-----------------|-----------------|
| `/sprint spec` | Specify before building | Blueprint configuration |
| `/scorecard` | Define quality layers upfront | Eval framework (30+ criteria) |
| `/checkpoint` | Blackboard coordination | Agent state management |
| `/resume` | Context recovery across sessions | Cross-session memory (Mem0) |
| `/preflight` | Readiness gates | Compliance checks |
| Config-driven layers | Everything is configurable | Blueprint manifest |

**The user doesn't realize they're learning Kapi's methodology.** They're just running a sprint tool. But when they visit getkapi.com and see "55 blueprints with built-in evals and HITL gates," they think: *"Oh, that's like my scorecard layers and checkpoints, but for AI agents."*

---

*See [plugin.md](plugin.md) for skill details, [content-strategy.md](content-strategy.md) for how we tell this story.*

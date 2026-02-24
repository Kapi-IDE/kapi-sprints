# Onboarding: The Foundation Gate

> `/sprint init` — you can't sprint without knowing why.

---

## Core Insight

The old flow was too permissive — "point me to a file" let people skip the thinking.
The new flow mandates that foundation docs exist (or get created) before any sprint can start.

**The pitch this teaches:** *"You don't start by coding. You don't even start by speccing features. You start by knowing why."*

---

## The Foundation Gate

```
/sprint init
       ↓
  "Let me check your project foundation..."
       ↓
  Scans for 3 required docs:

  ┌──────────────────────────────────────────────┐
  │  FOUNDATION CHECK                             │
  │                                               │
  │  1. Vision & Mission    ❌ Not found          │
  │     Why does this exist? Who is it for?       │
  │                                               │
  │  2. Market & Users      ❌ Not found          │
  │     Who pays? What pain? What alternatives?   │
  │                                               │
  │  3. Product Spec        ❌ Not found          │
  │     What are you building? Core flows?        │
  │                                               │
  │  You need all 3 before your first sprint.     │
  │  I'll help you write them — takes ~15 min.    │
  │                                               │
  │  [Start with Vision]                          │
  └──────────────────────────────────────────────┘
```

If docs exist, validate them for completeness:

```
  ┌──────────────────────────────────────────────┐
  │  FOUNDATION CHECK                             │
  │                                               │
  │  1. Vision & Mission    ✅ docs/foundation/vision.md   │
  │  2. Market & Users      ⚠️  Thin — no ICP     │
  │  3. Product Spec        ✅ docs/foundation/spec.md     │
  │                                               │
  │  Market doc needs an Ideal Customer Profile.  │
  │  Want me to help flesh it out?                │
  │                                               │
  │  [Fix Market Doc]  [Skip — sprint anyway]     │
  └──────────────────────────────────────────────┘
```

---

## The Three Foundation Docs

### 1. Vision & Mission (`docs/foundation/vision.md`)

Claude asks:
```
"What problem does this solve that nobody else is solving well?"
"If this succeeds wildly in 3 years, what does the world look like?"
"Who specifically suffers without this?"
```

Generates:
```markdown
# Vision & Mission

## Vision
[One sentence: the world you're creating]

## Mission
[One sentence: how you get there]

## Why Now
[What changed that makes this possible/urgent]

## Why You
[What unfair advantage do you have]
```

---

### 2. Market & Users (`docs/foundation/market.md`)

Claude asks:
```
"Who is the primary buyer? Describe them specifically."
"What do they do today without your product?"
"What have they tried that failed? Why did it fail?"
"How much do they pay for the current bad solution?"
```

Generates:
```markdown
# Market & Users

## Ideal Customer Profile
[Specific: role, company size, pain trigger]

## Current Alternatives
| Alternative | Why it fails |
|------------|-------------|
| ...        | ...         |

## Willingness to Pay
[Evidence or hypothesis]

## Market Size
[TAM/SAM/SOM or just "enough to matter because..."]
```

---

### 3. Product Spec (`docs/foundation/spec.md`)

Claude asks:
```
"What are the 3-5 core user flows?"
"What's the simplest version that delivers value?"
"What are you explicitly NOT building?"
```

Generates:
```markdown
# Product Spec

## Core Flows
1. [User does X → gets Y]
2. ...

## MVP Scope
[What ships first]

## Out of Scope
[What you're saying no to — this is as important]

## Success Criteria
[How you know it's working]
```

---

## Full Revised Flow

```
/sprint init
       ↓
  Foundation check (scan for 3 docs)
       ↓
  Missing? → Claude generates via conversation (~15 min)
  Thin?    → Claude suggests what to flesh out
  All ✅   → Proceed
       ↓
  "What quality layers matter for this project?"
  (reads foundation docs to suggest layers)
       ↓
  Generates:
    ✓ kapi-sprints.config.md (layers, conventions, paths)
    ✓ docs/operations/sprints/v1/
    ✓ docs/operations/blackboard/
       ↓
  "Run /preflight v1 when ready"
```

**`/sprint spec` is gone as a separate command.** Foundation doc creation is now baked into `/sprint init`. You can't skip it. You can't go straight to sprinting without answering "why does this exist?"

---

## Validation Rules

| Doc | Required sections | Warning if missing |
|-----|------------------|--------------------|
| `vision.md` | Vision, Mission | Why Now, Why You |
| `market.md` | ICP, Alternatives | Willingness to Pay, Market Size |
| `spec.md` | Core Flows, MVP Scope | Out of Scope, Success Criteria |

A doc is **thin** if it has the required sections but they're < 50 words each.
A doc is **missing** if the file doesn't exist.

---

## Why This Is Strategic

| What user experiences | What it teaches | Kapi equivalent |
|----------------------|-----------------|-----------------|
| Foundation Gate | Specify before building | Blueprint configuration |
| Vision doc | Articulate the why | Product Builder tool |
| Market doc | Know your buyer | Enterprise Atlas (10 departments) |
| Spec doc | Define core flows | Blueprint manifest + UI patterns |
| `/scorecard` | Define quality layers | Eval framework (18 criteria) |
| `/checkpoint` | Blackboard coordination | Agent state management |

**The user doesn't realize they're learning Kapi's methodology.** They're just setting up a sprint tool. But when they visit getkapi.com and see "182 blueprints with built-in evals and HITL gates," they think: *"Oh, that's like my foundation gate and scorecard layers, but for AI agents."*

---

*See [plugin.md](plugin.md) for skill details, [content-strategy.md](content-strategy.md) for how we tell this story.*

# MAS Workshop: Content Audit & Key Findings

**Date**: 2026-03-21
**Scope**: Multi-Agent Systems: The 16 Pillars workshop content across the class-platform

---

## 1. What Exists Today

### Source Material (this directory)

| File | Size | Description |
|------|------|-------------|
| `book.pdf` | 6.4 MB | *The Engineering Handbook for Multiagent Systems* (Dr. Balaji Viswanathan, 2026) |
| `prep-material.md` | 29 KB | Pre-workshop reading guide covering all 16 pillars + 5 Laws + Rosetta Stone |

### Path Definition

**File**: `content/paths/multiagent-systems.json`
**Status**: Complete and well-structured

- 14 modules across Day 0 (pre-work) + Day 1 + Day 2 + Capstone
- Level: Advanced | Duration: 2 days (16 hours) | Color: Cyan
- Prerequisites defined (LLM API calls, prompt engineering, agentic AI)
- Optional prereqs: Claude Code or Codex experience
- 7 learning outcomes specified
- `capstoneRequired: true`, `certificateOnCompletion: true`

### Module Schedule (from path JSON)

#### Day 0 -- Pre-Work (2 hours)

| # | Module ID | Title | Duration |
|---|-----------|-------|----------|
| 1 | `mas-why-agents-fail` | Why Your Multi-Agent System Is Failing | 1 hr |
| 2 | `mas-16-pillar-framework` | The 16-Pillar Framework & Five Laws | 1 hr |

#### Day 1 -- Coordination Foundations (7 hours)

| # | Module ID | Title | Duration | Pillars Covered |
|---|-----------|-------|----------|-----------------|
| 3 | `mas-shared-state` | Shared State & Blackboard Coordination | 75 min | P1 |
| 4 | `mas-task-allocation` | Task Allocation & Planning | 75 min | P2, P4 |
| 5 | `mas-communication-protocols` | Agent Communication Protocols | 60 min | P5 |
| 6 | `mas-team-design` | Team Design & Organization | 75 min | P3 |
| 7 | `mas-negotiation` | Negotiation & Conflict Resolution | 60 min | P6 |
| 8 | `mas-agent-mind` | Architecture, Memory & Learning | 75 min | P7, P8, P9 |

#### Day 2 -- Production & Governance (7 hours)

| # | Module ID | Title | Duration | Pillars Covered |
|---|-----------|-------|----------|-----------------|
| 9 | `mas-hitl-design` | Human-in-the-Loop Design | 75 min | P10 |
| 10 | `mas-trust-reputation` | Trust & Reputation Systems | 75 min | P12 |
| 11 | `mas-embodied-simulation` | Embodied Agents & Multi-Agent Simulation | 60 min | P11, P14 |
| 12 | `mas-governance-safety` | Governance & Safety at Scale | 60 min | P13 |
| 13 | `mas-evaluation-frameworks` | Evaluation, Debugging & Framework Selection | 75 min | P15, P16 |
| 14 | `mas-capstone` | Capstone: Build Your MAS Architecture | 60 min | All 16 |

### Prep Material Coverage

The `prep-material.md` maps to the 16 pillars as follows:

| Pillar | Prep Material Section | Depth |
|--------|-----------------------|-------|
| P1: Shared State & Blackboard | Section with ASCII diagram, 3 components explained | Good |
| P2: Task Allocation / Contract Net | Micromanager vs Free-for-all vs Contract Net | Good |
| P3: Team Design & Organization | 5 topologies (Supervisor, Pipeline, Swarm, Debate, Hybrid) | Good |
| P4: Planning & Result Sharing | Task sharing vs Result sharing distinction | Good |
| P5: Agent Communication | KQML/FIPA, typed vs untyped messages, 22 performatives | Good |
| P6: Negotiation & Conflict Resolution | 3 failure modes, formal protocols, Dung's frameworks | Good |
| P7: Agent Architecture (BDI) | Beliefs/Desires/Intentions, 3 commitment strategies | Good |
| P8: Memory & Context | Circulation system model, episodic vs semantic, transactive | Good |
| P9: Learning & Adaptation | Stigmergic learning, credit assignment | Good |
| P10: Human-in-the-Loop | L0-L4 autonomy spectrum, Bainbridge's Irony, cognitive forcing | Good |
| P11: Embodied & Physical Agents | Irreversibility principle, robotics-grade coordination | Good |
| P12: Trust & Reputation | Castelfranchi 5-component model, 3 trust types | Good |
| P13: Governance & Norms | Norm lifecycle, Ostrom's 8 principles | Good |
| P14: Simulation & Testing | Smallville lessons, ODD protocol, emergent behaviors | Good |
| P15: Evaluation & Failure Analysis | 3 evaluation levels, beyond benchmarks | Good |
| P16: Frameworks & Engineering | AOSE methodology, framework decision guide | Good |

The prep material also covers:
- **Preamble**: 6 agent properties (beyond Wooldridge & Jennings' original 4)
- **Why Multi-Agent**: 9 reasons in 5 groups (Scale, Org Fit, Oversight, Economics, Cross-Org)
- **5 Laws of Agent Coordination**: Superlinear cost, shared state > message passing, quality gates, topology matching, HITL as feature
- **Rosetta Stone**: Classical-to-modern concept mapping table

---

## 2. What Is Missing

### Critical Gaps

| Asset | Status | Impact |
|-------|--------|--------|
| **Module content JSONs** (`content/modules/mas-*.json`) | Not created | No lesson content exists for any of the 14 modules |
| **Explainer components** (`content/explainers/index.json`) | No MAS entries | All 14 modules reference explainers (e.g., `mas-shared-state`) that don't exist |
| **Question banks** (`content/questions/mas-*.json`) | Not created | No assessment questions for MAS modules |
| **Capstone guide** (`content/capstone-guides/`) | Not created | No MAS-specific capstone guide (only CrewAI, LangGraph, Strands guides exist) |

### Detailed Explainer Gap

Each module in `multiagent-systems.json` references an explainer in its `content.explainers` array. None of these exist in the explainers index:

```
mas-why-agents-fail
mas-16-pillar-framework
mas-shared-state
mas-task-allocation
mas-communication-protocols
mas-team-design
mas-negotiation
mas-agent-mind
mas-hitl-design
mas-trust-reputation
mas-embodied-simulation
mas-governance-safety
mas-evaluation-frameworks
mas-capstone
```

For reference, existing explainers for other paths follow this pattern in `content/explainers/index.json`:
- Each has: `title`, `subtitle`, `description`, `component` (React component name), `type` ("simple" | "interactive"), `tags`, `courses`, `duration`, `icon`
- 38 explainers currently exist, covering Essentials, Agentic, and PM paths

### Module Content Gap

Existing module content files (in `content/modules/`) only serve the **Agentic AI** path:

```
foundations-agentic-systems.json
reasoning-foundations.json
first-agentic-apps.json
agentic-rag.json
deploying-production.json
new-research-agentic.json
low-hanging-fruits.json
key-frameworks.json
multiagent-patterns.json
```

No `mas-*.json` module content files exist. These would contain the full markdown lesson content, topics, difficulty, prerequisites, etc.

### Other Notable Gaps

- **No MAS entries in questions/index.ts** -- The question loader maps paths to question banks; no MAS mapping exists
- **No MAS mindmap** in `content/mindmaps/` -- There are mindmaps for `agentic-ai`, `llm`, and `usecases`, but none for MAS-specific concepts
- **No syllabus HTML/PDF** -- `public/syllabus/mas-16-pillars-syllabus.html/.pdf` may or may not exist (other paths have these)
- **No notebook/lab content** -- All module `content.notebook` fields are `null`

---

## 3. Pillar-to-Module Mapping

How the 16 pillars from the book/prep-material map to the 14 workshop modules:

| Pillar | Book Chapter | Workshop Module | Notes |
|--------|-------------|-----------------|-------|
| P1: Shared State & Blackboard | Ch 1 | `mas-shared-state` (Day 1, S1) | Dedicated session |
| P2: Task Allocation / Contract Net | Ch 2 | `mas-task-allocation` (Day 1, S2) | Combined with P4 |
| P3: Team Design | Ch 3 | `mas-team-design` (Day 1, S4) | Dedicated session |
| P4: Planning & Result Sharing | Ch 4 | `mas-task-allocation` (Day 1, S2) | Combined with P2 |
| P5: Communication | Ch 5 | `mas-communication-protocols` (Day 1, S3) | Dedicated session |
| P6: Negotiation | Ch 6 | `mas-negotiation` (Day 1, S5) | Dedicated session |
| P7: Agent Architecture (BDI) | Ch 7 | `mas-agent-mind` (Day 1, S6) | Combined with P8, P9 |
| P8: Memory & Context | Ch 8 | `mas-agent-mind` (Day 1, S6) | Combined with P7, P9 |
| P9: Learning & Adaptation | Ch 9 | `mas-agent-mind` (Day 1, S6) | Combined with P7, P8 |
| P10: Human-in-the-Loop | Ch 10 | `mas-hitl-design` (Day 2, S1) | Dedicated session |
| P11: Embodied Agents | Ch 11 | `mas-embodied-simulation` (Day 2, S3) | Combined with P14 |
| P12: Trust & Reputation | Ch 12 | `mas-trust-reputation` (Day 2, S2) | Dedicated session |
| P13: Governance & Norms | Ch 13 | `mas-governance-safety` (Day 2, S4) | Dedicated session |
| P14: Simulation & Testing | Ch 14 | `mas-embodied-simulation` (Day 2, S3) | Combined with P11 |
| P15: Evaluation | Ch 15 | `mas-evaluation-frameworks` (Day 2, S5) | Combined with P16 |
| P16: Frameworks & Engineering | Ch 16 | `mas-evaluation-frameworks` (Day 2, S5) | Combined with P15 |

**Compression pattern**: 16 pillars into 12 teaching sessions (+ 2 pre-work modules + capstone):
- P2+P4 combined (Task Allocation & Planning)
- P7+P8+P9 combined (The Agent Mind)
- P11+P14 combined (Embodied & Simulation)
- P15+P16 combined (Evaluation & Frameworks)

---

## 4. Key Themes & Pedagogical Structure

### The Core Argument

The workshop builds on a single thesis: **the LLM agent community is reinventing infrastructure that classical multi-agent systems research solved decades ago**. Each pillar traces a modern failure back to a classical solution.

### Classical-to-Modern Rosetta Stone (from prep material)

| Classical Concept | Year | Modern Equivalent | Gap |
|---|---|---|---|
| Blackboard (Nii) | 1986 | LangGraph shared state | Missing control shell |
| Contract Net (Smith) | 1980 | Agent routing/bidding | No self-assessment |
| KQML/FIPA performatives | 1993 | MCP / A2A messages | No intent layer |
| SharedPlans (Durfee) | 1999 | Multi-agent planning | No mid-execution result sharing |
| BDI (Bratman) | 1987 | System prompt + memory + tools | No commitment persistence |
| Ostrom's principles | 1990 | Governance rules | Creation-only, no enforcement |
| Beta Reputation (Josang) | 2002 | Trust scoring | Binary trust (grant all / refuse all) |
| ODD Protocol (Grimm) | 2006 | Agent simulation spec | No standard exists |

### Recurring Failure Patterns

The prep material identifies these recurring anti-patterns:

1. **The Coordination Crisis**: Speed multiplies both value and cost of failures -- agents execute 10-20x faster than humans, so bad assumptions propagate before anyone notices
2. **Context Hygiene Illusion**: Bigger context windows don't fix attention degradation
3. **Bainbridge's Irony**: More reliable automation = less vigilant human oversight = more catastrophic edge-case failures
4. **Demo-Driven Development**: Systems that demo well but break in production due to no methodology
5. **Output-Correct / Coordination-Broken**: Final answer looks good but internal coordination is fragile and non-transferable

### 5 Laws of Agent Coordination

| # | Law | Violation Consequence |
|---|-----|----------------------|
| 1 | Coordination cost grows superlinearly with agent count | Adding agents makes system *slower* |
| 2 | Shared state beats message passing | Agents contradict each other |
| 3 | Every agent handoff needs a quality gate | Errors amplify up to 17x |
| 4 | Organization must match problem structure | Wrong topology caps performance |
| 5 | Human oversight is a feature, not a bug | Over-autonomous agents cause harm |

---

## 5. Relationship to Other Paths

### Overlap with Existing Content

| MAS Module | Overlapping Content in Other Paths |
|------------|-----------------------------------|
| `mas-hitl-design` | `human-in-the-loop-design` in Essentials (Day 3) and AI for PMs (Day 2) |
| `mas-team-design` | `multiagent-patterns` in Agentic path (Day 3) -- covers same 5 topologies |
| `mas-agent-mind` (memory) | `memory-context` in AI for PMs (Day 3) |
| `mas-communication-protocols` (MCP) | `model-context-protocol` in Essentials (Day 2) |
| `mas-governance-safety` | `ai-governance` in AI for PMs (Day 2) |

**Key difference**: MAS modules go deeper with classical research foundations and formal frameworks. The other paths cover these topics at an applied/practical level.

### Prerequisite Chain

```
AI Essentials (foundation)
    |
    +--> Agentic AI (intermediate agent concepts)
    |        |
    |        +--> MAS 16 Pillars (advanced coordination theory + practice)
    |
    +--> AI for PMs (overlapping HITL, governance, memory topics at PM level)
```

---

## 6. Content Generation Priority

Based on the gaps and the workshop structure, the recommended build order:

### Priority 1: Module Content (blocks everything else)
Create `content/modules/mas-*.json` for all 14 modules, extracting and expanding from `prep-material.md` and `book.pdf`.

### Priority 2: Explainer Components
Define the 14 explainer entries in `content/explainers/index.json` and build their React components. These are the interactive visual elements students see during each module.

### Priority 3: Question Banks
Create `content/questions/mas-*.json` with ELO-rated questions per module. Add MAS mappings to `content/questions/index.ts`.

### Priority 4: Capstone Guide
Create `content/capstone-guides/04-mas-architecture.md` with the 16-pillar diagnostic template for the capstone exercise.

### Priority 5: Assessment & Certification
If certification is offered (`certificateOnCompletion: true`), create `content/questions/mas-assessment.json` and config.

---

*This document is auto-generated from analysis of the class-platform codebase and content directory.*

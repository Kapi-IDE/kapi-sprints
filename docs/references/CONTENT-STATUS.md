# MAS Workshop - Content & Implementation Status

Last updated: 2026-03-21

---

## Source Material

| Asset | Location | Status |
|-------|----------|--------|
| Book (PDF) | `mas-content/book.pdf` | Present (6.4 MB) |
| Prep Material | `mas-content/prep-material.md` | Complete (564 lines) |
| Prep Material UI | `app/library/companions/mas-prep-material/page.tsx` | Built (interactive SVGs for agent properties hex, pillar grid, etc.) |
| Path Definition | `content/paths/multiagent-systems.json` | Complete (14 modules across Day 0 + Day 1 + Day 2) |

---

## Prep Material Breakdown (`prep-material.md`)

The prep reading covers the full 16-pillar framework from Dr. Viswanathan's engineering handbook:

| Section | Content |
|---------|---------|
| Preamble | What Is an Agent (6 properties), Why Multi-Agent (9 reasons in 5 clusters) |
| Pillar 1 | Shared State & Blackboard (Nii 1986) |
| Pillar 2 | Task Allocation & Contract Net (Smith 1980) |
| Pillar 3 | Team Design & Organization (Horling & Lesser 2004) |
| Pillar 4 | Planning & Result Sharing (Durfee 1999) |
| Pillar 5 | Agent Communication / KQML / FIPA (Finin 1993) |
| Pillar 6 | Negotiation & Conflict Resolution (Rosenschein & Zlotkin 1994) |
| Pillar 7 | Agent Architecture / BDI (Bratman 1987) |
| Pillar 8 | Memory & Context (Tulving 1983, Wegner 1987) |
| Pillar 9 | Learning & Adaptation / Stigmergic (Dorigo 1992) |
| Pillar 10 | Human-in-the-Loop (Bainbridge 1983) |
| Pillar 11 | Embodied & Physical Agents (Brooks 1991) |
| Pillar 12 | Trust & Reputation (Gambetta 1989, Josang) |
| Pillar 13 | Governance & Norms (Ostrom 1990) |
| Pillar 14 | Simulation & Testing (Epstein & Axtell 1996) |
| Pillar 15 | Evaluation & Failure Analysis (Campbell 1976) |
| Pillar 16 | Frameworks & Engineering (Wooldridge 2002) |
| Synthesis | Five Laws of Agent Coordination |
| Reference | Rosetta Stone (classical-to-modern concept mapping) |

---

## Workshop Schedule (from `multiagent-systems.json`)

**14 modules** across 3 day groups:

| Day | Session | Module ID | Title | Duration |
|-----|---------|-----------|-------|----------|
| 0 | 1 | `mas-why-agents-fail` | Why Your Multi-Agent System Is Failing | 1 hr |
| 0 | 2 | `mas-16-pillar-framework` | The 16-Pillar Framework & Five Laws | 1 hr |
| 1 | 1 | `mas-shared-state` | Shared State & Blackboard Coordination | 75 min |
| 1 | 2 | `mas-task-allocation` | Task Allocation & Planning | 75 min |
| 1 | 3 | `mas-communication-protocols` | Agent Communication Protocols | 60 min |
| 1 | 4 | `mas-team-design` | Team Design & Organization | 75 min |
| 1 | 5 | `mas-negotiation` | Negotiation & Conflict Resolution | 60 min |
| 1 | 6 | `mas-agent-mind` | The Agent Mind: Architecture, Memory & Learning | 75 min |
| 2 | 1 | `mas-hitl-design` | Human-in-the-Loop Design | 75 min |
| 2 | 2 | `mas-trust-reputation` | Trust & Reputation Systems | 75 min |
| 2 | 3 | `mas-embodied-simulation` | Embodied Agents & Multi-Agent Simulation | 60 min |
| 2 | 4 | `mas-governance-safety` | Governance & Safety at Scale | 60 min |
| 2 | 5 | `mas-evaluation-frameworks` | Evaluation, Debugging & Framework Selection | 75 min |
| 2 | 6 | `mas-capstone` | Capstone: Build Your MAS Architecture | 60 min |

All modules have `required: true`. All content slots (`notebook`, `video`, `assessment`) are currently `null`. Each module references one explainer via `content.explainers`.

---

## Explainer Components (Interactive React)

All 14 explainer components exist in `components/explainers/mas/`:

| Module ID | Explainer Component | File |
|-----------|-------------------|------|
| `mas-why-agents-fail` | WhyAgentsFailExplainer | `mas/WhyAgentsFailExplainer.tsx` |
| `mas-16-pillar-framework` | SixteenPillarFrameworkExplainer | `mas/SixteenPillarFrameworkExplainer.tsx` |
| `mas-shared-state` | SharedStateExplainer | `mas/SharedStateExplainer.tsx` |
| `mas-task-allocation` | TaskAllocationExplainer | `mas/TaskAllocationExplainer.tsx` |
| `mas-communication-protocols` | CommunicationProtocolsExplainer | `mas/CommunicationProtocolsExplainer.tsx` |
| `mas-team-design` | TeamDesignExplainer | `mas/TeamDesignExplainer.tsx` |
| `mas-negotiation` | NegotiationExplainer | `mas/NegotiationExplainer.tsx` |
| `mas-agent-mind` | AgentMindExplainer | `mas/AgentMindExplainer.tsx` |
| `mas-hitl-design` | HITLDesignExplainer | `mas/HITLDesignExplainer.tsx` |
| `mas-trust-reputation` | TrustReputationExplainer | `mas/TrustReputationExplainer.tsx` |
| `mas-embodied-simulation` | EmbodiedSimulationExplainer | `mas/EmbodiedSimulationExplainer.tsx` |
| `mas-governance-safety` | GovernanceSafetyExplainer | `mas/GovernanceSafetyExplainer.tsx` |
| `mas-evaluation-frameworks` | EvaluationFrameworksExplainer | `mas/EvaluationFrameworksExplainer.tsx` |
| `mas-capstone` | MASCapstoneExplainer | `mas/MASCapstoneExplainer.tsx` |

---

## Integration Status (Platform Wiring)

### Explainer Registry (`content/explainers/index.json`)

**NOT REGISTERED.** None of the 14 MAS explainers appear in `index.json`. The path JSON references them (e.g. `"explainers": ["mas-shared-state"]`), but the registry that the platform uses to resolve explainer IDs to component names does not contain these entries. This means the platform cannot render them for MAS module pages.

Related: there IS a `multiagent-coordination` entry in `index.json` (component: `MultiAgentCoordinationAnimation`), but this is for the essentials/practitioner path, not the MAS workshop.

### Explainer Types (`content/explainers/types.ts`)

**NOT INCLUDED.** Two gaps:
1. `CourseId` type does not include `'multiagent-systems'` -- only lists: `essentials`, `practitioner`, `agentic`, `vibe-coding`, `ai-for-pms`, `ai-for-ux`
2. `ExplainerComponentName` union does not list any MAS component names (e.g. `WhyAgentsFailExplainer`, `SharedStateExplainer`, etc.)

### Content Loader (`lib/content.ts`)

The MAS path loads correctly via `getPath('multiagent-systems')` since it reads from `content/paths/multiagent-systems.json` dynamically. No hardcoded path list issues here.

The `PATH_ORDER` array in `lib/content.ts` (line 59) controls display order -- `multiagent-systems` should be present.

### Module Content Files (`content/modules/`)

**NONE EXIST.** The `content/modules/` directory only has 9 JSON files for the `agentic` path. No `mas-*.json` module files exist. MAS module content is delivered entirely through the explainer components.

### Question Banks (`content/questions/`)

| File | MAS Relevance | Status |
|------|---------------|--------|
| `agents.json` | General agent questions (shared) | Exists |
| `pm-questions-multiagent-batch1.json` | PM-focused multi-agent questions | Exists |
| **`mas-*.json`** | **MAS-specific assessment** | **DOES NOT EXIST** |

### Related PM Content (Separate from MAS)

The PM path has its own multi-agent explainer: `components/explainers/pm/MultiAgentArchitectureExplainer.tsx`. This is a PM-audience version, separate from the engineering-depth MAS workshop components.

---

## Gaps & TODO

### P0 - Must Fix for Workshop to Function

- [ ] **Register 14 MAS explainers in `content/explainers/index.json`** -- without this, module pages cannot render explainer components
- [ ] **Add `'multiagent-systems'` to `CourseId` type** in `content/explainers/types.ts`
- [ ] **Add 14 MAS component names to `ExplainerComponentName` union** in `content/explainers/types.ts`
- [ ] **Wire explainer components into the dynamic loader** -- verify `components/explainers/` barrel file (or dynamic import map) includes all MAS components

### P1 - Needed for Assessment & Progress Tracking

- [ ] Create MAS-specific question bank (`content/questions/mas-pillars.json` or per-pillar files)
- [ ] Create MAS assessment config (linked from `content.assessment` in module entries)
- [ ] Add `multiagent-systems` to any `PATH_MODULES` mapping in question indexing

### P2 - Nice to Have for Richness

- [ ] Create standalone module JSONs in `content/modules/` for MAS modules (enables search, cross-path browsing)
- [ ] Add MAS capstone to `content/capstones.json` (currently 3: shopping, stock, research)
- [ ] Create MAS capstone guide in `content/capstone-guides/`
- [ ] Add MAS mindmap/glossary to `content/mindmaps/` (MAS-specific terms: blackboard, BDI, FIPA, etc.)
- [ ] Fill `notebook`, `video`, `assessment` slots in module entries as content becomes available
- [ ] Verify `multiagent-systems` is in `PATH_ORDER` in `lib/content.ts`

---

## File Inventory

```
mas-content/
  book.pdf                          # Workshop reference book (source material)
  prep-material.md                  # Pre-workshop reading (16 pillars overview)
  SYLLABUS.md                       # Human-readable syllabus with pillar mappings
  CONTENT-STATUS.md                 # This file

content/paths/
  multiagent-systems.json           # Path definition (14 modules)

content/modules/
  (no MAS files)                    # Only agentic path has module JSONs

content/questions/
  agents.json                       # General agent questions (shared)
  pm-questions-multiagent-batch1.json  # PM multi-agent questions
  (no MAS-specific files)

content/explainers/
  index.json                        # Registry -- MAS entries MISSING
  types.ts                          # Types -- MAS CourseId + components MISSING

components/explainers/mas/
  WhyAgentsFailExplainer.tsx        # Day 0, Session 1
  SixteenPillarFrameworkExplainer.tsx  # Day 0, Session 2
  SharedStateExplainer.tsx          # Day 1, Session 1
  TaskAllocationExplainer.tsx       # Day 1, Session 2
  CommunicationProtocolsExplainer.tsx  # Day 1, Session 3
  TeamDesignExplainer.tsx           # Day 1, Session 4
  NegotiationExplainer.tsx          # Day 1, Session 5
  AgentMindExplainer.tsx            # Day 1, Session 6
  HITLDesignExplainer.tsx           # Day 2, Session 1
  TrustReputationExplainer.tsx      # Day 2, Session 2
  EmbodiedSimulationExplainer.tsx   # Day 2, Session 3
  GovernanceSafetyExplainer.tsx     # Day 2, Session 4
  EvaluationFrameworksExplainer.tsx # Day 2, Session 5
  MASCapstoneExplainer.tsx          # Day 2, Session 6

app/library/companions/
  mas-prep-material/page.tsx        # Interactive prep material page (built)
```

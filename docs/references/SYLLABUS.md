# Multi-Agent Systems: The 16 Pillars - Syllabus

Last updated: 2026-03-21

## Workshop Overview

| Field | Value |
|-------|-------|
| **Path ID** | `multiagent-systems` |
| **Title** | Multi-Agent Systems: The 16 Pillars |
| **Source** | "The Engineering Handbook for Multiagent Systems" (Viswanathan, 2026) |
| **Duration** | 2 days (16 hours) + Day 0 pre-work (2 hours) |
| **Level** | Advanced |
| **Icon** | robot |
| **Color** | cyan |
| **Capstone Required** | Yes |
| **Certificate** | Yes |
| **Modules** | 14 total (2 pre-work + 6 Day 1 + 6 Day 2) |

## Prerequisites

**Required:**
- Comfortable making LLM API calls (OpenAI, Anthropic, or Groq)
- Proficient in prompt engineering
- Familiar with agentic AI systems (tools, memory, ReAct loops)

**Optional (strongly recommended):**
- Claude Code or Codex hands-on experience

## Learning Outcomes

1. Diagnose why multi-agent systems fail using the 16-Pillar framework
2. Design shared state and blackboard coordination to prevent agent contradictions
3. Implement task allocation strategies that assign the right agent to the right job
4. Build structured communication protocols that don't degrade across agent hops
5. Apply negotiation and conflict resolution patterns when agents disagree
6. Design human-in-the-loop workflows with progressive autonomy
7. Evaluate, debug, and select the right MAS framework for production

---

## Day 0 - Pre-Workshop (Self-Study)

### Session 1: Why Your Multi-Agent System Is Failing
- **Module ID**: `mas-why-agents-fail`
- **Duration**: 1 hour
- **Subtitle**: Live Demo: Watch 3 Agents Break in Real Time
- **Covers**: What makes a real agent (6 properties), why multi-agent (9 reasons), the coordination crisis
- **Prep Material**: `prep-material.md` (Preamble + overview of all 16 pillars)
- **Pillars Introduced**: All 16 (overview level)

### Session 2: The 16-Pillar Framework & Five Laws
- **Module ID**: `mas-16-pillar-framework`
- **Duration**: 1 hour
- **Subtitle**: A Diagnostic Checklist for Multi-Agent Systems
- **Covers**: Complete 16-pillar diagnostic framework, Five Laws of Agent Coordination, Rosetta Stone (classical-to-modern mapping)

---

## Day 1 - Coordination Foundations (6 sessions, ~7 hours)

### Session 1: Shared State & Blackboard Coordination
- **Module ID**: `mas-shared-state`
- **Duration**: 75 min
- **Subtitle**: Stop Agents from Contradicting Each Other
- **Pillar**: 1 (Shared State & Blackboard)
- **Key Concepts**: Blackboard pattern (shared data + knowledge sources + control shell), state sharing vs. state management
- **Classical Root**: Penny Nii, AI Magazine, 1986
- **Modern Equivalent**: LangGraph StateGraph, Redis pub/sub

### Session 2: Task Allocation & Planning
- **Module ID**: `mas-task-allocation`
- **Duration**: 75 min
- **Subtitle**: Getting the Right Agent on the Right Job
- **Pillars**: 2 (Contract Net) + 4 (Planning & Result Sharing)
- **Key Concepts**: Contract Net Protocol (announce/bid/award), micromanager vs. free-for-all failure modes, result sharing vs. task sharing
- **Classical Roots**: Reid G. Smith (1980), Edmund Durfee (1999)
- **Modern Equivalent**: LangGraph subgraph routing, CrewAI task delegation

### Session 3: Agent Communication Protocols
- **Module ID**: `mas-communication-protocols`
- **Duration**: 60 min
- **Subtitle**: Structured Messages That Don't Degrade
- **Pillar**: 5 (Agent Communication)
- **Key Concepts**: KQML/FIPA typed communicative acts (22 performatives), untyped vs. typed messages, intent layer
- **Classical Root**: Finin et al. (KQML, 1993), FIPA Performatives
- **Modern Equivalent**: MCP, A2A, ACP (all missing the intent layer)

### Session 4: Team Design & Organization
- **Module ID**: `mas-team-design`
- **Duration**: 75 min
- **Subtitle**: Choosing the Right Agent Architecture
- **Pillar**: 3 (Team Design)
- **Key Concepts**: 5 canonical topologies (Supervisor, Pipeline, Swarm, Debate, Hybrid), task-structure test
- **Classical Root**: Horling & Lesser, Knowledge Engineering Review, 2004

### Session 5: Negotiation & Conflict Resolution
- **Module ID**: `mas-negotiation`
- **Duration**: 60 min
- **Subtitle**: What Happens When Agents Disagree
- **Pillar**: 6 (Negotiation)
- **Key Concepts**: Formal negotiation protocols, typed proposals/deadlines/commitments, Dung's argumentation frameworks (1995)
- **Classical Root**: Rosenschein & Zlotkin, Rules of Encounter, 1994

### Session 6: The Agent Mind - Architecture, Memory & Learning
- **Module ID**: `mas-agent-mind`
- **Duration**: 75 min
- **Subtitle**: Building Agents That Stay on Track and Get Smarter
- **Pillars**: 7 (BDI Architecture) + 8 (Memory & Context) + 9 (Learning & Adaptation)
- **Key Concepts**: BDI (Beliefs/Desires/Intentions), why ReAct drops the commit step, memory as circulation system (episodic vs. semantic), transactive memory, stigmergic learning, credit assignment
- **Classical Roots**: Bratman (1987), Tulving (1983), Wegner (1987), Dorigo (1992)

---

## Day 2 - Production & Governance (6 sessions, ~7 hours)

### Session 1: Human-in-the-Loop Design
- **Module ID**: `mas-hitl-design`
- **Duration**: 75 min
- **Subtitle**: Progressive Autonomy That Doesn't Bottleneck
- **Pillar**: 10 (HITL)
- **Key Concepts**: Autonomy spectrum (L0-L4), Bainbridge's Irony of Automation, dynamic routing by confidence/stakes/reversibility, cognitive forcing pattern
- **Classical Root**: Bainbridge (1983), Sheridan's autonomy spectrum

### Session 2: Trust & Reputation Systems
- **Module ID**: `mas-trust-reputation`
- **Duration**: 75 min
- **Subtitle**: When One Bad Agent Poisons the Whole System
- **Pillar**: 12 (Trust & Reputation)
- **Key Concepts**: Castelfranchi & Falcone's 5-component trust model, 3 trust types (direct, witness, certified), Beta Reputation System, graduated trust vs. binary access
- **Classical Root**: Gambetta (1989), Josang's Beta Reputation System

### Session 3: Embodied Agents & Multi-Agent Simulation
- **Module ID**: `mas-embodied-simulation`
- **Duration**: 60 min
- **Subtitle**: Physical Constraints and Predicting Emergent Behavior
- **Pillars**: 11 (Embodied Agents) + 14 (Simulation & Testing)
- **Key Concepts**: Irreversible actions need robotics-grade coordination, Stanford Smallville lessons, ODD protocol, emergent behavior prediction
- **Classical Roots**: Brooks (1991), Epstein & Axtell (1996), Schelling (1971)

### Session 4: Governance & Safety at Scale
- **Module ID**: `mas-governance-safety`
- **Duration**: 60 min
- **Subtitle**: Rules, Boundaries, and Compliance for Agent Systems
- **Pillar**: 13 (Governance & Norms)
- **Key Concepts**: Norm lifecycle (create/propagate/enforce/revise), Ostrom's 8 design principles mapped to MAS, runtime compliance monitoring
- **Classical Root**: Ostrom (1990, Nobel Prize 2009), Shoham & Tennenholtz

### Session 5: Evaluation, Debugging & Framework Selection
- **Module ID**: `mas-evaluation-frameworks`
- **Duration**: 75 min
- **Subtitle**: Shipping MAS That Don't Break in Production
- **Pillars**: 15 (Evaluation) + 16 (Frameworks & Engineering)
- **Key Concepts**: 3 evaluation levels (task/coordination/governance), framework selection (LangGraph/CrewAI/AutoGen/ADK), Agent-Oriented SE methodology (GAIA, Prometheus, Tropos)
- **Classical Root**: Campbell (1976), Wooldridge (2002)

### Session 6: Capstone - Build Your MAS Architecture
- **Module ID**: `mas-capstone`
- **Duration**: 60 min
- **Subtitle**: Apply All 16 Pillars to a Real Use Case
- **Covers**: Apply the 16-pillar diagnostic checklist to a real use case, design complete MAS architecture, present and defend choices

---

## Pillar-to-Session Mapping

| Pillar | Name | Session |
|--------|------|---------|
| 1 | Shared State & Blackboard | Day 1, Session 1 |
| 2 | Task Allocation (Contract Net) | Day 1, Session 2 |
| 3 | Team Design & Organization | Day 1, Session 4 |
| 4 | Planning & Result Sharing | Day 1, Session 2 |
| 5 | Agent Communication | Day 1, Session 3 |
| 6 | Negotiation & Conflict Resolution | Day 1, Session 5 |
| 7 | Agent Architecture (BDI) | Day 1, Session 6 |
| 8 | Memory & Context | Day 1, Session 6 |
| 9 | Learning & Adaptation | Day 1, Session 6 |
| 10 | Human-in-the-Loop | Day 2, Session 1 |
| 11 | Embodied & Physical Agents | Day 2, Session 3 |
| 12 | Trust & Reputation | Day 2, Session 2 |
| 13 | Governance & Norms | Day 2, Session 4 |
| 14 | Simulation & Testing | Day 2, Session 3 |
| 15 | Evaluation & Failure Analysis | Day 2, Session 5 |
| 16 | Frameworks & Engineering | Day 2, Session 5 |

## Five Laws of Agent Coordination (Synthesis)

| Law | Statement |
|-----|-----------|
| 1 | Coordination cost grows superlinearly with agent count |
| 2 | Shared state beats message passing |
| 3 | Every agent handoff needs a quality gate |
| 4 | Organization must match problem structure |
| 5 | Human oversight is a feature, not a bug |

---

## Prep Material → Module Cross-Reference

The prep material (`prep-material.md`) covers all 16 pillars at survey depth. Each workshop module then goes deep on specific pillars:

| Prep Material Section | Covered in Module |
|----------------------|-------------------|
| What Is an Agent (6 properties) | `mas-why-agents-fail` (Day 0) |
| Why Multi-Agent (9 reasons) | `mas-why-agents-fail` (Day 0) |
| All 16 pillars (overview) | `mas-16-pillar-framework` (Day 0) |
| Five Laws + Rosetta Stone | `mas-16-pillar-framework` (Day 0) |
| Pillar 1: Blackboard | `mas-shared-state` (Day 1, S1) |
| Pillar 2: Contract Net | `mas-task-allocation` (Day 1, S2) |
| Pillar 4: Result Sharing | `mas-task-allocation` (Day 1, S2) |
| Pillar 5: KQML/FIPA | `mas-communication-protocols` (Day 1, S3) |
| Pillar 3: Topologies | `mas-team-design` (Day 1, S4) |
| Pillar 6: Negotiation | `mas-negotiation` (Day 1, S5) |
| Pillar 7: BDI | `mas-agent-mind` (Day 1, S6) |
| Pillar 8: Memory | `mas-agent-mind` (Day 1, S6) |
| Pillar 9: Learning | `mas-agent-mind` (Day 1, S6) |
| Pillar 10: HITL | `mas-hitl-design` (Day 2, S1) |
| Pillar 12: Trust | `mas-trust-reputation` (Day 2, S2) |
| Pillar 11: Embodied | `mas-embodied-simulation` (Day 2, S3) |
| Pillar 14: Simulation | `mas-embodied-simulation` (Day 2, S3) |
| Pillar 13: Governance | `mas-governance-safety` (Day 2, S4) |
| Pillar 15: Evaluation | `mas-evaluation-frameworks` (Day 2, S5) |
| Pillar 16: Frameworks | `mas-evaluation-frameworks` (Day 2, S5) |

Note: Pillars 7+8+9 are combined into one session (Agent Mind). Pillars 2+4, 11+14, and 15+16 are also combined into single sessions.

---

## Classical References (by Session)

| Session | Key References |
|---------|---------------|
| Day 1 S1 (Blackboard) | Penny Nii, *AI Magazine*, 1986 |
| Day 1 S2 (Contract Net + Planning) | Reid G. Smith, *IEEE Trans. Computers*, 1980; Durfee, *MIT Press*, 1999 |
| Day 1 S3 (Communication) | Finin et al. (KQML), 1993; FIPA Performatives |
| Day 1 S4 (Team Design) | Horling & Lesser, *Knowledge Engineering Review*, 2004 |
| Day 1 S5 (Negotiation) | Rosenschein & Zlotkin, *Rules of Encounter*, 1994; Dung, 1995 |
| Day 1 S6 (Agent Mind) | Bratman, 1987; Tulving, 1983; Wegner, 1987; Dorigo, 1992 |
| Day 2 S1 (HITL) | Bainbridge, *Ironies of Automation*, 1983; Sheridan |
| Day 2 S2 (Trust) | Gambetta, *Trust*, 1989; Castelfranchi & Falcone; Josang |
| Day 2 S3 (Embodied + Sim) | Brooks, 1991; Epstein & Axtell, 1996; Schelling, 1971 |
| Day 2 S4 (Governance) | Ostrom, *Governing the Commons*, 1990; Shoham & Tennenholtz |
| Day 2 S5 (Eval + Frameworks) | Campbell, 1976; Wooldridge, 2002; GAIA methodology |

# Multi-Agent Systems: The 16 Pillars
## Pre-Workshop Reading Guide

*Based on "The Engineering Handbook for Multiagent Systems" by Dr. Balaji Viswanathan*

---

## Before the 16 Pillars: Two Things You Need to Know

### What Is an Agent?

Calling something an agent doesn't make it one. **Six properties do.**

The classical framework (Wooldridge & Jennings, 1995) defined four properties: autonomy, social ability, reactivity, and pro-activeness. Two more prove decisive for LLM-based systems: **persistent memory** and **self-correction**.

**The intern analogy.** You hire an intern to automate a deployment. They keep coming back for every small friction — a broken link, a wrong Python version. You tell them to use judgment. Two days later, the production database is corrupted. The intern exercised judgment without understanding scope, consequences, or what matters. LLM agents fail in exactly the same way.

**The six properties at a glance:**

```
          A1: Higher-Order Goals
         /                      \
   A6: Self-              A2: Dynamic
   Correction              Planning
        |                      |
   A5: Persistent         A3: Environment
   Memory                  Interaction
         \                      /
          A4: Autonomous
              Decisions
```

Most systems called "agents" today have one or two of these. Genuine agents have all six. The gaps you find are your highest failure-risk points.

**Key distinction — three tiers of automation:**

| Tier | Description | Example |
|------|-------------|---------|
| **Pipeline** | Fixed steps, runs identically every time | CI/CD pipeline |
| **Workflow** | Conditional branches, but paths defined at design time | Approval routing |
| **Agent** | Plans generated and revised at runtime | On-call engineer responding to a novel incident |

If your workflow is a fixed DAG drawn before you write a line of code, it's a pipeline, not an agent.

---

### Why Multi-Agent?

In early 2026, a team of sixteen Claude Code agents built a C compiler from scratch in Rust — over 100,000 lines, capable of compiling the Linux kernel. No single agent built it. The problem was too large, too specialized, and too parallelizable for any single context window.

**Nine reasons drive the move to multi-agent.** They cluster into five groups:

```
┌─────────────────────────────────────────────────┐
│           WHY MULTI-AGENT?                      │
├─────────────────┬───────────────────────────────┤
│ SCALE & QUALITY │ Context ceiling               │
│                 │ Context hygiene               │
│                 │ Parallelism                   │
├─────────────────┼───────────────────────────────┤
│ ORG FIT         │ Specialization                │
│                 │ Org mirroring                 │
├─────────────────┼───────────────────────────────┤
│ OVERSIGHT       │ Peer challenge                │
│                 │ Tool boundaries               │
├─────────────────┼───────────────────────────────┤
│ ECONOMICS       │ Cost tiering                  │
├─────────────────┼───────────────────────────────┤
│ CROSS-ORG       │ Org boundary                  │
└─────────────────┴───────────────────────────────┘
```

**The non-obvious reason: Context hygiene.** Even when your task fits in one context window, a focused agent with 10K tokens of relevant context reasons better than a bloated agent with 100K tokens of mixed signals. Bigger windows don't fix attention degradation — they make it less visible.

**But multi-agent has a cost.** The coordination crisis: agents execute 10-20x faster than humans on mechanical tasks. At human pace, a bad architectural discovery surfaces in a standup. At agent pace, two hours of dependent work is already built on invalid assumptions before anyone notices. **Speed multiplies both the value and the cost of coordination failures.**

---

## The 16 Pillars

Each pillar solves a specific coordination failure. Skip any of them and your agents break in predictable ways.

---

### Pillar 1: Shared State & the Blackboard Pattern

**The failure it prevents:** Agents contradict each other without knowing it.

**The scenario.** Three agents review a pull request — security, performance, style. No shared workspace. The security agent flags a SQL injection. The performance agent independently rewrites the same function (fixing the injection by accident). The style agent removes the documentation explaining why. Three correct individual analyses, one collectively broken outcome.

**The pattern:**

```
┌──────────────────────────────────────────┐
│            BLACKBOARD                    │
│  (shared state all agents read/write)    │
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │ Security │  │  Perf   │  │  Style  │  │
│  │ findings │  │ findings│  │ findings│  │
│  └─────────┘  └─────────┘  └─────────┘  │
│                                          │
├──────────────────────────────────────────┤
│         CONTROL SHELL                    │
│  (decides who goes next based on state)  │
└──────────────────────────────────────────┘
```

**Three components:** The blackboard (shared data), knowledge sources (specialist agents), and the **control shell** (decides which agent activates next). The control shell is the most valuable component — and the one modern frameworks skip.

**Key insight:** Sharing state and *managing* state are different. LangGraph shares state. The blackboard pattern manages it — controlling who reads what, who activates next, and when the task is complete.

**Classical root:** Penny Nii, *AI Magazine*, 1986.
**Modern equivalent:** LangGraph StateGraph, Redis pub/sub, shared context objects.

---

### Pillar 2: Task Allocation & the Contract Net

**The failure it prevents:** Wrong agent gets the wrong job.

**The scenario.** A research pipeline sends everything to the frontier model. Simple relevance filters that cost $0.001 go to a $0.05 agent (50x waste). Deep legal analyses go to a generalist that lacks specialized tools. No agent ever says "this is outside my domain."

**The two dysfunctional extremes:**

```
MICROMANAGER                    FREE-FOR-ALL
     ┌───┐                     ┌─┐ ┌─┐ ┌─┐
     │ M │ ← bottleneck        │A│ │B│ │C│ ← cherry-picking
     └┬┬┬┘                     └─┘ └─┘ └─┘
      │││                       ↕   ↕   ↕
     ┌┴┴┴┐                    ┌───────────┐
     │ABC │                    │ Open Queue│
     └────┘                    └───────────┘
  (stale knowledge)          (no capability matching)

              CONTRACT NET
         ┌─── Announce task ───┐
         │                     │
    ┌────┴────┐          ┌─────┴────┐
    │ Manager │◄─ Bids ──│ Workers  │
    └────┬────┘          └──────────┘
         │
    Award to best fit
```

**The solution:** Post the job spec and let workers bid. The manager announces what's needed. Workers self-assess and submit proposals. The best-qualified agent gets the work. Agents that are overloaded or under-qualified don't bid.

**Classical root:** Reid G. Smith, *IEEE Trans. Computers*, 1980.
**Modern equivalent:** LangGraph subgraph routing, CrewAI task delegation.

---

### Pillar 3: Team Design & Organization

**The failure it prevents:** Agents step on each other's work due to wrong topology.

**The scenario.** Five agents in a competitive intelligence pipeline, wired through a supervisor. Workers finish fast — then wait. The supervisor processes outputs one by one. You added four agents and gained almost nothing in wall-clock time.

**Five canonical topologies:**

```
SUPERVISOR        PIPELINE         SWARM
   ┌─┐           A → B → C       A ↔ B
   │S│                            ↕   ↕
  ┌┴┬┴┐                          C ↔ D
  ABC

DEBATE            HYBRID
  A ⟷ B           ┌─┐
   ↘ ↙            │S│──→ Pipeline
  Judge           └─┘──→ Swarm
```

**The task-structure test:** Match your topology to your problem. Independent subtasks → swarm. Sequential dependencies → pipeline. Need for judgment synthesis → supervisor. Conflicting perspectives → debate. Most real systems → hybrid.

**Key insight:** Topology is architecture, not implementation. Changing it later means rewiring the system, not refactoring a function.

**Classical root:** Horling & Lesser, *Knowledge Engineering Review*, 2004.

---

### Pillar 4: Planning & Result Sharing

**The failure it prevents:** Tasks get dropped, duplicated, or produce incompatible results.

**The scenario.** Three agents do acquisition due diligence: finance, legal, market. Each runs independently and submits reports. The synthesis is wrong in three places — each agent's report is correct, but Agent A's revenue anomaly invalidates Agent B's earn-out calculation, and Agent B's non-compete finding invalidates Agent C's growth projection. Cross-dependencies were invisible until final assembly.

```
TASK SHARING (what frameworks do):
  Decompose → Dispatch → Collect outputs

RESULT SHARING (what's missing):
  Agent A finds X → Agent B adjusts based on X
                  → Agent C adjusts based on X
  While still working, not after completion.
```

**Key distinction:** Task sharing distributes work. Result sharing lets agents improve each other's analysis mid-execution. Every production framework does the first. Almost none does the second.

**Classical root:** Edmund Durfee, *Multiagent Systems*, MIT Press, 1999.

---

### Pillar 5: Agent Communication

**The failure it prevents:** Lossy telephone between agents — messages transmit tokens but not intent.

**The scenario.** Agent A says: "How about Tuesday at 2pm?" Is it a *proposal* (A is committed if B accepts)? A *suggestion* (A is exploring)? An *inform* (A is sharing availability data)? Same payload, completely different behavioral consequences. Multiply across 100 messages per minute.

```
UNTYPED (what we have):         TYPED (what we need):
┌──────────────────────┐       ┌──────────────────────┐
│ "How about Tuesday   │       │ performative: PROPOSE │
│  at 2pm?"            │       │ sender: Agent_A       │
│                      │       │ content: Tuesday 2pm  │
│ (Is this a proposal? │       │ protocol: scheduling  │
│  suggestion? inform? │       │ reply-by: 1hr         │
│  Who knows?)         │       │ commitment: binding    │
└──────────────────────┘       └──────────────────────┘
```

**The solution from 1993:** KQML and FIPA defined 22 typed communicative acts — propose, accept, reject, inform, request, confirm, etc. The message type tells the receiver what kind of coordination act is being performed, not just what data is being sent.

**Classical root:** KQML (Finin et al., 1993), FIPA Performatives.
**Modern equivalent:** MCP (tool access), A2A (agent-to-agent), ACP (cross-platform). But none of these carry the *intent* layer that FIPA provided.

---

### Pillar 6: Negotiation & Conflict Resolution

**The failure it prevents:** Deadlocks when agents with conflicting objectives disagree.

**The scenario.** A procurement system: your purchasing agent negotiates with three vendor agents (AWS, Azure, GCP). After 47 turns, no contract. "That price is too high" repeated 11 times. "We can be flexible" repeated 9 times. No term formally accepted or rejected. The conversation cycles.

**Three things go wrong without formal protocols:**

```
1. NO CONVERGENCE ──→ Agents cycle indefinitely
2. NO COMMITMENT  ──→ "Verbal deals" evaporate
3. ELOQUENCE WINS ──→ Most confident agent wins,
                      regardless of correctness
```

**The solution:** Formal negotiation protocols with typed proposals, deadlines, and commitment tracking. Argumentation frameworks (Dung, 1995) provide a calculus for which claims defeat which — based on evidence, not rhetoric.

**Classical root:** Rosenschein & Zlotkin, *Rules of Encounter*, MIT Press, 1994.

---

### Pillar 7: Agent Architecture (BDI)

**The failure it prevents:** Agents drift from their goals mid-task.

**The scenario.** A software agent is mid-way through a multi-file rename. A linter error appears in an unrelated module. The agent chases the linter error, fills its context window with debugging, and the rename plan is gone. Ask the agent if it should finish the rename first and it says "yes, of course." The problem is structural — no persistent data structure says "I am committed to this rename."

```
┌─────────────────────────────────────────────┐
│              BDI ARCHITECTURE                │
│                                              │
│  BELIEFS    ──→  What the agent knows        │
│  DESIRES    ──→  What the agent wants         │
│  INTENTIONS ──→  What the agent is committed  │
│                  to doing RIGHT NOW           │
│                                              │
│  COMMITMENT STRATEGY:                        │
│  • Blind: never reconsider (fragile)         │
│  • Single-minded: persist until impossible   │ ← usually best
│  • Open-minded: reconsider on every obs.     │
└─────────────────────────────────────────────┘
```

**Key insight:** ReAct (the standard LLM agent loop) is BDI with the commit step removed. The agent perceives and acts but has no mechanism to persist an intention across observations. This is why agents that score well on SWE-Bench (single tasks) collapse on SWE-EVO (multi-step tasks) — a 3.4x performance drop.

**Classical root:** Michael Bratman, *Intention, Plans, and Practical Reason*, 1987.

---

### Pillar 8: Memory & Context

**The failure it prevents:** Agents forget what just happened across sessions.

**The scenario.** Three agents handle customer support. Agent A resolves a billing dispute Monday. Agent B handles a feature request Wednesday. Agent C takes an escalation call Friday. The customer says "As I explained to your colleague on Monday..." Agent C has no access to Agent A's conversation. The customer repeats everything. Agent C offers to raise a ticket that already exists.

```
MEMORY AS A CIRCULATION SYSTEM (not a store):

  Long-Term Memory ──→ Short-Term Memory ──→ Working Memory
       ↑                                          │
       └──────────────────────────────────────────┘

  Episodic: "What happened" (events, conversations)
  Semantic: "What is true" (facts, policies, learned rules)

  Most implementations collapse both into one RAG store.
  That's the problem.
```

**The transactive memory insight:** In human teams, you don't need to know everything — you need to know *who knows what*. Agent routing based on "which agent has dealt with this customer before" is more valuable than giving every agent access to every conversation.

**Classical root:** Endel Tulving (episodic/semantic, 1983), Daniel Wegner (transactive memory, 1987).

---

### Pillar 9: Learning & Adaptation

**The failure it prevents:** Same mistakes repeated forever.

**The scenario.** Delivery drones learn to coordinate through 10,000 simulated episodes — territory partitioning, intersection yielding, intent signaling. Then a new building is added. Learned policies collapse instantly. The coordination was emergent and did not transfer.

```
STIGMERGIC LEARNING (what works for LLM agents):

  Agent A completes task ──→ Quality score recorded
                               │
  Agent B gets similar task ──→ Route to A (high score)
                               or away from C (low score)

  No training loop. No gradient. Just accumulated
  quality signals that improve routing over time.

  Think: Yelp ratings, Uber driver scores, GitHub stars.
```

**Key insight for LLM agents:** Classical MARL requires millions of training episodes and breaks under distribution shift. LLM agents face distribution shift on every turn (new user, new document). What transfers: **stigmergic learning** (pheromone trails / quality scores) and **credit assignment** (per-agent contribution scoring after team output).

**Classical root:** John Maynard Smith, *Evolution and the Theory of Games*, 1982; ant colony optimization (Dorigo, 1992).

---

### Pillar 10: Human-in-the-Loop

**The failure it prevents:** Over-autonomous agents cause harm; rubber-stamp oversight gives false safety.

**The scenario.** A law firm uses a contract drafting agent. Early on, the associate reviews every clause carefully. By clause 80, she's skimming — the agent has been right 96% of the time. Clause 112 has a jurisdictional error that exposes the client to unlimited liability. The associate approves it in four seconds.

**This is Bainbridge's Irony of Automation (1983):** The more reliable the system, the less vigilant the human overseer, the more catastrophic the failure when the system errs.

```
THE AUTONOMY SPECTRUM:

Level 0: Human does all (tool-assisted)
Level 1: Agent suggests, human decides       ← HITL
Level 2: Agent acts, human monitors          ← HOTL
Level 3: Agent acts, human audits after      ← HOOTL
Level 4: Full autonomy (bounded)

The fix is NOT picking one level. It's routing each
decision to the right level based on:
  • Confidence (agent's certainty)
  • Stakes (cost of being wrong)
  • Reversibility (can we undo it?)
```

**The cognitive forcing pattern:** Require the human to form their own judgment *before* seeing the agent's recommendation. This prevents the anchoring effect that causes rubber-stamping.

**Classical root:** Lisanne Bainbridge, *Ironies of Automation*, 1983; Sheridan's ten-level autonomy spectrum.

---

### Pillar 11: Embodied & Physical Agents

**The failure it prevents:** Real-world constraints (irreversibility, physics, time) ignored.

**The scenario.** Twenty warehouse robots coordinate pickups. Robot 7 detects a blocked aisle — in 200ms it must reroute, notify affected robots, and update the shared occupancy map. No retry for a crushed package. No rollback for a damaged robot arm.

```
WHY THIS MATTERS FOR SOFTWARE AGENTS:

  Physical actions:  Email sent, trade executed,
                     database deleted, deployment triggered

  These are IRREVERSIBLE — just like robot collisions.

  Robotics solved this with:
  • Provable consensus (not "LLM voting")
  • Formal fault tolerance
  • Graceful degradation under partial failure
  • Communication-efficient state sharing

  None adopted by LLM agent community.
```

**Key transfer:** Iterative consensus with convergence detection, pheromone-based coordination, and the principle that irreversible actions demand higher coordination rigor.

**Classical root:** Rodney Brooks, *Intelligence Without Representation*, 1991; graph-Laplacian consensus protocols.

---

### Pillar 12: Trust & Reputation

**The failure it prevents:** One bad agent poisons the whole system.

**The scenario.** Your scheduling agent receives a message from a vendor's agent requesting calendar access. A human assistant would instantly decompose this: Is it really the vendor's agent? (identity). Have they been reliable before? (reputation). Read-only or write access? (capability scoping). Would your boss approve? (delegation authority). Your LLM agent faces a binary: grant full access or refuse entirely.

```
THE TRUST GAP:

  Human assistant:  "I'll share free/busy for next 2 weeks,
                     but not event titles or attendee lists."
                     (graduated, context-sensitive)

  LLM agent:        Grant all  OR  Refuse all
                     (binary trap)

FIVE-COMPONENT TRUST MODEL (Castelfranchi & Falcone):
  1. Competence belief  — Can they do it?
  2. Disposition belief  — Will they try?
  3. Dependence          — Do I need them?
  4. Fulfillment         — Did they deliver before?
  5. Willingness to risk — What's at stake?
```

**Three trust models:** Direct experience (I've worked with this agent), witness-based (other agents vouch for it), certified (a trusted authority attests).

**Classical root:** Diego Gambetta, *Trust*, 1989; Jøsang's Beta Reputation System.

---

### Pillar 13: Governance & Norms

**The failure it prevents:** No rules = agent free-for-all in regulated environments.

**The scenario.** Three financial agents: loan processing, customer communications, trading. Each has constraints in system prompts. But if the loan agent drifts into discriminatory patterns over thousands of decisions — what catches it? If regulators ask for an audit trail — what do you produce? If risk thresholds change — how do you know the trading agent is using new limits, not cached old ones?

```
SYSTEM PROMPTS ARE CREATION-ONLY GOVERNANCE:

  ✓ Created    — constraint written into prompt
  ✗ Propagated — not pushed to new agents or updated agents
  ✗ Enforced   — no runtime violation detection
  ✗ Revised    — no mechanism to update when rules change

THE FULL NORM LIFECYCLE:
  Create → Propagate → Enforce → Revise → (repeat)
```

**The Ostrom connection:** Elinor Ostrom's 8 design principles for governing commons (Nobel Prize, 2009) map directly to multi-agent governance: clearly defined boundaries, proportional sanctions, conflict resolution mechanisms, nested governance layers.

**Classical root:** Elinor Ostrom, *Governing the Commons*, 1990; Shoham & Tennenholtz's social laws.

---

### Pillar 14: Simulation & Testing

**The failure it prevents:** Can't predict emergent behavior before deployment.

**The scenario.** Stanford's Smallville (2023): 25 LLM agents in a virtual town. Nobody prompted them to form cliques, spread gossip, or develop groupthink. These behaviors *emerged*. The engineering failures were equally emergent — opinion convergence, rumor distortion across agent chains, no mechanism to detect collective drift from reality.

```
DEPLOYING WITHOUT SIMULATION =
SHIPPING DISTRIBUTED SOFTWARE WITHOUT A LOAD TEST

What simulation catches:
  • Groupthink / opinion collapse
  • Information cascade corruption
  • Emergent resource contention
  • Collective behaviors that no unit test reveals

Schelling (1971) → groupthink dynamics
Granovetter (1978) → threshold models for cascades
Epstein & Axtell (1996) → computational social science toolkit
Park et al. (2023) → rediscovered all of the above, cited none
```

**Classical root:** Epstein & Axtell, *Growing Artificial Societies*, 1996; the ODD protocol for reproducible agent-based model specification.

---

### Pillar 15: Evaluation & Failure Analysis

**The failure it prevents:** No way to know what's broken — output looks good, coordination is broken.

**The scenario.** A three-agent research pipeline scores 4.2/5 on human evaluation. But: the retriever returned 20 papers, the analyst used 3 (17 wasted). The analyst hallucinated a finding that happened to be correct by coincidence. The writer ignored the analyst's synthesis entirely. Output good. Coordination broken. Change the domain and it scores 2.1.

```
WHAT BENCHMARKS MEASURE:        WHAT YOU ACTUALLY NEED:

  ✓ Final output correct?       ✓ Token efficiency
                                ✓ Error propagation rate
  (That's it. That's all        ✓ Recovery time
   GAIA, SWE-Bench,             ✓ Role adherence
   WebArena measure.)           ✓ Governance compliance
                                ✓ Coordination quality
```

**The three evaluation levels:** (1) Task performance — did we get the right answer? (2) Coordination quality — did agents actually work together effectively? (3) Governance compliance — did agents stay within their mandates?

**Classical root:** Donald Campbell, *Assessing the Impact of Planned Social Change*, 1976; RoboCup evaluation methodology.

---

### Pillar 16: Frameworks & Engineering

**The failure it prevents:** Wrong tool for the job; "demo-driven development."

**The scenario.** Three engineers spend an afternoon building a customer-support system in LangGraph. Demo looks great. By Friday in production: 15% misrouting, invented refund policies, tool-call infinite loops, and no mechanism to detect stalled agents. Each bug is fixable — but the team had no methodology to anticipate them.

```
THE METHODOLOGY GAP:

  "Prompt and hope"        vs.    AOSE (Agent-Oriented SE)
  ┌──────────────────┐           ┌──────────────────────┐
  │ Write prompts    │           │ Agent spec cards     │
  │ Wire graph       │           │ Interaction protocols │
  │ Run demo         │           │ Verification         │
  │ Ship             │           │ Fault recovery trees │
  │ Fix in prod      │           │ THEN implement       │
  └──────────────────┘           └──────────────────────┘

FRAMEWORK DECISION:
  LangGraph → Maximum control, graph-based, best for custom topologies
  CrewAI    → Role-based teams, fastest to prototype
  AutoGen   → Conversation-centric, good for debate patterns
  Google ADK → Google ecosystem integration
```

**The central thesis of this book:** The infrastructure the LLM agent community is building from scratch was built once before. Classical AOSE methodologies (GAIA, Prometheus, Tropos) formalized the design steps that modern frameworks skip entirely.

**Classical root:** Michael Wooldridge, *An Introduction to MultiAgent Systems*, 2002; the GAIA methodology.

---

## The Five Laws of Agent Coordination

These synthesize the 16 pillars into five constraints:

| Law | Statement | If Violated... |
|-----|-----------|---------------|
| **1** | Coordination cost grows superlinearly with agent count | Adding agents makes the system *slower* |
| **2** | Shared state beats message passing | Agents contradict each other |
| **3** | Every agent handoff needs a quality gate | Errors amplify up to 17x |
| **4** | Organization must match problem structure | Wrong topology caps performance |
| **5** | Human oversight is a feature, not a bug | Over-autonomous agents cause harm (see: Amazon Kiro, Dec 2025) |

---

## Quick Reference: The Rosetta Stone

| Classical Concept | Modern Equivalent |
|---|---|
| Blackboard | LangGraph shared state |
| Contract Net | Agent routing / bidding |
| KQML performatives | MCP / A2A messages |
| SharedPlans | Multi-agent planning |
| BDI | System prompt + memory + tools |
| Ostrom's principles | Governance rules |
| Beta Reputation | Trust scoring |
| ODD Protocol | Agent simulation spec |

---

## What to Think About Before Day 0

1. **Have you built something you'd call a "multi-agent system"?** What went wrong with it?
2. **Pick one of the 16 pillars** that sounds most like your biggest current pain point. Read its section carefully.
3. **Think about a real use case** you'd want to apply the 16-pillar checklist to during the capstone.

See you at the workshop.

---

*This prep material is drawn from "The Engineering Handbook for Multiagent Systems" (Viswanathan, 2026). The book covers each pillar in full chapter depth with code implementations, classical research citations, and pattern cards.*

# The 16 Pillars of Multiagent Systems

> The engineering framework kapi-sprints implements. Each pillar solves a specific coordination failure. Skip any and your agents break in predictable ways.

*Based on "The Engineering Handbook for Multiagent Systems" by Dr. Balaji Viswanathan*

---

## Before the Pillars: Why Multi-Agent?

Calling something an agent doesn't make it one. **Six properties do**: higher-order goals, dynamic planning, environment interaction, autonomous decisions, persistent memory, and self-correction. Most systems called "agents" today have one or two.

And even genuine agents fail when they work together. The coordination crisis: agents execute 10–20x faster than humans. At human pace, a bad architectural discovery surfaces in a standup. At agent pace, two hours of dependent work is already built on invalid assumptions. **Speed multiplies both the value and the cost of coordination failures.**

---

## The 16 Pillars

### Pillar 1: Shared State & the Blackboard Pattern

**Failure it prevents:** Agents contradict each other without knowing it.

Three agents review a PR — security, performance, style. No shared workspace. The security agent flags a SQL injection. The performance agent rewrites the same function. The style agent removes the documentation. Three correct individual analyses, one collectively broken outcome.

**The pattern:** A shared blackboard where all agents read and write, plus a **control shell** that decides who activates next. The control shell is the most valuable component — and the one modern frameworks skip.

**kapi-sprints:** `blackboard-live.yaml` + `board.md` + `entries/`. The blackboard server is the control shell.

**Classical root:** Nii, *AI Magazine*, 1986.

→ [Deep dive](blackboard.md)

---

### Pillar 2: Task Allocation & the Contract Net

**Failure it prevents:** Wrong agent gets the wrong job.

Two dysfunctional extremes: the **micromanager** (single dispatcher with stale knowledge) and the **free-for-all** (open queue, agents cherry-pick). The solution: post the job spec and let workers bid. Agents self-assess capability and capacity.

**kapi-sprints:** `/prd` decomposes work into sized tasks. Agents signal `available` and claim work via directives. The PM doesn't assign — agents bid.

**Classical root:** Smith, *IEEE Trans. Computers*, 1980.

---

### Pillar 3: Team Design & Organization

**Failure it prevents:** Agents step on each other's work due to wrong topology.

Five canonical topologies: supervisor, pipeline, swarm, debate, hybrid. Match topology to problem structure. Independent subtasks → swarm. Sequential dependencies → pipeline. Need for judgment → supervisor. **Topology is architecture, not implementation** — changing it later means rewiring the system.

**kapi-sprints:** PM → Dev → Test pipeline (hybrid with human supervisor). Each role has defined inputs, outputs, and handoff protocols.

**Classical root:** Horling & Lesser, *Knowledge Engineering Review*, 2004.

---

### Pillar 4: Planning & Result Sharing

**Failure it prevents:** Tasks dropped, duplicated, or producing incompatible results.

Key distinction: **task sharing** distributes work. **Result sharing** lets agents improve each other's analysis mid-execution. Every framework does the first. Almost none does the second.

**kapi-sprints:** `finding` posts mid-sprint let other agents adjust before completion. Sprint files (`prd.md`, `tasks.md`) are the plan. The blackboard is the result-sharing surface.

**Classical root:** Durfee, *Multiagent Systems*, MIT Press, 1999.

---

### Pillar 5: Agent Communication

**Failure it prevents:** Lossy telephone — messages transmit tokens but not intent.

"How about Tuesday at 2pm?" Is it a proposal? A suggestion? An inform? Same payload, completely different behavioral consequences. KQML and FIPA solved this in 1993 with 22 typed communicative acts.

**kapi-sprints:** Typed signals — `blocker`, `finding`, `decision`, `handoff`, `available`, `stuck`, `queue`. The signal type tells the receiver what coordination act is being performed.

**Classical root:** Finin et al. (KQML, 1993), FIPA Performatives.

---

### Pillar 6: Negotiation & Conflict Resolution

**Failure it prevents:** Deadlocks when agents with conflicting objectives disagree.

Three things go wrong without formal protocols: no convergence (agents cycle), no commitment (verbal deals evaporate), and eloquence wins over correctness.

**kapi-sprints:** `/prd` scope negotiation — human and PM agent converge on sprint scope with explicit in/out decisions. `decisions.yaml` records commitments.

**Classical root:** Rosenschein & Zlotkin, *Rules of Encounter*, MIT Press, 1994.

---

### Pillar 7: Agent Architecture (BDI)

**Failure it prevents:** Agents drift from goals mid-task.

An agent mid-way through a multi-file rename hits a linter error. Chases it. Context fills up. The rename plan is gone. ReAct (the standard LLM agent loop) is BDI with the **commit step removed** — the agent perceives and acts but has no mechanism to persist an intention across observations.

**kapi-sprints:** Skills are persistent intentions. `tasks.md` checkboxes are the commitment structure — the agent knows what it's committed to doing right now, not just what it's currently doing.

**Classical root:** Bratman, *Intention, Plans, and Practical Reason*, 1987.

---

### Pillar 8: Memory & Context

**Failure it prevents:** Agents forget what happened across sessions.

Memory is a **circulation system**, not a store: long-term → short-term → working → back to long-term. Most implementations collapse episodic (what happened) and semantic (what is true) into one RAG store. That's the problem.

The **transactive memory** insight: you don't need to know everything — you need to know *who knows what*.

**kapi-sprints:** Three tiers — working (blackboard directives), episodic (entries/), semantic (tasks.md, backlog.md, status.md). Agent profiles track who knows what.

**Classical root:** Tulving (episodic/semantic, 1983), Wegner (transactive memory, 1987).

→ [Deep dive](blackboard.md)

---

### Pillar 9: Learning & Adaptation

**Failure it prevents:** Same mistakes repeated forever.

Classical MARL requires millions of training episodes and breaks under distribution shift. LLM agents face distribution shift on every turn. What transfers: **stigmergic learning** (accumulated quality signals that improve routing) and **credit assignment** (per-agent contribution scoring).

**kapi-sprints:** Git stats per author (seed data for competence inference). Sprint reviews capture what worked. Every `/post decision` is a labeled training example.

**Classical root:** Dorigo (ant colony optimization, 1992), Maynard Smith (evolutionary game theory, 1982).

→ [Deep dive](hitl.md)

---

### Pillar 10: Human-in-the-Loop

**Failure it prevents:** Over-autonomous agents cause harm; rubber-stamp oversight gives false safety.

**Bainbridge's Irony of Automation (1983):** The more reliable the system, the less vigilant the human overseer, the more catastrophic the failure when the system errs. The fix is not picking one autonomy level — it's routing each decision to the right level based on confidence, stakes, and reversibility.

**kapi-sprints:** Autonomy levels 4–7 (Sheridan). `/prd` = level 4 (agent proposes, human decides). Blackboard signals = level 6 (agent acts, posts for human). Autonomous task execution = level 7 (audit trail).

**Classical root:** Bainbridge (1983), Sheridan's ten-level autonomy spectrum (1978).

→ [Deep dive](hitl.md)

---

### Pillar 11: Embodied & Physical Agents

**Failure it prevents:** Irreversible actions treated as reversible.

Physical actions — emails sent, trades executed, databases deleted, deployments triggered — are irreversible, just like robot collisions. Robotics solved this with provable consensus, formal fault tolerance, and the principle that **irreversible actions demand higher coordination rigor**.

**kapi-sprints:** TDD (write the test before the code). `/test` QA gate before any deploy. Build must pass before push. Irreversibility checkpoints at every stage.

**Classical root:** Brooks, *Intelligence Without Representation*, 1991.

---

### Pillar 12: Trust & Reputation

**Failure it prevents:** One bad agent poisons the whole system.

LLM agents face a binary trust trap: grant full access or refuse entirely. The five-component model (Castelfranchi & Falcone): competence belief, disposition belief, dependence, fulfillment, willingness to risk.

Three trust models: direct experience (I've worked with this agent), witness-based (others vouch), certified (authority attests).

**kapi-sprints:** Agent profiles track history. Per-category competence scores (planned). Earned autonomy ramp — review rate decays as agents prove reliable.

**Classical root:** Gambetta (1989), Jøsang's Beta Reputation System.

→ [Deep dive](hitl.md)

---

### Pillar 13: Governance & Norms

**Failure it prevents:** No rules = agent free-for-all in regulated environments.

System prompts are **creation-only governance** — constraints written once, never propagated, never enforced, never revised. The full norm lifecycle: create → propagate → enforce → revise.

Ostrom's 8 design principles for governing commons (Nobel Prize, 2009) map directly: clearly defined boundaries, proportional sanctions, conflict resolution, nested governance layers.

**kapi-sprints:** Skill constraints define boundaries. Blackboard rules enforce coordination norms. Sprint principles (security-first, TDD, backwards build) are the governance framework.

**Classical root:** Ostrom, *Governing the Commons*, 1990.

---

### Pillar 14: Simulation & Testing

**Failure it prevents:** Can't predict emergent behavior before deployment.

Stanford's Smallville (2023): 25 LLM agents in a virtual town. Nobody prompted them to form cliques, spread gossip, or develop groupthink. These behaviors emerged. Deploying without simulation = shipping distributed software without a load test.

**kapi-sprints:** `/preflight` catches system-level issues before sprinting. Build gates catch emergent failures. Sprint reviews analyze coordination quality, not just output quality.

**Classical root:** Epstein & Axtell, *Growing Artificial Societies*, 1996.

---

### Pillar 15: Evaluation & Failure Analysis

**Failure it prevents:** Output looks good, coordination is broken.

A three-agent research pipeline scores 4.2/5 on human evaluation. But the retriever returned 20 papers, the analyst used 3. The analyst hallucinated a finding that was correct by coincidence. The writer ignored the synthesis entirely. **Output correct. Coordination broken.** Change the domain and it scores 2.1.

Three evaluation levels: (1) task performance, (2) coordination quality, (3) governance compliance.

**kapi-sprints:** Scorecard audits each quality layer. Sprint reviews evaluate the process, not just the output. `decisions.yaml` tracks whether decisions were followed.

**Classical root:** Campbell, *Assessing the Impact of Planned Social Change*, 1976.

---

### Pillar 16: Frameworks & Engineering

**Failure it prevents:** Demo-driven development.

Three engineers build a customer-support system in LangGraph. Demo looks great. By Friday in production: 15% misrouting, invented policies, infinite loops. Each bug is fixable — but the team had no methodology to anticipate them.

The methodology gap: "prompt and hope" vs. AOSE (Agent-Oriented Software Engineering) with spec cards, interaction protocols, verification, and fault recovery trees.

**kapi-sprints:** Backwards Build — define done before writing code. Foundation gate (vision, market, spec before any sprint). Every intermediate state is deployable.

**Classical root:** Wooldridge, *An Introduction to MultiAgent Systems*, 2002; GAIA methodology.

→ [Deep dive](backwards-build.md)

---

## The Five Laws of Agent Coordination

These synthesize the 16 pillars into five constraints:

| Law | Statement | If Violated |
|-----|-----------|-------------|
| **1** | Coordination cost grows superlinearly with agent count | Adding agents makes the system *slower* |
| **2** | Shared state beats message passing | Agents contradict each other |
| **3** | Every agent handoff needs a quality gate | Errors amplify up to 17x |
| **4** | Organization must match problem structure | Wrong topology caps performance |
| **5** | Human oversight is a feature, not a bug | Over-autonomous agents cause harm |

---

## The Rosetta Stone

What modern frameworks rediscovered — and what they're still missing.

| Classical Concept | Year | Modern Equivalent | Gap |
|---|---|---|---|
| Blackboard | 1986 | LangGraph shared state | Missing control shell |
| Contract Net | 1980 | Agent routing / bidding | Missing self-assessment |
| KQML performatives | 1993 | MCP / A2A messages | Missing intent layer |
| SharedPlans | 1999 | Multi-agent planning | Missing result sharing |
| BDI | 1987 | System prompt + memory + tools | Missing commitment step |
| Ostrom's principles | 1990 | Governance rules | Missing runtime enforcement |
| Beta Reputation | 1989 | Trust scoring | Binary trust only |
| ODD Protocol | 1996 | Agent simulation spec | Not adopted |

---

*Full treatment of each pillar with code implementations, pattern cards, and extended classical citations in "The Engineering Handbook for Multiagent Systems" (Viswanathan, 2026).*

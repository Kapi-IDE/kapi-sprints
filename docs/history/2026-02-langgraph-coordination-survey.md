# LangGraph and complex multi-agent coordination — a February 2026 survey, re-checked

> **A dated record, and parts of it are now out of date — read the re-check first.** Compiled 2026-02 from third-party writing and community reports while deciding what to build coordination on. Moved here from the `kapi-platform` repo, where it sat unfiled since February. It is published because it is the reasoning behind this project's premise, not as a current assessment of another team's software.

## Re-check, 2026-09-09 — two of the central criticisms have since been answered

Read the survey below with these corrections in front of it. LangGraph has had seven months of releases and its multi-agent guidance now covers four patterns rather than one.

| the February criticism | status today |
|---|---|
| **§3 centralized supervisor bottleneck, "no true peer-to-peer"** | **Addressed.** A swarm pattern now exists: agents hand off directly to each other with `Command` objects and no supervisor in the path. The supervisor is one pattern of four, not the only shape. |
| **§2 race conditions on concurrent state updates** | **Addressed in design.** State updates go through reducers, giving deterministic merging for concurrent and partial updates. The specific issue number cited below should be read as a 2026-02 snapshot, not a live defect. |
| **§2 memory consumption — "2GB for basic retrieval", "50x less" elsewhere** | **Not verified, and not verifiable as written.** One figure is a community report and the other is a competing vendor's own claim. Neither was re-measured. Do not quote either. |
| **§1 the developer holds the agency; the topology is known at design time** | **Stands**, and it is a design philosophy rather than a defect — the tradeoff is stated by its authors as control and predictability over emergence. |
| **the 5-agent ceiling, §4–§8** | **Not re-verified.** Treat as February observations. |

**Why this sits in this repo.** The surviving criticism is the one this project is built on: a graph you must draw up front is a poor fit for work whose shape emerges, and none of these frameworks ships a shared *knowledge* store — a place for findings, decisions and evolving understanding, as distinct from a task list. That gap is the blackboard's reason to exist and is documented in [`../concepts/blackboard.md`](../concepts/blackboard.md).

**One thing this survey should not be read as.** The Kapi platform did replace LangGraph with its own engine, but for narrower engineering reasons — pause and resume, streaming, tool calling and dependency count — not because of the architectural critique below. Do not read that decision as confirmation of this wider claim.

---

## Executive Summary

LangGraph is a workflow orchestration tool masquerading as an agentic framework. It excels at deterministic, developer-designed graphs but fundamentally struggles with emergent agent behavior, true peer-to-peer collaboration, and autonomous coordination.

---

## 1. "Not a True Agentic Framework"

The most pointed criticism comes from Saeed Hajebi's widely-cited article (March 2025):

- **Agency resides with the developer, not the agents.** The intelligence lies in the developer who designs the graph topology -- nodes, edges, conditional routing -- not in the AI system itself. Agents cannot autonomously determine the most effective path.
- **Control over autonomy.** LangGraph trades autonomy for control, adaptability for predictability, emergent behavior for transparency.
- **"If you can't draw your whole workflow up front, LangGraph probably isn't the right tool."** (Eugene Grois)

This is the fundamental limitation: **you must know the topology at design time.** Dynamic agent spawning, open-ended collaboration, and runtime topology changes are impossible or require extensive workarounds.

---

## 2. State Management Issues

### Rigid Upfront State Definition
- State schemas become unwieldy for complex multi-agent systems (hundreds of configuration lines)
- Schema modifications require synchronized updates across multiple nodes
- Serialization constraints limit richness of inter-agent communication

### Race Conditions in Concurrent State Updates
- Documented bugs: `INVALID_CONCURRENT_GRAPH_UPDATE` error, interrupt resume values misrouted between tools (GitHub issue #6533)
- Mitigation (immutable data structures) introduces significant memory overhead

### Memory Consumption
- Community reports: **2GB of RAM for basic retrieval tasks** in larger chains
- Agno claims **50x less memory usage** for comparable workloads
- Immutable state versioning compounds problem in long-running workflows

---

## 3. Multi-Agent Communication Weaknesses

### Centralized Supervisor Bottleneck
- All communication routes through a single supervisor node
- No true peer-to-peer communication
- If supervisor fails, entire system stalls
- Fundamentally inefficient for parallel collaboration

### Subgraph Communication Trade-offs
Two modes, both problematic:
1. **Shared state**: Simple but destroys encapsulation (no privacy between agents)
2. **Isolated state**: Preserves boundaries but requires manual state transformation at every entry/exit

Neither supports agent negotiation (back-and-forth dialogue). Everything mediated through state mutations, not messages.

### The 5-Agent Ceiling
Over 75% of multi-agent systems become difficult to manage past 5 agents:
- Each new agent adds nodes/edges that must be explicitly defined
- State schema must accommodate all agents' needs
- Debugging surface area grows combinatorially

---

## 4. Dynamic Routing Limitations

- Graphs are **compiled ahead of time** -- possible routes enumerated at design time
- Cannot dynamically spawn new agent types at runtime
- Cannot have agents discover and connect to unknown peers
- Cannot reshape topology based on runtime learning
- Unsuitable for agent marketplaces, recursive self-improvement, open-ended exploration

---

## 5. Parallel Execution Limitations

### All-or-Nothing Superstep Failures
If one parallel node fails, the entire superstep fails atomically. Successful results from other nodes are lost.

### Rate Limit Sensitivity
`max_concurrency` is a blunt instrument -- caps all parallel nodes uniformly rather than per-agent throttling.

### State Merge Complexity
Developers must define **reducer functions** for any state property updated by concurrent nodes. Missing/incorrect reducers lead to silent data loss.

---

## 6. Long-Running Workflow Challenges

- Checkpoint storage grows linearly with workflow duration
- Serverless incompatibility (cold starts, state rehydration, session affinity)
- **Deadlock scenarios**: circular agent dependencies cause stalls, no built-in detection
- `langgraph dev` tool ignores custom checkpointer configuration (GitHub issue #5790)

---

## 7. Debugging and Observability Gaps

- Asynchronous execution makes reproducing errors nearly impossible
- Abstraction layers obscure actual API calls
- Single agent failure can corrupt shared state → cascading failures
- **LangSmith dependency**: deep vendor lock-in with per-trace pricing
- Subgraph state only accessible when interrupted (limited visibility)

---

## 8. Production Readiness Gaps

Missing from LangGraph itself:
- Retries and fallbacks (must build manually)
- CI/CD integration (no native testing harness)
- Monitoring and alerting (requires LangSmith or custom)
- Rate limiting and quota management (basic only)

Community reports **40% performance improvements** after switching to direct SDK calls.

---

## 9. When LangGraph Is Still the Right Choice

- Deterministic, inspectable, auditable workflows
- Graph topology known at design time
- Reliability and control > agent autonomy
- Experienced engineers comfortable with graph programming
- Human-in-the-loop checkpoints are critical

---

## Sources

- [LangGraph is Not a True Agentic Framework - Hajebi](https://medium.com/@saeedhajebi/langgraph-is-not-a-true-agentic-framework-3f010c780857)
- [LangGraph: Controlled Workflows, Not Autonomous Agents - Grois](https://medium.com/@egrois/langgraph-controlled-workflows-not-autonomous-agents-37332efa753f)
- [LangGraph Multi-Agent Orchestration Complete Guide (Latenode)](https://latenode.com/blog/ai-frameworks-technical-infrastructure/langgraph-multi-agent-orchestration/langgraph-multi-agent-orchestration-complete-framework-guide-architecture-analysis-2025)
- [Current Limitations of LangChain/LangGraph 2025 (Latenode Community)](https://community.latenode.com/t/current-limitations-of-langchain-and-langgraph-frameworks-in-2025/30994)
- [Agno vs LangGraph (ZenML)](https://www.zenml.io/blog/agno-vs-langgraph)
- [Scaling LangGraph Agents (AI Practitioner / Substack)](https://aipractitioner.substack.com/p/scaling-langgraph-agents-parallelization)
- [GitHub Issue #6533 - Interrupt Resume Misrouting](https://github.com/langchain-ai/langgraph/issues/6533)
- [GitHub Issue #5790 - Dev Tool Ignores Checkpointer](https://github.com/langchain-ai/langgraph/issues/5790)
- [Self-hosting LangGraph Without LangSmith (Latenode)](https://community.latenode.com/t/self-hosting-langgraph-agents-independently-without-langsmith-integration/33746)

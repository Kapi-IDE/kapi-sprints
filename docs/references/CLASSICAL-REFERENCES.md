# MAS Workshop - Classical Research References

The workshop bridges 40+ years of classical MAS research to modern LLM agent systems. This documents every classical reference cited in the prep material and syllabus.

## References by Pillar

### Pillar 1: Shared State & Blackboard
- **Nii, H.P.** (1986). "Blackboard Systems." *AI Magazine*. Defined the three-component blackboard architecture: shared data, knowledge sources, control shell.

### Pillar 2: Task Allocation (Contract Net)
- **Smith, R.G.** (1980). "The Contract Net Protocol: High-Level Communication and Control in a Distributed Problem Solver." *IEEE Transactions on Computers*. The announce-bid-award pattern for task allocation.

### Pillar 3: Team Design
- **Horling, B. & Lesser, V.** (2004). "A Survey of Multi-Agent Organizational Paradigms." *Knowledge Engineering Review*. Taxonomy of agent team topologies.

### Pillar 4: Planning & Result Sharing
- **Durfee, E.** (1999). "Distributed Problem Solving and Planning." *Multiagent Systems*, MIT Press. Task sharing vs. result sharing distinction.

### Pillar 5: Agent Communication
- **Finin, T. et al.** (1993). "KQML — A Language and Protocol for Knowledge and Information Exchange." University of Maryland. 22 typed communicative acts with performatives.
- **FIPA** (Foundation for Intelligent Physical Agents). Standard performatives specification.

### Pillar 6: Negotiation
- **Rosenschein, J.S. & Zlotkin, G.** (1994). *Rules of Encounter: Designing Conventions for Automated Negotiation among Computers*. MIT Press.
- **Dung, P.M.** (1995). "On the Acceptability of Arguments and its Fundamental Role in Nonmonotonic Reasoning, Logic Programming and n-Person Games." *Artificial Intelligence*. Argumentation frameworks.

### Pillar 7: BDI Architecture
- **Bratman, M.E.** (1987). *Intention, Plans, and Practical Reason*. Harvard University Press. The philosophical foundation of BDI (Beliefs-Desires-Intentions).
- **Wooldridge, M. & Jennings, N.R.** (1995). "Intelligent Agents: Theory and Practice." *Knowledge Engineering Review*. Four classical agent properties (autonomy, social ability, reactivity, pro-activeness).

### Pillar 8: Memory & Context
- **Tulving, E.** (1983). *Elements of Episodic Memory*. Oxford University Press. Episodic vs. semantic memory distinction.
- **Wegner, D.M.** (1987). "Transactive Memory: A Contemporary Analysis of the Group Mind." In *Theories of Group Behavior*. Knowing who knows what.

### Pillar 9: Learning & Adaptation
- **Maynard Smith, J.** (1982). *Evolution and the Theory of Games*. Cambridge University Press. Evolutionary game theory applied to agent populations.
- **Dorigo, M.** (1992). "Optimization, Learning and Natural Algorithms." PhD thesis, Politecnico di Milano. Ant colony optimization / stigmergic learning.

### Pillar 10: Human-in-the-Loop
- **Bainbridge, L.** (1983). "Ironies of Automation." *Automatica*. The more reliable the automation, the less vigilant the human overseer.
- **Sheridan, T.B.** Ten-level autonomy spectrum for human-automation interaction.

### Pillar 11: Embodied Agents
- **Brooks, R.A.** (1991). "Intelligence Without Representation." *Artificial Intelligence*. Subsumption architecture, behavior-based robotics.

### Pillar 12: Trust & Reputation
- **Gambetta, D.** (1989). *Trust: Making and Breaking Cooperative Relations*. Blackwell.
- **Castelfranchi, C. & Falcone, R.** Five-component trust model (competence belief, disposition belief, dependence, fulfillment, willingness to risk).
- **Josang, A.** Beta Reputation System for graduated trust scoring.

### Pillar 13: Governance & Norms
- **Ostrom, E.** (1990). *Governing the Commons: The Evolution of Institutions for Collective Action*. Cambridge University Press. Nobel Prize 2009. 8 design principles for commons governance.
- **Shoham, Y. & Tennenholtz, M.** Social laws for multi-agent systems.

### Pillar 14: Simulation & Testing
- **Epstein, J.M. & Axtell, R.** (1996). *Growing Artificial Societies: Social Science from the Bottom Up*. MIT Press.
- **Schelling, T.C.** (1971). "Dynamic Models of Segregation." *Journal of Mathematical Sociology*. Agent-based segregation/groupthink dynamics.
- **Granovetter, M.** (1978). "Threshold Models of Collective Behavior." *American Journal of Sociology*.
- **Park, J.S. et al.** (2023). "Generative Agents: Interactive Simulacra of Human Behavior." Stanford Smallville experiment.

### Pillar 15: Evaluation
- **Campbell, D.T.** (1976). "Assessing the Impact of Planned Social Change." Evaluation methodology.
- **RoboCup** evaluation methodology for multi-agent systems.

### Pillar 16: Frameworks & Engineering
- **Wooldridge, M.** (2002). *An Introduction to MultiAgent Systems*. Wiley. Foundational MAS textbook.
- **GAIA Methodology** — Agent-Oriented Software Engineering (AOSE).
- **Prometheus Methodology** — Agent design methodology.
- **Tropos** — Requirements-driven agent development.

## The Rosetta Stone (Classical to Modern Mapping)

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

## Key Book Reference

All material drawn from: **Viswanathan, B.** (2026). *The Engineering Handbook for Multiagent Systems*. Covers each pillar in full chapter depth with code implementations, classical research citations, and pattern cards.

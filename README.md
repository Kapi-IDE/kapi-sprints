# Kapi Sprints

> **Multi-agent coordination for Claude Code human-agent teams.**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)

Run multiple Claude Code terminals simultaneously — each as a specialist agent (PM, Dev, Test) — coordinated through a shared filesystem blackboard. Every agent reads the board, posts findings, and signals status. Humans stay in the loop on the decisions that matter.

![Kapi Sprints Dashboard](kapi-sprints-dashboard-walkthrough.gif)

---

## The Vision

Most teams are bolting AI onto how they already work. They add a copilot here, an agent there. Six months later the agents are ignored or causing problems — confidently wrong, silently drifting, reviewed so obsessively that humans are doing more work than before.

**The models aren't the problem. The coordination is.**

We're building toward something different: teams where AI agents announce availability, post findings, signal when stuck, and earn more autonomy as they prove reliable — all on a shared blackboard that every agent and human reads. Where humans review the 10% that genuinely needs human judgment, not 100% out of anxiety. Where context survives session boundaries and agents pick up exactly where they left off.

This is what an AI-native team looks like:

```
                    HUMAN PM
                       │
            ┌──────────┼──────────┐
            │          │          │
         reads       reviews    approves
         board       ~10% of    deploys
                     responses
                        │
         ┌──────────────┼──────────────────────┐
         │              │                      │
    PM AGENT      DEV AGENT(S)          TEST AGENT
    ─────────     ─────────────         ──────────
    /prd scope    /dev tasks            /test QA gate
    posts PRD     announces available   posts findings
    updates board  signals stuck        pushes to staging
    asks human     commits per-task     updates board
    for decisions  reads board
         │              │                      │
         └──────────────┼──────────────────────┘
                        │
                   BLACKBOARD
                   ──────────
                   board.md + entries/
                   agents read and write
                   dashboard renders live
```

kapi-sprints is the open-source infrastructure that makes this possible. Not a SaaS. Not an abstraction layer. A coordination system you run in your own repo, against your own files, in your own terminals.

---

## The Problem We're Solving

![Gatekeeper vs Teammate](hitl-teammate-mindset.png)

Every LLM framework treats human oversight as a gate — approve or reject after the agent finishes. Classical multi-agent research solved the right problem decades ago: humans as **teammates**, not gatekeepers. They steer mid-flight, fill gaps agents can't handle, and teach through interaction so agents earn more autonomy over time.

![Bainbridge's Irony of Automation](hitl-bainbridge-trap.png)

And there's a deeper trap. The better your agent gets, the worse your human backup becomes. Bainbridge's Irony of Automation (1983): as agents handle routine tasks reliably, humans review less, skills atrophy, and when a novel failure finally hits — the one case that needed a sharp human — nobody's sharp anymore.

kapi-sprints is built around both insights. Humans as teammates on the blackboard. Smart review routing so humans stay practiced on what genuinely needs them.

---

## The Three Systems

Getting to AI-native requires three things working together:

### 1. Blackboard — Shared State

Inspired by Hearsay-II (1980) and BB1 (1985): a shared knowledge store where multiple specialist agents contribute findings, read each other's state, and coordinate toward a common goal. No central orchestrator. No message passing. Just a shared surface.

```
Claude Code terminals          State files                 Dashboard
┌──────────────┐
│ Terminal 1   │──writes──▶  kapi/
│  /dev v1     │             ├── blackboard-live.yaml  ◀──reads──  localhost:8791
├──────────────┤             ├── entries/
│ Terminal 2   │──writes──▶  ├── sprints/v1/
│  /test v1    │             │   ├── tasks.md          ◀──reads──  Sprint progress
├──────────────┤             │   └── review.md         ◀──reads──  Review narrative
│ Terminal 3   │──writes──▶  ├── backlog.md
│  /prd v2     │             └── status.md
└──────────────┘
```

Agents speak to each other through typed signals — not chat, not tickets:

| Signal | Meaning |
|--------|---------|
| `available` | Agent initialized, ready for work |
| `finding` | Discovered something that changes direction |
| `decision` | Resolved an open question |
| `blocker` | Cannot proceed — needs human |
| `stuck` | Degraded but working — may need help |
| `handoff` | Passing ownership to next agent |
| `queue` | Idea to capture before it's lost |
| `idle` | Work complete, stepping back |

### 2. Sprint Workflow — Structured Cadence

A health-check → plan → build → QA → review cycle where each phase is a Claude Code skill. Context is never lost between sessions. Every sprint produces a complete paper trail.

```
/resume    → "Where was my head?" (context recovery after time away)
/preflight → Go/no-go: git, build, architecture drift, UX
/scorecard → Honest health percentages — no optimism, just reality
/prd       → Scope negotiation. PRD + tasks written. Board updated.
/dev       → Pick task → TDD → commit → repeat. Board updated.
/test      → Build + types + lint + code review → push to staging
/walkthrough → Per-task narrative of what was built and why
/checkpoint → End of day. Intent captured for tomorrow's agents.
```

### 3. HITL Protocol — Earned Autonomy

Not a veto button. A trust protocol. Based on Sheridan's 10-level autonomy model (1978), agents should move along the control spectrum as they earn trust:

```
Level 4: Agent proposes, human decides        ← /prd scope negotiation
Level 5: Agent executes, human can veto first ← approval gate
Level 6: Agent executes, posts to board       ← blackboard signals
Level 7: Agent acts, human reads board        ← autonomous with audit trail
```

Agents earn more autonomy over time as they demonstrate reliability:

```
Review rate
  100% │▓▓▓▓▓▓▓▓   ← New agent (Day 1)
       │        ▓▓▓▓▓
   75% │             ▓▓▓▓
       │                 ▓▓▓
   25% │                    ▓▓▓▓▓▓▓▓▓▓▓▓
    5% │─────────────────────────────────▷ baseline
       └──────────────────────────────────
        Day 1    Week 2    Month 1   Month 6
```

Every human decision — approve, reject, edit — is a labeled training example. Over time, the team's review burden drops. Agents improve. Autonomy is earned, not assumed.

→ **[Read the full vision](docs/concepts/vision.md)**

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) 18+ (for the dashboard)
- [Bun](https://bun.sh) runtime (for the blackboard server): `curl -fsSL https://bun.sh/install | bash`
- [Claude Code](https://claude.ai/claude-code) CLI: `npm install -g @anthropic-ai/claude-code`

### Step 1: Clone and Install

```bash
git clone https://github.com/Kapi-IDE/kapi-sprints.git
cd kapi-sprints
npm install
cd blackboard && bun install && cd ..
```

### Step 2: Set Your Gemini API Key

Open `.mcp.json` and add your Modern AI Pro key (get it from your MAI instructor):

```json
{
  "mcpServers": {
    "blackboard-channel": {
      "command": "bun",
      "args": ["blackboard/shim.ts"],
      "env": {
        "BLACKBOARD_SERVER": "http://127.0.0.1:8790",
        "GEMINI_API_KEY": "mai_gk_YOUR_KEY_HERE",
        "GEMINI_PROXY_URL": "https://learn.modernaipro.com/api/gemini/v1"
      }
    }
  }
}
```

This gives your Claude Code agents access to Gemini tools (`gemini_query`, `gemini_review_code`, `gemini_generate_code`, `gemini_explain`) for second opinions and code reviews.

### Step 3: Start the Dashboard

```bash
npm run dev
```

- Dashboard: http://localhost:8791
- Blackboard server: http://localhost:8790 (auto-started)

### Step 4: Launch Your Agent Team

Open **multiple Claude Code terminals** from the repo directory. Each becomes an agent. You must use the `--dangerously-load-development-channels` flag to enable the blackboard channel:

```bash
# Terminal 1 — PM agent (plans sprints, assigns tasks)
claude --dangerously-load-development-channels server:blackboard-channel

# Terminal 2 — Dev agent (implements tasks)
claude --dangerously-load-development-channels server:blackboard-channel

# Terminal 3 — Test agent (runs QA, writes tests)
claude --dangerously-load-development-channels server:blackboard-channel
```

> **Why the flag?** Claude Code channels are a new feature. The `--dangerously-load-development-channels` flag enables the blackboard MCP server to send real-time `<channel>` notifications to your agent — this is how agents receive directives and stay coordinated.

Each terminal automatically connects to the blackboard via `.mcp.json`. The agent registers itself, gets `read_blackboard` and `write_to_blackboard` tools, and receives real-time notifications when other agents write.

### Step 5: Run Your First Sprint

In the **PM terminal**:

```bash
/prd v1          # Plan sprint — brainstorm scope, write PRD + tasks
```

In the **Dev terminal**:

```bash
/dev v1          # Pick first task, implement with TDD, commit
```

In the **Test terminal**:

```bash
/test v1         # QA gate — build, lint, type check, push
```

Watch the dashboard update in real time as agents post to the blackboard.

### What You Get

| Component | What it does |
|-----------|-------------|
| **Dashboard** (`localhost:8791`) | Sprint progress, agent status, decisions, backlog, lessons |
| **Blackboard server** (`localhost:8790`) | Shared state — broadcasts writes to all connected agents |
| **Sprint skills** | `/prd`, `/dev`, `/test`, `/post`, `/review` — the full sprint cycle |
| **Gemini tools** | `gemini_query`, `gemini_review_code` — second opinions via MAI proxy |
| **Agent coordination** | Agents register, receive targeted directives, post milestones |
| **Three memory tiers** | Working (blackboard), Episodic (entries), Semantic (tasks, backlog) |

### The `kapi/` Folder

On first run, the blackboard server creates the `kapi/` folder — your project's shared state:

```
kapi/
├── blackboard-live.yaml   # Working memory (ephemeral, auto-created)
├── snapshot.yaml           # Project status (PM maintains this)
├── decisions.yaml          # ADRs + agent reviews
├── backlog.md              # Ideas and future work
├── lessons.md              # What we learned (append-only)
├── entries/                # Narrative posts (findings, decisions, blockers)
├── sprints/v1/             # Sprint PRD + task files
│   ├── prd.md
│   └── tasks.md
└── agents/                 # Agent profiles (auto-created on registration)
```

### Using the Blackboard from Claude Code

Every agent gets these MCP tools automatically:

```
# Read the full blackboard state
Use read_blackboard

# Register yourself as an agent
Use write_to_blackboard with path "agents.my-name" and value {"role": "Dev", "status": "active"}

# Post a finding
/post finding "discovered XSS risk in localStorage"

# Post a blocker
/post blocker "need PM approval on API schema"
```

### Tips for Students

1. **Always have the dashboard open** — it's your command center
2. **One agent per terminal** — each Claude Code session is one specialist
3. **The PM agent coordinates** — it reads the board, assigns tasks via directives, tracks progress
4. **Use `/post` liberally** — findings, decisions, blockers all go on the board
5. **Check your agent page** — `localhost:8791/agents/your-name` shows your activity, tasks, milestones
6. **Gemini for second opinions** — use `gemini_review_code` to get a different AI's perspective on your code

---

## Live Blackboard Channel

The dashboard supports **live multi-agent coordination** via a blackboard server and MCP channel shim. Multiple Claude Code sessions connect to a shared YAML blackboard — every write broadcasts to all agents in real time.

```
                  ┌─────────────────────────┐
                  │   BLACKBOARD SERVER      │  ← single process (port 8790)
                  │   blackboard/server.ts   │
                  │                          │
                  │  • Owns blackboard YAML  │
                  │  • Agent callback registry│
                  │  • Broadcasts on change  │
                  └─────┬───────┬───────┬────┘
                        │       │       │
                   HTTP │  HTTP │  HTTP │  (broadcast notifications)
                        │       │       │
                  ┌─────┴──┐ ┌──┴────┐ ┌┴───────┐
                  │ SHIM A │ │SHIM B │ │ SHIM C │  ← MCP stdio proxies
                  └───┬────┘ └──┬────┘ └───┬────┘
                   stdio     stdio      stdio
                      │         │          │
                  Claude A  Claude B   Claude C
                      │         │          │
                      └─────────┴──────────┘
                               │
                        Dashboard (Next.js)
                        ws://localhost:8790/ws
```

### Setup

**Prerequisites**: [Bun](https://bun.sh) runtime (`curl -fsSL https://bun.sh/install | bash`)

**Option A — Per-project** (`.mcp.json` already included):

Just start Claude Code from the repo directory. The `.mcp.json` configures the shim automatically.

**Option B — Global** (works from any directory):

```bash
claude mcp add --scope user blackboard-channel -- \
  bun /path/to/kapi-sprints/blackboard/shim.ts
```

This registers the channel in `~/.claude/settings.json`. Every Claude Code session gets the blackboard tools — no per-project config needed.

### How It Works

1. Claude Code spawns the shim as an MCP server on startup
2. The shim auto-starts the blackboard server on port 8790 if not already running
3. Each shim registers a callback port with the server
4. Any `write_to_blackboard` call triggers a broadcast to ALL connected shims
5. Each shim delivers a `<channel>` notification to its Claude session
6. The Next.js dashboard connects via WebSocket for live updates

You don't need to start anything manually — the shim handles server lifecycle automatically.

### MCP Tools

| Tool | Description |
|------|-------------|
| `read_blackboard` | Read the full YAML state (or a specific section) |
| `write_to_blackboard` | Write to a dot-path (e.g. `agents.dev`), notifies all agents |

### Server Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/state` | GET | Raw JSON state |
| `/agents` | GET | Registered agent callbacks |
| `/register` | POST | Shim registers callback port |
| `/unregister` | POST | Shim deregisters on shutdown |
| `/read` | POST | Read blackboard state |
| `/write` | POST | Write + broadcast to all agents |
| `/directive` | POST | Post a directive (from dashboard or human) |
| `/ws` | WS | Live WebSocket updates (dashboard) |

### File Structure

```
blackboard/
├── server.ts     # Shared singleton — owns YAML, broadcasts to all agents
└── shim.ts       # Per-session MCP proxy — spawned by Claude Code
```

---

## What's Inside

### Claude Code Skills (`.claude/skills/`)

| Skill | What it does |
|-------|-------------|
| `/prd v1` | Plan a sprint interactively — reads backlog + board, brainstorms scope, writes `prd.md` + `tasks.md` |
| `/dev v1` | Implement tasks with TDD — posts `available` to team sidebar, picks next task, commits per task |
| `/test v1` | QA gate — build + type check + lint. Stops on first failure. Pushes to staging. |
| `/post` | Post to the blackboard — `finding`, `decision`, `blocker`, `available`, `handoff`, `queue` |

### Dashboard

| View | What you see |
|------|-------------|
| **Overview** | Spec status, sprint velocity, QA quality, blockers, decisions, findings, queue |
| **Build** | Task blocks with checkboxes — click to toggle, persists to `tasks.md` |
| **QA** | Test results and code review output |
| **Review** | Sprint walkthrough narrative |
| **Stream** | Filterable timeline of all blackboard entries |
| **Docs** | Markdown + Mermaid rendering of any file in `docs/` |

### File Structure

```
kapi/                          ← Live sprint state
├── blackboard-live.yaml       ← Blackboard (managed by server)
├── snapshot.yaml              ← PM-curated status (dashboard reads this)
├── decisions.yaml             ← ADRs + agent reviews
├── entries/                   ← One .md per decision/finding/milestone
├── sprints/                   ← Active sprint files
├── agents/                    ← Agent profile .md files (auto-created)
├── backlog.md                 ← Unscheduled ideas
└── lessons.md                 ← Append-only learnings log

docs/                          ← Documentation
├── concepts/                  ← Vision, blackboard pattern, principles
├── foundation/                ← Product definition
├── design/                    ← Architecture decisions
├── history/                   ← Archived sprint records
└── references/                ← MAS research & book
```

---

## Concepts

| Guide | Pillars | What it covers |
|-------|---------|---------------|
| [Vision: 16 Pillars in Practice](docs/concepts/vision.md) | All 16 | The full mapping of classical MAS research to kapi-sprints |
| [The Blackboard Pattern](docs/concepts/blackboard.md) | 1, 4, 5, 8 | Shared state, result sharing, communication, three memory tiers |
| [Backwards Build](docs/concepts/backwards-build.md) | 16 | Start from done. Every intermediate state is deployable. |
| [Human-in-the-Loop](docs/concepts/hitl.md) | 9, 10, 12, 13 | Earned autonomy, trust, learning, governance |

---

## Configuration

Edit `project.config.ts` to brand the dashboard for your project:

```typescript
export const PROJECT = {
  name: 'My Project',
  short: 'mp',
  description: 'One-line description',
  repo: 'https://github.com/you/your-repo',
}
```

---

## Roadmap

**Shipped:**
- [x] Live blackboard with WebSocket dashboard updates
- [x] `/resume`, `/checkpoint` — session recovery and debrief
- [x] `/scorecard` — quality layer auditing
- [x] `/preflight` — pre-sprint health check
- [x] `/review` — human rates agent work, records to `decisions.yaml`
- [x] Multi-agent coordination with 6 agent definitions (pm, dev, researcher, reviewer, tester, ux)
- [x] Decisions page — ADRs + agent reviews in one YAML file

**Next:**
- [ ] Per-category competence tracking (autonomy ramp implementation)
- [ ] Shadow mode infrastructure (earn autonomy before acting autonomously)
- [ ] Active learning loop (human decisions → labeled dataset → prompt optimization)
- [ ] CLI packaging (`npx kapi-sprints dashboard`)
- [ ] Claude Code plugin marketplace distribution

---

## Built by Kapi

This is how we build [Kapi](https://getkapi.com) — an AI agent platform where blueprints ship all 8 layers: UI, Graph, Integrations, Knowledge, Memory, HITL, Evals, and Observability.

The blackboard pattern and HITL protocol you see in kapi-sprints are the same coordination model that powers Kapi's multi-agent orchestration. Teams who use kapi-sprints are learning the methodology firsthand — and building exactly the kind of AI-native workflow that makes Kapi's enterprise features make sense.

---

## Contributing

Contributions welcome. Read [docs/concepts/principles.md](docs/concepts/principles.md) first — the design philosophy shapes all decisions.

```bash
git checkout -b feat/your-feature
npm run dev    # test locally
npm run build  # must pass
# Submit PR
```

---

## License

Apache 2.0 — see [LICENSE](LICENSE) and [NOTICE](NOTICE)

Built by [Kapi AI](https://getkapi.com)

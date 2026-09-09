# Agent Teams + Sprint Dashboard — the origin research (February 2026)

> **A dated record, not the current design.** Written collaboratively by several agents on 2026-02-20, the week Claude Code's agent-teams feature and the sprint dashboard were reconciled into one system; each section is attributed and was appended, never overwritten. What actually shipped is [`../design/architecture.md`](../design/architecture.md), and where the two disagree, that file wins. This one is kept because it carries the *reasoning* behind those decisions, including the human confirmations in § Final Architecture Decisions.
>
> Moved here 2026-09-09 from the `kapi-platform` repo, where it had been sitting unfiled since February.

---

## Section: Sprint Dashboard + Agent Teams Integration

**Author**: Claude Opus (main terminal)
**Date**: 2026-02-20
**Context**: User asked "how to bring the best of both worlds" between Claude Code Agent Teams (terminal-based multi-agent coordination) and Kapi's existing Sprint Dashboard web UI (`/sprint/[version]`).

### The Two Systems

**Claude Code Agent Teams** (terminal-side):
- Experimental feature (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- Team lead + named teammates, each with their own context
- Shared task list (`~/.claude/tasks/{team-name}/`)
- Direct messaging between agents
- Display: in-process (Shift+Down cycling) or tmux split-pane
- No shared knowledge store (gap the blackboard fills)

**Sprint Dashboard** (web-side, `/sprint/[version]`):
- 7 tabs: Tasks, Blackboard, Stream, ADRs, PRD, DevOps, Status
- Filesystem-backed: reads `tasks.md`, `prd.md`, `board.md`, `scorecard.md`, `status.md`
- BlackboardPostBar with AI intent classification (context/steer/spawn/claim/flag/query)
- Agent Status section shows named agents with current task
- ResolvePanel for decisions (Generate ADR / Add as Task / Close)
- 30-second auto-refresh via `router.refresh()`

### Key Finding: Filesystem Is the Shared Bus

Both systems already converge on the filesystem:

```
Agent Teams agents ──write──► board.md, entries/, tasks.md
Sprint Dashboard   ──reads──► board.md, entries/, tasks.md (30s poll)
Human (PostBar)    ──writes─► board.md ──► agents read via /resume
```

No API bridge, no WebSocket needed. The filesystem IS the integration layer.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│  TERMINAL (Agent Teams)          WEB (Sprint Dashboard) │
│                                                         │
│  Team Lead ◄──── Shift+Down ───► /sprint/v7             │
│    │                                  │                 │
│    ├─ Dev agent ──── writes ────► board.md ──► Blackboard│
│    ├─ Test agent ─── writes ────► entries/ ──► Stream    │
│    └─ PM agent ───── writes ────► tasks.md ──► Tasks     │
│                                                         │
│  Filesystem is the shared bus                           │
│                                                         │
│  Agent posts to blackboard ──► 30s auto-refresh ──► UI  │
│  Human posts via PostBar ──► board.md ──► /resume reads │
└─────────────────────────────────────────────────────────┘
```

### Capability Mapping

| Capability | Agent Teams (Terminal) | Sprint Dashboard (Web) |
|---|---|---|
| Task execution | Agents pick up tasks, write code | Visual progress tracking, expandable details |
| Communication | Direct messaging between agents | BlackboardPostBar with intent classification |
| Shared knowledge | None (gap!) | Blackboard with sections (blockers, decisions, findings) |
| Context recovery | None (gap!) | `/resume` reads board.md + recent entries |
| Human steering | Shift+Down to cycle agents | Post bar with `steer` intent → Directives |
| Status visibility | `tmux` split panes | Agent Status section in Blackboard tab |
| Decision making | Agent asks team lead | ResolvePanel → Generate ADR / Add Task / Close |

### Three Recommended Integrations

#### 1. Agent Teams hooks → auto-update board.md Agent Status

Currently, Agent Status entries like `Dev (v7, T01)` are manually posted. With Agent Teams, add a hook that updates `## Agent Status` in `board.md` whenever an agent claims or completes a task:

```bash
# .claude/hooks/on-task-claim.sh
sed -i '' "s/^- $AGENT_NAME.*$/- $AGENT_NAME ($SPRINT, $TASK_ID) — active since $(date +%H:%M)/" \
  docs/internal/blackboard/board.md
```

The dashboard's 30-second refresh picks this up. No new API needed.

#### 2. /dev skill → Agent Teams aware

Make the existing `/dev` skill work as an Agent Teams teammate:

```markdown
# In .claude/agents/dev.md
---
name: dev
description: Implements sprint tasks with TDD
model: opus
tools: [Bash, Read, Edit, Write, Glob, Grep]
---

Before starting a task:
1. Read docs/internal/blackboard/board.md for blockers/directives
2. Check tasks.md for unclaimed tasks
3. Write your claim to board.md Agent Status section
4. After completing, post a finding entry to entries/
```

This replaces the manual `/post` step — the agent self-documents.

#### 3. PostBar `spawn` intent → creates Agent Teams task

The BlackboardPostBar classifies `spawn` intent as "add to backlog." Wire it to also write to Agent Teams task list so an idle teammate can pick it up:

```typescript
// In /api/blackboard/post route handler
if (intent === 'spawn') {
  await appendToBoard(content)  // existing
  await fs.writeFile(           // new
    path.join(tasksDir, `${Date.now()}.md`),
    `# ${content}\nPriority: normal\nStatus: pending\n`
  )
}
```

### What NOT to Build

- **WebSocket bridge** between Agent Teams and dashboard — filesystem polling at 30s is fine for a dev tool
- **Agent chat UI in browser** — terminal handles agent interaction; dashboard is for monitoring and steering
- **Duplicate task systems** — `tasks.md` is the single source; both systems read/write it

### Practical Workflow

```
Morning:
  1. Open /sprint/v7 in browser — scan Blackboard for overnight context
  2. Start Agent Teams: claude --team sprint-v7
  3. Team lead reads board.md, assigns tasks to Dev/Test agents

During sprint:
  4. Agents write findings/blockers to board.md as they work
  5. Dashboard auto-refreshes — progress visible in browser
  6. Post "steer" directive from PostBar → agents pick up on /resume
  7. Flag a decision from PostBar → ResolvePanel generates ADR

End of block:
  8. /checkpoint from terminal → writes summary entry
  9. Dashboard Stream tab shows checkpoint with decisions made
```

### Open Questions for Other Agents

- How should agent name persistence work across terminal restarts? (Agent Teams loses state on exit)
- Should `.claude/agents/*.md` definitions include which blackboard sections to watch?
- Is 30s polling sufficient, or should we add filesystem watchers for faster dashboard updates during active sprints?
- How to handle write conflicts when two agents update `board.md` simultaneously?

---

## Section: Blackboard as Shared Memory + Dedicated Blackboard Agent

**Author**: Claude Sonnet 4.6 (main terminal, conversation session)
**Date**: 2026-02-20
**Context**: Extended conversation with Balaji about blackboard IA, intent classification, Agent Teams architecture, and a proposed dedicated blackboard agent in a second terminal.

### Core Clarification: Blackboard ≠ Supervisor

The Team Lead (supervisor) and the Blackboard (shared memory) are distinct:

```
┌─────────────────────────────────────────────────────────┐
│              board.md (the blackboard)                   │
│         Shared persistent memory — survives restarts     │
└──────────────────────────┬──────────────────────────────┘
                           │ reads + writes
          ┌────────────────┼──────────────────┐
          │                │                  │
  ┌───────▼──────┐  ┌──────▼──────┐  ┌───────▼───────┐
  │  Team Lead   │  │  Dev Agent  │  │  Test Agent   │
  │(Orchestrator)│  │             │  │               │
  └──────────────┘  └─────────────┘  └───────────────┘
          │
  ┌───────▼────────────────────────┐
  │  Humans (sprint post bar)      │
  │  Balaji → Human:Balaji         │
  │  Dev    → Human:Dev            │
  └────────────────────────────────┘
```

The Team Lead reads the board to coordinate. It does not replace the board. The board persists when the team is torn down — the Team Lead does not.

### Blackboard IA Changes Made (this session)

The blackboard sections were restructured from a flat activity log into semantically distinct sections:

| Section | Purpose | Written by |
|---|---|---|
| Active Blockers | Things blocking progress right now | Any agent or human |
| Open Decisions | Unresolved forks requiring judgment | Any agent or human |
| Directives | Active constraints on what to focus/avoid | Steer intent, Team Lead |
| Findings | Persistent discovered facts | Context intent, agents |
| Agent Status | Who is doing what right now | Agents via hooks |
| Activity | Event log (ephemeral) | Hooks, milestones |
| Resolved | Closed decisions with outcome | ResolvePanel |

Old "Queued" section removed — spawn/claim intents now route to `backlog.md ## Inbox`. Blackboard is current state, not a task queue.

### Intent Classification (6 intents)

The BlackboardPostBar classifies every post using the top-tier model (Claude Opus 4.6):

| Intent | Routes to | Example |
|---|---|---|
| `context` | Findings | "The client is on Azure gov cloud" |
| `steer` | Directives | "Skip mobile layout for now" |
| `spawn` | backlog.md ## Inbox | "Someone should add rate limiting" |
| `claim` | backlog.md ## Inbox | "I'll handle the auth rewrite" |
| `flag` | Open Decisions | "Should we use Redis or Postgres?" |
| `query` | Inline answer (no write) | "What are the current blockers?" |

`query` intent answers inline from board state — nothing is written to the board.

### New: Dedicated Blackboard Agent (Proposed)

**Problem with current approach**: The post bar makes a stateless HTTP call. The classifier has no board context when it classifies — it can't detect duplicates, spot conflicts, or answer queries against live state.

**Proposed**: A Claude agent running in a dedicated terminal (Terminal 2), purely for blackboard interaction. The user types `/post "..."` and the agent:

1. Reads current `board.md` before classifying
2. Classifies using the 6-intent taxonomy (in its system prompt)
3. Routes to the correct section with full context awareness
4. Answers `query` intents inline without writing
5. Can ask back if genuinely ambiguous

```
Terminal 1 (work)                Terminal 2 (blackboard agent)
─────────────────                ──────────────────────────────
$ claude                         $ claude --agent blackboard
> working on HITL...             > Ready. Board loaded.
                                 > 2 open decisions, 0 blockers.

/post "we need to understand
HITL patterns more"              → Classified: finding → Findings
                                 → Written with Human:Balaji attribution
                                 → board.md updated ✓

/post "what are the blockers?"   → Query (no write)
                                 → "One blocker: auth token refresh
                                    on 401. Assigned to DevAgent."
```

**Why this is better than the API approach**:
- Reads board before classifying (context-aware, avoids duplicates)
- Can handle ambiguous posts conversationally
- Query answers use live board state
- No separate model call — Claude is already doing the work
- Attribution (`Human:Balaji`, `Human:Dev`) set once in agent config

### Named Attribution Pattern

The `role` field in `/api/blackboard/post` already handles attribution. Extend to support structured names:

```
Human:Balaji    — user posts via terminal or post bar
Human:Dev       — developer posts via terminal or post bar
DevAgent        — dev agent writing findings
TestAgent       — test agent writing findings
OrchestratorAgent — Team Lead writing directives/assignments
```

Board entries become self-documenting:
```
- **DevAgent** — auth token not refreshed on 401 — feb 20 3pm
- **TestAgent** — reproduced on staging, not local — feb 20 3:10pm
- **Human:Balaji** — this happened in v6, check JWT middleware — feb 20 3:15pm
- **Human:Dev** — I'll pick this up — feb 20 3:20pm
```

### The CLAUDE.md Integration Point

All teammates automatically load `CLAUDE.md`. This is the zero-friction integration:

```markdown
## Blackboard (Sprint Context)
Before starting any task, read docs/internal/blackboard/board.md.
Pay attention to:
- ## Directives (active constraints — follow these)
- ## Active Blockers (don't duplicate blocked work)
- ## Open Decisions (may affect your approach)
Post significant findings to docs/internal/blackboard/entries/
with your agent name as role attribution.
```

Every spawned teammate — Dev, Test, Orchestrator — gets this automatically. No extra wiring.

### Hooks for Automatic Board Updates

Two hooks cover automatic attribution:

- `TeammateIdle` → fires when teammate finishes → write to Agent Status
- `TaskCompleted` → fires when task completes → write to Activity

This means agents don't have to manually post their status — the hooks do it. The board stays current without agent discipline.

### Open Questions (adding to prior agent's list)

- Should the dedicated blackboard agent be an Agent Teams teammate (always running) or a standalone claude session?
- The `query` intent currently returns an inline answer in the web post bar — does the terminal blackboard agent replace this or complement it?
- How do we handle the case where two agents write to the same section simultaneously? (File locking? Append-only entries/ directory is safer than direct board.md edits)
- Should `principles.md` (durable beliefs) also be loaded by all agents via CLAUDE.md?

---

## Section: Cross-Agent Review + Tension Resolution

**Author**: Claude Opus (main terminal)
**Date**: 2026-02-20
**Context**: Review of Sonnet agent's Section 2 for alignment and conflicts with Section 1.

### Alignment Confirmed

Both sections independently converge on:
- Filesystem as shared bus (no API bridge)
- CLAUDE.md as agent onboarding mechanism
- Hooks for automatic status updates
- Named attribution for board entries

### Tension: Task Routing for `spawn` Intent

**Section 1** (Opus) proposes: spawn → write to `~/.claude/tasks/{team}/` (Agent Teams task list)
**Section 2** (Sonnet) proposes: spawn → write to `backlog.md ## Inbox`

**Resolution**: Sonnet is correct. `backlog.md` should be the single task queue. Agent Teams should read from `backlog.md`, not maintain a separate `~/.claude/tasks/` directory. Two task queues = drift. The CLAUDE.md instruction for teammates should include:

```markdown
## Task Picking
Check docs/internal/backlog.md ## Inbox for unclaimed work.
When you claim a task, move it from Inbox to In Progress with your agent name.
```

Section 1's integration #3 (PostBar spawn → Agent Teams task file) is **superseded** by this approach.

### Adopted from Section 2

These ideas from the Sonnet agent should be considered canonical:

1. **Blackboard ≠ Supervisor** — The board persists across team teardowns. The Team Lead does not. This is the key architectural invariant.
2. **Dedicated Blackboard Agent** — Stateful classification beats the stateless API. Terminal 2 running `claude --agent blackboard` is the right pattern.
3. **Queued → backlog.md migration** — Blackboard is current state only. Task queuing belongs in `backlog.md ## Inbox`.

### Remaining Open Questions (consolidated)

From both sections — updated after Section 4 (Final Architecture Decisions):

1. **Write conflicts**: Two agents editing `board.md` simultaneously. Best answer so far: append-only `entries/` directory for findings/activity (no conflict), direct board.md edits only for structured sections (Agent Status, Blockers) which change infrequently. **Still open — needs a concrete locking strategy or convention.**
2. ~~**Blackboard agent topology**~~: **RESOLVED** by Decision 1 + Decision 4. Standalone Terminal 2 session (`claude --agent blackboard`), not an Agent Teams teammate. CLAUDE.md loads automatically for any `claude` session in the repo, so the "teammate gets auto CLAUDE.md" concern is moot.
3. **30s polling vs filesystem watcher**: 30s is fine for monitoring. If real-time matters (e.g., blocker posted mid-task), agents should read board.md at task boundaries anyway per CLAUDE.md instructions. **Still open — low priority, 30s likely sufficient.**
4. **Agent name persistence**: Agent Teams loses state on exit. The board survives. On restart, agents re-read board.md Agent Status section to see what was in progress — this is the context recovery mechanism. **Still open — needs testing with actual Agent Teams.**

---

## Section: Third Option — Blackboard as Coordination Layer

**Author**: Claude Sonnet 4.6 (main terminal)
**Date**: 2026-02-20
**Context**: Balaji asked whether agent debate (the main Agent Teams advantage) can happen through board.md itself, and whether agents can be steered to coordinate via the board.

### The Missing Column in Anthropic's Comparison Chart

Anthropic's chart compares two options. We're building a third:

| | Subagents | Agent Teams | **Blackboard (ours)** |
|---|---|---|---|
| **Context** | Own context; results return to caller | Own context; fully independent | Own context; all read board.md on start |
| **Communication** | Report to main agent only | Teammates message each other directly | All agents write/read board.md (async broadcast) |
| **Coordination** | Main agent manages all work | Shared task list, self-coordination | backlog.md ## Inbox + board.md Directives |
| **Best for** | Focused tasks, result only matters | Complex work needing real-time discussion | **Persistent work across sessions, humans + agents** |
| **Token cost** | Lower | Higher (each teammate = live Claude instance) | **Lowest** — agents spin up, read board, work, write back, done |

### Agent Debate via board.md

The one capability Agent Teams has that ours "lacks" — agents debating competing hypotheses — works through the board. Findings, Open Decisions, and Directives are the debate channels:

```
T=0:   DevAgent posts to Findings:
         "auth failure is a token expiry issue"

T+5m:  TestAgent reads board, disagrees, posts to Findings:
         "reproduced without expired tokens — not expiry"

T+10m: Human:Balaji posts to Directives:
         "DevAgent: re-examine with TestAgent's finding in mind"

T+15m: DevAgent reads board, posts updated Finding:
         "TestAgent correct — it's middleware order not expiry"
       DevAgent posts to Open Decisions:
         "Which fix: reorder middleware (A) or new layer (B)?"
```

That is a debate. Async, written, with a permanent record.

### Steering Agents to Coordinate

Directives are the coordination channel. Any human or orchestrator can post:

```
- DevAgent: challenge the finding in Findings #3 before implementing
- TestAgent: verify DevAgent's latest finding independently
- All: read board before starting next task — new directive posted
```

Agents read at task boundaries (per CLAUDE.md instruction). The steering reaches them on their next read cycle — typically minutes, not milliseconds.

### The Real Tradeoff

Agent Teams debate: **seconds** (live in-process messaging)
Board debate: **minutes** (periodic reads at task boundaries)

For sprint work, minutes is fine. The async model has a hidden benefit: agents write deliberate, structured arguments rather than rapid-fire messages. Decision quality is often better.

The flag buys **speed of debate**. The board buys **permanent record of it**.

### Why We Don't Need the Flag

- No persistent live Claude instances — lower token cost
- Shared state survives session restarts (the flag's state does not)
- Humans participate on equal footing — just post to the board
- Works in any terminal, any machine, any git clone
- The only thing lost: sub-second agent-to-agent ping time

If a task genuinely needs real-time adversarial debate (parallel security research, competing hypothesis investigation), the flag can be layered on top. The board remains the persistent knowledge layer underneath.

---

## Section: Final Architecture Decisions (Human-confirmed)

**Author**: Claude Sonnet 4.6 (main terminal)
**Date**: 2026-02-20
**Context**: Balaji confirmed final decisions on terminal vs web split, model dependency, and open-source strategy.

### Decision 1: Terminal owns posting, Web owns UI

**Resolved.**

```
Terminal 2 (blackboard agent)     Web (/sprint/[version])
──────────────────────────────    ─────────────────────────
Freeform chat + AI discussion     Read-only board view
Post findings, blockers, flags    Resolve decisions (Save as ADR)
Intent classification (Claude)    Handle escalations
Query board state                 Add as Task
                                  Close decision with remark
                                  Stream / ADRs / PRD / Tasks tabs
```

Web has zero AI calls for posting. All intelligence is in the terminal agent using the user's own Claude Code session. No API keys embedded in the repo.

This resolves the "terminal agent vs web post bar" open question from Section 2. **Web post bar is removed.**

### Decision 2: Web is zero-model-dependency

**Resolved.**

The ResolvePanel's "Generate ADR" button was already AI-free — it takes the user's typed resolution and formats it into a template ADR file. The label was misleading. Renamed to "Save as ADR".

All three web resolve actions (Save as ADR / Add as Task / Close) require no AI calls. The web dashboard is now:
- Zero model dependency
- Works for anyone who clones the repo, regardless of AI provider
- Reads and writes markdown files only

### Decision 3: principles.md loaded through CLAUDE.md

**Resolved.**

`docs/internal/principles.md` (durable product/engineering/process beliefs) is referenced in `../../CLAUDE.md` so all Claude Code sessions — and all Agent Teams teammates — load it automatically. It is not part of the blackboard (which is current state only). Principles are stable, the board is ephemeral.

### Decision 4: Open-source strategy drives model independence

**Context**: This workflow (blackboard + sprint dashboard + agent definitions) will be published as a GitHub repo for others to use.

**Implications**:
- No hardcoded API keys or model names in web routes
- Classification logic lives in the terminal agent's system prompt (`.claude/agents/blackboard.md`), not in a web API route
- `docs/internal/blackboard/` is plain markdown — no dependencies
- `app/sprint/` reads files only — works with any editor or CI that writes to the same paths
- The only requirement to run the full workflow: Claude Code CLI

### Codebase Changes Made

| Change | File | Reason |
|---|---|---|
| Removed | `app/api/blackboard/classify/route.ts` | Moved to terminal agent |
| Removed | `BlackboardPostBar` component | Terminal agent replaces it |
| Fixed | `app/api/blackboard/resolve/route.ts` | `task` action was writing to `## Queued`; updated to `backlog.md ## Inbox` |
| Renamed | ResolvePanel "Generate ADR" → "Save as ADR" | Was never AI-generated |
| Added | `../../CLAUDE.md` | Reference to `docs/internal/principles.md` |
| ~~To build~~ Superseded | ~~`.claude/agents/blackboard.md`~~ | Main agent handles board posts inline — no dedicated blackboard agent needed |
| To build | `.claude/agents/dev.md` | Ephemeral subagent persona for implementation tasks |
| To build | `.claude/agents/researcher.md` | Ephemeral subagent persona for deep research |
| To build | `.claude/agents/tester.md` | Ephemeral subagent persona for test coverage |
| To build | `.claude/agents/reviewer.md` | Ephemeral subagent persona for code review |

---

## Section: Final Topology — 1 Terminal, Ephemeral Subagents

**Author**: Claude Opus (researcher session)
**Date**: 2026-02-20
**Context**: Balaji confirmed: main agent = discussion agent, subagents spawn and end, only 1 terminal.

### The Settled Architecture

```
1 terminal: main Claude session (you + Claude)
    │
    │  ← orchestration, discussion, decision-making, blackboard posts
    │
    ├─ Task(subagent: dev)        → reads board → implements → writes findings → exits
    ├─ Task(subagent: researcher) → reads board → researches → writes findings → exits
    ├─ Task(subagent: tester)     → reads board → tests       → writes findings → exits
    └─ Task(subagent: reviewer)   → reads board → reviews     → writes findings → exits
                                          ▲
                                    board.md is how
                                    all agents share
                                    context across spawns
```

**The main agent never exits.** It is the user's conversational partner and the orchestrator. Subagents are ephemeral — they spawn, do focused work, write back to the board (or return results inline), and die. The board persists everything.

### What This Supersedes

- ~~**Terminal 2 / dedicated blackboard agent**~~ (Section 2): Not needed. The main agent handles blackboard posts inline during conversation. No second terminal.
- ~~**Agent Teams flag**~~ (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`): Not needed. Subagents via the Task tool are sufficient. No persistent teammate instances.

### Role of `.claude/agents/*.md`

These aren't persistent running agents — they're **subagent personas**. When the main agent spawns a Task, it can reference an agent definition as the system prompt for that subagent:

```
.claude/agents/dev.md        → persona for Task(subagent: dev work)
.claude/agents/researcher.md → persona for Task(subagent: research)
.claude/agents/tester.md     → persona for Task(subagent: testing)
```

Each persona definition includes: read board.md on start, do focused work, write findings back, post to blackboard.

### What Each Agent Type Does

| Agent | Spawned when | Reads from board | Writes back |
|---|---|---|---|
| dev | Main agent assigns an implementation task | Directives, Blockers, Open Decisions | Findings, Agent Status |
| researcher | Main agent needs deep research | Directives, existing Findings | Findings (new) |
| tester | Main agent wants test coverage | Tasks, Findings | Findings, Blockers (if failures) |
| reviewer | Main agent wants code review | ADRs, Directives | Findings, Open Decisions |

### The Blackboard Loop

```
You tell main agent: "implement the HITL approval queue"
    ↓
Main agent posts Directive to board: "DevAgent: implement HITL approval queue, T14"
Main agent spawns Task(dev subagent)
    ↓
Dev subagent starts:
  1. Reads board.md (sees Directive, Blockers, Open Decisions)
  2. Reads tasks.md (finds T14 spec)
  3. Implements with TDD
  4. Posts Finding to board: "T14 done, 3 tests passing"
  5. Updates board Agent Status
  6. Exits — returns summary to main agent
    ↓
Main agent reads summary, you see result in conversation
Dashboard auto-refreshes — board now shows T14 Finding
```

### Resolved Questions

| Question | Answer |
|---|---|
| Blackboard agent topology | Main agent handles it inline. No second terminal. |
| Agent Teams flag needed? | No. Task tool subagents are sufficient. |
| How many terminals? | 1. The main conversation terminal. |
| How do agents coordinate? | Through board.md between spawn cycles. |
| What if two subagents run in parallel? | Both write to entries/ (append-only, no conflict). Structured board.md sections only edited by main agent or sequentially. |

---

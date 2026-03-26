# Architecture

> Two subsystems. Filesystem is the API. Skills write, dashboard reads.

---

## System Overview

```
Claude Code terminals          State files                 Dashboard
┌──────────────┐
│ Terminal 1   │──writes──▶  kapi/
│  /dev v1     │             ├── blackboard-live.yaml  ◀──reads──  localhost:8791
├──────────────┤             ├── entries/
│ Terminal 2   │──writes──▶  ├── sprints/v1/
│  /test v1    │             │   ├── tasks.md
├──────────────┤             │   └── prd.md
│ Terminal 3   │──writes──▶  ├── backlog.md
│  /prd v2     │             └── status.md
└──────────────┘
```

**Skills write markdown. The blackboard server manages live state. The dashboard reads both.** They never talk directly — the filesystem and YAML state are the only interface.

---

## Blackboard Server (`blackboard/server.ts`)

Shared singleton process (Bun, port 8790). Owns the source of truth: `kapi/blackboard-live.yaml`.

```
Endpoints:
  POST /register     Agent shims register callback ports
  POST /unregister   Cleanup on exit
  POST /read         Read state (agents, directives, log)
  POST /write        Write + broadcast to all agents
  POST /directive    Post directive (from dashboard UI or human)
  GET  /state        Raw JSON state
  GET  /agents       Debug: registered agents
  POST /sweep        Remove stale agents (last_seen > 10 min)
  WS   /ws           WebSocket for live dashboard updates
```

Key properties:
- In-memory YAML state (single-threaded = race-free)
- Protected roots: `log` and `blackboard` cannot be overwritten directly
- Payload size guard: 512 KB max
- Agent profiles auto-created as `.md` files in `kapi/agents/`

---

## MCP Shim (`blackboard/shim.ts`)

Per-agent MCP stdio proxy. Claude Code spawns one per session.

1. Declares `claude/channel` capability → enables `<channel>` notifications
2. Registers callback port with shared server
3. Proxies two tools to server via HTTP:
   - `read_blackboard(section?)` → POST /read
   - `write_to_blackboard(path, value, log_entry)` → POST /write
4. Listens on callback port for `/notify` from server
5. Translates HTTP → `notifications/claude/channel` over stdio
6. Auto-starts server if not running
7. Auto-starts Next.js dashboard if not running
8. Heartbeat every 5 min

---

## Skills (`.claude/skills/`)

| Skill | What it writes | Generalization |
|-------|---------------|----------------|
| `/prd` | `kapi/sprints/{v}/prd.md` + `tasks.md` | Read layers from config |
| `/dev` | Updates task checkboxes, entries | Already generic |
| `/test` | Build + lint + types → push to dev | Already generic |
| `/post` | Entry files + board sections | Already generic |
| `/preflight` | Pre-sprint readiness check | Read layers from config |
| `/scorecard` | Quality layer audit | Read layers from config |
| `/walkthrough` | Sprint review narrative | Already generic |
| `/review` | Appends review record to `decisions.yaml` | Already generic |
| `/checkpoint` | Session state to blackboard | Universal |
| `/resume` | Restore context from checkpoint | Universal |

### Foundation Gate (baked into `/sprint init`)

Before any sprint, three docs must exist:
1. `docs/foundation/vision.md` — why does this exist?
2. `docs/foundation/market.md` — who is it for?
3. `docs/foundation/spec.md` — what are you building?

Missing → Claude generates via conversation (~15 min). Thin → offers to flesh out. All pass → scaffold sprint structure.

### Scorecard Customization

Scorecard reads user-defined layers from config, not hardcoded layers:

```markdown
# kapi-sprints.config.md

## Layers (what /scorecard audits)
1. API — routes, validation, error handling
2. Auth — session, permissions, tokens
3. UI — components, accessibility
4. Data — models, migrations, queries
5. Tests — coverage, e2e, integration
```

---

## Dashboard (`app/`)

Next.js 16 + React 19 + Tailwind 4. Dark theme (zinc/amber palette).

### Pages

| Route | What it shows | Reads from |
|-------|-------------|------------|
| `/dashboard` | 5-card command center (score, blockers, decisions, findings, directives) + snapshot + milestones | `snapshot.yaml`, `decisions.yaml`, `board.md`, `backlog.md` |
| `/agents` | Live agent cards, directive kanban, activity stream, protocol reference | `blackboard-live.yaml` (via WebSocket) |
| `/agents/[id]` | Agent detail: milestones, learnings, activity tabs | `blackboard-live.yaml` |
| `/decisions` | ADR cards + agent review cards with status badges | `decisions.yaml` |
| `/lessons` | Append-only learnings log rendered as prose | `lessons.md` |
| `/backlog` | Inbox items and queued work | `backlog.md` |
| `/board` | Blackboard view: blockers, decisions, findings, agent status | `board.md` |
| `/sprints/[v]` | Sprint detail: progress bar, task blocks with expand, PRD tab | `sprints/{v}/tasks.md`, `prd.md` |
| `/docs/[...path]` | Markdown + Mermaid rendering of any file in docs/ | Any `.md` file |

### Data Flow

```
Server components read markdown files at request time
  → Parse via lib/parsers/ (tasks.ts, board.ts, scorecard.ts)
  → Render as structured UI

Client components connect to blackboard server
  → WebSocket (ws://localhost:8790/ws) for live agent state
  → useBlackboard() hook for reactive updates
```

### File ↔ Dashboard Contract

| File | Writer | Reader | Format |
|------|--------|--------|--------|
| `tasks.md` | `/prd`, `/dev` | Dashboard | Blocks with `### Block X`, tasks with `- [x]` / `- [ ]` |
| `blackboard-live.yaml` | Server | Dashboard, agents | YAML with agents, directives, log |
| `entries/*.md` | `/post`, `/checkpoint` | Dashboard | YAML frontmatter + markdown body |
| `backlog.md` | `/prd`, `/post` | Dashboard | `## Inbox` and `## Done` sections |
| `status.md` | Various | Dashboard | Demo/gaps/history sections |

**This contract is the API.** The only coupling between writer and reader.

---

## Auto-Invocable Agents (2)

| Agent | Trigger | What it does |
|-------|---------|-------------|
| `arch-reviewer` | `/dev` surfaces architecture decisions | Reviews patterns, suggests ADRs |
| `test-planner` | `/dev` builds new functionality | Plans test coverage, suggests structure |

---

## Why Files + Server (Not Just Files)

v1 was files-only. The blackboard server was added for:

- **Live agent coordination** — agents register, receive broadcasts, coordinate in real-time
- **Directive routing** — target specific agents (`@dev fix auth`)
- **Session independence** — agents can join/leave without restarting the system
- **Dashboard live updates** — WebSocket push instead of polling

The files remain the durable record. The server manages ephemeral coordination state.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun (server, shim) + Node (Next.js) |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 (dark: zinc/amber) |
| State | YAML (live) + Markdown (durable) |
| Protocol | MCP (Model Context Protocol) |
| AI | Optional Gemini integration via shim |
| Diagrams | Mermaid (rendered in docs viewer) |

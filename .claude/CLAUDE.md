# CLAUDE.md — Kapi Sprints

This file tells Claude Code how to work with this repository.

## What This Is

A file-based sprint dashboard for Claude Code teams. The UI reads plain Markdown from `docs/operations/` and renders it as an IDE-like interface.

## Sprint Workflow

```
/prd v2          → Plan sprint (interactive): produces tasks.md + prd.md
/dev v2          → Implement tasks (TDD + Playwright): pick next task, write test, implement, verify
/test v2         → QA gate: build, lint, code review, push check
/post            → Post to blackboard (finding, decision, blocker, etc.)
/walkthrough v2  → Generate sprint review: narrative of what was built
```

## Key Directories

```
docs/operations/
├── blackboard/board.md        ← Shared coordination state (read on every page load)
├── blackboard/entries/        ← One file per finding/decision/milestone (frontmatter + body)
├── sprints/v1/tasks.md        ← Task list with checkboxes
├── sprints/v1/prd.md          ← Sprint goals and task breakdown
├── backlog.md                 ← Unscheduled ideas (## Inbox section)
├── scorecard.md               ← Platform health %
└── status.md                  ← Demo-safe features, known gaps, history

app/[version]/page.tsx         ← Server component: reads all .md files
app/[version]/_components/     ← DevDashboard.tsx + RightPanel.tsx
project.config.ts              ← Project name, initials, description
```

## Blackboard Posting

**Never write raw markdown to `board.md` directly.** Use `/post` from the terminal — Claude Code handles classification, entry file creation, and board.md update.

```bash
/post finding "parser ignores entries with no title"
/post blocker "need PM sign-off on queue layout"
/post decision "SQLite vs Postgres for local dev?"
/post available "Dev ready for v2 T03"
/post handoff "Test — Dev done with T07, needs e2e coverage"
/post queue "add stale signal detection to right panel"
```

This applies to **both humans and agents**. Agents invoke `/post` programmatically during `/dev`, `/test`, etc. Humans type it in the terminal. Same protocol, same format, same entry files.

Entry files land in `docs/operations/blackboard/entries/` with frontmatter:
```yaml
---
type: finding | decision | blocker | steer | available | handoff | queued
role: Human:Balaji | Dev | PM | Test
timestamp: feb 24 10am
title: Short title
---
```

## Task Format

```markdown
- [ ] **T01: Task title** (S)
  What: What it does
  Files: path/to/file.ts
  Logic:
    key implementation detail
  Test: How to verify
```

Sizes: S = ~15 min, M = ~30 min

## Design Principles

1. **Backwards Build** — Start from done, work backwards. Every intermediate state is deployable.
2. **Blackboard** — Single source of truth for sprint state. If it matters, it goes on the board.
3. **TDD** — Test first, always. No task done without a passing test.
4. **Small sprints** — 3 hours max. If it takes longer, the planning was wrong.
5. **No clever code** — Boring, obvious, well-named code wins.

## Live Blackboard Channel

The repo includes a blackboard server + MCP shim in `blackboard/`. These enable real-time multi-agent coordination via Claude Code channels.

### How it connects

- **`.mcp.json`** at repo root configures `blackboard-channel` pointing to `blackboard/shim.ts`
- The shim auto-starts `blackboard/server.ts` on port 8790 and the Next.js dashboard on port 8791 if not already running
- Every Claude Code session gets `read_blackboard` and `write_to_blackboard` tools
- Writes broadcast to ALL connected agents via `<channel>` notifications

### Agent protocol

On startup:
1. `read_blackboard` to see current state
2. `write_to_blackboard` to register under `agents.<your_name>` with role, status, capabilities
3. Check `directives:` for assigned work

On `<channel>` notification:
1. `read_blackboard` to see what changed
2. Check directives for tasks assigned to you
3. Do the work
4. `write_to_blackboard` to update your status and log results

Rules:
- Only write to your own section under `agents.<your_name>`
- Never modify another agent's section
- Always add a `log_entry` when writing
- Read before writing to avoid stale state

### Global install (optional)

To use the blackboard from any project directory:

```bash
claude mcp add --scope user blackboard-channel -- bun /path/to/kapi-sprints/blackboard/shim.ts
```

### Dashboard

The Next.js dashboard at `localhost:8791` connects via WebSocket (`ws://localhost:8790/ws`) for live updates. The status bar shows connection state — green "live" when connected, gray "polling" when falling back to SSR.

## Development

```bash
npm run dev    # localhost:8791 (port 8791 to avoid conflicts)
npm run build  # must pass before every push
```

Note: The shim auto-starts both the blackboard server (:8790) and the dashboard (:8791) when Claude Code launches. You rarely need to run `npm run dev` manually.

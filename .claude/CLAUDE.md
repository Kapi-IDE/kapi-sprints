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

Always post to the blackboard for:
- Findings that change direction
- Architectural decisions
- Blockers
- Agent status updates

Format for `board.md` entries:
```
- **Short title** — details → `entries/filename.md`
```

Entry files (`entries/*.md`) frontmatter:
```yaml
---
type: finding | decision | milestone | blocker | queued | steer
role: Dev | PM | Test | Human:Name
timestamp: jan 15 10am
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

## Development

```bash
npm run dev    # localhost:3000
npm run build  # must pass before every push
```

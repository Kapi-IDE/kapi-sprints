# Kapi Sprints — Dev Dashboard

> **A sprint dashboard for Claude Code teams.**
> Built around Backwards Build and Blackboard coordination patterns.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)

---

## What is this?

Kapi Sprints is an open-source, file-based sprint dashboard that lives alongside your code. It reads plain Markdown files from `docs/operations/` and renders them as an IDE-like interface with:

- **Blackboard** — shared coordination space for humans and AI agents (blockers, decisions, findings, directives)
- **Sprint stages** — Plan → Build → QA → Review → Done with a 3-hour countdown timer
- **Task tracking** — Checkbox tasks organized into blocks, persisted back to `tasks.md`
- **Team view** — AI agent status + human activity parsed from blackboard entries
- **Stream** — filterable timeline of all decisions, findings, milestones, and blockers
- **Backlog** — inbox of ideas that can be promoted to blockers

No database. No SaaS. Everything is a `.md` file in your repo.

---

## Design Philosophy

### Backwards Build

Every sprint starts from the desired end state, not the first task. Ask *"What does done look like?"* then work backwards. Every intermediate state is deployable.

### Blackboard

Inspired by blackboard systems in multi-agent AI. The `board.md` file is the single source of truth for sprint state — all agents and humans post findings, decisions, and status here. The UI reads it on every page load.

### Claude Code Native

Designed to be used with [Claude Code](https://claude.ai/claude-code) slash commands:
- `/prd v2` — plan a sprint interactively, produces `tasks.md`
- `/dev v2` — implement tasks with TDD + Playwright screenshots
- `/test v2` — run the QA gate
- `/post` — post to the blackboard without leaving your terminal
- `/walkthrough v2` — generate a sprint review narrative

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/Kapi-IDE/kapi-sprints.git
cd kapi-sprints

# 2. Install
npm install

# 3. Configure your project
# Edit project.config.ts — change name, short initials, description

# 4. Start dev server
npm run dev
# → http://localhost:3000 (redirects to /v1)
```

---

## File Structure

```
docs/operations/
├── blackboard/
│   ├── board.md          ← Edit this to update the blackboard
│   └── entries/          ← One .md file per finding/decision/milestone
├── sprints/
│   ├── v1/
│   │   ├── tasks.md      ← Task list (checkboxes persist on click)
│   │   ├── prd.md        ← Sprint goals and acceptance criteria
│   │   ├── preflight.md  ← Pre-sprint health check output
│   │   ├── code-review.md ← QA gate output
│   │   └── review.md     ← Sprint walkthrough narrative
│   └── v2/               ← Empty dir = "upcoming" sprint
├── backlog.md            ← Inbox of unscheduled ideas
├── scorecard.md          ← Platform health percentages
└── status.md             ← What's safe to demo, known gaps, history
```

---

## Blackboard Format

`docs/operations/blackboard/board.md` uses these section headers:

```markdown
## Active Blockers
## Open Decisions
## Directives
## Findings
## Agent Status
## Activity
## Resolved
```

Items are bullet points. The UI parses them and renders live status indicators.

**Entry files** (`entries/*.md`) use frontmatter:

```markdown
---
type: finding | decision | milestone | blocker | queued | steer
role: Dev | PM | Test | Human:YourName
timestamp: jan 15 10am
---

# Title here

Body content here.
```

---

## Task Format

Tasks in `tasks.md` follow this format:

```markdown
## Block A: Name

- [ ] **T01: Task title** (S)
  What: What this task does
  Files: path/to/file.ts, another/file.ts
  Logic:
    pseudocode or key implementation details
  Test: How to verify this works
  Depends: T00 (optional)
```

Sizes: `S` = ~15 min, `M` = ~30 min. Checkboxes toggle via the UI and persist back to `tasks.md`.

---

## Configuration

Edit `project.config.ts`:

```typescript
export const PROJECT = {
  name: 'My Project',     // Shown in sidebar and title bar
  short: 'mp',            // 2-letter initials for the logo badge
  description: '...',     // One-line description
  repo: 'https://...',    // Your repository URL
}
```

---

## API Routes

Three write endpoints (all write to local `.md` files):

| Route | Method | Description |
|-------|--------|-------------|
| `/api/sprint/[version]/toggle` | POST | Toggle a task checkbox in `tasks.md` |
| `/api/blackboard/resolve` | POST | Move a decision from Open to Resolved |
| `/api/backlog/promote` | POST | Promote a backlog item to Active Blocker |

---

## Contributing

Contributions welcome. Apache 2.0 licensed.

```bash
# Fork → clone → branch
git checkout -b feat/your-feature

# Make changes, test locally
npm run dev
npm run build  # must pass

# Submit PR
```

Please read `docs/guides/principles.md` before contributing — the design philosophy shapes all decisions.

---

## Roadmap

- [ ] Claude Code plugin integration (read terminal status live)
- [ ] Configurable sprint duration
- [ ] Dark/light theme toggle
- [ ] Multiple project support
- [ ] Webhook to post blackboard entries from external tools

---

## License

Apache 2.0 — see [LICENSE](LICENSE)

Built by [Kapi IDE](https://github.com/Kapi-IDE) · Inspired by [Claude Code](https://claude.ai/claude-code)

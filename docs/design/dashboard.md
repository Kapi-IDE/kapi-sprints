# Dashboard Architecture

> Next.js app. Separate process. Watches markdown files via chokidar.

---

## Overview

The dashboard is the existing Next.js app in this repo (`/app`), extracted and packaged as an npx-runnable CLI tool.

**User experience:**
```bash
# In a separate terminal (not Claude Code)
npx kapi-sprints dashboard

# Or after npm install
kapi-sprints dashboard
```

Opens `localhost:3838`. Auto-discovers project structure from `kapi-sprints.config.md` in the current directory.

---

## Sidebar Structure

Blackboard is home. Sprints are where you execute.

```
CURRENT SPRINT
  ● v8                    ← one click, always visible
    Plan · Build · QA · Review · Done

──────────────────

BLACKBOARD               ← second item, not buried
  Board                   ← live view (the default landing)
  Stream (11)             ← chronological feed
  Checkpoints             ← session history

──────────────────

WORKSPACE
  Backlog
  ADRs (1)
  Status

──────────────────

▸ PAST SPRINTS            ← collapsed by default
    ✓ v7  ✓ v6  ✓ v5

▸ UPCOMING                ← collapsed
    ○ v9 (draft)
```

**Default landing:** Blackboard (full view) → "Where was I, what's happening, what needs me" → Click sprint to execute.

---

## Right Panel: Blackboard Summary

Always visible when viewing a sprint:

```
BLACKBOARD
──────────
⚠ BLOCKERS
  • API rate limit issue (#34)

⏳ WAITING ON YOU
  • Review PR for auth module

📋 OPEN DECISIONS
  • Redis vs Postgres for sessions?

🖥 TERMINALS
  • T1: /dev v8 (active)
  • T2: /test v8 (idle)

💡 QUEUED
  • Refactor error handling
```

---

## Route Structure

```
app/
├── page.tsx                         # Blackboard (default landing)
├── sprint/[version]/
│   ├── page.tsx                     # Sprint overview (progress bar, timer)
│   ├── build/page.tsx               # Tasks view with blocks
│   ├── qa/page.tsx                  # Test results
│   └── review/page.tsx              # Walkthrough results
├── blackboard/
│   ├── page.tsx                     # Full blackboard view
│   ├── stream/page.tsx              # Chronological feed
│   └── checkpoints/page.tsx         # Session history
├── backlog/page.tsx
└── adrs/page.tsx
```

---

## Data Layer

### Parsers (`lib/parsers/`)

Each parser reads a specific markdown format and returns structured data:

| Parser | Input | Output |
|--------|-------|--------|
| `tasks.ts` | `sprints/v1/tasks.md` | `{ blocks: Block[], progress: number, total: number }` |
| `board.ts` | `blackboard/board.md` | `{ blockers: Item[], decisions: Item[], queued: Item[] }` |
| `scorecard.ts` | `sprints/v1/scorecard.md` | `{ layers: Layer[], grade: string }` |
| `checkpoint.ts` | `blackboard/entries/*.md` | `{ entries: CheckpointEntry[] }` |
| `stream.ts` | `blackboard/stream.md` | `{ events: StreamEvent[] }` |

### File Watcher (`lib/watcher.ts`)

```typescript
// Pseudocode
const watcher = chokidar.watch([
  'docs/operations/sprints/*/tasks.md',
  'docs/operations/sprints/*/scorecard.md',
  'docs/operations/blackboard/board.md',
  'docs/operations/blackboard/stream.md',
  'docs/operations/blackboard/entries/*.md'
]);

watcher.on('change', (path) => {
  const data = parse(path);
  wsServer.broadcast({ type: 'update', path, data });
});
```

### WebSocket Server

Embedded in the Next.js API route or custom server. Pushes file change events to all connected browser tabs.

---

## UI Components (Extracted from Kapi Dashboard)

Key components to extract from the existing `app/[version]/` implementation:

| Component | What it renders |
|-----------|----------------|
| `SprintProgressBar` | Progress bar + timer at top |
| `TaskBlock` | Collapsed block with letter badge (A, B, C...) |
| `TaskItem` | Individual task with checkbox |
| `PhaseTabs` | Build / QA / Review tabs with counts |
| `BlackboardPanel` | Right panel with blockers, decisions, queued |
| `SidebarNav` | Full sidebar with sprint/blackboard/workspace sections |

---

## CLI Entry Point

`bin/cli.js`:

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const command = process.argv[2];

if (command === 'dashboard') {
  const port = process.argv[3] || 3838;
  
  // Check for kapi-sprints.config.md in cwd
  const configPath = path.join(process.cwd(), 'kapi-sprints.config.md');
  if (!fs.existsSync(configPath)) {
    console.log('⚠ No kapi-sprints.config.md found.');
    console.log('  Run /sprint init in Claude Code first.');
    process.exit(1);
  }
  
  console.log(`🚀 Kapi Sprints dashboard starting on http://localhost:${port}`);
  // Start Next.js dev server pointing at cwd for file watching
  // ...
}
```

`package.json` additions:

```json
{
  "name": "kapi-sprints",
  "bin": {
    "kapi-sprints": "./bin/cli.js"
  }
}
```

---

## Dashboard ↔ Plugin Contract

The dashboard and plugin never communicate directly. They share a contract through markdown file formats:

| File | Writer | Reader | Format contract |
|------|--------|--------|-----------------|
| `tasks.md` | `/prd`, `/dev` | Dashboard | Blocks with `### Block X: Title`, tasks with `- [x]` / `- [ ]` |
| `board.md` | `/post` | Dashboard | Sections: `## Blockers`, `## Decisions`, `## Queued` |
| `scorecard.md` | `/scorecard` | Dashboard | Layer grades in table format |
| `entries/*.md` | `/checkpoint` | Dashboard | YAML frontmatter + markdown body |
| `stream.md` | Various skills | Dashboard | Timestamped entries, newest first |

**This contract is the API.** Document it carefully — it's the only coupling between packages.

---

*See [architecture.md](architecture.md) for the monorepo overview.*

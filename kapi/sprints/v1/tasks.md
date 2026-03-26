# Sprint v1 Tasks

## Block A: Fix Pipeline + Polish

- [x] **T01: Fix directive pipeline** (M)
  What: Directives posted from the dashboard/agents page don't reach target agents
  Files: blackboard/server.ts, blackboard/shim.ts, app/agents/page.tsx
  Logic:
    diagnose why directives aren't delivered — check POST /directive endpoint
    verify broadcast/notify logic in server.ts targets correct callback ports
    verify shim forwards notifications to Claude Code channel
    test: post directive from dashboard, confirm agent receives <channel> notification
  Test: Post a directive targeting a specific agent, verify it appears in their channel

- [x] **T02: Fix get-started page** (S)
  What: Replace non-existent commands and wrong paths with real ones
  Files: app/get-started/page.tsx
  Logic:
    replace `/sprint init` references with `/preflight` + `/prd` sequence
    replace `npx kapi-sprints dashboard` with `npm run dev`
    replace `docs/operations/sprints/v1/` with `kapi/sprints/v1/`
    replace `docs/operations/blackboard/` with `kapi/`
    replace `kapi-sprints.config.md` with `project.config.ts`
  Test: Every command and path on the page exists and works

- [x] **T03: Page title consistency** (S)
  What: Backlog page and any others missing distinct titles
  Files: app/backlog/page.tsx
  Logic:
    add `export const metadata` with title "Backlog · Kapi Sprints"
    scan other pages for missing titles
  Test: Each page shows a distinct title in the browser tab

- [x] **T04: Verify snapshot.yaml → dashboard wiring** (S)
  What: Confirm the /dashboard page reads and renders snapshot.yaml
  Files: app/dashboard/page.tsx, app/dashboard/DashboardView.tsx, kapi/snapshot.yaml
  Logic:
    load /dashboard in browser, confirm status panel shows snapshot headline + text
    confirm milestones panel shows entries from snapshot.yaml
    if not rendering, debug the data flow from page.tsx → DashboardView props
  Test: Dashboard shows snapshot status text and milestones

## Block B: Decisions System

- [x] **T05: Create kapi/decisions.yaml + update resolve API** (M)
  What: Single YAML file for ADRs and agent reviews, update API to write to it
  Files: kapi/decisions.yaml, app/api/blackboard/resolve/route.ts, docs/adr.md
  Logic:
    create kapi/decisions.yaml with schema header and seed ADR:
      ADR-001: "Use file-based blackboard over message bus"
    update /api/blackboard/resolve action='adr' to append to decisions.yaml instead of writing entry .md files
    delete docs/adr.md (replaced by decisions.yaml)
    use yaml package to parse/stringify safely
  Depends: none
  Test: Resolve an Open Decision as ADR from dashboard, verify it appends to decisions.yaml

- [x] **T06: Build /decisions page** (M)
  What: New page that parses kapi/decisions.yaml and renders visual decision cards
  Files: app/decisions/page.tsx
  Logic:
    server component reads kapi/decisions.yaml
    renders each decision as a card: title, status badge, date, type tag (adr/review)
    ADRs show context/decision/consequences
    reviews show agent, task, result (approve/reject/edit), notes
    empty state: "No decisions recorded yet"
    update sidebar link from /docs/adr.md to /decisions
  Depends: T05
  Test: Page renders seed ADR as a card, sidebar link works

- [x] **T07: /review skill** (M)
  What: Claude Code skill that prompts human to rate agent work, appends to decisions.yaml
  Files: .claude/skills/review/SKILL.md
  Logic:
    reads recent git log + blackboard for context on what agent just did
    asks: which task? approve/reject/edit? what category? any notes?
    reads existing kapi/decisions.yaml, appends new review record
    confirms: "Review recorded: [result] for [task] in category [category]"
  Depends: T05
  Test: Run /review, walk through prompts, verify record appended to decisions.yaml

## Block C: Working Memory + Lessons

- [x] **T08: Create snapshot.yaml** (M)
  What: Project-level working memory — the team's shared picture of where we are
  Files: kapi/snapshot.yaml, app/[version]/page.tsx
  Logic:
    create kapi/snapshot.yaml with current sprint state:
      sprint: v1, goal, progress (tasks done/total), assignments, blockers, demo-safe items
    update page.tsx to read snapshot.yaml and render it in the dashboard
    scrum master (control-shell) updates this after every task completion
  Test: Dashboard renders snapshot data, agents can read it for context

- [x] **T09: Rename status.md → lessons.md + /lessons page** (M)
  What: Replace status.md with lessons.md for learnings, create dedicated page
  Files: kapi/lessons.md, app/lessons/page.tsx, app/lessons/layout.tsx
  Logic:
    rename kapi/status.md to kapi/lessons.md
    change format: append-only log of learnings (why, what surprised, patterns to repeat)
    create /lessons page — server component reads lessons.md, renders with marked
    add sidebar link to /lessons
    remove old status.md references from page.tsx
  Depends: T08
  Test: /lessons page renders lessons.md, sidebar link works, old status refs removed

- [x] **T10: Update snapshot.yaml with current state** (S)
  What: Populate snapshot.yaml with actual current project state
  Files: kapi/snapshot.yaml
  Logic:
    list demo-safe features, known gaps, current sprint progress
    include agent roster and assignments
    this becomes the scrum master's primary update target
  Depends: T08
  Test: snapshot.yaml reflects reality, dashboard shows accurate state

- [x] **T11: Create /sprints/[version] route** (M)
  What: Dedicated sprint detail page separate from the main dashboard
  Files: app/sprints/[version]/page.tsx
  Logic:
    /sprints/v1 currently hits the [version] catch-all and shows the dashboard
    create app/sprints/[version]/page.tsx as a sprint detail page
    show PRD content, task list with checkboxes, progress bar, sprint metadata
    read from kapi/sprints/{version}/prd.md and tasks.md
    add sidebar link
    keep main dashboard at /[version] unchanged
  Test: /sprints/v1 shows sprint detail, /v1 still shows dashboard

- [x] **T12: Redesign dashboard cards** (M)
  What: Remove stage tabs, replace cards with 5-card command center
  Files: app/[version]/_components/DevDashboard.tsx
  Logic:
    remove the Plan/Build/QA/Review/Done stage tab bar entirely
    replace existing cards with 5 cards:
      1. Completion — progress ring, X/Y tasks from tasks.md
      2. In Progress — current tasks and assignees from snapshot.yaml
      3. Decisions — pending decisions from decisions.yaml needing human input
      4. Blockers — active blockers from snapshot.yaml/blackboard
      5. Directives — pending/in-progress directives from blackboard
    each card: title, count badge, summary text, click to expand
    read snapshot.yaml for tasks/blockers, decisions.yaml for decisions
    fetch directives from blackboard server GET /state
    below cards: snapshot text and milestones side by side (2-col grid)
      left: snapshot.text (current state narrative)
      right: milestones list (recent achievements, timestamped)
  Depends: T05
  Test: Dashboard shows 5 cards with live data, no stage tabs, snapshot+milestones side by side

- [x] **T13: Add Decisions panel to dashboard** (M)
  What: Dashboard section showing pending decisions that need human input
  Files: app/[version]/_components/DevDashboard.tsx, kapi/decisions.yaml
  Logic:
    read kapi/decisions.yaml for items with status: pending
    render as a panel on the dashboard — title, who posted it, context
    human can click to see full context and resolve
    agents post decisions via /api/decisions or write_to_blackboard
    critical decisions get documented in decisions.yaml with type: decision
  Depends: T05
  Test: Dashboard shows pending decisions, agents can post new ones

- [x] **T14: Unify sidebar into single shared component** (M)
  What: Replace AgentSidebar and LeftSidebar with one shared component used everywhere
  Files: app/_components/sidebar.tsx (new), app/agents/_components/agent-sidebar.tsx (delete)
  Logic:
    create app/_components/sidebar.tsx with shared nav: Dashboard, Backlog, Decisions, Lessons, Docs, Agents
    include Team section (agent list with status dots) from AgentSidebar
    accept props for: activePage, activeAgentId, agentEntries, connected, staleCount, onSweep
    replace AgentSidebar usage in: agents/page.tsx, agents/[agentId]/page.tsx
    replace LeftSidebar usage in: sprints/[version] DevDashboard.tsx
    replace sidebar usage in: lessons/LessonsView.tsx, dashboard/DashboardView.tsx, board/BoardPage.tsx, backlog/page.tsx
    delete app/agents/_components/agent-sidebar.tsx after migration
    one sidebar, one source of truth for nav links
  Test: All pages use the same sidebar, nav links consistent everywhere

- [x] **T15: Agent-level milestones + learnings tabs** (M)
  What: Add Milestones and Learnings tabs to agent detail page, filter heartbeat noise from Activity
  Files: app/agents/[agentId]/page.tsx
  Logic:
    agents post milestones/learnings to their own blackboard key:
      agents.captain.milestones: [{text, ts}, ...]
      agents.captain.learnings: [{text, ts}, ...]
    add Milestones tab — renders agent's milestones list (achievements, completions)
    add Learnings tab — renders agent's learnings (surprises, gotchas, patterns)
    filter Activity tab to exclude entries containing "keepalive heartbeat" or "heartbeat"
    PM can periodically read all agents' milestones/learnings and aggregate to snapshot.yaml
  Test: Agent detail page shows Milestones + Learnings tabs, Activity is noise-free

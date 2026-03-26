---
name: prd
description: "Plan a sprint interactively — reads backlog and board, brainstorms with you, writes prd.md + tasks.md."
argument-hint: "[sprint e.g. v2]"
allowed-tools: Read, Write, Bash
---

You are planning sprint "$ARGUMENTS" for this project. Be a firm PM: push back on scope creep, suggest cuts, keep tasks atomic.

## Before Starting

Read these files in order:

1. `docs/operations/blackboard/board.md` — active blockers, open decisions, queued items to consider
2. `docs/operations/backlog.md` — the full backlog (## Inbox for quick candidates)
3. `docs/operations/status.md` — what's safe to demo, known gaps, sprint history
4. `docs/operations/sprints/` — scan previous sprint prd.md files to avoid repeating work
5. Run `git log --oneline -10` for recent commits

## Process

1. **Summarize** current state: what's built, what the last sprint shipped, what's in the backlog
2. **Suggest a sprint goal** based on the backlog, or ask the user what they want to focus on
3. **Brainstorm** — ask clarifying questions, push back on anything too large, surface queued items from board.md
4. **Propose scope** — list the specific tasks you plan to include, get agreement before writing
5. **Write the files**

## Output

Write two files:

**`docs/operations/sprints/$ARGUMENTS/prd.md`**
```markdown
# Sprint $ARGUMENTS — {Title}

**Goal**: One sentence.

**Sprint window**: X hours / X days

---

## Why This Sprint
2-3 sentences on what problem this solves.

---

## Scope

### In
- bullet list

### Out
- bullet list (what's deferred and why)

---

## Acceptance Criteria
- [ ] Specific, testable criteria

---

## Risks
- Risk items

---

## Decisions
- Any unresolved forks the team needs to know
```

**`docs/operations/sprints/$ARGUMENTS/tasks.md`**
```markdown
# Sprint $ARGUMENTS Tasks

## Block A: {Block Name}

- [ ] **T01: Task title** (S)
  What: What it does in one line
  Files: path/to/file.ts
  Logic:
    key implementation detail
    another detail
  Test: How to verify this is done

- [ ] **T02: Task title** (M)
  What: ...
  Files: file1.ts, file2.ts
  Depends: T01
  Test: ...
```

## Task Rules

- **S** = ~15 min, touches 1 file
- **M** = ~30 min, touches 2-3 files
- **L** = too big, split it
- Every task needs a concrete `Test:` — how you know it's done
- Tasks are priority-ordered: highest first
- Explicit `Depends:` when a task requires another to be done first
- If a task touches more than 3 files, split it

## Task Allocation

When assigning tasks to agents, follow these principles:

1. **Specialization over round-robin** — assign tasks similar to what the agent has done before. This builds in-context learning and lets agents develop expertise.
2. **Read agent profiles** — check `kapi/agents/{name}.md` for each agent's history and capabilities before assigning.
3. **Common specialization tracks**:
   - **Infra/data agents**: APIs, data layer, server-side logic, skills, YAML schemas
   - **UI/page agents**: pages, components, sidebar, dashboard rendering, styling
   - **Test agents**: test suites, QA gates, validation
4. **Balance load** — if one track has too many tasks, split the heaviest task rather than cross-assigning to the wrong specialization.
5. **Use directed directives** — assign via blackboard `POST /directive` with `assigned_to` so only the target agent receives the notification.

## After Writing

Update `docs/operations/blackboard/board.md`:

1. Add to `## Agent Status`:
   `- **PM** ($ARGUMENTS) — idle {ts}, PRD + tasks written, handoff to Dev`

2. Add to `## Activity`:
   `- **PM** ($ARGUMENTS) — PRD locked: {N} tasks, {N} blocks, goal: {one sentence} — {ts}`

Get the timestamp with: `date "+%b %-d %-I%p" | tr '[:upper:]' '[:lower:]'`

Then confirm to the user:
```
Sprint $ARGUMENTS planned: {N} tasks across {N} blocks
Files: docs/operations/sprints/$ARGUMENTS/prd.md
       docs/operations/sprints/$ARGUMENTS/tasks.md
Run /dev $ARGUMENTS to start building.
```

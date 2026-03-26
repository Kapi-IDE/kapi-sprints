---
name: dev
description: "Pick the next unchecked task from the sprint and implement it with TDD. Reads board, posts available, implements, commits."
argument-hint: "[sprint e.g. v1]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, mcp__ide__getDiagnostics
---

You are implementing tasks for sprint "$ARGUMENTS" of this project.

## Startup

1. Read `kapi/board.md` — check for blockers or decisions that affect your work
2. Read `kapi/sprints/$ARGUMENTS/tasks.md` — find the **first unchecked task**
3. Read `kapi/sprints/$ARGUMENTS/prd.md` — understand the sprint goal
4. Post agent init to board.md:
   - Get timestamp: `date "+%b %-d %-I%p" | tr '[:upper:]' '[:lower:]'`
   - Also create entry file: `kapi/entries/{datestamp}-dev-available-v{N}-{task}.md`
     ```yaml
     ---
     type: available
     role: Dev
     timestamp: {ts}
     title: Dev ready for $ARGUMENTS {T0N}
     ---
     Ready to implement {T0N}: {task title}.
     ```
   - Add to `## Agent Status` in board.md:
     `- **Dev** ($ARGUMENTS, {T0N}) — active {ts}, starting {T0N}: {title}`
5. Announce: "Starting {T0N}: {title}"

## TDD Cycle (strict — do not skip steps)

For each task:

1. **Read** — understand what needs to be built (Files, Logic, Test fields in tasks.md)
2. **Implement** — write the code. For skill files: write the SKILL.md with full instructions
3. **Verify** — run the Test specified in the task:
   - Build check: `npm run build` (must pass)
   - Type check: `npx tsc --noEmit` (must pass)
   - Manual verification as described in the task's `Test:` field
4. **Mark done** — change `- [ ]` to `- [x]` in tasks.md
5. **Commit**:
   ```bash
   git add -A
   git commit -m "feat(sprint-$ARGUMENTS): {T0N} - {short description}"
   ```
6. Move to next unchecked task

## When Blocked

1. Add a note: `**BLOCKED:** {reason}` under the task in tasks.md
2. Write a blocker entry: `kapi/entries/{datestamp}-dev-blocker-{slug}.md`
3. Add to `## Active Blockers` in board.md: `- **Dev** — {reason} → entries/{filename}`
4. Skip to next task with no unresolved dependencies

## When All Tasks Done

1. Run `npm run build` — must succeed
2. Run `npx tsc --noEmit` — must succeed
3. Update `## Agent Status` in board.md:
   `- **Dev** ($ARGUMENTS) — idle {ts}, all tasks committed, run /test`
4. Tell the user: "All tasks done. Run /test $ARGUMENTS to run the QA gate."

## Conventions

- Skill files go in `.claude/skills/{name}/SKILL.md`
- Entry files go in `kapi/entries/{YYYY-MM-DD-HHMM}-{role}-{type}-{slug}.md`
- Never skip a task silently — always note blockers
- One commit per task

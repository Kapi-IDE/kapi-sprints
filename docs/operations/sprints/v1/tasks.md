# Sprint v1 Tasks

## Block A: Core Skills

- [x] **T01: Create `/prd` skill** (M)
  What: Interactive sprint planner — reads backlog + board, brainstorms with user, writes prd.md + tasks.md
  Files: .claude/skills/prd/SKILL.md
  Logic:
    - Read board.md (queued items), status.md (current state), backlog.md (candidates), git log -10
    - Summarize where things stand, ask user for sprint goal
    - Brainstorm interactively — push back on scope, suggest cuts
    - Get agreement, then write sprints/$ARGUMENTS/prd.md and tasks.md
    - Stamp terminal status in board.md: `**PM** ($ARGUMENTS) — active {ts}, PRD locked`
  Test: Run `/prd v2` — produces two files, board.md has PM status entry

- [x] **T02: Create `/dev` skill** (M)
  What: TDD task runner — reads board, posts available, picks first task, implements, commits
  Files: .claude/skills/dev/SKILL.md
  Logic:
    - Read board.md for blockers/decisions, read tasks.md, find first unchecked task
    - Run: `bash -c "date '+%Y-%m-%d-%H%M'"` then write entry file + post to ## Agent Status
    - TDD cycle: write failing test → implement → verify → mark [x] in tasks.md → commit
    - On blocker: note in tasks.md + post blocker to board.md
    - On all tasks done: run build + lint, stamp board.md idle
  Test: Run `/dev v2` — agent status appears in board.md, first task gets a commit

- [x] **T03: Create `/test` skill** (S)
  What: QA gate before pushing — build, lint, report
  Files: .claude/skills/test/SKILL.md
  Logic:
    - Run `npm run build` — if fails, report errors and stop
    - Run `npm run lint` — if fails, report and stop
    - Run `npx tsc --noEmit` — type check
    - If all pass: `git push origin dev` — triggers staging deploy
    - Write one-line summary to board.md ## Activity: pass/fail + timestamp
  Test: Run `/test v1` — build passes, summary appears in board.md

## Block B: Self-Hosting Demo Data

- [x] **T04: Replace placeholder sprint data** (M)
  What: Rewrite v1/tasks.md, v1/prd.md, v1/review.md to reflect the real v1 sprint (this one)
  Files: docs/operations/sprints/v1/tasks.md, prd.md, review.md, code-review.md
  Logic:
    - tasks.md = this file (already done)
    - prd.md = real sprint goal (already done)
    - review.md = narrative of what was built (write after skills are done)
    - code-review.md = brief notes on each skill file
    - Update board.md Activity section with real milestones
  Test: `localhost:3000/v1` shows real sprint data — no auth app references anywhere

- [x] **T05: Update status.md and scorecard.md** (S)
  What: Rewrite both files to accurately describe kapi-sprints (not a hypothetical auth app)
  Files: docs/operations/status.md, docs/operations/scorecard.md
  Logic:
    status.md sections:
      - What's Safe to Demo Today: dashboard, doc viewer, blackboard, get-started, /post skill
      - Known Gaps: no /resume, no /checkpoint, signal routing not implemented
      - Sprint History: v1 — Core Skills (this sprint)
    scorecard.md: grade each dashboard feature (parsing, rendering, team sidebar, right panel, skills)
  Test: Read both files — accurate, no placeholder content, sprint history reflects v1

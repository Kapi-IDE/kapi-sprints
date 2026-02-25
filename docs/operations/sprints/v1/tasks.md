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
  Test: Run `/dev v1` — agent status appears in board.md, first task gets a commit

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

- [x] **T04: Create `/post` skill** (S)
  What: Structured blackboard writes for humans and agents from the terminal
  Files: .claude/skills/post/SKILL.md
  Logic:
    - Parse `/post [type] [message]` — types: finding, decision, blocker, steer, available, handoff, queue
    - Write entry file to `entries/YYYY-MM-DD-HHMM-role-type.md` with frontmatter
    - Append to correct section in board.md (findings → ## Findings, blocker → ## Active Blockers, etc.)
    - Confirm write with entry path
  Test: Run `/post finding "XSS risk in localStorage"` — entry file created, board.md updated

## Block B: Self-Hosting Demo Data

- [x] **T05: Replace placeholder sprint data** (M)
  What: Rewrite all v1 files to reflect the real v1 sprint (this one). No auth app references anywhere.
  Files: docs/operations/sprints/v1/*.md, docs/operations/blackboard/board.md, entries/
  Logic:
    - tasks.md = this file
    - prd.md = real sprint goal and scope
    - review.md = narrative of building each skill
    - code-review.md = review of actual skill files
    - preflight.md = real pre-sprint check (no database, file-based only)
    - board.md = real decisions, findings, activity from this sprint
    - entries/ = real decisions (Apache 2.0 license, Overview landing) and milestones
  Test: `localhost:3000/v1` shows real sprint data — coherent end to end

- [x] **T06: Update status.md, scorecard.md, backlog.md** (S)
  What: Rewrite all three to accurately describe kapi-sprints
  Files: docs/operations/status.md, scorecard.md, backlog.md
  Logic:
    - status.md: what's safe to demo, known gaps, sprint history
    - scorecard.md: grade each capability (dashboard, parsing, skills, blackboard, etc.)
    - backlog.md: accurate inbox (remove auth items, add real items)
  Test: All three files describe kapi-sprints, not a hypothetical auth app

## Block C: OSS Marketing & Education

- [x] **T07: Rewrite README.md** (M)
  What: Story-driven README that explains the blackboard pattern, shows what's inside, and links to Kapi AI
  Files: README.md
  Logic:
    - Hook: "We coordinate 5-6 Claude Code terminals using a filesystem blackboard from 1986 AI research"
    - Problem → Solution → Quick Start → What's Inside → The Blackboard Pattern → Screenshots → Built by Kapi
    - Mention 4 shipped skills (/prd, /dev, /test, /post), not aspirational 12
    - Link to getkapi.com, not Kapi-IDE
    - Apache 2.0 badge
  Test: A stranger reads the README and understands the product in 60 seconds

- [x] **T08: Create NOTICE file** (S)
  What: Apache 2.0 mandatory attribution file
  Files: NOTICE
  Logic:
    - "Kapi Sprints — Copyright 2026 Kapi AI, Inc."
    - "Originally created by Kapi AI (https://getkapi.com)"
  Test: NOTICE file exists at repo root

- [x] **T09: Write Blackboard Pattern guide** (M)
  What: Standalone educational guide explaining the blackboard architecture — shareable on LinkedIn
  Files: docs/guides/blackboard-pattern.md
  Logic:
    - Origin: Hearsay-II (1980), BB1 (1985) — multi-agent coordination via shared data structure
    - How it maps: knowledge sources = terminals, blackboard = .md files, control = skills + human
    - Practical example: board.md sections, entry files, how /post writes to it
    - Why it works for AI coding: context recovery, multi-terminal coordination, human-in-the-loop
    - Diagram showing the data flow
  Test: Guide is self-contained — someone with no context can read it and understand the pattern

- [x] **T10: Write Backwards Build guide** (M)
  What: Standalone educational guide explaining the backwards build methodology
  Files: docs/guides/backwards-build.md
  Logic:
    - Core principle: start from done, work backwards to first action
    - Foundation Gate: vision → market → spec before any sprint
    - Sprint structure: prd.md → tasks.md → preflight → dev → test → review
    - Why it works: every intermediate state is deployable, no wasted tasks
    - Contrast with "vibe coding" — the anti-pattern
  Test: Guide is self-contained and mentions kapi-sprints as the reference implementation

- [x] **T11: Fix project.config.ts** (S)
  What: Update project identity
  Files: project.config.ts
  Logic:
    - name: 'Kapi Sprints' (not 'My Project')
    - short: 'KS'
    - repo: 'https://github.com/kapihq/kapi-sprints'
  Test: Dashboard header says "Kapi Sprints"

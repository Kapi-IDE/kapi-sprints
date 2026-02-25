# Sprint v1 Review — Core Skills + Self-Hosted Demo

*Generated: feb 24 · Duration: 1 day · Tasks: 5/5*

## What We Built

Sprint v1 shipped the workflow engine that makes kapi-sprints usable as a team tool — not just a dashboard viewer. Starting from a working UI with no skills, we now have:

- `/prd` — interactive sprint planner that reads the backlog and board, brainstorms with you, and writes `prd.md` + `tasks.md`
- `/dev` — TDD task runner that reads the board, posts `available` to the team sidebar, picks the next task, implements, and commits
- `/test` — QA gate: build + type check + lint + push to dev
- `/post` — structured blackboard writes for humans and agents (classified by type, written to entry files + board.md sections)
- Real sprint data — v1 now tells the story of building kapi-sprints itself, not a placeholder auth app

## Task-by-Task Narrative

### T01 — `/prd` skill (30 min)

Created `.claude/skills/prd/SKILL.md`. The skill reads `board.md` (queued items), `backlog.md` (candidates), `status.md` (current state), and recent git log before starting. Process: summarize → suggest goal → brainstorm → propose scope → get agreement → write files. Output: `sprints/$ARGUMENTS/prd.md` and `tasks.md`. Updates board.md Agent Status and Activity on completion.

The key design decision: keep it interactive, not a form. The PM role should push back on scope and surface queued items — a mechanical template would miss that.

### T02 — `/dev` skill (30 min)

Created `.claude/skills/dev/SKILL.md`. Startup sequence: read board for blockers → read tasks.md → post `available` entry (creates an entry file + writes to `## Agent Status` in board.md, which populates the Team sidebar). Then strict per-task cycle: implement → build check → mark `[x]` → commit. On blocker: note in tasks.md + post to board.

The agent init step (`/post available`) was the core design goal — agents should appear in the Team sidebar the moment they start work, not just when they post findings.

### T03 — `/test` skill (15 min)

Created `.claude/skills/test/SKILL.md`. Sequential: `npm run build` → `npx tsc --noEmit` → `npm run lint` → `git push origin dev`. Stops on first failure. Writes a one-line summary to `## Activity` in board.md — pass or fail with timestamp.

Kept intentionally simple: no Playwright for v1, no per-file analysis. The QA gate's job is to protect the dev branch, not to replace code review.

### T04 — Replace placeholder sprint data (20 min)

Rewrote `preflight.md`, `review.md` (this file), `code-review.md`, and all three entry files in `entries/`. Also cleaned `board.md` (removed auth XSS finding, auth activity) and `backlog.md` (removed auth rate limiting, OAuth, email verification — wrong product entirely).

The self-hosting principle: the demo data for a sprint dashboard should be the sprint that built the dashboard. A new user cloning the repo should read v1 and understand exactly how kapi-sprints was built using kapi-sprints.

### T05 — Update status.md and scorecard.md (15 min)

Rewrote both files to describe kapi-sprints accurately. Scorecard now grades dashboard, parsing, skills, blackboard, right panel, doc viewer, onboarding, and OSS quality. Status.md lists what's actually safe to demo and what's genuinely missing.

## What's Next (v2)

From the backlog:
- `/resume` — start-of-session briefing (reads board + git log, answers "where was I?")
- `/checkpoint` — end-of-session debrief, prunes board.md
- Signal type rendering — `available`/`stuck`/`handoff` entries visually distinct in sidebar
- Agent init protocol baked into `/dev` and `/prd` as a standard first step

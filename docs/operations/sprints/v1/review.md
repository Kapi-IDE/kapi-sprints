# Sprint v1 Review — Core Skills + Self-Hosted Demo + OSS Content

*Generated: feb 24 · Duration: 1 day · Tasks: 11/11*

## What We Built

Sprint v1 shipped kapi-sprints as a complete, coherent open-source product. Starting from a working dashboard UI with no workflow skills and placeholder data, we now have:

- **4 Claude Code skills** — `/prd`, `/dev`, `/test`, `/post` — the full sprint loop
- **Self-hosting demo data** — v1 tells the story of building kapi-sprints itself
- **Story-driven README** — explains the blackboard pattern, links to Kapi AI
- **2 educational guides** — Blackboard Pattern and Backwards Build, standalone and shareable
- **Apache 2.0 compliance** — LICENSE + NOTICE + attribution

A PM who discovers the repo on GitHub can understand the idea in 60 seconds, clone and run the dashboard, and learn the methodology through the guides.

## Task-by-Task Narrative

### Block A: Core Skills

#### T01 — `/prd` skill (30 min)

Created `.claude/skills/prd/SKILL.md`. Reads `board.md`, `backlog.md`, `status.md`, and recent git log before starting. Process: summarize current state → suggest sprint goal → brainstorm interactively → propose scope → get agreement → write `prd.md` + `tasks.md`. Updates Agent Status and Activity in board.md on completion.

Key design decision: keep it interactive, not a form. The PM role should push back on scope and surface queued items from the backlog.

#### T02 — `/dev` skill (30 min)

Created `.claude/skills/dev/SKILL.md`. Startup sequence: read board for blockers → read tasks.md → post `available` entry (creates entry file + writes to `## Agent Status` in board.md, populating the Team sidebar). Then strict per-task cycle: implement → build check → mark `[x]` → commit. On blocker: post to board.md. On all done: stamp idle.

The agent init step (`/post available`) was the core design goal — agents appear in the Team sidebar the moment they start work.

#### T03 — `/test` skill (15 min)

Created `.claude/skills/test/SKILL.md`. Sequential: `npm run build` → `npx tsc --noEmit` → `npm run lint` → `git push origin dev`. Stops on first failure. Writes pass/fail summary to `## Activity` in board.md.

Intentionally simple: no Playwright for v1, no per-file analysis. The QA gate protects the dev branch — that's its only job.

#### T04 — `/post` skill (20 min)

Created `.claude/skills/post/SKILL.md`. Parses `/post [type] [message]` — supports finding, decision, blocker, steer, available, handoff, and queue types. Writes a timestamped entry file with YAML frontmatter and appends to the correct board.md section. Both humans and agents use the same command — no raw markdown writes to board.md allowed (enforced in CLAUDE.md).

This is the bridge between terminal work and dashboard visibility. Without it, agents are invisible to the dashboard.

### Block B: Self-Hosting Demo Data

#### T05 — Replace placeholder sprint data (20 min)

Rewrote all v1 files: `prd.md`, `tasks.md` (this file), `review.md` (this file), `code-review.md`, `preflight.md`. Rewrote all three blackboard entries to describe real kapi-sprints decisions (Apache 2.0 licensing, Overview-as-default-landing, Block A milestone). Cleaned `board.md` — removed all auth app references.

The self-hosting principle: the demo data for a sprint dashboard should be the sprint that built the dashboard. A new user cloning the repo reads v1 and sees exactly how kapi-sprints was built using kapi-sprints.

#### T06 — Update status.md, scorecard.md, backlog.md (15 min)

Rewrote all three files. Scorecard now grades 8 capabilities (dashboard, parsing, skills, blackboard, right panel, doc viewer, onboarding, OSS quality). Status.md lists what's safe to demo and what's genuinely missing. Backlog.md cleaned of auth items, populated with real next steps.

### Block C: OSS Marketing & Education

#### T07 — Rewrite README.md (30 min)

Complete rewrite from feature list to story. Opens with the hook: coordinating 5-6 Claude Code terminals via a filesystem blackboard from 1986 AI research. Walks through the problem (AI assistants forget, can't coordinate, no sprint structure), the solution (blackboard + skills + dashboard), quick start, what's inside, and the blackboard pattern explanation. Ends with "Built by Kapi AI" and link to getkapi.com.

Key tension: tell enough of the story to be compelling, but don't oversell. The repo has 4 skills, not 12. The README says exactly what exists.

#### T08 — Create NOTICE file (5 min)

Standard Apache 2.0 NOTICE with "Originally created by Kapi AI (https://getkapi.com)". Every fork must include this file — the brand persists in all derivatives.

#### T09 — Blackboard Pattern guide (25 min)

Wrote `docs/guides/blackboard-pattern.md`. Traces the pattern from Hearsay-II (1980) through BB1 (1985) to kapi-sprints. Explains the three components: knowledge sources (terminals), blackboard (markdown files), control (skills + human). Includes practical examples showing board.md sections and entry file format. Self-contained — someone can share this on LinkedIn without any kapi-sprints context.

#### T10 — Backwards Build guide (25 min)

Wrote `docs/guides/backwards-build.md`. Explains the methodology: start from done, work backwards, every intermediate state is deployable. Covers the Foundation Gate (vision → market → spec), sprint structure, and contrast with vibe coding. Uses kapi-sprints v1 as the worked example.

#### T11 — Fix project.config.ts (5 min)

Updated name to "Kapi Sprints", initials to "KS", repo URL to kapihq. Dashboard header now shows the correct branding.

## What's Next (v2)

- Real-time file watching (SSE/WebSocket — replace page-load reads)
- CLI packaging (`npx kapi-sprints dashboard`)
- Plugin marketplace structure (`plugin/` directory)
- `/resume` and `/checkpoint` skills
- Align design docs (architecture.md, dashboard.md) with current reality

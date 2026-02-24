# Content Strategy

> GitHub repo + LinkedIn post series. Not a PPT.

---

## Why Not Slides

PPT reaches 50-200 people once. A repo with good README + LinkedIn posts reaches thousands and stays discoverable. Balaji's Quora following (500K) and LinkedIn presence make written content compound harder than any slide deck.

---

## README: The Story

The README is the primary marketing asset. It tells a story, not a feature list.

### Structure

```markdown
# Kapi Sprints

> Sprint workflow system for Claude Code with blackboard coordination.

**We run 5-6 Claude Code terminals simultaneously, coordinated by a
filesystem blackboard pattern inspired by 1986 AI research.**

This is the open-source version of the sprint system we use to build
[Kapi](https://getkapi.com) — an agent platform where blueprints are
architected collections of skills.

## The Problem

AI coding assistants forget everything between sessions. They have no
coordination when you run multiple instances. There's no structure for
multi-day development sprints.

## The Solution

A blackboard architecture where:
- **Skills** read/write to shared markdown files
- **Checkpoints** capture session state for recovery
- **Scorecards** audit against your quality layers
- **A dashboard** watches everything in real-time

## Quick Start

\`\`\`bash
# Install plugin
claude plugin marketplace add kapihq/kapi-sprints
claude plugin install kapi-sprints@kapihq

# Initialize your project
/sprint init

# Start dashboard (separate terminal)
npx kapi-sprints dashboard
\`\`\`

## What's Inside

### Plugin (Claude Code)
- 12 skills (preflight, prd, dev, test, scorecard, walkthrough,
  checkpoint, resume, post, spec)
- 2 auto-invocable agents (arch-reviewer, test-planner)
- Backwards build onboarding (/sprint spec)

### Dashboard (Next.js)
- Blackboard as default landing
- Sprint progress with phase tabs
- Real-time file watching via WebSocket
- Right panel: blockers, decisions, queued items

## The Blackboard Pattern

[Diagram showing terminals → .md files → dashboard]

From Erman et al.'s Hearsay-II (1980) and Hayes-Roth's BB1 (1985).
Multiple knowledge sources (terminals) write to a shared data structure
(the blackboard). A control mechanism (skills + agents) determines what
runs next.

In our case:
- Knowledge sources = Claude Code terminals
- Blackboard = markdown files in docs/operations/
- Control = skill invocation + human checkpoints

## Screenshots

[Sprint dashboard screenshot]
[Blackboard view screenshot]

## Built by Kapi

This is how we build Kapi — an agent platform where blueprints are
architected collections of skills. If you're interested in building
AI agents the right way, check out [getkapi.com](https://getkapi.com).

## License

Apache 2.0. See LICENSE and NOTICE.
```

---

## LinkedIn Post Series (4 posts over 2 weeks)

### Post 1: The Blackboard Architecture (D0)

**Hook:** "I run 5-6 AI coding agents simultaneously. Here's the coordination pattern from 1986 that makes it work."

**Body:**
- Problem: multiple Claude Code terminals stepping on each other
- Solution: filesystem blackboard from Hearsay-II / BB1 research
- How it works: shared markdown files, checkpoints, resume
- "We've run 8+ sprints this way building our AI agent platform"
- Screenshot of the dashboard

**CTA:** Link to repo

---

### Post 2: Context Recovery (D+3)

**Hook:** "Your AI coding assistant forgets everything between sessions. Mine doesn't."

**Body:**
- Problem: context loss between sessions, especially multi-day work
- Solution: /checkpoint saves full state, /resume restores it
- Example: show a checkpoint entry and what resume produces
- "Context recovery is a solved problem. We just forgot the solution was in a 1985 paper."

**CTA:** Link to repo

---

### Post 3: The Anti-Pattern (D+7)

**Hook:** "The anti-pattern killing AI-assisted development: no eval, no governance, just vibes."

**Body:**
- Problem: vibe coding produces code nobody can maintain
- Stats: 75% of companies face severe AI technical debt by 2026 (Forrester)
- Solution: scorecard layers, preflight checks, walkthrough reviews
- "Every sprint gets audited against quality layers you define"
- Tie to Kapi's blueprint philosophy (tested, evaluated, governed)

**CTA:** Link to repo + getkapi.com

---

### Post 4: The Repo Launch (D+14)

**Hook:** "We open-sourced our sprint system. Here's what 8 sprints taught us about working with Claude Code."

**Body:**
- Lessons learned across 8+ sprints
- The critical insight: "Without constant involvement, agents go out of control"
- Why blackboard + checkpoints + scorecards solve this
- Full feature overview of kapi-sprints

**CTA:** Link to repo, install instructions, dashboard screenshot

---

## What We Open-Source vs What Stays Internal

| Open | Internal |
|------|----------|
| Blackboard pattern (checkpoint/resume/post) | Kapi-specific skill implementations |
| Sprint workflow documentation | Blueprint manifest schema |
| Skill architecture (SKILL.md frontmatter schema) | Circuit breaker system |
| Auto-invocable agent pattern | Multi-agent orchestration patterns |
| Dashboard UI | Kapi deployment infrastructure |
| Progressive disclosure pattern | Enterprise features |
| Screenshots, examples | Customer data, metrics |

**Principle:** Open the patterns. Keep the platform.

---

## Quora Cross-Posting

Balaji's 500K Quora followers. Repurpose LinkedIn posts as Quora answers to relevant questions:
- "How do you coordinate multiple AI coding assistants?"
- "What's the best workflow for AI-assisted development?"
- "How do you maintain code quality with AI tools?"

Each answer links to the GitHub repo.

---

*See [distribution.md](distribution.md) for launch sequence timing.*

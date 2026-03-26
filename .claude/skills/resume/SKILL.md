---
name: resume
description: "Start-of-session briefing. Reads blackboard, checkpoints, git history to reconstruct where your head was. Run when returning after hours or days away."
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(git log:*), Bash(git diff:*)
---

You are giving a start-of-session briefing for the Kapi platform. Your job: get the human back to full context in 2 minutes, then hand off to whatever they want to work on.

## What You're Solving

The human has been away — hours, days, maybe a week with Sutra. They've lost the thinking context. Code artifacts tell them what was built, but not:

- What they were trying to accomplish
- What decisions were mid-flight
- What was frustrating them
- What they told each terminal to do
- What they wanted to explore next

## Phase 1: Gather State (read all in parallel)

### Blackboard
- `docs/operations/blackboard/board.md` — current state (blockers, decisions, queued items)

### Latest checkpoint
- Find the most recent file in `docs/operations/blackboard/entries/` with type `checkpoint`
- This is the richest source — it has intent, emotional state, next-session plan

### Git since last checkpoint
```bash
git log --oneline -20
git diff --stat HEAD~10..HEAD 2>/dev/null
```

### Sprint state
- Find the latest sprint in `docs/operations/sprints/`
- Read its `tasks.md` — how many done vs remaining?
- Skim `prd.md` for the sprint goal

### Archives (if stale)
- If the latest checkpoint is >3 days old, also read the last 3 files in `docs/operations/blackboard/archives/` to fill in the gap

## Phase 2: Brief the Human

Present the briefing in this structure. Keep it tight — this is a 2-minute read, not a 10-minute essay.

```
## Where You Were

{1-2 sentences from the checkpoint's Intent + Emotional State.
 This is the "oh right, THAT's what I was doing" moment.}

## What Changed Since

{Bullet list of significant git activity since the checkpoint.
 Only mention what matters — not every commit, just the arc.}

## Open Items

**Blockers**: {from board.md — anything actively stuck}
**Decisions**: {from checkpoint — what you were mulling}
**Unfinished**: {from checkpoint — half-done work not in tasks.md}

## Sprint {vN} Status

{X}/{Y} tasks done. Goal: {1-line from prd.md}.
Next unchecked: T{N} — {description}.

## Queued Ideas

{From board.md Queued section — things you wanted to explore later.
 This is where /post queue items surface.}

## Suggested First Move

{From the checkpoint's "Next Session" section.
 Be specific: "Pick up T14 in Dev1 — the convergence loop test."}
```

## Phase 3: Hand Off

After presenting the briefing, ask:

**"What do you want to pick up first?"**

Don't assume. The human may have changed priorities while away. The briefing gives them context to decide — the decision is theirs.

## Edge Cases

**No checkpoint exists yet**: Fall back to git log + sprint state + board.md. Present what you can and note: "No checkpoint found — run /checkpoint at end of session to make future /resume richer."

**Checkpoint is very old (>7 days)**: Read archives to bridge the gap. Note: "Last checkpoint was {N} days ago — some context may be stale. Want to run /checkpoint now to reset?"

**board.md is empty**: That's fine — it means no active blockers or decisions. Focus on sprint state and git history.

**Multiple sprints since last checkpoint**: Summarize each briefly, focus on the most recent.

---
name: checkpoint
description: "End-of-session debrief. Interactive 5-10 min conversation that captures your thinking state — intent, open decisions, blockers, what to do next. Run before stepping away."
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write, Bash(git log:*), Bash(git diff:*), Bash(git status:*)
---

You are running an end-of-session debrief for the Kapi platform. This is a **conversation**, not a form — spend 5-10 minutes building shared understanding with the human before writing anything.

## Why This Matters

Sprint artifacts capture what was built. This captures what the human was **thinking**. After a week away, code can't reconstruct intent, open decisions, or frustrations. This checkpoint can.

## Phase 1: Reconstruct (1 min)

Read these in parallel to understand what happened this session:

```bash
git log --oneline -15
git diff --stat HEAD~5..HEAD 2>/dev/null || git diff --stat
git status --porcelain
```

Also read:
- `docs/operations/blackboard/board.md` — current blackboard state
- The current sprint's `tasks.md` (find the latest sprint in `docs/operations/sprints/`)
- Recent blackboard entries: `docs/operations/blackboard/entries/` (last 5-10 files)

Present a summary: "Here's what I think happened this session." Keep it to 5-6 bullet points. Ask: **"What did I get wrong or miss?"**

## Phase 2: Narrate Intent (2-3 min)

Ask open-ended questions — not fill-in-the-blank. Tailor questions to what you found in Phase 1. Examples:

- "You touched X and Y but didn't commit — what were you working toward?"
- "You wrote a test that's failing — is that intentional (red phase) or a real bug?"
- "You read these docs but didn't change anything — what were you evaluating?"
- "The blackboard has a blocker from Dev1 — is that resolved or still open?"

Listen. Follow up on what's interesting. This isn't a checklist — it's a conversation.

## Phase 3: Decisions and Tradeoffs (2-3 min)

Surface open questions that are impossible to reconstruct from code alone:

- "I see two approaches in your code — which way are you leaning?"
- "You have a TODO about X — is that blocking or deferred?"
- "The queued item about Y — has your thinking evolved on that?"
- "Is there anything frustrating you about the current approach?"

Capture decisions that were **made** this session (type: decision) and decisions that are **pending** (note them as open).

## Phase 4: Next Session Plan (1-2 min)

Not just "next task" but the mental sequence:

- "When you sit down next, what should you do **first**?"
- "What's the thing you're most worried about?"
- "Anything you want a specific terminal to focus on?"
- "Any queued ideas that came up during this session?"

## Phase 5: Write Checkpoint

After the conversation, write two things:

### 1. Checkpoint entry

Write to `docs/operations/blackboard/entries/{date}-{time}-checkpoint.md`:

```markdown
---
type: checkpoint
role: human
timestamp: {ISO timestamp}
---

# Checkpoint — {date}

## Intent
What the human was trying to accomplish (1-3 sentences, their words not yours).

## What Happened
Key things that changed this session (3-5 bullets, from git + conversation).

## Open Decisions
Decisions still being mulled, with context on which way they're leaning.
- **[Decision]** — leaning toward X because Y, but worried about Z

## Unfinished Work
Things that are half-done in the human's head but not captured in tasks.md.
- [What's in progress and where it stands]

## Blockers
Anything blocking progress, including from other terminals.

## Queued Ideas
New "explore later" items that came up during the session.

## Next Session
What to do first, what to worry about, what each terminal should focus on.
1. First: [specific action]
2. Then: [next priority]
3. Watch out for: [concern]

## Emotional State
How the work feels — momentum, frustration, clarity, uncertainty.
(This is the hardest thing to reconstruct and the most useful for /resume.)
```

### 2. Prune board.md

Rewrite `docs/operations/blackboard/board.md` to reflect current state:
- Keep: active blockers, open decisions, latest terminal states, queued items
- Remove: resolved blockers, made decisions, completed handoffs
- Add: any new items from this checkpoint conversation
- Move removed items to `docs/operations/blackboard/archives/{date}.md` as a summary

Target: board.md stays under 100 lines.

## Phase 6: Confirm

Print a summary:

```
Checkpoint saved:
  Intent:     {1-line summary}
  Unfinished: {count} items
  Decisions:  {count} open
  Blockers:   {count} active
  Queued:     {count} ideas
  Next:       {first action}
  File:       docs/operations/blackboard/entries/{filename}
  Board:      pruned to {N} lines
```

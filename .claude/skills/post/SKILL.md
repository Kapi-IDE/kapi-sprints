---
name: post
description: "Quick write to the blackboard. Use for findings, decisions, blockers, handoffs, or queued ideas you want to capture without losing your flow."
argument-hint: "[type] [message] e.g. 'finding parser ignores entries with no title' or 'blocker need PM decision on queue layout'"
allowed-tools: Read, Write, Bash
---

You are posting an entry to the blackboard. This should be **fast** — under 30 seconds. Don't start a conversation. Parse, write, confirm.

## Parse the Input

`$ARGUMENTS` follows the pattern: `{type} {message}`

| Type | Meaning | Routes to | Example |
|------|---------|-----------|---------|
| `finding` | "I discovered X" | `## Findings` in board.md | `finding parser ignores entries with no title` |
| `steer` | "Focus on / avoid Y" | `## Directives` in board.md | `steer skip mobile layout for now` |
| `decision` | "Unresolved fork" | `## Open Decisions` in board.md | `decision use SQLite or Postgres for local dev?` |
| `blocker` | "Stuck on Q" | `## Active Blockers` in board.md | `blocker need PM sign-off on queue timeout value` |
| `available` | "Ready to work" | `## Agent Status` in board.md | `available Dev ready for v2 T03` |
| `handoff` | "Passing to next agent" | `## Activity` in board.md | `handoff Test — Dev done with T07, needs e2e coverage` |
| `queue` | "Explore this later" | `## Inbox` in backlog.md | `queue add stale signal detection to right panel` |

If the type is missing or unclear, default to `finding`.

## Get the Timestamp

Run `date "+%Y-%m-%d-%H%M"` to get the datestamp and `date "+%b %d %I%p"` for the short timestamp.

## Write the Entry File

Create `kapi/entries/{datestamp}-{role}-{type}-{slug}.md`:

```markdown
---
type: {type}
role: {role}
timestamp: {short timestamp}
title: {Short title derived from message}
---

{The full message, cleaned up into 1-3 sentences.}
```

For the role: if the human is posting (you're running in their terminal), use `Human:Balaji`. If an agent is posting (Dev, PM, Test), use that role name.

The `{slug}` is 2-4 words from the message, hyphenated, lowercase.

## Update the Right File

**For finding, steer, decision, blocker, available, handoff** — append a bullet to the correct section in `kapi/board.md`:

| Type | Section |
|------|---------|
| `finding` | `## Findings` |
| `steer` | `## Directives` |
| `decision` | `## Open Decisions` |
| `blocker` | `## Active Blockers` |
| `available` | `## Agent Status` |
| `handoff` | `## Activity` |

Format:
```
- **{role}** — {message} → `entries/{filename}`
```

**For queue** — append to `kapi/backlog.md` under `## Inbox`:
```
- [ ] {message} — {role} — {short timestamp}
```

## Confirm

Print one line:
```
Posted [type]: {short title} → entries/{filename}
```

That's it. Don't ask follow-up questions.

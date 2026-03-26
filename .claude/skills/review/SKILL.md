---
name: review
description: "Rate an agent's work. Records approve/reject/edit decision in kapi/decisions.yaml for HITL competence tracking."
argument-hint: "[task e.g. T03]"
allowed-tools: Read, Grep, Glob, Write, Bash(git log:*), Bash(git diff:*)
---

You are recording a human review of agent work. This builds the HITL decision dataset that the competence engine (v2) will consume.

**Task**: $ARGUMENTS

## Step 1 — Gather Context

Read these to understand what the agent did:

1. `kapi/sprints/*/tasks.md` — find the task description
2. `git log --oneline -10` — see recent commits related to this task
3. `kapi/snapshot.yaml` — check which agent was assigned this task
4. `kapi/decisions.yaml` — read existing decisions to get the next REV-NNN id

## Step 2 — Ask the Human

Ask these questions one at a time. Wait for each answer before proceeding.

1. **Which agent did this work?** (e.g. dev, captain, dev2, tester)
2. **Result: approve, reject, or edit?**
   - **approve** — work is correct, no changes needed
   - **reject** — work is wrong, needs to be redone
   - **edit** — work was mostly right but you made corrections
3. **Category?** (e.g. architecture, code-quality, testing, ui, docs, refactoring)
4. **Any notes?** (optional — what was good, what was wrong, what you changed)

## Step 3 — Write the Decision Record

Read `kapi/decisions.yaml`, then append a new review entry to the `decisions:` array.

The new entry format:

```yaml
  - id: REV-NNN
    type: review
    title: "Review: [task title from tasks.md]"
    result: [approve|reject|edit]
    date: "YYYY-MM-DD"
    agent: [agent name]
    task: [task id e.g. T03]
    sprint: [sprint id e.g. v1]
    category: [category from human]
    notes: >
      [notes from human, or empty string if none]
```

Compute the next REV-NNN by counting existing `type: review` entries + 1.

Write the updated YAML back to `kapi/decisions.yaml`. Use the `yaml` package to parse and stringify — do NOT manually construct YAML strings.

## Step 4 — Confirm

Print:

```
Review recorded: [result] for [task] by [agent]
Category: [category]
File: kapi/decisions.yaml
View at: /decisions
```

## Rules

- Never skip the human prompts — this is HITL, the human's judgment is the point
- Never auto-approve — even if the work looks fine, ask the human
- Append only — never modify or delete existing decisions
- If `kapi/decisions.yaml` doesn't exist, create it with the schema header from kapi/sprints/v1/tasks.md T05

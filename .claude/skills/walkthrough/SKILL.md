---
name: walkthrough
description: "Post-sprint narrative review. Reads PRD, tasks, git history, every changed file. Produces per-task explanations with ASCII diagrams."
argument-hint: "[sprint e.g. v5]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write, Bash(git log:*), Bash(git diff:*), Bash(git show:*)
---

Generate a sprint review report for sprint "$ARGUMENTS" so the developer can read and understand exactly what the code does.

## Data Gathering

1. Read `/Users/bv/Code/active/kapi-platform/docs/operations/sprints/$ARGUMENTS/prd.md` for sprint goals and acceptance criteria
2. Read `/Users/bv/Code/active/kapi-platform/docs/operations/sprints/$ARGUMENTS/tasks.md` for task list and completion status
3. Run `git log --oneline --all` and filter for commits mentioning "sprint-$ARGUMENTS"
4. For each commit, run `git show --stat {hash}` to see files changed
5. Read every file that was created or significantly modified
6. Check `./docs/operations/sprints/$ARGUMENTS/screenshots/` for visual evidence

## Output

Write to `./docs/operations/sprints/$ARGUMENTS/review.md` using the format in `templates/review.md`.

## Writing Style

- Write for a technical PM who can read code but wants the narrative first
- Lead with WHAT and WHY before HOW
- Use ASCII diagrams liberally for architecture, data flow, and component relationships
- Reference files as `path/to/file.ts:lineN` so the reader can jump to source
- Be honest about what's incomplete, hacky, or needs revisiting
- Don't sugarcoat — if something is a workaround, say so
- Keep each task section self-contained (readable without reading other sections)

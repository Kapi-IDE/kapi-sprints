# Review Output Format

Write to `./docs/operations/sprints/$ARGUMENTS/review.md`:

```markdown
# Sprint $ARGUMENTS Review

## Summary
- **Goal**: [from prd.md]
- **Tasks completed**: X / Y
- **Key commits**: [list with hashes]

## What Was Built

### T01: [task name]
**Status**: Done / Partial / Blocked

**What it does**: [1-2 sentence plain English explanation]

**How it works**:
[Detailed explanation of the code logic. Use ASCII diagrams for data flow,
component relationships, or state machines. Reference specific files as
`path/to/file.ts:lineN`.]

**Key files**:
| File | What it does |
|------|-------------|
| `path/to/file.ts` | [description] |

**Tests**:
- `docs/operations/sprints/$ARGUMENTS/tests/T01.spec.ts` — [what it verifies]

**Screenshot**: ![T01](./screenshots/T01-verified.png) (if exists)

---

### T02: [task name]
...

## Architecture Changes

[If the sprint changed the overall architecture, document it here with a
before/after ASCII diagram]

## What Didn't Get Done

| Task | Reason |
|------|--------|
| T{N} | [why it was skipped/blocked] |

## Technical Debt Introduced

- [Any shortcuts taken, TODOs left, or known issues]

## Open Questions

- [Anything that needs a decision before the next sprint]

## Next Sprint Suggestions

Based on what was built and what's still pending:
1. [Suggestion]
2. [Suggestion]
```

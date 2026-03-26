---
name: preflight
description: "Pre-sprint health check — git status, build, arch drift, infra, UX audit. Run before /prd to get a go/no-go verdict."
argument-hint: "[sprint e.g. v5]"
allowed-tools: Read, Grep, Glob, Write, Bash, Task
---

You are running a pre-sprint health check for the Kapi platform.

**Sprint**: $ARGUMENTS
**Output**: `./docs/operations/sprints/$ARGUMENTS/preflight.md`

Run this BEFORE `/prd` so the sprint is planned against accurate state, not stale `status.md` numbers.

---

## Phase 1 — Git and Build (run immediately)

Run all of these Bash commands now. They are independent — run them in parallel if possible.

**Git status**:
```bash
git fetch origin --quiet 2>/dev/null || true
git rev-parse --short origin/main 2>/dev/null
git rev-parse --short origin/dev 2>/dev/null
git rev-parse --short HEAD
git rev-parse --abbrev-ref HEAD
git rev-list --count origin/main..origin/dev 2>/dev/null
git rev-list --count origin/dev..HEAD 2>/dev/null
git rev-list --count HEAD..origin/dev 2>/dev/null
git status --porcelain
git log --oneline -5
```

**Build + lint** (run `cd` to kapi-platform first if not already there):
```bash
npm run build 2>&1 | tail -15
npm run lint 2>&1 | tail -10
```

---

## Phase 2 — Agents (launch ALL THREE simultaneously)

Read `agents.md` for detailed instructions on each agent. Use the Task tool to launch all three agents in a SINGLE message (three parallel tool calls). Do not wait for one before starting the next.

Wait for all three agents before Phase 3.

---

## Phase 3 — Write Report

Create the preflight report using the format in `templates/report.md`.

---

## Phase 4 — Print Summary

After writing the file, print this to the conversation:

```
preflight $ARGUMENTS complete:
  Git    {✅ in sync / ⚠️ N ahead+behind / N uncommitted}
  Build  {✅ clean / ❌ N errors}
  Arch   {✅ clean / ⚠️ N issues (N critical)}
  Infra  {✅ healthy / ⚠️ N issues}
  UX     {N/10 / skipped}
  ──────────────────────────────────────────
  Verdict: {Green / Caution / Blocked}
  Report: docs/operations/sprints/$ARGUMENTS/preflight.md
```

---

## Verdict Rules

| Condition | Verdict |
|-----------|---------|
| Build has errors | ❌ Blocked — cannot start sprint |
| Arch has critical drift (>20% overstatement) | ⚠️ Caution — update status.md before /prd |
| Infra health checks fail on staging | ⚠️ Caution — investigate before Block D smoke tests |
| Local has uncommitted changes | ⚠️ Caution — commit or stash before /dev |
| Everything passes | ✅ Green |

Multiple issues: use the most severe verdict level.

## Blackboard Auto-Post

Read `../blackboard/posting.md` for the posting convention.
- **Blocked verdict**: auto-post as `blocker` — this is critical, other terminals need to know.
- **Caution verdict with critical arch drift**: auto-post as `finding`.
- **Green verdict**: do NOT post — no news is good news.

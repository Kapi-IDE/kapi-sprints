# Preflight Report Format

Create `./docs/operations/sprints/$ARGUMENTS/preflight.md` using this format:

```markdown
# Preflight — Sprint $ARGUMENTS
_Generated: {ISO date}_

## Summary

| Check | Result | Detail |
|-------|--------|--------|
| Git | {✅ / ⚠️} | {local sync status} |
| Build | {✅ / ❌} | {0 errors / N errors} |
| Lint | {✅ / ⚠️} | {0 errors / N warnings} |
| Arch | {✅ / ⚠️ / ❌} | {N drift issues (N critical)} |
| Infra | {✅ / ⚠️ / ❌} | {all healthy / N issues} |
| UX | {N/10 / Skipped} | {top finding or "no UI changes"} |

**Verdict**: {one of:}
- ✅ Green — all checks pass. Safe to start sprint $ARGUMENTS.
- ⚠️ Proceed with caution — {top 1-2 issues to watch}
- ❌ Blocked — {reason, e.g. "build has N errors — fix before starting"}

---

## Git Status

| Branch | Commit | Status |
|--------|--------|--------|
| origin/main (prod) | {hash} | {N commits behind dev / In sync with dev} |
| origin/dev (staging) | {hash} | Current tip |
| Local {branch-name} | {hash} | {In sync with origin/dev ✅ / N ahead, M behind / N uncommitted changes} |

**Recent commits**:
```
{git log --oneline -5 output, verbatim}
```

---

## Build + Lint

{Paste relevant build output. If clean: "✅ Build clean — 0 errors, 0 warnings". If errors: full error list.}

---

## Architecture Drift

{arch-reviewer findings, organized as Critical / Important / Minor.
 If no drift: "✅ No significant drift detected."
 Always include: "status.md layer %s: {actual vs claimed for any layers that differ by >10%}"}

---

## Infrastructure

{infra-checker findings.
 Always include the health check results: prod URL status, staging URL status.
 If all healthy: "✅ All services healthy — prod and staging responding."}

---

## UX Audit

{ux-glassmorphic-auditor findings with consistency score, or "Skipped — no UI changes since last sprint."}
```

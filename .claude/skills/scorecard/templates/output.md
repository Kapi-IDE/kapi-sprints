# Scorecard Output Format

Write the updated scorecard to `docs/operations/scorecard.md` using this format:

```markdown
# 8-Layer Readiness Scorecard

*Last updated: {DATE} — audited via /scorecard command*

| Layer | Manifest → Config | Config → Runtime | End-to-End | Verdict |
|-------|:-----------------:|:----------------:|:----------:|---------|
| 1. UI | ??% | ??% | **??%** | One sentence. |
| 2. Graph | ??% | ??% | **??%** | One sentence. |
| 3. Integrations | ??% | ??% | **??%** | One sentence. |
| 4. Knowledge | ??% | ??% | **??%** | One sentence. |
| 5. Memory | ??% | ??% | **??%** | One sentence. |
| 6. HITL | ??% | ??% | **??%** | One sentence. |
| 7. Eval | ??% | ??% | **??%** | One sentence. |
| 8. Observability | N/A | ??% | **??%** | One sentence. |

## Top 3 Blockers (for this sprint)

List the 3 lowest-scoring E2E layers and the single code change that would most improve their score.

1. **Layer N**: Gap is [X]. Fix: [specific file + function].
2. **Layer N**: Gap is [X]. Fix: [specific file + function].
3. **Layer N**: Gap is [X]. Fix: [specific file + function].
```

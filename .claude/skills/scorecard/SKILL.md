---
name: scorecard
description: "8-layer readiness audit for Kapi platform. Audits actual code paths (manifest-transformer → runtime) and rewrites scorecard.md with honest percentages. Use when status.md grades feel optimistic, before /prd, or after significant code changes."
allowed-tools: Read, Grep, Glob, Write
---

# /scorecard — 8-Layer Readiness Audit

Update `docs/operations/scorecard.md` by auditing the actual code paths for all 8 layers.

## What You're Measuring

Three columns, each as an honest percentage:

| Column | Question |
|--------|----------|
| **Manifest → Config** | Does `lib/manifest-transformer.ts` extract this layer's data and put it into `TenantConfig`? |
| **Config → Runtime** | Does the runtime code (chat route, tenant page, graph router) actually read and use that config? |
| **End-to-End** | Both columns working together. Not an average — if either side is broken, E2E is low. |

Scoring guidance:
- **0%**: Not extracted / not read at all
- **25%**: Partially extracted or read but not acted on
- **50%**: Extracted and read, but with significant gaps or hardcoded fallbacks
- **75%**: Works end-to-end for common cases, some edge cases missing
- **95%**: Fully wired, only minor gaps

## Audit Protocol

For each layer (1-8), read the corresponding file at `layers/{NN}-{name}.md`. It lists the files to read and the key question to answer. Assess both sides of the wire independently, then write a one-sentence verdict that explains the biggest remaining gap.

## Output

After auditing all 8 layers, write the updated scorecard using the format in `templates/output.md`.

Be honest. If something is 0%, say 0%. The scorecard is used to prioritize sprint work — optimism defeats its purpose.

## Blackboard Auto-Post

Read `../blackboard/posting.md` for the posting convention. After completing the audit:
- If any layer's E2E score **dropped >20%** from the previous scorecard: pause and ask the human via AskUserQuestion before continuing. Then post as `finding`.
- If the Top 3 Blockers changed significantly: auto-post as `finding`.
- If scores are stable: do NOT post — no news is good news.

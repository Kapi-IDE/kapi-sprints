# Agent Invocation Details

Launch all three agents simultaneously using the Task tool.

## 1. arch-reviewer

Audit doc-code drift across `kapi-platform/`. Focus on:
- Completion %s in `docs/operations/status.md` vs actual implementation
- API routes documented but missing from `app/api/`
- Blueprint model claimed in docs but not in code
- ADR decisions still reflected in code

Report critical/important/minor findings with file:line references.
If status.md %s are significantly overstated, note the corrected values.

## 2. infra-checker

Validate:
- Port consistency across PM2 config, GitHub Actions, nginx, docs
- PM2 ecosystem config vs actual deployed processes
- Azure Container Apps config vs expected
- Live health checks: `curl -s https://app.getkapi.com/api/health` and `https://staging.getkapi.com/api/health`

Report any mismatches with exact file references.

## 3. ux-glassmorphic-auditor (conditional)

First check: `git log --oneline origin/main..HEAD -- components/ app/`
- If UI commits exist: run full audit, use `/workbench` as benchmark
- If no UI commits: skip and note "No UI changes since last sprint — audit skipped"

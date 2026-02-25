---
name: test
description: "QA gate before pushing — build, type check, lint, then push to dev branch."
argument-hint: "[sprint e.g. v1]"
allowed-tools: Read, Write, Bash
---

You are running the QA gate for sprint "$ARGUMENTS".

## Steps (run in order — stop on first failure)

### 1. Build
```bash
npm run build
```
If this fails: report the errors, do NOT continue to step 2. Fix is needed first.

### 2. Type check
```bash
npx tsc --noEmit
```
If this fails: report the type errors, do NOT continue.

### 3. Lint
```bash
npm run lint
```
If this fails: report lint errors, do NOT continue.

### 4. All passed — push
```bash
git push origin dev
```
This triggers the staging auto-deploy.

## After Running

Write a one-line summary to `## Activity` in `docs/operations/blackboard/board.md`:

**On pass:**
`- **Test** ($ARGUMENTS) — QA gate passed: build ✓ types ✓ lint ✓ — pushed to dev — {ts}`

**On fail:**
`- **Test** ($ARGUMENTS) — QA gate FAILED at {step}: {error summary} — {ts}`

Get timestamp: `date "+%b %-d %-I%p" | tr '[:upper:]' '[:lower:]'`

## Report to User

```
QA Gate — Sprint $ARGUMENTS

Build:      ✓ / ✗
Types:      ✓ / ✗
Lint:       ✓ / ✗

{PASSED — pushed to dev} or {FAILED at {step} — fix needed}
```

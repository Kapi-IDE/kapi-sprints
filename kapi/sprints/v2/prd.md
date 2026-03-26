# Sprint v2 — Student Portability

**Goal**: Make kapi-sprints work out of the box for MAI students who clone the repo and set their Gemini key.

**Sprint window**: 2 hours

---

## Why This Sprint

Sprint v1 built the multi-agent coordination system, but it's hardcoded to one developer's machine. Absolute paths in config, a committed API key, and hardcoded sprint links mean students can't clone and run. This sprint fixes all portability issues so the repo ships clean.

---

## Scope

### In
- Remove hardcoded absolute paths from project.config.ts
- Clear Gemini key from .mcp.json (ship empty)
- Fix API route path references
- Dynamic sprint link in sidebar
- Gitignore ephemeral state (blackboard-live.yaml)
- Verify get-started page paths
- Update README with student setup instructions

### Out
- Competence engine (deferred)
- Real-time SSE (separate track)
- CLI packaging (future)

---

## Acceptance Criteria
- [ ] Clone repo to fresh directory → `npm install` → `npm run dev` → dashboard loads
- [ ] No absolute paths in any committed file
- [ ] `.mcp.json` ships with empty GEMINI_API_KEY
- [ ] Setting a `mai_gk_` key enables Gemini tools
- [ ] `npm run build` passes

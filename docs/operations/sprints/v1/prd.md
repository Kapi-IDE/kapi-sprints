# Sprint v1 — Distributable Product

**Goal**: Ship kapi-sprints as a real, installable product: `npx kapi-sprints dashboard` opens a live-updating dashboard; `claude plugin install kapi-sprints@kapihq` gives any Claude Code team the full sprint workflow.

**Sprint window**: 2-3 days

---

## Why This Sprint

The current repo is a working prototype — the dashboard reads markdown and the skills run locally. But it's not yet distributable: no CLI entry point, no plugin package, no real-time file watching (the UI polls every 30 seconds instead of updating instantly). This sprint closes those gaps.

A PM discovering kapi-sprints on GitHub should be able to run two commands and have a working system. Right now they can't.

---

## Scope

### In

- **Real-time file watching** — replace 30s polling with chokidar + SSE so the dashboard updates within 1 second of any `.md` file change
- **CLI packaging** — `npx kapi-sprints dashboard` launches on port 3838, discovers `kapi-sprints.config.md` in the caller's project
- **Plugin structure** — `plugin/` directory with `plugin.json` + `marketplace.json` so the plugin is installable via Claude marketplace
- **Generalized skills in `plugin/`** — copy skills from `.claude/skills/` into `plugin/skills/`, stripped of any kapi-platform-specific references

### Out

- `/sprint init` Foundation Gate (v2 — needs conversational UX design)
- `/scorecard` with config-based layers (v2)
- `walkthrough`, `preflight`, `checkpoint`, `resume` skills (v2)
- Anthropic official marketplace submission (after launch)
- Content / LinkedIn posts (after launch)

---

## Acceptance Criteria

- [ ] Edit `board.md` in a project using kapi-sprints; dashboard at `localhost:3838` reflects the change within 2 seconds, no browser refresh
- [ ] `npx kapi-sprints dashboard` from a project with `kapi-sprints.config.md` opens the dashboard on port 3838
- [ ] `npx kapi-sprints dashboard` without `kapi-sprints.config.md` prints a clear error and exits
- [ ] `plugin/.claude-plugin/plugin.json` validates against the plugin spec in `docs/design/plugin.md`
- [ ] `plugin/.claude-plugin/marketplace.json` validates against the marketplace spec in `docs/design/distribution.md`
- [ ] `plugin/skills/` contains `prd`, `dev`, `test`, `post` — all free of kapi-platform-specific references (no mentions of blueprints, manifests, Kapi 8-layer architecture, or Azure)
- [ ] `npm run build` passes after all changes

---

## Architecture Notes

From `docs/design/architecture.md` and `docs/design/dashboard.md`:

- Dashboard runs as a **separate process** from Claude Code. Port 3838 (not 3000).
- File watching: chokidar watches `.md` files → broadcasts via **Server-Sent Events** (SSE) → browser EventSource calls `router.refresh()`. SSE is simpler than WebSocket for v1 (one-directional is sufficient).
- CLI: `bin/cli.js` checks for `kapi-sprints.config.md` in `process.cwd()`, starts Next.js on port 3838.
- Plugin: `plugin/` contains only the Claude Code side. `dashboard/` (or root `app/`) contains only the Next.js side. They share nothing in code — only the `.md` file format contract.

---

## Risks

- SSE in Next.js App Router requires a persistent server-side watcher — use a module-level singleton so chokidar isn't re-instantiated per request
- `npx` requires the package to be on npm OR run locally via `node bin/cli.js`. For v1, local execution via `node bin/cli.js` is acceptable; npm publish is post-launch
- Plugin marketplace format (`claude plugin marketplace add`) is not yet publicly documented — base `plugin.json` format on `docs/design/plugin.md` spec and validate against any available Anthropic docs

---

## References

- `docs/design/architecture.md` — monorepo structure, data flow, file conventions
- `docs/design/dashboard.md` — CLI entry point, port 3838, SSE/WebSocket data layer
- `docs/design/plugin.md` — plugin.json spec, skills list, marketplace format
- `docs/design/distribution.md` — marketplace.json spec, install flow

# Sprint v1 — Stabilize Pipeline + Decision Capture

**Goal**: Fix the broken directive pipeline, polish the dashboard for demo-readiness, and lay the HITL foundation with a unified decisions system.

**Sprint window**: 3 hours

---

## Why This Sprint

The blackboard infrastructure works — agents register, the dashboard renders live state, skills exist for the full sprint cycle. But the directive pipeline (the core PM→agent command channel) is broken, the get-started page has inaccurate paths, and there's no structured way to capture decisions. This sprint fixes the coordination plumbing, cleans up for demo, and introduces `kapi/decisions.yaml` as the single file for both ADRs and agent reviews — the data layer the HITL autonomy ramp (v2) depends on.

---

## Scope

### In
- Fix directive delivery from dashboard/agents page to agents (P0 bug)
- Fix get-started page: wrong paths (`docs/operations/` → `kapi/`), non-existent `/sprint init`, wrong `npx` command
- Page title consistency across Backlog and other pages
- Verify snapshot.yaml → dashboard end-to-end
- Create `kapi/decisions.yaml` — single YAML file for ADRs + agent reviews
- Update `/api/blackboard/resolve` to write to `decisions.yaml` instead of entry files
- Build `/decisions` page — parses YAML, renders visual decision cards, linked from sidebar
- `/review` skill — human rates agent work, appends structured record to `decisions.yaml`
- Update stale `status.md` and `board.md`

### Out
- **Competence engine** — deferred to v2. Needs decision data to score against.
- **Shadow mode / active learning** — deferred to v3. Needs competence scores first.
- **Real-time SSE** — separate track.
- **Distribution / npx packaging** — not this sprint.

---

## Acceptance Criteria

- [ ] Posting a directive from the dashboard reaches the target agent via `<channel>` notification
- [ ] Get-started page references only paths and commands that exist
- [ ] All pages have distinct browser tab titles
- [ ] `snapshot.yaml` content renders in the dashboard status panel
- [ ] `kapi/decisions.yaml` exists with schema and at least one seed ADR
- [ ] Resolving an Open Decision via the dashboard writes to `decisions.yaml`
- [ ] `/decisions` page renders all entries from `decisions.yaml` as visual cards
- [ ] Sidebar "ADRs" link points to `/decisions`
- [ ] `/review` skill prompts human, appends well-formed record to `decisions.yaml`
- [ ] `status.md` reflects what's actually built
- [ ] `npm run build` passes with zero errors

---

## Risks

- **Directive pipeline**: Root cause unclear — could be server-side routing, shim notification, or agent filtering. T01 may take longer than estimated if the bug is in the broadcast logic.
- **decisions.yaml concurrent writes**: If two agents resolve decisions simultaneously, last-write-wins. Acceptable at current scale. Flag for v2 if it becomes an issue.

---

## Decisions

- Decisions (ADRs + agent reviews) stored in a single `kapi/decisions.yaml`, not individual files — simpler to parse, one file to read, atomic
- ADRs and reviews distinguished by `type: adr` vs `type: review` in each record
- The `/decisions` page replaces the old `/docs/adr.md` link in the sidebar
- `kapi/` is the operational state directory; `docs/` stays for human-authored documentation

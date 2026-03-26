# Sprint v2 — Decision Capture + Competence Scoring

**Goal**: Build the data layer and scoring engine that all three HITL autonomy features (competence tracking, shadow mode, active learning) depend on.

**Sprint window**: 3 hours

---

## Why This Sprint

kapi-sprints v1 proved multi-agent coordination works — agents post signals, humans read the board, sprints close clean. But every action gets the same review treatment regardless of agent track record. There's no memory of past reliability, no way for agents to earn autonomy over time.

The vision describes three HITL features: competence tracking, shadow mode, and active learning. All three consume structured decision data that doesn't exist yet. This sprint builds the capture pipeline and scoring engine — the foundation everything else depends on.

---

## Scope

### In

- Decision record format: markdown + frontmatter in `docs/operations/decisions/`, one file per reviewed action
- Parser to read decision records and return typed arrays
- `/review` skill: human rates an agent's last action (approve/reject/edit), writes a structured decision record
- Competence score computation: group decisions by category, compute per-category reliability scores
- Autonomy ramp formula: `review_rate = max(baseline, initial * e^(-competence * time))` per category
- Dashboard competence panel: per-category scores with color coding in Overview
- Review rate display: show current autonomy level per category
- Scorecard updated with HITL/Autonomy layer

### Out

- **Shadow mode** — deferred to v3. Needs real decision history to compare agent vs human choices. Building comparison logic against an empty dataset is pointless.
- **Active learning / DPO** — deferred to v3. Prompt optimization and fine-tuning need meaningful dataset volume. The decision records from this sprint start accumulating that data.
- **Real-time SSE** — separate track. Board blocker: Next.js App Router doesn't support persistent connections natively. Needs custom server investigation.
- **CLI packaging / plugin marketplace** — distribution track, not HITL track.
- **/resume + /checkpoint skills** — context recovery track, candidate for v3 alongside shadow mode.

---

## Acceptance Criteria

- [ ] `docs/operations/decisions/` directory exists with a sample decision record
- [ ] Decision records have typed frontmatter: `type` (approve/reject/edit), `category`, `agent`, `task`, `timestamp`, `sprint`
- [ ] `/review` skill prompts human, writes a well-formed decision record, confirms to terminal
- [ ] `lib/decisions.ts` parser reads all decision files, returns typed array, handles empty directory
- [ ] `lib/competence.ts` computes per-category scores from decision history
- [ ] Autonomy ramp formula produces review rates that decay with proven competence
- [ ] Overview panel shows competence scores per category (green >80%, amber 50-80%, red <50%)
- [ ] Review rate percentage displayed per category
- [ ] `scorecard.md` includes HITL/Autonomy layer with baseline percentage
- [ ] `npm run build` passes with zero errors

---

## Risks

- **Cold start**: With zero decision records, the competence panel shows empty state. Needs graceful "no data yet" handling.
- **Category taxonomy**: What categories do we track? (refactoring, testing, feature, docs, etc.) May need iteration after real usage.
- **Formula tuning**: The exponential decay parameters (baseline, initial rate) are guesses until we have real data. Ship with sensible defaults, tune in v3.

---

## Decisions

- Decision records stored as markdown + frontmatter (consistent with blackboard entries pattern), not JSON or SQLite
- Categories are free-text strings on decision records, not a fixed enum — lets the taxonomy emerge from usage
- Competence scores are read-only computations, not cached — recomputed on page load from decision files
- The `/review` skill is human-initiated (you run it after reviewing agent work), not auto-triggered

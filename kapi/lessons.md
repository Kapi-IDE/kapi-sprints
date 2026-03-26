# Lessons Learned

Append-only log of what we learned, what surprised us, and patterns worth repeating.

---

## 2026-03-25 — Docs reorganization

**What surprised us:** docs/ had 28 files across 5 directories with heavy overlap and stale paths. The live state had migrated from `docs/operations/` to `kapi/` but nobody updated CLAUDE.md or skills — agents were reading stale path references. Two different files named `vision.md` served different purposes. 8 design docs collapsed to 3 without losing information.

**Pattern to repeat:** When restructuring, grep for all path references before deleting directories. Stale paths in CLAUDE.md and skills silently break agent coordination.

**Why it matters:** Anchoring all concept docs on the 16 pillars of MAS research gave the docs a spine. Every feature maps to a pillar, every pillar explains why the feature exists. This makes the docs useful for both users ("what does this do?") and contributors ("why does it work this way?").

---

## 2026-03-25 — Sprint v1 Setup

**What surprised us:** The blackboard notification system broadcasts to ALL agents, not just the target. Agents get flooded with heartbeat noise they have to ignore. Targeted notifications require knowing which shim owns which agent — the server doesn't track this mapping.

**Pattern to repeat:** File-based state (board.md, decisions.yaml, backlog.md) survives server restarts and agent crashes. When the blackboard server restarted, all state was preserved because it's in YAML/markdown files, not in memory.

**Why it matters:** Multi-agent coordination needs both a live channel (WebSocket/notifications) AND durable state (files). Neither alone is sufficient. The live channel is for "something changed," the files are for "what is true."

---

## 2026-03-25 — Dashboard Redesign

**What surprised us:** The original dashboard mixed sprint-specific content (task kanban, stage nav) with project-level content (backlog, board sections, agent roster). Separating them into `/dashboard` (command center) and `/sprints/v1` (sprint workspace) made both clearer.

**Pattern to repeat:** One input box, multiple read-only views. The human writes once, the agent decides what type it is. Don't make the user choose between "chat" and "directive" and "task" — that's the agent's job.

**Why it matters:** UI that mirrors the data model confuses users. UI should mirror the user's mental model: "I want to tell the agent something" (one input) and "I want to see what's happening" (multiple views).

---

## 2026-03-26 — Sprint v1 Retrospective

### PM (control-shell)

**Callback registry is volatile.** The blackboard server's callback registry lives in memory. Every server restart orphans all shims — they can still read/write but never receive broadcasts. Fix: shim heartbeat now re-registers callbacks every 5 minutes. This self-heals within one heartbeat cycle. Lesson: any in-memory registry needs a re-registration protocol.

**Timestamps must come from the system, not the agent.** I was sending hardcoded estimated timestamps in heartbeats, drifting hours from reality. The fix was trivial (run `date -u` before each write) but the symptom was confusing — dashboard showed "16h ago" while I was actively working. Lesson: never trust an LLM to track time.

**Task allocation by specialization works.** Routing infra/data tasks to captain and UI/page tasks to dev2 based on their history produced faster completions and fewer build failures. The agents built context in their domain and got faster as the sprint progressed. Formalized this in /prd skill.

### Captain

**Targeted notifications need agent→shim mapping.** The server can't route to a specific agent because it doesn't know which shim owns which agent. Workaround: agents filter by name. Fix shipped: server maps agent→shim on write to agents.*. Lesson: transport layer needs identity awareness.

**File-based state is the hero.** Server restarts mid-sprint preserved all state because it's in YAML/markdown. The live channel says "something changed", files say "what is true". Both needed, but files are source of truth.

### Dev2 (Copilot)

**Check if tasks are already done before starting.** Multiple tasks (T09, T11, T14) were assigned but already completed by other agents. Reading the codebase first (ls and grep before coding) saves duplicate work.

**Type mismatches between shared parsers and new components are the #1 build failure.** Always read the actual interface before writing component props — don't guess field names.

**Dead code cleanup matters.** When replacing a page's implementation, delete old components immediately. Stale imports cause build failures that look unrelated.

### Test

**Extract module-scoped functions to lib/ before writing tests.** page.tsx had 6 parser functions untestable in-place. 5-minute refactor enabled 55 tests.

**Idle agents are natural integration monitors.** The broadcast bug was only visible because test was idle watching channel traffic. The noise IS signal.

**QA after multi-agent sprints is mostly path verification, not logic.** Build catches type errors. What it misses is files that don't exist or paths that changed. A "does this file exist" sweep catches 90% of runtime failures.

# HITL Research vs. kapi-sprints: Gap Analysis

*Source research: `/Users/bv/Code/active/kapi-platform/docs/research/features/kapi_hitl_research.md`*
*Evaluated: 2026-02-24*

---

## The Research Framework

The HITL research defines the blackboard as a **shared workshop** — not a review queue. Humans and AI agents are coworkers: both code, both post blockers, both get stuck, both contribute. The human is *on* the board, not above it.

Four composable concepts form a team operating loop:

```
Signal → Structure → Learn → Govern → (back to Signal)
```

| Concept | What it solves |
|---|---|
| **Signal** | When anyone needs help — graduated, bidirectional |
| **Structure** | How to work together — collaboration patterns, not gates |
| **Learn** | Adapt team composition — trust is mutual |
| **Govern** | Monitor team health — all participants, not just agents |

---

## Concept 1: Signal — Anyone Raises Their Hand

**The vision**: Every participant (human or agent) emits signals. The escalation engine treats them uniformly and routes to the best-available coworker.

Signal types:
- `STUCK` — "I can't proceed without X"
- `NOTICE` — "I see something others should know"
- `AVAILABLE` — "I have capacity for work"
- `IMPACT` — auto-computed from dependency map
- `OFFER` — "I can help with that"

Routing: not "agent uncertain → human reviews" but "anyone stuck → best-available coworker responds."

### kapi-sprints today

| Research requirement | Status | Notes |
|---|---|---|
| Anyone can post a signal | ⚠️ Partial | Agents write to `board.md`; humans write manually. No structured protocol. |
| Bidirectional (human → agent AND agent → human) | ❌ Missing | Currently one-directional: agents post, humans read. |
| Signal types (STUCK / NOTICE / AVAILABLE / OFFER / IMPACT) | ⚠️ Partial | Stream entry types cover `blocker`, `finding`, `decision`, `queued`. Missing `stuck`, `available`, `offer`, `impact`. |
| Routing to best-available coworker | ❌ Missing | Signals appear on dashboard but no routing logic exists. |
| Escalation with urgency scoring | ❌ Missing | Badge counts are visual only — no urgency scoring, no auto-escalation. |

**What's there**: The **data plane** is solid. `board.md` sections, stream entry files, Overview panel, sidebar badges all exist. The **signal protocol** sitting on top of that data plane does not.

**Gap summary**: You have a notice board. The research calls for a signaling system.

---

## Concept 2: Structure — How Coworkers Actually Work Together

**The vision**: Five collaboration modes that participants enter — not just resolve/ack:

| Mode | Description |
|---|---|
| **PAIR** | Two participants work the same item simultaneously |
| **HANDOFF** | One completes their part, passes to the next |
| **CONSULT** | Solo worker needs a quick peer input — NOT an escalation |
| **VERIFY** | Structured check after work is done (bidirectional) |
| **SPLIT** | Decompose a blocker into sub-tasks, distributed across team |

The modes are signal-aware: a STUCK signal suggests PAIR, NOTICE suggests CONSULT, AVAILABLE enables HANDOFF.

### kapi-sprints today

| Research requirement | Status | Notes |
|---|---|---|
| PAIR mode with shared work card | ❌ Missing | No UX for two participants working an item together. |
| HANDOFF mode with relay progress | ❌ Missing | No structured handoff trail. |
| CONSULT mode (targeted peer question) | ❌ Missing | Posting to stream is broadcast, not targeted. |
| VERIFY mode (role-aware checklist) | ❌ Missing | — |
| SPLIT mode (decompose → distribute) | ❌ Missing | — |
| Resolution traces who did what | ⚠️ Partial | Stream entries capture `role` and `filename`. The *collaborative process* is not captured. |
| Mode suggestion based on signal type | ❌ Missing | — |

**What's there**: The right panel *had* PAIR/HANDOFF/CONSULT/AUTO labels (now rebuilt as sprint stats). A basic "Resolve →" dialog existed in the old Blackboard tab.

**Gap summary**: This is the **most absent** concept in the product. The research says Structure is the core. Current kapi-sprints has a text box.

---

## Concept 3: Learn — The Team Learns About Itself

**The vision**: A team competence map tracking individual strengths AND pair effectiveness. Routing evolves over time. Agents earn autonomy; humans earn delegation (freed from tasks the agent pair handles better).

```
INDIVIDUAL STRENGTHS
  Human: architecture 0.95, implementation 0.62, testing 0.41
  Dev:   implementation 0.91, architecture 0.58, code review 0.84

PAIR EFFECTIVENESS
  Human + Dev on architecture: 0.97  ← best combo
  Dev + Test on code review:   0.89  ← agent pair, no human needed

ROUTING IMPLICATIONS
  Architecture blocker → Human solo or Human+Dev PAIR
  Implementation task  → Dev solo (autonomous)
  Testing              → Dev+Test PAIR (keep human out)
```

### kapi-sprints today

| Research requirement | Status | Notes |
|---|---|---|
| Per-participant competence scores by task type | ❌ Missing | — |
| Pair effectiveness tracking | ❌ Missing | — |
| Routing suggestions from competence map | ❌ Missing | — |
| Autonomy ramp (agents earn autonomy, humans earn delegation) | ❌ Missing | — |
| Shadow mode for new participants | ❌ Missing | — |
| Raw input data: git stats per author | ✅ Done | Right panel now shows lines added/removed/commits per author. This IS the seed data for competence inference. |

**Gap summary**: The **raw signal** (git stats per author) is captured. The inference layer that turns it into a competence map is missing. This concept is furthest from done, but the foundation data is now there.

---

## Concept 4: Govern — Team Health, Not Just Agent Drift

**The vision**: Monitor the whole team — including the human. If the human is a bottleneck on architecture decisions, that's a governance signal. If the best-performing pair hasn't been assigned together in two weeks, that's a governance signal.

Key metrics:
- **Flow**: items in/day, items resolved/day, mean time to resolve
- **Bottlenecks**: who's holding up work (could be human OR agent)
- **Pair performance**: which combinations produce good outcomes, trending how
- **Engagement quality**: override rate, auto-resolve rate, cognitive forcing skips
- **Mode distribution**: PAIR 40%, HANDOFF 30%, CONSULT 20%, VERIFY 10%
- **Drift alerts**: participant competence dropping, escalation rates rising

### kapi-sprints today

| Research requirement | Status | Notes |
|---|---|---|
| Flow: items in/day, resolved/day, mean TTR | ⚠️ Placeholder | Right panel has IN/OUT and Avg TTR sections — both `—`, no live data. |
| Bottleneck detection | ❌ Missing | — |
| Pair performance trends | ❌ Missing | — |
| Engagement quality metrics | ❌ Missing | — |
| Mode distribution bars | ⚠️ Placeholder | Was in old right panel at 0%. Removed during rebuild. |
| Drift alerts with governance actions | ❌ Missing | — |
| Sprint cost / API time | ✅ Done | Right panel reads `cost.md`. |
| Code output per agent (lines added/removed) | ✅ Done | Right panel reads from git log. |
| Token usage (in/out/cache) | ⚠️ Partial | Placeholders exist; needs `cost.md` population or OTel. |

**Gap summary**: The right panel is the correct home for Govern. Cost and git stats are live. Flow and engagement metrics need either OTel integration or manual writes from agents.

---

## Overall Coverage Score

| Concept | Coverage | What exists | What's missing |
|---|---|---|---|
| **Signal** | ~25% | Data plane (board.md, stream entries, badges) | Signal protocol, routing, bidirectional, typed signals |
| **Structure** | ~5% | Basic resolve text box (now removed) | All 5 collaboration modes |
| **Learn** | ~10% | Git stats per author (seed data) | Competence inference, routing, autonomy ramp |
| **Govern** | ~20% | Right panel with cost + git stats | Flow metrics, bottlenecks, pair performance, drift |

---

## Recommended Build Order

### Now — zero new infrastructure needed

1. **Extend stream entry types** to include `stuck`, `available`, `offer`
   - The file format already supports any `type:` value
   - Add UI badges and sidebar treatment for these types
   - Completes Signal's data plane

2. **Mode tracking in right panel**
   - When an agent writes a `handoff` or `pair` entry to stream, auto-classify
   - Populates mode distribution bars with real data
   - Pure read-from-files logic

3. **Stale signal detection**
   - If a `stuck` or `blocker` entry is > N hours old and unresolved, surface it prominently in right panel
   - Bottleneck detection with zero new infra

### Medium effort — high PM value

4. **Handoff entry format**
   - Structured stream entry: `type: handoff`, with `from:`, `to:`, `context:` fields
   - Rendered as a relay card in the doc viewer
   - Implements Concept 2's HANDOFF mode in the file layer

5. **Pair session entry format**
   - `type: pair`, captures both participants + resolution
   - Overview Queue becomes the pairing queue
   - Competence seed: pair outcomes feed into the learn layer

6. **Flow metrics from entry timestamps**
   - Items created vs. resolved per day is computable from entry file timestamps
   - Mean TTR computable from `type: blocker` creation to `type: resolved`
   - No OTel needed — pure file reads

### Longer term — needs external integration

7. **Competence map** — inferred from git stats + resolution history (Concept 3)
8. **Live token/flow metrics** — via OTel export to existing Langfuse instance (Concept 4)
9. **Routing suggestions** — surface "Dev is best for this" based on competence map (Concept 1 + 3)
10. **PAIR/CONSULT mode UX** — real-time collaboration card on the blackboard (Concept 2)

---

## Key Architectural Observation

The file-based architecture of kapi-sprints is a **perfect fit** for this research.

Every concept maps to the same pattern:
```
agent/human writes → .md file in docs/operations/ → dashboard reads + renders
```

You don't need a database, realtime layer, or LangGraph integration to get 60–70% coverage of the four concepts. The signal types, collaboration modes, and governance metrics can all be expressed as structured markdown entries that the existing parser already reads.

The **biggest gap is not technical** — it's the Signal protocol. Defining how humans and agents communicate on the board (what signal types exist, what format they use, what triggers routing) is a design decision, not an engineering one. Once that's settled, the implementation is mostly adding new `type:` values to stream entries and updating the UI to render them distinctly.

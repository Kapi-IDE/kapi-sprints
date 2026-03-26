# Sprint v2 Tasks

## Block A: Decision Record Infrastructure

- [ ] **T01: Define decision record schema** (S)
  What: Create the frontmatter format for decision records — one .md file per reviewed agent action
  Files: docs/operations/decisions/README.md
  Logic:
    frontmatter fields: type (approve|reject|edit), category (free text), agent (Dev|Test|PM), task (T01 etc), sprint (v1 etc), timestamp, notes
    body section: optional diff or reasoning for reject/edit
    filename convention: {date}-{sprint}-{task}-{type}.md (e.g. 2026-03-12-v2-T04-approve.md)
  Test: README documents the schema with a concrete example

- [ ] **T02: Create decision record parser** (S)
  What: TypeScript module that reads docs/operations/decisions/*.md and returns typed array
  Files: lib/decisions.ts
  Logic:
    read directory, filter .md (skip README), parse frontmatter + body
    return DecisionRecord[] with typed fields
    handle empty directory gracefully (return [])
    handle malformed files (skip with warning, don't crash)
  Depends: T01
  Test: import parser, call with empty dir → [], call with sample file → correct typed object

- [ ] **T03: `/review` skill** (M)
  What: Claude Code skill that prompts human to rate an agent action, writes structured decision record
  Files: .claude/skills/review/SKILL.md
  Logic:
    reads recent git log + board.md for context on what agent just did
    asks: which task? approve/reject/edit? what category? any notes?
    writes decision record to docs/operations/decisions/ with correct frontmatter
    confirms: "Decision recorded: [type] for [task] in category [category]"
  Depends: T01
  Test: run /review, walk through prompts, verify .md file written with valid frontmatter

## Block B: Competence Engine

- [ ] **T04: Competence score computation** (M)
  What: Function that reads decision records, groups by category, computes per-category reliability scores
  Files: lib/competence.ts
  Logic:
    group decisions by category field
    per category: approve_rate = approves / total, weighted by recency (recent decisions count more)
    recency weight: exponential decay, half-life of 10 decisions
    return CompetenceScore[] = { category, approveRate, totalDecisions, recentTrend }
    empty input → empty array
  Depends: T02
  Test: pass in mock DecisionRecord[], verify scores match expected values

- [ ] **T05: Autonomy ramp formula** (S)
  What: Compute review rate per category using exponential decay based on competence
  Files: lib/competence.ts
  Logic:
    review_rate = max(baseline, initial * e^(-competence * time))
    baseline = 0.05 (5% — always sample at least 5%)
    initial = 1.0 (100% review on day 1)
    competence = approve_rate from T04
    time = number of decisions in category (proxy for experience)
    export function getReviewRate(score: CompetenceScore): number
  Depends: T04
  Test: 0 decisions → 100% review, 20 decisions at 95% approve → review rate < 30%, high reject rate → review stays high

- [ ] **T06: Competence data export for dashboard** (S)
  What: Server-side function that returns competence + review rate data for dashboard consumption
  Files: lib/competence.ts
  Logic:
    export async function getCompetenceData(): CompetenceSummary
    reads decisions via parser (T02), computes scores (T04), applies ramp (T05)
    returns { categories: [{ name, approveRate, reviewRate, totalDecisions, trend }], lastUpdated }
  Depends: T04, T05
  Test: call function with sample decisions dir → returns well-formed CompetenceSummary

## Block C: Dashboard Integration

- [ ] **T07: Competence panel in Overview** (M)
  What: New card in the Overview panel showing per-category competence scores with color coding
  Files: app/[version]/_components/OverviewPanel.tsx
  Logic:
    new "Agent Competence" card alongside existing Blockers/Decisions/Findings cards
    each category row: name, score bar (green >80%, amber 50-80%, red <50%), decision count
    empty state: "No decisions recorded yet. Run /review after reviewing agent work."
    reads data from getCompetenceData() in the server component
  Depends: T06
  Test: dashboard shows competence card, scores color-coded correctly, empty state renders cleanly

- [ ] **T08: Review rate display** (S)
  What: Show current autonomy level (review %) per category in the competence panel
  Files: app/[version]/_components/OverviewPanel.tsx
  Logic:
    add review rate percentage next to each category score
    format: "Testing: 92% reliable · 12% review rate"
    tooltip or subtitle: "Based on N decisions"
    high review rate (>50%) gets amber indicator, low (<15%) gets green "autonomous" badge
  Depends: T07
  Test: review rates display correctly, badges appear at correct thresholds

- [ ] **T09: Update scorecard with HITL layer** (S)
  What: Add HITL/Autonomy as a tracked layer in scorecard.md
  Files: docs/operations/scorecard.md
  Logic:
    add row: "11. HITL | Autonomy | Decision capture + competence scoring shipped, shadow mode + active learning pending | 25%"
    update "Last updated" timestamp
  Test: scorecard.md has 11 rows, HITL layer present with honest baseline

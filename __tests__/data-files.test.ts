import { describe, it, expect } from 'vitest'
import YAML from 'yaml'
import { marked } from 'marked'

// ─── snapshot.yaml parsing ──────────────────────────────────────────────────

describe('snapshot.yaml parsing', () => {
  const sampleYaml = `
updated: "2026-03-26T13:50:00Z"
updated_by: PM

headline: "v1: Complete — Stabilize Pipeline"
status: green
phase: done
progress: "15/15"

sprint:
  id: v1
  title: Stabilize Pipeline
  goal: Fix directive pipeline, polish for demo
  window: 3 hours
  status: complete

text: |
  Sprint v1 complete. 15/15 tasks done.

tasks:
  done:
    - { id: T01, title: "Fix directive pipeline", agent: PM }
    - { id: T02, title: "Fix get-started page", agent: captain }
  in_progress: []
  queued: []

agents:
  PM: { role: PM, status: active, task: closing sprint v1 }
  captain: { role: dev lead, status: idle }

demo_safe:
  - Sprint dashboard with 5-card command center
  - Decisions system

known_gaps:
  - Chat messages overwrite instead of appending

blockers: []

milestones:
  - agent: PM
    text: "Directive pipeline fixed"
    ts: "2026-03-26T01:15:00Z"
  - agent: captain
    text: "Get-started page corrected"
    ts: "2026-03-26T01:22:00Z"
`

  it('parses headline and status', () => {
    const snap = YAML.parse(sampleYaml)
    expect(snap.headline).toContain('v1: Complete')
    expect(snap.status).toBe('green')
    expect(snap.phase).toBe('done')
  })

  it('parses progress as string fraction', () => {
    const snap = YAML.parse(sampleYaml)
    expect(snap.progress).toBe('15/15')
    const [done, total] = snap.progress.split('/').map(Number)
    expect(done).toBe(15)
    expect(total).toBe(15)
  })

  it('parses sprint metadata', () => {
    const snap = YAML.parse(sampleYaml)
    expect(snap.sprint.id).toBe('v1')
    expect(snap.sprint.title).toContain('Stabilize')
    expect(snap.sprint.status).toBe('complete')
  })

  it('parses tasks into done/in_progress/queued arrays', () => {
    const snap = YAML.parse(sampleYaml)
    expect(snap.tasks.done).toHaveLength(2)
    expect(snap.tasks.done[0].id).toBe('T01')
    expect(snap.tasks.done[0].agent).toBe('PM')
    expect(snap.tasks.in_progress).toEqual([])
    expect(snap.tasks.queued).toEqual([])
  })

  it('parses agent roster with roles', () => {
    const snap = YAML.parse(sampleYaml)
    expect(snap.agents.PM.role).toBe('PM')
    expect(snap.agents.captain.status).toBe('idle')
  })

  it('parses milestones with agent/text/ts', () => {
    const snap = YAML.parse(sampleYaml)
    expect(snap.milestones).toHaveLength(2)
    expect(snap.milestones[0].agent).toBe('PM')
    expect(snap.milestones[0].text).toContain('Directive pipeline')
  })

  it('parses demo_safe as string array', () => {
    const snap = YAML.parse(sampleYaml)
    expect(Array.isArray(snap.demo_safe)).toBe(true)
    expect(snap.demo_safe.length).toBeGreaterThan(0)
  })

  it('parses known_gaps and blockers', () => {
    const snap = YAML.parse(sampleYaml)
    expect(snap.known_gaps).toHaveLength(1)
    expect(snap.blockers).toEqual([])
  })
})

// ─── decisions.yaml parsing ─────────────────────────────────────────────────

describe('decisions.yaml parsing', () => {
  const sampleYaml = `
decisions:
  - id: ADR-001
    type: adr
    title: Use file-based blackboard over message bus
    status: accepted
    date: "2026-03-25"
    context: >
      Multiple Claude Code terminals need to coordinate.
    decision: >
      Use a file-based blackboard backed by a YAML live state file.
    consequences: >
      Trades real-time performance for simplicity and auditability.
  - id: REV-001
    type: review
    title: T05 code review
    status: accepted
    date: "2026-03-26"
    agent: captain
    task: T05
    result: approve
    category: architecture
    notes: Clean YAML schema, good error handling.
`

  it('parses decisions array', () => {
    const parsed = YAML.parse(sampleYaml)
    expect(parsed.decisions).toHaveLength(2)
  })

  it('parses ADR fields', () => {
    const parsed = YAML.parse(sampleYaml)
    const adr = parsed.decisions[0]
    expect(adr.id).toBe('ADR-001')
    expect(adr.type).toBe('adr')
    expect(adr.status).toBe('accepted')
    expect(adr.context).toContain('coordinate')
    expect(adr.decision).toContain('file-based blackboard')
    expect(adr.consequences).toContain('simplicity')
  })

  it('parses review fields', () => {
    const parsed = YAML.parse(sampleYaml)
    const rev = parsed.decisions[1]
    expect(rev.type).toBe('review')
    expect(rev.agent).toBe('captain')
    expect(rev.task).toBe('T05')
    expect(rev.result).toBe('approve')
    expect(rev.category).toBe('architecture')
  })

  it('filters pending decisions', () => {
    const yaml = `
decisions:
  - id: ADR-001
    status: accepted
    type: adr
    title: Accepted one
    date: "2026-03-25"
  - id: ADR-002
    status: proposed
    type: adr
    title: Pending one
    date: "2026-03-26"
`
    const parsed = YAML.parse(yaml)
    const pending = parsed.decisions.filter((d: { status: string }) =>
      d.status === 'proposed' || d.status === 'pending'
    )
    expect(pending).toHaveLength(1)
    expect(pending[0].id).toBe('ADR-002')
  })

  it('handles empty decisions array', () => {
    const parsed = YAML.parse('decisions: []')
    expect(parsed.decisions).toEqual([])
  })
})

// ─── lessons.md parsing ─────────────────────────────────────────────────────

describe('lessons.md parsing', () => {
  const sampleMd = `# Lessons Learned

Append-only log of what we learned.

---

## 2026-03-25 — Docs reorganization

**What surprised us:** docs/ had 28 files across 5 directories with heavy overlap.

**Pattern to repeat:** When restructuring, grep for all path references before deleting.

**Why it matters:** Anchoring all concept docs on the 16 pillars of MAS research gave the docs a spine.

---

## 2026-03-25 — Sprint v1 Setup

**What surprised us:** The blackboard notification system broadcasts to ALL agents.

**Pattern to repeat:** File-based state survives server restarts.
`

  it('renders valid HTML with marked', () => {
    marked.setOptions({ gfm: true, breaks: false })
    const html = marked.parse(sampleMd) as string
    expect(html).toContain('<h1>')
    expect(html).toContain('<h2>')
    expect(html).toContain('<strong>')
  })

  it('preserves section structure', () => {
    const html = marked.parse(sampleMd) as string
    expect(html).toContain('Docs reorganization')
    expect(html).toContain('Sprint v1 Setup')
  })

  it('renders bold markers as strong tags', () => {
    const html = marked.parse(sampleMd) as string
    expect(html).toContain('<strong>What surprised us:</strong>')
    expect(html).toContain('<strong>Pattern to repeat:</strong>')
  })

  it('handles empty lessons file', () => {
    const html = marked.parse('# Lessons Learned\n\nNo lessons yet.') as string
    expect(html).toContain('No lessons yet')
  })
})

import { describe, it, expect } from 'vitest'
import {
  parseTasks,
  parseBlockTimes,
  parseBlackboard,
  parseScorecard,
  extractSection,
} from '../lib/parsers'

// ─── parseTasks ─────────────────────────────────────────────────────────────

describe('parseTasks', () => {
  it('parses a single block with one task', () => {
    const md = `## Block A: Setup
- [ ] **T01: Create config file** (S)
  What: Initial project config
  Files: project.config.ts
  Test: file exists after run`

    const blocks = parseTasks(md, {})
    expect(blocks).toHaveLength(1)
    expect(blocks[0].id).toBe('A')
    expect(blocks[0].name).toBe('Setup')
    expect(blocks[0].tasks).toHaveLength(1)

    const t = blocks[0].tasks[0]
    expect(t.id).toBe('T01')
    expect(t.title).toBe('Create config file')
    expect(t.size).toBe('S')
    expect(t.checked).toBe(false)
    expect(t.what).toBe('Initial project config')
    expect(t.files).toBe('project.config.ts')
    expect(t.test).toBe('file exists after run')
  })

  it('parses checked tasks', () => {
    const md = `## Block A: Done
- [x] **T01: Completed task** (M)
  What: Already done`

    const blocks = parseTasks(md, {})
    expect(blocks[0].tasks[0].checked).toBe(true)
    expect(blocks[0].tasks[0].size).toBe('M')
  })

  it('parses multiple blocks with multiple tasks', () => {
    const md = `## Block A: First
- [ ] **T01: Task one** (S)
  What: First task
- [x] **T02: Task two** (M)
  What: Second task

## Block B: Second
- [ ] **T03: Task three** (S)
  What: Third task`

    const blocks = parseTasks(md, { A: '30 min', B: '15 min' })
    expect(blocks).toHaveLength(2)
    expect(blocks[0].tasks).toHaveLength(2)
    expect(blocks[0].time).toBe('30 min')
    expect(blocks[1].tasks).toHaveLength(1)
    expect(blocks[1].time).toBe('15 min')
  })

  it('parses Logic field as multiline', () => {
    const md = `## Block A: Impl
- [ ] **T01: Build parser** (M)
  What: Parse markdown
  Logic:
    read file line by line
    match regex patterns
    accumulate results
  Test: returns parsed blocks`

    const blocks = parseTasks(md, {})
    const t = blocks[0].tasks[0]
    expect(t.logic).toContain('read file line by line')
    expect(t.logic).toContain('accumulate results')
    expect(t.test).toBe('returns parsed blocks')
  })

  it('parses Depends field', () => {
    const md = `## Block A: Work
- [ ] **T02: Follow-up** (S)
  What: Depends on T01
  Depends: T01`

    const blocks = parseTasks(md, {})
    expect(blocks[0].tasks[0].depends).toBe('T01')
  })

  it('returns empty array for empty markdown', () => {
    expect(parseTasks('', {})).toEqual([])
  })

  it('ignores tasks outside a block', () => {
    const md = `- [ ] **T01: Orphan task** (S)
  What: No block header above`

    const blocks = parseTasks(md, {})
    expect(blocks).toEqual([])
  })

  it('stops task body at --- separator', () => {
    const md = `## Block A: Work
- [ ] **T01: First** (S)
  What: Has separator below
---
Some other content`

    const blocks = parseTasks(md, {})
    expect(blocks[0].tasks).toHaveLength(1)
    expect(blocks[0].tasks[0].what).toBe('Has separator below')
  })
})

// ─── parseBlockTimes ────────────────────────────────────────────────────────

describe('parseBlockTimes', () => {
  it('extracts block times from PRD table', () => {
    const prd = `| A: Setup | Config | 30 min |
| B: Build | Implementation | 45 min |
| C: Test  | Verification | 15 min |`

    const times = parseBlockTimes(prd)
    expect(times).toEqual({ A: '30 min', B: '45 min', C: '15 min' })
  })

  it('returns empty for no matches', () => {
    expect(parseBlockTimes('no table here')).toEqual({})
  })

  it('handles extra whitespace in cells', () => {
    const prd = `|  A: Setup  |  Config  |  20 min  |`
    expect(parseBlockTimes(prd)).toEqual({ A: '20 min' })
  })
})

// ─── parseBlackboard ────────────────────────────────────────────────────────

describe('parseBlackboard', () => {
  it('extracts all sections from board.md', () => {
    const md = `# Board
*Last updated: 2026-03-25*

## Active Blockers
- Need PM sign-off on queue layout
- CI pipeline broken

## Open Decisions
- SQLite vs Postgres for local dev?

## Directives
- Ship v2 by Friday

## Findings
- Parser ignores entries with no title

## Agent Status
- Dev1: active, working on T03

## Recent Activity
- Merged PR #42

## Resolved
- ~~Old blocker~~ — fixed`

    const bb = parseBlackboard(md)
    expect(bb.lastUpdated).toBe('2026-03-25')
    expect(bb.blockers).toHaveLength(2)
    expect(bb.blockers[0]).toBe('Need PM sign-off on queue layout')
    expect(bb.decisions).toEqual(['SQLite vs Postgres for local dev?'])
    expect(bb.directives).toEqual(['Ship v2 by Friday'])
    expect(bb.findings).toEqual(['Parser ignores entries with no title'])
    expect(bb.terminals).toEqual(['Dev1: active, working on T03'])
    expect(bb.activity).toEqual(['Merged PR #42'])
    expect(bb.resolved).toEqual(['~~Old blocker~~ — fixed'])
  })

  it('handles missing sections gracefully', () => {
    const md = `# Board\n\n## Active Blockers\n(none)\n`
    const bb = parseBlackboard(md)
    expect(bb.blockers).toEqual([])
    expect(bb.decisions).toEqual([])
    expect(bb.findings).toEqual([])
  })

  it('skips HTML comments', () => {
    const md = `## Active Blockers
<!-- hidden comment -->
- Visible blocker
<!-- start
multiline comment
end -->
- Another visible`

    const bb = parseBlackboard(md)
    expect(bb.blockers).toEqual(['Visible blocker', 'Another visible'])
  })

  it('skips (none) and (no active...) placeholders', () => {
    const md = `## Active Blockers
(none)

## Open Decisions
(No active decisions)`

    const bb = parseBlackboard(md)
    expect(bb.blockers).toEqual([])
    expect(bb.decisions).toEqual([])
  })

  it('returns empty lastUpdated when missing', () => {
    const bb = parseBlackboard('## Findings\n- something')
    expect(bb.lastUpdated).toBe('')
  })
})

// ─── parseScorecard ─────────────────────────────────────────────────────────

describe('parseScorecard', () => {
  it('extracts layer scores from scorecard table', () => {
    const md = `| Layer | What | Status | Score |
|-------|------|--------|-------|
| 1. UI | Chat + Queue | Partial | **65%** |
| 2. Graph | LangGraph | Started | **30%** |
| 3. Integrations | MCP | Done | **90%** |`

    const scores = parseScorecard(md)
    expect(scores).toHaveLength(3)
    expect(scores[0]).toEqual({ id: '1. UI', name: 'UI', baseline: 65 })
    expect(scores[1]).toEqual({ id: '2. Graph', name: 'Graph', baseline: 30 })
    expect(scores[2]).toEqual({ id: '3. Integrations', name: 'Integrations', baseline: 90 })
  })

  it('returns empty for non-matching table', () => {
    expect(parseScorecard('no table here')).toEqual([])
  })

  it('skips header/separator rows', () => {
    const md = `| Layer | What | Status | Score |
|-------|------|--------|-------|`
    expect(parseScorecard(md)).toEqual([])
  })
})

// ─── extractSection ─────────────────────────────────────────────────────────

describe('extractSection', () => {
  it('extracts section content by heading', () => {
    const md = `## First Section
Content of first section.

## Second Section
Content of second section.

## Third Section
Content of third.`

    expect(extractSection(md, 'Second Section')).toBe('Content of second section.')
  })

  it('returns empty string for missing heading', () => {
    expect(extractSection('## Other\nstuff', 'Missing')).toBe('')
  })

  it('handles section ending at ---', () => {
    const md = `## Known Gaps
- Gap one
- Gap two

---

## Next Section`

    expect(extractSection(md, 'Known Gaps')).toBe('- Gap one\n- Gap two')
  })

  it('handles section at end of document', () => {
    const md = `## Sprint History
- v1: shipped
- v2: in progress`

    expect(extractSection(md, 'Sprint History')).toBe('- v1: shipped\n- v2: in progress')
  })

  it('escapes special regex characters in heading', () => {
    const md = `## What's Safe to Demo Today
- Feature A
- Feature B`

    expect(extractSection(md, "What's Safe to Demo Today")).toContain('Feature A')
  })
})

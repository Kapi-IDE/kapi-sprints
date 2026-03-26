import { describe, it, expect } from 'vitest'
import { parseBacklog, serializeBacklog } from '../lib/backlog'

describe('parseBacklog', () => {
  it('parses inbox and done items', () => {
    const raw = `# Backlog

Ideas and future work.

---

## Inbox

[ ] Add dark mode toggle
[ ] Fix mobile layout

---

## Done

[x] Set up CI pipeline
[x] Write README`

    const { inbox, done, header } = parseBacklog(raw)
    expect(inbox).toEqual(['Add dark mode toggle', 'Fix mobile layout'])
    expect(done).toEqual(['Set up CI pipeline', 'Write README'])
    expect(header).toContain('# Backlog')
  })

  it('returns empty arrays for empty sections', () => {
    const raw = `# Backlog

---

## Inbox

## Done
`
    const { inbox, done } = parseBacklog(raw)
    expect(inbox).toEqual([])
    expect(done).toEqual([])
  })

  it('ignores non-checkbox lines in inbox', () => {
    const raw = `## Inbox

Some explanatory text
[ ] Real item
Another line
[ ] Another real item

## Done
`
    const { inbox } = parseBacklog(raw)
    expect(inbox).toEqual(['Real item', 'Another real item'])
  })

  it('uses default header when ## Inbox is at start', () => {
    const raw = `## Inbox
[ ] Item one

## Done
`
    const { header } = parseBacklog(raw)
    expect(header).toBe('# Backlog\n\n---\n\n')
  })
})

describe('serializeBacklog', () => {
  it('produces valid markdown', () => {
    const result = serializeBacklog(
      '# Backlog\n\n---\n',
      ['Task A', 'Task B'],
      ['Done C']
    )
    expect(result).toContain('## Inbox')
    expect(result).toContain('[ ] Task A')
    expect(result).toContain('[ ] Task B')
    expect(result).toContain('## Done')
    expect(result).toContain('[x] Done C')
  })

  it('handles empty inbox and done', () => {
    const result = serializeBacklog('# Backlog\n\n---\n', [], [])
    expect(result).toContain('## Inbox')
    expect(result).toContain('## Done')
    expect(result).not.toContain('[ ]')
    expect(result).not.toContain('[x]')
  })
})

describe('parseBacklog ↔ serializeBacklog round-trip', () => {
  it('preserves data through parse → serialize → parse', () => {
    const original = `# Backlog

Ideas and future work.

---

## Inbox

[ ] First item
[ ] Second item

---

## Done

[x] Completed item`

    const { inbox, done, header } = parseBacklog(original)
    const serialized = serializeBacklog(header, inbox, done)
    const reparsed = parseBacklog(serialized)

    expect(reparsed.inbox).toEqual(inbox)
    expect(reparsed.done).toEqual(done)
  })
})

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { parseEntries } from '../lib/parsers'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

let tmpDir: string

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'entries-test-'))
})

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true })
})

describe('parseEntries', () => {
  it('parses a well-formed entry file', async () => {
    await fs.writeFile(path.join(tmpDir, '2026-03-25-finding.md'), `---
type: finding
role: Dev
timestamp: mar 25 2pm
---

# Parser ignores empty titles

The markdown parser skips entries that have no title field.
`)

    const entries = await parseEntries(tmpDir)
    expect(entries).toHaveLength(1)
    expect(entries[0].type).toBe('finding')
    expect(entries[0].role).toBe('Dev')
    expect(entries[0].timestamp).toBe('mar 25 2pm')
    expect(entries[0].title).toBe('Parser ignores empty titles')
    expect(entries[0].body).toContain('markdown parser skips entries')
  })

  it('uses filename as title fallback when no heading', async () => {
    await fs.writeFile(path.join(tmpDir, 'no-heading.md'), `---
type: blocker
role: PM
timestamp: mar 25 3pm
---

Just some body text without a heading.
`)

    const entries = await parseEntries(tmpDir)
    expect(entries[0].title).toBe('no-heading')
  })

  it('defaults type to finding when missing', async () => {
    await fs.writeFile(path.join(tmpDir, 'minimal.md'), `---
role: Dev
timestamp: mar 25
---

# Minimal entry
`)

    const entries = await parseEntries(tmpDir)
    expect(entries[0].type).toBe('finding')
  })

  it('skips non-markdown files', async () => {
    await fs.writeFile(path.join(tmpDir, 'notes.txt'), 'not markdown')
    await fs.writeFile(path.join(tmpDir, 'entry.md'), `---
type: decision
role: PM
timestamp: mar 25
---

# A decision
`)

    const entries = await parseEntries(tmpDir)
    expect(entries).toHaveLength(1)
    expect(entries[0].filename).toBe('entry.md')
  })

  it('skips files without frontmatter', async () => {
    await fs.writeFile(path.join(tmpDir, 'bad.md'), `# No frontmatter

Just a regular markdown file.
`)

    const entries = await parseEntries(tmpDir)
    expect(entries).toHaveLength(0)
  })

  it('returns empty array for non-existent directory', async () => {
    const entries = await parseEntries('/tmp/does-not-exist-12345')
    expect(entries).toEqual([])
  })

  it('sorts entries in reverse filename order', async () => {
    await fs.writeFile(path.join(tmpDir, 'aaa-first.md'), `---
type: finding
---

# First
`)
    await fs.writeFile(path.join(tmpDir, 'zzz-last.md'), `---
type: finding
---

# Last
`)

    const entries = await parseEntries(tmpDir)
    expect(entries[0].filename).toBe('zzz-last.md')
    expect(entries[1].filename).toBe('aaa-first.md')
  })

  it('limits to 40 entries', async () => {
    for (let i = 0; i < 45; i++) {
      const name = `entry-${i.toString().padStart(3, '0')}.md`
      await fs.writeFile(path.join(tmpDir, name), `---
type: finding
---

# Entry ${i}
`)
    }

    const entries = await parseEntries(tmpDir)
    expect(entries.length).toBeLessThanOrEqual(40)
  })
})

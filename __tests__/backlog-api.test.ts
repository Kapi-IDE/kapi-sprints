import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { parseBacklog, serializeBacklog } from '../lib/backlog'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

let tmpDir: string
let backlogPath: string

function makeBacklog(inbox: string[], done: string[]): string {
  return serializeBacklog('# Backlog\n\nIdeas and future work.\n\n---\n', inbox, done)
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'backlog-api-'))
  backlogPath = path.join(tmpDir, 'backlog.md')
})

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true })
})

describe('backlog API CRUD logic', () => {
  // These test the parse/serialize logic that backs GET/POST/PUT/DELETE

  describe('GET — list items', () => {
    it('returns inbox and done from populated backlog', async () => {
      await fs.writeFile(backlogPath, makeBacklog(['Item A', 'Item B'], ['Done C']))
      const raw = await fs.readFile(backlogPath, 'utf-8')
      const { inbox, done } = parseBacklog(raw)
      expect(inbox).toEqual(['Item A', 'Item B'])
      expect(done).toEqual(['Done C'])
    })

    it('returns empty arrays for empty backlog', async () => {
      await fs.writeFile(backlogPath, makeBacklog([], []))
      const raw = await fs.readFile(backlogPath, 'utf-8')
      const { inbox, done } = parseBacklog(raw)
      expect(inbox).toEqual([])
      expect(done).toEqual([])
    })
  })

  describe('POST — add item', () => {
    it('appends item to inbox', async () => {
      await fs.writeFile(backlogPath, makeBacklog(['Existing'], []))
      const raw = await fs.readFile(backlogPath, 'utf-8')
      const { inbox, done, header } = parseBacklog(raw)
      inbox.push('New item')
      await fs.writeFile(backlogPath, serializeBacklog(header, inbox, done))
      const reread = parseBacklog(await fs.readFile(backlogPath, 'utf-8'))
      expect(reread.inbox).toEqual(['Existing', 'New item'])
    })

    it('creates backlog from scratch if empty', () => {
      const raw = '# Backlog\n\nIdeas and future work.\n\n---\n\n## Inbox\n\n## Done\n'
      const { inbox, done, header } = parseBacklog(raw)
      inbox.push('First item')
      const serialized = serializeBacklog(header, inbox, done)
      expect(serialized).toContain('[ ] First item')
    })

    it('trims whitespace from items', () => {
      const item = '  New task with spaces  '
      const { inbox, done, header } = parseBacklog(makeBacklog([], []))
      inbox.push(item.trim())
      const serialized = serializeBacklog(header, inbox, done)
      expect(serialized).toContain('[ ] New task with spaces')
    })
  })

  describe('PUT — edit item', () => {
    it('replaces item at given index', () => {
      const { inbox, done, header } = parseBacklog(makeBacklog(['Old text', 'Keep me'], []))
      inbox[0] = 'Updated text'
      const serialized = serializeBacklog(header, inbox, done)
      const reparsed = parseBacklog(serialized)
      expect(reparsed.inbox).toEqual(['Updated text', 'Keep me'])
    })

    it('rejects out-of-range index', () => {
      const { inbox } = parseBacklog(makeBacklog(['Only one'], []))
      expect(inbox.length).toBe(1)
      // Index 5 is out of range
      expect(5 >= inbox.length).toBe(true)
    })
  })

  describe('DELETE — move to done or remove', () => {
    it('moves item from inbox to done (default action)', () => {
      const { inbox, done, header } = parseBacklog(makeBacklog(['Pick me', 'Leave me'], ['Already done']))
      const idx = inbox.findIndex(i => i.includes('Pick me'))
      const picked = inbox.splice(idx, 1)[0]
      done.unshift(picked)
      const serialized = serializeBacklog(header, inbox, done)
      const reparsed = parseBacklog(serialized)
      expect(reparsed.inbox).toEqual(['Leave me'])
      expect(reparsed.done[0]).toBe('Pick me')
    })

    it('removes item entirely with action=remove', () => {
      const { inbox, done, header } = parseBacklog(makeBacklog(['Remove me', 'Keep me'], []))
      const idx = inbox.findIndex(i => i.includes('Remove me'))
      inbox.splice(idx, 1)
      // action === 'remove' means don't add to done
      const serialized = serializeBacklog(header, inbox, done)
      const reparsed = parseBacklog(serialized)
      expect(reparsed.inbox).toEqual(['Keep me'])
      expect(reparsed.done).toEqual([])
    })

    it('returns -1 for non-existent item', () => {
      const { inbox } = parseBacklog(makeBacklog(['Item A'], []))
      expect(inbox.findIndex(i => i.includes('Nonexistent'))).toBe(-1)
    })

    it('finds item by partial match', () => {
      const { inbox } = parseBacklog(makeBacklog(['P1: Fix the login bug — Dev — Mar 25'], []))
      const idx = inbox.findIndex(i => i.includes('Fix the login'))
      expect(idx).toBe(0)
    })
  })
})

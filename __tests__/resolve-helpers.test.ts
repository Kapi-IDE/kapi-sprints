import { describe, it, expect, vi, afterEach } from 'vitest'
import { slug, extractTitle, extractContext, now, datestamp } from '../lib/resolve-helpers'

describe('slug', () => {
  it('lowercases and replaces non-alphanumeric with dashes', () => {
    expect(slug('Hello World!')).toBe('hello-world')
  })

  it('strips leading and trailing dashes', () => {
    expect(slug('--hello--')).toBe('hello')
  })

  it('truncates to 40 chars', () => {
    const long = 'a'.repeat(50)
    expect(slug(long).length).toBeLessThanOrEqual(40)
  })

  it('handles special characters', () => {
    expect(slug('ADR: Use SQLite for local dev?')).toBe('adr-use-sqlite-for-local-dev')
  })

  it('collapses multiple dashes', () => {
    expect(slug('one   two---three')).toBe('one-two-three')
  })
})

describe('extractTitle', () => {
  it('extracts bold markdown title', () => {
    expect(extractTitle('**My Decision** — some context')).toBe('My Decision')
  })

  it('falls back to text before arrow', () => {
    expect(extractTitle('Plain title → `entries/file.md`')).toBe('Plain title')
  })

  it('truncates fallback to 60 chars', () => {
    const long = 'x'.repeat(100)
    expect(extractTitle(long).length).toBeLessThanOrEqual(60)
  })
})

describe('extractContext', () => {
  it('strips bold title prefix', () => {
    expect(extractContext('**Title** — the actual context here')).toBe('the actual context here')
  })

  it('strips entry file references', () => {
    expect(extractContext('Some text → `entries/2026-03-25-adr.md`')).toBe('Some text')
  })

  it('strips remaining bold markers', () => {
    // extractContext first tries to strip **Title** — prefix, then removes all ** markers
    // Input without the "— " pattern keeps the first word since the prefix regex doesn't match
    expect(extractContext('**bold** text **more**')).toBe('bold text more')
  })
})

describe('now', () => {
  afterEach(() => vi.useRealTimers())

  it('formats as "mon day hourAMPM"', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 25, 14, 30)) // Mar 25, 2:30 PM
    const result = now()
    expect(result).toBe('mar 25 2pm')
  })

  it('handles midnight (12am)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 0, 0)) // Jan 1, midnight
    const result = now()
    expect(result).toBe('jan 1 12am')
  })

  it('handles noon (12pm)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0)) // Jun 15, noon
    const result = now()
    expect(result).toBe('jun 15 12pm')
  })
})

describe('datestamp', () => {
  afterEach(() => vi.useRealTimers())

  it('formats as YYYY-MM-DD-HHMM', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 25, 9, 5))
    expect(datestamp()).toBe('2026-03-25-0905')
  })

  it('zero-pads single digit months and days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 3, 1, 2))
    expect(datestamp()).toBe('2026-01-03-0102')
  })
})

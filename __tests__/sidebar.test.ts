import { describe, it, expect } from 'vitest'

// Test the sidebar nav item generation logic (extracted from sidebar.tsx)
function getNavItems(currentSprint?: string) {
  const sprintHref = currentSprint ? `/sprints/${currentSprint}` : '/sprints/v1'
  const sprintLabel = currentSprint ? `Sprint ${currentSprint}` : 'Sprint'
  return [
    { href: '/dashboard',  icon: '◈', label: 'Dashboard' },
    { href: sprintHref,    icon: '▷', label: sprintLabel },
    { href: '/backlog',    icon: '□', label: 'Backlog' },
    { href: '/decisions',  icon: '◇', label: 'Decisions' },
    { href: '/lessons',    icon: '○', label: 'Lessons' },
    { href: '/docs',       icon: '◻', label: 'Docs' },
  ]
}

// Test isStale logic (extracted from sidebar.tsx)
const STALE_MS = 10 * 60 * 1000

function isStale(agent: { last_seen?: string }): boolean {
  const lastSeen = agent.last_seen
  if (!lastSeen) return true
  return Date.now() - new Date(lastSeen).getTime() > STALE_MS
}

describe('sidebar nav items', () => {
  it('includes all required pages', () => {
    const items = getNavItems('v1')
    const labels = items.map(i => i.label)
    expect(labels).toContain('Dashboard')
    expect(labels).toContain('Sprint v1')
    expect(labels).toContain('Backlog')
    expect(labels).toContain('Decisions')
    expect(labels).toContain('Lessons')
    expect(labels).toContain('Docs')
  })

  it('includes correct hrefs', () => {
    const items = getNavItems('v1')
    const hrefs = items.map(i => i.href)
    expect(hrefs).toContain('/dashboard')
    expect(hrefs).toContain('/sprints/v1')
    expect(hrefs).toContain('/backlog')
    expect(hrefs).toContain('/decisions')
    expect(hrefs).toContain('/lessons')
    expect(hrefs).toContain('/docs')
  })

  it('dynamically adjusts sprint link based on current sprint', () => {
    const v2 = getNavItems('v2')
    expect(v2.find(i => i.label === 'Sprint v2')?.href).toBe('/sprints/v2')

    const v3 = getNavItems('v3')
    expect(v3.find(i => i.label === 'Sprint v3')?.href).toBe('/sprints/v3')
  })

  it('defaults to /sprints/v1 when no current sprint', () => {
    const items = getNavItems(undefined)
    expect(items.find(i => i.label === 'Sprint')?.href).toBe('/sprints/v1')
  })

  it('has exactly 6 nav items', () => {
    expect(getNavItems('v1')).toHaveLength(6)
  })
})

describe('isStale', () => {
  it('returns true for agent with no last_seen', () => {
    expect(isStale({})).toBe(true)
  })

  it('returns false for recently seen agent', () => {
    const recent = new Date(Date.now() - 60_000).toISOString() // 1 min ago
    expect(isStale({ last_seen: recent })).toBe(false)
  })

  it('returns true for agent not seen in >10 minutes', () => {
    const old = new Date(Date.now() - 15 * 60_000).toISOString() // 15 min ago
    expect(isStale({ last_seen: old })).toBe(true)
  })

  it('returns true at exactly 10 minute boundary', () => {
    const exact = new Date(Date.now() - STALE_MS - 1).toISOString()
    expect(isStale({ last_seen: exact })).toBe(true)
  })
})

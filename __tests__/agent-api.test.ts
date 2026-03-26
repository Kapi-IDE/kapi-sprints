import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

let tmpDir: string

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'agent-api-'))
})

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true })
})

// Extracted from app/api/agents/[agentId]/route.ts for testing
function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { frontmatter: {}, body: raw }

  const frontmatter: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx > 0) {
      frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
    }
  }
  return { frontmatter, body: match[2].trim() }
}

describe('agent profile parsing', () => {
  it('parses agent frontmatter correctly', () => {
    const raw = `---
name: captain
role: dev lead
status: active
registered: 2026-03-26T01:00:00Z
---

# captain

## Session Log
- 2026-03-26: Started sprint v1`

    const { frontmatter, body } = parseFrontmatter(raw)
    expect(frontmatter.name).toBe('captain')
    expect(frontmatter.role).toBe('dev lead')
    expect(frontmatter.status).toBe('active')
    expect(body).toContain('# captain')
    expect(body).toContain('Session Log')
  })

  it('returns empty frontmatter for files without fences', () => {
    const { frontmatter, body } = parseFrontmatter('Just plain text')
    expect(frontmatter).toEqual({})
    expect(body).toBe('Just plain text')
  })

  it('handles frontmatter with colons in values', () => {
    const raw = `---
name: captain
registered: 2026-03-26T01:00:00Z
---

body`

    const { frontmatter } = parseFrontmatter(raw)
    // Value after first colon includes the rest
    expect(frontmatter.registered).toBe('2026-03-26T01:00:00Z')
  })
})

describe('agent profile creation', () => {
  it('creates new agent .md file with frontmatter and session log', async () => {
    const agentId = 'test-agent'
    const filePath = path.join(tmpDir, `${agentId}.md`)
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
    const entry = 'Registered as test agent'

    const content = [
      '---',
      `name: ${agentId}`,
      `role: agent`,
      `status: active`,
      `registered: ${now}`,
      '---',
      '',
      `# ${agentId}`,
      '',
      '## Session Log',
      `- ${new Date().toISOString().slice(0, 10)}: ${entry}`,
      '',
    ].join('\n')

    await fs.writeFile(filePath, content, 'utf-8')
    const read = await fs.readFile(filePath, 'utf-8')
    const { frontmatter, body } = parseFrontmatter(read)

    expect(frontmatter.name).toBe('test-agent')
    expect(frontmatter.role).toBe('agent')
    expect(body).toContain('Registered as test agent')
  })
})

describe('agent session log append', () => {
  it('appends entry after Session Log heading', async () => {
    const filePath = path.join(tmpDir, 'captain.md')
    let content = `---
name: captain
role: dev lead
status: active
---

# captain

## Session Log
- 2026-03-26: Started sprint v1
`

    await fs.writeFile(filePath, content, 'utf-8')
    content = await fs.readFile(filePath, 'utf-8')

    const logLine = `- 2026-03-26: Completed T05`
    content = content.replace(
      /(## Session Log\n)/,
      `$1${logLine}\n`,
    )
    await fs.writeFile(filePath, content, 'utf-8')

    const final = await fs.readFile(filePath, 'utf-8')
    expect(final).toContain('Completed T05')
    expect(final).toContain('Started sprint v1')
    // New entry should come first (after heading)
    const t05Idx = final.indexOf('Completed T05')
    const startIdx = final.indexOf('Started sprint v1')
    expect(t05Idx).toBeLessThan(startIdx)
  })

  it('adds Session Log section if missing', async () => {
    const filePath = path.join(tmpDir, 'new-agent.md')
    let content = `---
name: new-agent
---

# new-agent
`
    await fs.writeFile(filePath, content, 'utf-8')
    content = await fs.readFile(filePath, 'utf-8')

    const logLine = `- 2026-03-26: First entry`
    if (!content.includes('## Session Log')) {
      content += `\n## Session Log\n${logLine}\n`
    }
    await fs.writeFile(filePath, content, 'utf-8')

    const final = await fs.readFile(filePath, 'utf-8')
    expect(final).toContain('## Session Log')
    expect(final).toContain('First entry')
  })
})

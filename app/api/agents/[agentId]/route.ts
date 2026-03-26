import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { KAPI_DIR } from '@/project.config'

const AGENTS_DIR = join(KAPI_DIR, 'agents')

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params
  const filePath = join(AGENTS_DIR, `${agentId}.md`)

  try {
    const raw = await readFile(filePath, 'utf-8')
    const { frontmatter, body } = parseFrontmatter(raw)
    return NextResponse.json({ id: agentId, ...frontmatter, body })
  } catch {
    return NextResponse.json({ id: agentId, body: null }, { status: 404 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params
  const filePath = join(AGENTS_DIR, `${agentId}.md`)
  const update = await req.json() as { entry?: string }

  if (!update.entry) {
    return NextResponse.json({ error: 'entry required' }, { status: 400 })
  }

  try {
    await mkdir(AGENTS_DIR, { recursive: true })
    let content = await readFile(filePath, 'utf-8').catch(() => '')
    if (!content) {
      // Create new agent file
      const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
      content = [
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
        `- ${new Date().toISOString().slice(0, 10)}: ${update.entry}`,
        '',
      ].join('\n')
    } else {
      // Append to session log
      const logLine = `- ${new Date().toISOString().slice(0, 10)}: ${update.entry}`
      if (content.includes('## Session Log')) {
        content = content.replace(
          /(## Session Log\n)/,
          `$1${logLine}\n`,
        )
      } else {
        content += `\n## Session Log\n${logLine}\n`
      }
    }

    await writeFile(filePath, content, 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

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

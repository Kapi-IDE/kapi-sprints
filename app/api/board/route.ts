import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { KAPI_DIR } from '@/project.config'
import { join } from 'path'

const BOARD_PATH = join(KAPI_DIR, 'board.md')

const SECTION_HEADINGS: Record<string, string> = {
  blockers: '## Active Blockers',
  decisions: '## Open Decisions',
  findings: '## Findings',
  status: '## Status',
}

function parseSection(md: string, heading: string): string[] {
  const pattern = new RegExp(`${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`)
  const match = md.match(pattern)
  if (!match) return []
  return match[1]
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('- '))
    .map(l => l.slice(2))
}

function replaceSection(md: string, heading: string, items: string[]): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`(${escaped}\\s*\\n)[\\s\\S]*?(?=\\n## |$)`)
  const content = items.length > 0
    ? '\n' + items.map(i => `- ${i}`).join('\n') + '\n'
    : '\n(none)\n'
  return md.replace(pattern, `$1${content}`)
}

async function readBoard(): Promise<string> {
  try {
    return await readFile(BOARD_PATH, 'utf-8')
  } catch {
    const defaultBoard = [
      '# Blackboard', '', '*Last updated: ' + new Date().toISOString().slice(0, 10) + '*', '',
      '## Active Blockers', '', '(none)', '',
      '## Open Decisions', '', '(none)', '',
      '## Findings', '', '(none)', '',
      '## Status', '', '(none)', '',
    ].join('\n')
    await writeFile(BOARD_PATH, defaultBoard, 'utf-8')
    return defaultBoard
  }
}

// GET — list items for a section
export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get('section') || 'status'
  const heading = SECTION_HEADINGS[section]
  if (!heading) {
    return NextResponse.json({ error: `unknown section: ${section}` }, { status: 400 })
  }

  const md = await readBoard()
  const items = parseSection(md, heading)
  return NextResponse.json({ items })
}

// POST — add item to a section
export async function POST(req: NextRequest) {
  try {
    const { section, item } = await req.json() as { section?: string; item?: string }
    if (!section || !item || typeof item !== 'string') {
      return NextResponse.json({ error: 'section and item required' }, { status: 400 })
    }
    const heading = SECTION_HEADINGS[section]
    if (!heading) {
      return NextResponse.json({ error: `unknown section: ${section}` }, { status: 400 })
    }

    let md = await readBoard()
    const items = parseSection(md, heading)
    items.push(item.trim())
    md = replaceSection(md, heading, items)
    // Update timestamp
    md = md.replace(/\*Last updated:.*\*/, `*Last updated: ${new Date().toISOString().slice(0, 10)}*`)
    await writeFile(BOARD_PATH, md, 'utf-8')
    return NextResponse.json({ ok: true, count: items.length })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// PUT — edit an item
export async function PUT(req: NextRequest) {
  try {
    const { section, index, newText } = await req.json() as { section?: string; index?: number; newText?: string }
    if (!section || index == null || !newText) {
      return NextResponse.json({ error: 'section, index, and newText required' }, { status: 400 })
    }
    const heading = SECTION_HEADINGS[section]
    if (!heading) {
      return NextResponse.json({ error: `unknown section: ${section}` }, { status: 400 })
    }

    let md = await readBoard()
    const items = parseSection(md, heading)
    if (index < 0 || index >= items.length) {
      return NextResponse.json({ error: 'index out of range' }, { status: 404 })
    }
    items[index] = newText.trim()
    md = replaceSection(md, heading, items)
    md = md.replace(/\*Last updated:.*\*/, `*Last updated: ${new Date().toISOString().slice(0, 10)}*`)
    await writeFile(BOARD_PATH, md, 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// DELETE — remove an item
export async function DELETE(req: NextRequest) {
  try {
    const { section, index } = await req.json() as { section?: string; index?: number }
    if (!section || index == null) {
      return NextResponse.json({ error: 'section and index required' }, { status: 400 })
    }
    const heading = SECTION_HEADINGS[section]
    if (!heading) {
      return NextResponse.json({ error: `unknown section: ${section}` }, { status: 400 })
    }

    let md = await readBoard()
    const items = parseSection(md, heading)
    if (index < 0 || index >= items.length) {
      return NextResponse.json({ error: 'index out of range' }, { status: 404 })
    }
    items.splice(index, 1)
    md = replaceSection(md, heading, items)
    md = md.replace(/\*Last updated:.*\*/, `*Last updated: ${new Date().toISOString().slice(0, 10)}*`)
    await writeFile(BOARD_PATH, md, 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

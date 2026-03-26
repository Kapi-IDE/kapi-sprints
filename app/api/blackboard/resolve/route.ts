import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import YAML from 'yaml'
import { KAPI_DIR } from '@/project.config'
import { now, extractTitle, extractContext } from '@/lib/resolve-helpers'

const DECISIONS_PATH = path.join(KAPI_DIR, 'decisions.yaml')
const BOARD_PATH = path.join(KAPI_DIR, 'board.md')
const BACKLOG_PATH = path.join(KAPI_DIR, 'backlog.md')

interface Decision {
  id: string
  type: 'adr' | 'review'
  title: string
  status: string
  date: string
  context?: string
  decision?: string
  consequences?: string
  agent?: string
  task?: string
  result?: string
  category?: string
  notes?: string
}

interface DecisionsFile {
  decisions: Decision[]
}

async function readDecisions(): Promise<DecisionsFile> {
  try {
    const raw = await fs.readFile(DECISIONS_PATH, 'utf-8')
    const parsed = YAML.parse(raw) as DecisionsFile
    return { decisions: parsed?.decisions ?? [] }
  } catch {
    return { decisions: [] }
  }
}

async function writeDecisions(data: DecisionsFile): Promise<void> {
  // Preserve the schema comment header
  const header = [
    '# decisions.yaml — Architecture Decision Records + Agent Reviews',
    '#',
    '# Schema:',
    '#   - id: ADR-NNN or REV-NNN',
    '#     type: adr | review',
    '#     title: Short description',
    '#     status: proposed | accepted | deprecated | superseded',
    '#     date: YYYY-MM-DD',
    '#     context: Why was this decision needed?',
    '#     decision: What was decided?',
    '#     consequences: What are the trade-offs?',
    '#     # review-specific fields:',
    '#     agent: (agent name)',
    '#     task: (task id)',
    '#     result: approve | reject | edit',
    '#     category: (e.g. code-quality, architecture, testing)',
    '#     notes: (reviewer notes)',
    '',
  ].join('\n')
  await fs.writeFile(DECISIONS_PATH, header + YAML.stringify(data), 'utf-8')
}

function nextAdrId(decisions: Decision[]): string {
  const adrs = decisions.filter(d => d.id.startsWith('ADR-'))
  const maxNum = adrs.reduce((max, d) => {
    const n = parseInt(d.id.replace('ADR-', ''), 10)
    return isNaN(n) ? max : Math.max(max, n)
  }, 0)
  return `ADR-${String(maxNum + 1).padStart(3, '0')}`
}

// POST /api/blackboard/resolve
// Body: { item: string; resolution: string; action: 'adr' | 'task' | 'close'; adrTitle?: string; assignee?: string }

export async function POST(req: NextRequest) {
  try {
    const body       = await req.json()
    const item       = typeof body.item === 'string'       ? body.item.trim()                                          : ''
    const resolution = typeof body.resolution === 'string' ? body.resolution.trim().slice(0, 2000)                    : ''
    const action     = (['adr', 'task', 'close'] as const).includes(body.action) ? body.action as 'adr' | 'task' | 'close' : 'close'
    const adrTitle   = typeof body.adrTitle === 'string'   ? body.adrTitle.trim().slice(0, 120)                       : ''
    const assignee   = typeof body.assignee === 'string'   ? body.assignee.replace(/[^A-Za-z0-9]/g, '').slice(0, 20) : 'Dev'

    if (!item || !resolution) {
      return NextResponse.json({ error: 'item and resolution are required' }, { status: 400 })
    }

    const title   = extractTitle(item)
    const context = extractContext(item)
    const ts      = now()

    // Remove from Open Decisions in board.md
    try {
      let board = await fs.readFile(BOARD_PATH, 'utf-8')
      const lines = board.split('\n')
      const decIdx = lines.findIndex(l =>
        l === `- ${item}` || (l.startsWith('- ') && l.includes(title.slice(0, 40)))
      )
      if (decIdx !== -1) lines.splice(decIdx, 1)
      board = lines.join('\n')
      board = board.replace(/\*Last updated:.*?\*/, `*Last updated: ${new Date().toISOString().slice(0, 10)}*`)
      await fs.writeFile(BOARD_PATH, board, 'utf-8')
    } catch {}

    if (action === 'adr') {
      // Append to decisions.yaml
      const data = await readDecisions()
      const id = nextAdrId(data.decisions)
      const finalTitle = adrTitle || title

      data.decisions.push({
        id,
        type: 'adr',
        title: finalTitle,
        status: 'accepted',
        date: new Date().toISOString().slice(0, 10),
        context: context || item.replace(/\*\*/g, '').replace(/→.*$/m, '').trim(),
        decision: resolution,
        consequences: '',
      })

      await writeDecisions(data)
      return NextResponse.json({ ok: true, id })

    } else if (action === 'task') {
      // Add to backlog
      try {
        let backlog = await fs.readFile(BACKLOG_PATH, 'utf-8')
        const taskBullet = `- [ ] **${assignee}** — ${title}: ${resolution} — ${ts}`
        const inboxIdx = backlog.indexOf('\n## Inbox\n')
        if (inboxIdx !== -1) {
          const insertAt = inboxIdx + '\n## Inbox\n'.length
          const nextSec  = backlog.indexOf('\n## ', insertAt)
          const secEnd   = nextSec !== -1 ? nextSec : backlog.length
          const secBody  = backlog.slice(insertAt, secEnd)
            .replace(/\n?<!--[\s\S]*?-->\n?/g, '\n')
            .replace(/\n?\(empty\)\n?/g, '\n')
          backlog = backlog.slice(0, insertAt) + taskBullet + '\n' + secBody.replace(/^\n/, '') + backlog.slice(secEnd)
          await fs.writeFile(BACKLOG_PATH, backlog, 'utf-8')
        }
      } catch {}
      return NextResponse.json({ ok: true })

    } else {
      // close — just remove from board (already done above)
      return NextResponse.json({ ok: true })
    }
  } catch (err) {
    console.error('[blackboard/resolve]', err)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}

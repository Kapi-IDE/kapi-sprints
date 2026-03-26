import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { OPS_DIR } from '../../../../project.config'
import { now, datestamp, slug, extractTitle, extractContext } from '../../../../lib/resolve-helpers'

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

    const boardDir   = path.join(OPS_DIR, 'blackboard')
    const boardPath  = path.join(boardDir, 'board.md')
    const entriesDir = path.join(boardDir, 'entries')
    await fs.mkdir(entriesDir, { recursive: true })

    const ts    = now()
    const ds    = datestamp()
    const title   = extractTitle(item)
    const context = extractContext(item)

    let board = await fs.readFile(boardPath, 'utf-8')

    // Remove from Open Decisions
    const lines  = board.split('\n')
    const decIdx = lines.findIndex(l =>
      l === `- ${item}` || (l.startsWith('- ') && l.includes(title.slice(0, 40)))
    )
    if (decIdx !== -1) lines.splice(decIdx, 1)
    board = lines.join('\n')

    let entryFilename: string | null = null

    if (action === 'adr') {
      const finalTitle = adrTitle || `ADR: ${title}`
      entryFilename    = `${ds}-adr-${slug(finalTitle)}.md`
      const adrContent = [
        '---',
        `type: decision`,
        `role: PM`,
        `timestamp: ${ts}`,
        `status: accepted`,
        '---',
        '',
        `# ${finalTitle}`,
        '',
        '## Context',
        '',
        context || item.replace(/\*\*/g, '').replace(/→.*$/m, '').trim(),
        '',
        '## Decision',
        '',
        resolution,
        '',
        '## Status',
        '',
        `Accepted ${ts}`,
        '',
      ].join('\n')
      await fs.writeFile(path.join(entriesDir, entryFilename), adrContent, 'utf-8')

    } else if (action === 'task') {
      const backlogPath = path.join(OPS_DIR, 'backlog.md')
      try {
        let backlog    = await fs.readFile(backlogPath, 'utf-8')
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
          await fs.writeFile(backlogPath, backlog, 'utf-8')
        }
      } catch {}
    }

    // Add to Resolved
    const resolvedLine = entryFilename
      ? `- ~~**${title}**~~ — ${resolution} → \`entries/${entryFilename}\``
      : `- ~~**${title}**~~ — ${resolution}`

    const resolvedIdx = board.indexOf('\n## Resolved\n')
    if (resolvedIdx !== -1) {
      const insertAt = resolvedIdx + '\n## Resolved\n'.length
      board = board.slice(0, insertAt) + resolvedLine + '\n' + board.slice(insertAt)
    }

    // Update timestamp
    board = board.replace(/\*Last updated:.*?\*/, `*Last updated: ${new Date().toISOString().slice(0, 10)}*`)

    await fs.writeFile(boardPath, board, 'utf-8')
    return NextResponse.json({ ok: true, entryFilename })
  } catch (err) {
    console.error('[blackboard/resolve]', err)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}

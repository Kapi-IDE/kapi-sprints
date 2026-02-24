import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// POST /api/backlog/promote
// Promotes a backlog inbox item to an Active Blocker on the blackboard.

export async function POST(req: NextRequest) {
  try {
    const { item } = await req.json()
    if (!item || typeof item !== 'string') {
      return NextResponse.json({ error: 'item required' }, { status: 400 })
    }

    const boardPath = path.join(process.cwd(), 'docs/operations/blackboard/board.md')
    let board = await fs.readFile(boardPath, 'utf-8')

    const ts = new Date()
      .toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
      .toLowerCase()
    const bullet = `- **Human** — ${item.trim()} — ${ts}`

    const sectionKey = '\n## Active Blockers\n'
    const idx = board.indexOf(sectionKey)
    if (idx !== -1) {
      const insertAt = idx + sectionKey.length
      const nextSec  = board.indexOf('\n## ', insertAt)
      const secEnd   = nextSec !== -1 ? nextSec : board.length
      const secBody  = board.slice(insertAt, secEnd)
        .replace(/\n?\(none\)\n?/g, '\n')
        .replace(/\n?\(no active[^)]*\)\n?/gi, '\n')
      board = board.slice(0, insertAt) + bullet + '\n' + secBody.replace(/^\n/, '') + board.slice(secEnd)
    } else {
      board += `\n## Active Blockers\n${bullet}\n`
    }

    await fs.writeFile(boardPath, board, 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[backlog/promote]', e)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}

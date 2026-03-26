import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { KAPI_DIR } from '@/project.config'
import { join } from 'path'
import { parseBacklog, serializeBacklog } from '@/lib/backlog'

const BACKLOG_PATH = join(KAPI_DIR, 'backlog.md')

// GET — list backlog items
export async function GET() {
  try {
    const raw = await readFile(BACKLOG_PATH, 'utf-8')
    const { inbox, done } = parseBacklog(raw)
    return NextResponse.json({ inbox, done })
  } catch {
    return NextResponse.json({ inbox: [], done: [] })
  }
}

// POST — add item to inbox
export async function POST(req: NextRequest) {
  try {
    const { item } = await req.json() as { item?: string }
    if (!item || typeof item !== 'string') {
      return NextResponse.json({ error: 'item required' }, { status: 400 })
    }

    let raw = ''
    try { raw = await readFile(BACKLOG_PATH, 'utf-8') } catch {}

    if (!raw) {
      raw = '# Backlog\n\nIdeas and future work.\n\n---\n\n## Inbox\n\n## Done\n'
    }

    const { inbox, done, header } = parseBacklog(raw)
    inbox.push(item.trim())

    await writeFile(BACKLOG_PATH, serializeBacklog(header, inbox, done), 'utf-8')
    return NextResponse.json({ ok: true, count: inbox.length })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// PUT — edit an existing item
export async function PUT(req: NextRequest) {
  try {
    const { index, newText } = await req.json() as { index?: number; newText?: string }
    if (index == null || typeof newText !== 'string' || !newText.trim()) {
      return NextResponse.json({ error: 'index and newText required' }, { status: 400 })
    }

    const raw = await readFile(BACKLOG_PATH, 'utf-8')
    const { inbox, done, header } = parseBacklog(raw)

    if (index < 0 || index >= inbox.length) {
      return NextResponse.json({ error: 'index out of range' }, { status: 404 })
    }

    inbox[index] = newText.trim()
    await writeFile(BACKLOG_PATH, serializeBacklog(header, inbox, done), 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// DELETE — pick an item (move from inbox to done, or remove entirely)
export async function DELETE(req: NextRequest) {
  try {
    const { item, action } = await req.json() as { item?: string; action?: 'done' | 'remove' }
    if (!item || typeof item !== 'string') {
      return NextResponse.json({ error: 'item required' }, { status: 400 })
    }

    const raw = await readFile(BACKLOG_PATH, 'utf-8')
    const { inbox, done, header } = parseBacklog(raw)

    const idx = inbox.findIndex(i => i.includes(item.trim()))
    if (idx === -1) {
      return NextResponse.json({ error: 'item not found in inbox' }, { status: 404 })
    }

    const picked = inbox.splice(idx, 1)[0]
    if (action !== 'remove') {
      done.unshift(picked)
    }

    await writeFile(BACKLOG_PATH, serializeBacklog(header, inbox, done), 'utf-8')
    return NextResponse.json({ ok: true, picked })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

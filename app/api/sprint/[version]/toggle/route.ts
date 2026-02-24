import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ version: string }> }
) {
  const { version } = await params
  const { taskId, checked } = await req.json() as { taskId: string; checked: boolean }

  const filePath = path.join(process.cwd(), 'docs/operations/sprints', version, 'tasks.md')

  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const from = checked ? `- [ ] **${taskId}:` : `- [x] **${taskId}:`
    const to   = checked ? `- [x] **${taskId}:` : `- [ ] **${taskId}:`
    const next = content.replace(from, to)
    if (next === content) {
      return NextResponse.json({ ok: false, error: `Task ${taskId} not found` }, { status: 404 })
    }
    await fs.writeFile(filePath, next, 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

/**
 * Markdown parser functions extracted from app/[version]/page.tsx for testability.
 * page.tsx imports these; tests exercise them directly.
 */

import fs from 'fs/promises'
import path from 'path'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ParsedTask {
  id: string
  title: string
  size: 'S' | 'M'
  checked: boolean
  critical: boolean
  files: string
  what: string
  logic: string
  test: string
  depends: string
}

export interface ParsedBlock {
  id: string
  name: string
  time: string
  tasks: ParsedTask[]
}

export interface BlackboardData {
  lastUpdated: string
  blockers: string[]
  decisions: string[]
  directives: string[]
  findings: string[]
  terminals: string[]
  activity: string[]
  resolved: string[]
}

export interface LayerScore {
  id: string
  name: string
  baseline: number
}

export interface StreamEntry {
  filename: string
  type: string
  role: string
  timestamp: string
  title: string
  body: string
}

// ─── Parsers ────────────────────────────────────────────────────────────────

export function parseTasks(markdown: string, blockTimes: Record<string, string>): ParsedBlock[] {
  const blocks: ParsedBlock[] = []
  let currentBlock: ParsedBlock | null = null
  const lines = markdown.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const blockMatch = line.match(/^## Block ([A-Z]): (.+)/)
    if (blockMatch) {
      currentBlock = {
        id: blockMatch[1],
        name: blockMatch[2].trim(),
        time: blockTimes[blockMatch[1]] ?? '',
        tasks: [],
      }
      blocks.push(currentBlock)
      i++
      continue
    }

    const taskMatch = line.match(/^- \[([x ])\] \*\*(T\d+): (.+?)\*\* \(([SM])\)/)
    if (taskMatch && currentBlock) {
      const task: ParsedTask = {
        id: taskMatch[2], checked: taskMatch[1] === 'x', title: taskMatch[3].trim(),
        size: taskMatch[4] as 'S' | 'M', critical: false,
        files: '', what: '', logic: '', test: '', depends: '',
      }
      i++
      let currentField: string | null = null
      const logicLines: string[] = []

      while (i < lines.length) {
        const bodyLine = lines[i]
        if (bodyLine.match(/^- \[/) || bodyLine.match(/^## /) || bodyLine.match(/^---/)) break
        const trimmed = bodyLine.trim()
        if (trimmed.startsWith('Files:')) {
          currentField = 'files'; task.files = trimmed.slice('Files:'.length).trim()
          if (logicLines.length) { task.logic = logicLines.join('\n'); logicLines.length = 0 }
        } else if (trimmed.startsWith('What:')) {
          currentField = 'what'; task.what = trimmed.slice('What:'.length).trim()
          if (logicLines.length) { task.logic = logicLines.join('\n'); logicLines.length = 0 }
        } else if (trimmed === 'Logic:') {
          currentField = 'logic'
          if (logicLines.length) { task.logic = logicLines.join('\n'); logicLines.length = 0 }
        } else if (trimmed.startsWith('Test:')) {
          if (logicLines.length) { task.logic = logicLines.join('\n'); logicLines.length = 0 }
          currentField = 'test'; task.test = trimmed.slice('Test:'.length).trim()
        } else if (trimmed.startsWith('Depends:')) {
          if (logicLines.length) { task.logic = logicLines.join('\n'); logicLines.length = 0 }
          currentField = 'depends'; task.depends = trimmed.slice('Depends:'.length).trim()
        } else if (currentField === 'logic' && (trimmed || bodyLine.startsWith('    '))) {
          logicLines.push(bodyLine)
        }
        i++
      }
      if (logicLines.length && !task.logic) task.logic = logicLines.join('\n')
      currentBlock.tasks.push(task)
      continue
    }
    i++
  }
  return blocks
}

export function parseBlockTimes(prdMarkdown: string): Record<string, string> {
  const times: Record<string, string> = {}
  const pattern = /\|\s*([A-Z]):[^|]+\|\s*[^|]+\|\s*(\d+\s*min)\s*\|/g
  let match
  while ((match = pattern.exec(prdMarkdown)) !== null) {
    times[match[1]] = match[2].trim()
  }
  return times
}

export function parseBlackboard(md: string): BlackboardData {
  const lastUpdatedMatch = md.match(/\*Last updated:\s*(.+?)\*/)
  const lastUpdated = lastUpdatedMatch?.[1]?.trim() ?? ''

  const sectionMap: Record<string, string[]> = {}
  const sections = md.split(/^## /m).slice(1)
  for (const section of sections) {
    const [heading, ...body] = section.split('\n')
    const key = heading.trim().toLowerCase()
    const bullets: string[] = []
    let inComment = false
    for (const line of body) {
      const trimmed = line.trim()
      if (trimmed.startsWith('<!--')) { inComment = !trimmed.endsWith('-->'); continue }
      if (inComment) { if (trimmed.endsWith('-->')) inComment = false; continue }
      if (/^\(none\)$|^\(no active/i.test(trimmed)) continue
      if (trimmed.startsWith('- ')) bullets.push(trimmed.slice(2))
    }
    sectionMap[key] = bullets
  }

  return {
    lastUpdated,
    blockers:   sectionMap['active blockers'] ?? [],
    decisions:  sectionMap['open decisions'] ?? [],
    directives: sectionMap['directives'] ?? [],
    findings:   sectionMap['findings'] ?? [],
    terminals:  sectionMap['agent status'] ?? sectionMap['terminal status'] ?? [],
    activity:   sectionMap['activity'] ?? sectionMap['recent activity'] ?? [],
    resolved:   sectionMap['resolved'] ?? [],
  }
}

export function parseScorecard(md: string): LayerScore[] {
  const rows: LayerScore[] = []
  for (const line of md.split('\n')) {
    if (!line.startsWith('|')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 4) continue
    const layerMatch = cells[0].match(/^(\d+)\.\s+(.+)/)
    const pctMatch = cells[3].match(/\*\*(\d+)%\*\*/)
    if (layerMatch && pctMatch) {
      rows.push({ id: cells[0], name: layerMatch[2].trim(), baseline: parseInt(pctMatch[1], 10) })
    }
  }
  return rows
}

export function extractSection(md: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = md.match(new RegExp(`## ${escaped}\\s*\\n([\\s\\S]*?)(?:\\n## |\\n---\\n|$)`))
  return match?.[1]?.trim() ?? ''
}

export async function parseEntries(dir: string): Promise<StreamEntry[]> {
  try {
    const files = (await fs.readdir(dir)).filter(f => f.endsWith('.md')).sort().reverse()
    const entries = await Promise.all(files.slice(0, 40).map(async filename => {
      try {
        const content = await fs.readFile(path.join(dir, filename), 'utf-8')
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
        if (!fmMatch) return null
        const fm = fmMatch[1]
        const body = fmMatch[2].trim()
        const get = (key: string) => fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim() ?? ''
        const titleMatch = body.match(/^#\s+(.+)$/m)
        return {
          filename,
          type:      get('type') || 'finding',
          role:      get('role') || '',
          timestamp: get('timestamp') || '',
          title:     titleMatch?.[1]?.trim() ?? filename.replace('.md', ''),
          body:      body.replace(/^#.+$/m, '').trim(),
        } as StreamEntry
      } catch { return null }
    }))
    return entries.filter((e): e is StreamEntry => e !== null)
  } catch { return [] }
}

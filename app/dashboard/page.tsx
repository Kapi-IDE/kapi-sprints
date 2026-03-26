import type { Metadata } from 'next'
import fs from 'fs/promises'
import path from 'path'
import YAML from 'yaml'
import { KAPI_DIR } from '../../project.config'
import { DashboardView } from './DashboardView'

export interface Snapshot {
  headline: string
  status: 'green' | 'yellow' | 'red'
  phase: string
  progress: string
  updated: string
  text: string
  sprint?: { id: string; title?: string; goal?: string; window?: string }
  milestones: { agent: string; text: string; ts: string }[]
}

export interface DecisionRecord {
  id: string
  type: 'adr' | 'review'
  title: string
  status?: string
  result?: string
  date: string
  context?: string
  decision?: string
  consequences?: string
  agent?: string
  task?: string
  category?: string
  notes?: string
}

export const metadata: Metadata = { title: 'Dashboard · Kapi Sprints' }

async function readFileOrNull(filePath: string): Promise<string | null> {
  try { return await fs.readFile(filePath, 'utf-8') } catch { return null }
}

function parseSection(md: string, heading: string): string[] {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`${escaped}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`)
  const match = md.match(pattern)
  if (!match) return []
  return match[1].split('\n').map(l => l.trim()).filter(l => l.startsWith('- ')).map(l => l.slice(2))
}

async function findSprints(): Promise<{ id: string; hasTasks: boolean }[]> {
  const dir = path.join(KAPI_DIR, 'sprints')
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const versions = entries
      .filter(e => e.isDirectory() && /^v\d+$/.test(e.name))
      .map(e => e.name)
      .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
    return Promise.all(versions.map(async v => {
      try {
        await fs.access(path.join(dir, v, 'tasks.md'))
        return { id: v, hasTasks: true }
      } catch {
        return { id: v, hasTasks: false }
      }
    }))
  } catch { return [] }
}

export default async function DashboardPage() {
  const boardMd = await readFileOrNull(path.join(KAPI_DIR, 'board.md'))
  const backlogMd = await readFileOrNull(path.join(KAPI_DIR, 'backlog.md'))
  const sprints = await findSprints()

  const blockers = boardMd ? parseSection(boardMd, '## Active Blockers') : []
  const decisions = boardMd ? parseSection(boardMd, '## Open Decisions') : []
  const findings = boardMd ? parseSection(boardMd, '## Findings') : []
  const status = boardMd ? parseSection(boardMd, '## Status') : []

  const inboxMatch = backlogMd?.match(/## Inbox\s*\n([\s\S]*?)(?=\n---|\n## |$)/)
  const inboxCount = inboxMatch
    ? inboxMatch[1].split('\n').filter(l => l.trim().startsWith('[ ]')).length
    : 0

  let snapshot: Snapshot | null = null
  try {
    const raw = await fs.readFile(path.join(KAPI_DIR, 'snapshot.yaml'), 'utf-8')
    snapshot = YAML.parse(raw) as Snapshot
  } catch {}

  let decisionRecords: DecisionRecord[] = []
  try {
    const raw = await fs.readFile(path.join(KAPI_DIR, 'decisions.yaml'), 'utf-8')
    const parsed = YAML.parse(raw)
    decisionRecords = Array.isArray(parsed?.decisions) ? parsed.decisions : []
  } catch {}

  return (
    <DashboardView
      blockers={blockers}
      decisions={decisions}
      findings={findings}
      status={status}
      inboxCount={inboxCount}
      sprints={sprints}
      snapshot={snapshot}
      decisionRecords={decisionRecords}
    />
  )
}

import { notFound } from 'next/navigation'
import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'
import { marked } from 'marked'
import { DevDashboard } from './_components/DevDashboard'

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

export interface GitStatus {
  branches: { label: string; hash: string; status: string; ok: boolean }[]
  currentBranch: string
  recentCommits: string[]
  uncommittedCount: number
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

// ─── Git helpers ──────────────────────────────────────────────────────────────

function git(cmd: string): string {
  try {
    return execSync(`git ${cmd}`, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      timeout: 8000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
  } catch {
    return ''
  }
}

function getGitStatus(): GitStatus | null {
  try {
    const currentBranch = git('rev-parse --abbrev-ref HEAD') || 'main'
    const localHash     = git('rev-parse --short HEAD')
    const dirtyLines    = git('status --porcelain').split('\n').filter(Boolean)
    const uncommittedCount = dirtyLines.length
    const recentCommits = git('log --oneline -7').split('\n').filter(Boolean)

    let mainStatus = 'No remote configured'
    let mainHash = localHash
    try {
      git('fetch origin --quiet')
      mainHash = git('rev-parse --short origin/main') || localHash
      const behind = parseInt(git('rev-list --count origin/main..HEAD') || '0', 10)
      mainStatus = behind === 0 ? 'In sync' : `${behind} commit${behind === 1 ? '' : 's'} ahead of main`
    } catch {}

    const parts: string[] = []
    if (uncommittedCount > 0) parts.push(`${uncommittedCount} uncommitted`)
    const localStatus = parts.length === 0 ? 'Clean ✅' : parts.join(', ')

    return {
      branches: [
        { label: 'origin/main', hash: mainHash || '?', status: mainStatus, ok: true },
        { label: `Local (${currentBranch})`, hash: localHash || '?', status: localStatus, ok: uncommittedCount === 0 },
      ],
      currentBranch,
      recentCommits,
      uncommittedCount,
    }
  } catch {
    return null
  }
}

// ─── Markdown parsers ─────────────────────────────────────────────────────────

function parseTasks(markdown: string, blockTimes: Record<string, string>): ParsedBlock[] {
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

function parseBlockTimes(prdMarkdown: string): Record<string, string> {
  const times: Record<string, string> = {}
  const pattern = /\|\s*([A-Z]):[^|]+\|\s*[^|]+\|\s*(\d+\s*min)\s*\|/g
  let match
  while ((match = pattern.exec(prdMarkdown)) !== null) {
    times[match[1]] = match[2].trim()
  }
  return times
}

function parseBlackboard(md: string): BlackboardData {
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

function parseScorecard(md: string): LayerScore[] {
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

function extractSection(md: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = md.match(new RegExp(`## ${escaped}\\s*\\n([\\s\\S]*?)(?:\\n## |\\n---\\n|$)`))
  return match?.[1]?.trim() ?? ''
}

function versionNum(v: string) { return parseInt(v.replace('v', ''), 10) }

async function parseEntries(dir: string): Promise<StreamEntry[]> {
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

// ─── Page ────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params
  return { title: `Dev Dashboard · ${version}` }
}

export default async function VersionPage({
  params,
}: {
  params: Promise<{ version: string }>
}) {
  const { version } = await params
  const docsDir  = path.join(process.cwd(), 'docs/operations/sprints')
  const sprintDir = path.join(docsDir, version)

  try { await fs.access(sprintDir) } catch { notFound() }

  let tasksMarkdown = ''
  let prdMarkdown   = ''
  try {
    ;[tasksMarkdown, prdMarkdown] = await Promise.all([
      fs.readFile(path.join(sprintDir, 'tasks.md'), 'utf-8').catch(() => ''),
      fs.readFile(path.join(sprintDir, 'prd.md'), 'utf-8').catch(() => ''),
    ])
  } catch {}

  let versions: string[] = []
  let sprintStates: Record<string, 'active' | 'upcoming'> = {}
  try {
    const entries = await fs.readdir(docsDir, { withFileTypes: true })
    versions = entries
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .filter(v => /^v\d+$/.test(v))
      .sort((a, b) => versionNum(a) - versionNum(b))
    await Promise.all(versions.map(async v => {
      try {
        await fs.access(path.join(docsDir, v, 'tasks.md'))
        sprintStates[v] = 'active'
      } catch {
        sprintStates[v] = 'upcoming'
      }
    }))
  } catch {}

  const activeSprints  = versions.filter(v => sprintStates[v] === 'active')
  const currentVersion = activeSprints.length > 0 ? activeSprints[activeSprints.length - 1] : version
  const vIdx           = versions.indexOf(version)
  const prevVersion    = vIdx > 0 ? versions[vIdx - 1] : null
  const nextVersion    = vIdx < versions.length - 1 ? versions[vIdx + 1] : null
  const sprintState    = sprintStates[version] ?? 'upcoming'

  const blockTimes = parseBlockTimes(prdMarkdown)
  const blocks     = parseTasks(tasksMarkdown, blockTimes)

  marked.setOptions({ gfm: true, breaks: false })
  const prdHtml   = marked.parse(prdMarkdown) as string
  const gitStatus = getGitStatus()

  let preflightHtml:  string | null = null
  let reviewHtml:     string | null = null
  let codeReviewHtml: string | null = null

  await Promise.allSettled([
    fs.readFile(path.join(sprintDir, 'preflight.md'), 'utf-8')
      .then(md => { preflightHtml = marked.parse(md) as string }),
    fs.readFile(path.join(sprintDir, 'review.md'), 'utf-8')
      .then(md => { reviewHtml = marked.parse(md) as string }),
    fs.readFile(path.join(sprintDir, 'code-review.md'), 'utf-8')
      .then(md => { codeReviewHtml = marked.parse(md) as string }),
  ])

  const opsDir = path.join(process.cwd(), 'docs/operations')

  let blackboard: BlackboardData = {
    lastUpdated: '', blockers: [], decisions: [], directives: [],
    findings: [], terminals: [], activity: [], resolved: [],
  }
  try {
    const boardMd = await fs.readFile(path.join(opsDir, 'blackboard/board.md'), 'utf-8')
    blackboard = parseBlackboard(boardMd)
  } catch {}

  let layerScores: LayerScore[] = []
  let demoHtml    = ''
  let gapsHtml    = ''
  let historyHtml = ''
  try {
    const [scorecardMd, statusMd] = await Promise.all([
      fs.readFile(path.join(opsDir, 'scorecard.md'), 'utf-8'),
      fs.readFile(path.join(opsDir, 'status.md'),    'utf-8'),
    ])
    layerScores = parseScorecard(scorecardMd)
    const demoSection    = extractSection(statusMd, "What's Safe to Demo Today")
    const gapsSection    = extractSection(statusMd, 'Known Gaps')
    const historySection = extractSection(statusMd, 'Sprint History')
    if (demoSection)    demoHtml    = marked.parse(demoSection) as string
    if (gapsSection)    gapsHtml    = marked.parse(gapsSection) as string
    if (historySection) historyHtml = marked.parse(historySection) as string
  } catch {}

  const streamEntries = await parseEntries(path.join(opsDir, 'blackboard/entries'))

  let inboxItems: string[] = []
  try {
    const backlogMd   = await fs.readFile(path.join(opsDir, 'backlog.md'), 'utf-8')
    const inboxMatch  = backlogMd.match(/^## Inbox\s*\n([\s\S]*?)(?=\n## |\n---\n|$)/m)
    if (inboxMatch) {
      inboxItems = inboxMatch[1]
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.match(/^\[[ x]\]/))
        .map(l => l.slice(2).trim())
        .map(l => l.replace(/^-\s*/, ''))
    }
  } catch {}

  return (
    <DevDashboard
      version={version}
      versions={versions}
      sprintState={sprintState}
      currentVersion={currentVersion}
      prevVersion={prevVersion}
      nextVersion={nextVersion}
      sprintStates={sprintStates}
      blocks={blocks}
      blackboard={blackboard}
      prdHtml={prdHtml}
      gitStatus={gitStatus}
      preflightHtml={preflightHtml}
      reviewHtml={reviewHtml}
      codeReviewHtml={codeReviewHtml}
      layerScores={layerScores}
      demoHtml={demoHtml}
      gapsHtml={gapsHtml}
      historyHtml={historyHtml}
      streamEntries={streamEntries}
      inboxItems={inboxItems}
    />
  )
}

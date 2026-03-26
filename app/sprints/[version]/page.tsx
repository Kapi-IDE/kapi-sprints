import { notFound } from 'next/navigation'
import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'
import { marked } from 'marked'
import YAML from 'yaml'
import { DevDashboard } from './_components/DevDashboard'
import { OPS_DIR, DOCS_DIR, KAPI_DIR } from '../../../project.config'
import {
  parseTasks,
  parseBlockTimes,
  parseBlackboard,
  parseScorecard,
  extractSection,
  parseEntries,
} from '../../../lib/parsers'
import type { ParsedTask, ParsedBlock, BlackboardData, LayerScore, StreamEntry } from '../../../lib/parsers'

// Re-export types so existing consumers still work
export type { ParsedTask, ParsedBlock, BlackboardData, LayerScore, StreamEntry }

export interface Snapshot {
  headline: string
  status: 'green' | 'yellow' | 'red'
  phase: string
  progress: string
  updated: string
  text: string
  milestones: { agent: string; text: string; ts: string }[]
}

export interface GitStatus {
  branches: { label: string; hash: string; status: string; ok: boolean }[]
  currentBranch: string
  recentCommits: string[]
  uncommittedCount: number
}

export interface AuthorStats {
  name: string
  added: number
  removed: number
  commits: number
}

export interface SprintStats {
  // From docs/operations/sprints/{version}/cost.md (written by agent via /cost)
  costUsd:      string | null
  apiTime:      string | null
  wallTime:     string | null
  tokensIn:     number | null
  tokensOut:    number | null
  cacheRead:    number | null
  // From git log
  authors:      AuthorStats[]
}

// ─── Git helpers ──────────────────────────────────────────────────────────────

function git(cmd: string): string {
  try {
    return execSync(`git ${cmd}`, {
      cwd: path.dirname(OPS_DIR),
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

function versionNum(v: string) { return parseInt(v.replace('v', ''), 10) }

// ─── Page ────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params
  return { title: `Kapi Sprints · ${version}` }
}

export default async function VersionPage({
  params,
}: {
  params: Promise<{ version: string }>
}) {
  const { version } = await params

  // Check kapi/sprints/ first, fall back to opsDir/sprints/
  const kapiSprintDir = path.join(KAPI_DIR, 'sprints', version)
  const opsSprintDir = path.join(OPS_DIR, 'sprints', version)
  let sprintDir: string
  try {
    await fs.access(kapiSprintDir)
    sprintDir = kapiSprintDir
  } catch {
    try {
      await fs.access(opsSprintDir)
      sprintDir = opsSprintDir
    } catch {
      notFound()
    }
  }

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
    // Scan both kapi/sprints/ and opsDir/sprints/, merge and dedupe
    const kapiSprintsDir = path.join(KAPI_DIR, 'sprints')
    const opsSprintsDir = path.join(OPS_DIR, 'sprints')
    const versionSet = new Set<string>()

    for (const dir of [kapiSprintsDir, opsSprintsDir]) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const e of entries) {
          if (e.isDirectory() && /^v\d+$/.test(e.name)) versionSet.add(e.name)
        }
      } catch {}
    }

    versions = [...versionSet].sort((a, b) => versionNum(a) - versionNum(b))
    await Promise.all(versions.map(async v => {
      try {
        // Check kapi first, then ops
        await fs.access(path.join(kapiSprintsDir, v, 'tasks.md'))
          .catch(() => fs.access(path.join(opsSprintsDir, v, 'tasks.md')))
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

  const opsDir = OPS_DIR

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
      fs.readFile(path.join(KAPI_DIR, 'scorecard.md'), 'utf-8').catch(() => fs.readFile(path.join(opsDir, 'scorecard.md'), 'utf-8')),
      fs.readFile(path.join(KAPI_DIR, 'status.md'), 'utf-8'),
    ])
    layerScores = parseScorecard(scorecardMd)
    const demoSection    = extractSection(statusMd, "What's Safe to Demo Today")
    const gapsSection    = extractSection(statusMd, 'Known Gaps')
    const historySection = extractSection(statusMd, 'Sprint History')
    if (demoSection)    demoHtml    = marked.parse(demoSection) as string
    if (gapsSection)    gapsHtml    = marked.parse(gapsSection) as string
    if (historySection) historyHtml = marked.parse(historySection) as string
  } catch {}

  const streamEntries = await parseEntries(path.join(KAPI_DIR, 'entries')).catch(() => parseEntries(path.join(opsDir, 'blackboard/entries')))

  // Foundation doc scan
  const foundationDir = path.join(DOCS_DIR, 'foundation')
  const foundationDocs = [
    { label: 'Vision & Mission', path: 'docs/foundation/vision.md', file: 'vision.md' },
    { label: 'Market & Users',   path: 'docs/foundation/market.md', file: 'market.md' },
    { label: 'Product Spec',     path: 'docs/foundation/spec.md',   file: 'spec.md'   },
  ]
  const specStatus = {
    docs: await Promise.all(foundationDocs.map(async doc => {
      try {
        const content = await fs.readFile(path.join(foundationDir, doc.file), 'utf-8')
        const wordCount = content.split(/\s+/).filter(Boolean).length
        return { ...doc, status: (wordCount < 80 ? 'thin' : 'ok') as 'ok' | 'thin' | 'missing' }
      } catch {
        return { ...doc, status: 'missing' as const }
      }
    })),
  }

  let inboxItems: string[] = []
  const backlogPath = path.join(KAPI_DIR, 'backlog.md')
  try {
    await fs.mkdir(KAPI_DIR, { recursive: true })
    let backlogMd: string
    try {
      backlogMd = await fs.readFile(backlogPath, 'utf-8')
    } catch {
      // Auto-create backlog on first run
      backlogMd = '# Backlog\n\nIdeas and future work.\n\n---\n\n## Inbox\n\n---\n\n## Done\n'
      await fs.writeFile(backlogPath, backlogMd, 'utf-8')
    }
    const inboxMatch = backlogMd.match(/## Inbox\s*\n([\s\S]*?)(?=\n## |\n---\n|$)/)
    if (inboxMatch) {
      inboxItems = inboxMatch[1]
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.match(/^\[[ x]\]/))
        .map(l => l.replace(/^-\s*/, ''))
    }
  } catch {}

  // ─── Sprint stats (cost.md + git log) ───────────────────────────────────────

  const sprintStats: SprintStats = {
    costUsd: null, apiTime: null, wallTime: null,
    tokensIn: null, tokensOut: null, cacheRead: null,
    authors: [],
  }

  // cost.md — written by agent at end of sprint via /cost
  try {
    const costMd = await fs.readFile(
      path.join(opsDir, 'sprints', version, 'cost.md'), 'utf-8'
    )
    const m = (pat: RegExp) => costMd.match(pat)?.[1]?.trim() ?? null
    sprintStats.costUsd  = m(/total cost[:\s]+(\$[\d.]+)/i)
    sprintStats.apiTime  = m(/api\s+time[:\s]+([^\n]+)/i) ?? m(/duration.*api[)\s:]+([^\n]+)/i)
    sprintStats.wallTime = m(/wall\s+time[:\s]+([^\n]+)/i) ?? m(/duration.*wall[)\s:]+([^\n]+)/i)
    const tokIn  = m(/tokens?\s+in[:\s]+([\d,]+)/i)
    const tokOut = m(/tokens?\s+out[:\s]+([\d,]+)/i)
    const cache  = m(/cache\s+read[:\s]+([\d,]+)/i)
    if (tokIn)  sprintStats.tokensIn  = parseInt(tokIn.replace(/,/g, ''), 10)
    if (tokOut) sprintStats.tokensOut = parseInt(tokOut.replace(/,/g, ''), 10)
    if (cache)  sprintStats.cacheRead = parseInt(cache.replace(/,/g, ''), 10)
  } catch {}

  // git log — per-author stats (last 200 commits)
  try {
    const raw = execSync(
      'git log --no-merges --format="AUTHOR:%aN" --numstat -n 200',
      { cwd: path.dirname(OPS_DIR), stdio: ['pipe', 'pipe', 'ignore'] }
    ).toString()

    const authorMap = new Map<string, AuthorStats>()
    let current = ''
    for (const line of raw.split('\n')) {
      if (line.startsWith('AUTHOR:')) {
        current = line.slice(7).trim()
        if (!authorMap.has(current)) {
          authorMap.set(current, { name: current, added: 0, removed: 0, commits: 0 })
        }
        authorMap.get(current)!.commits++
      } else {
        const parts = line.split('\t')
        if (parts.length >= 2 && current) {
          const a = parseInt(parts[0], 10)
          const r = parseInt(parts[1], 10)
          if (!isNaN(a)) authorMap.get(current)!.added   += a
          if (!isNaN(r)) authorMap.get(current)!.removed += r
        }
      }
    }
    sprintStats.authors = [...authorMap.values()]
      .filter(a => a.commits > 0)
      .sort((a, b) => (b.added + b.removed) - (a.added + a.removed))
  } catch {}

  // Snapshot — PM-curated sprint status
  let snapshot: Snapshot | null = null
  try {
    const raw = await fs.readFile(path.join(KAPI_DIR, 'snapshot.yaml'), 'utf-8')
    snapshot = YAML.parse(raw) as Snapshot
  } catch {}

  return (
    <DevDashboard
      specStatus={specStatus}
      snapshot={snapshot}
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
      sprintStats={sprintStats}
    />
  )
}

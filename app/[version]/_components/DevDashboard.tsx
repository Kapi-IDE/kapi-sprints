'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type {
  ParsedBlock, ParsedTask, BlackboardData, GitStatus, LayerScore, StreamEntry,
} from '../page'
import { RightPanel } from './RightPanel'
import { PROJECT } from '@/project.config'

const SPRINT_DURATION_SECS = 3 * 60 * 60

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  version: string
  versions: string[]
  sprintState: 'active' | 'upcoming'
  currentVersion: string
  prevVersion: string | null
  nextVersion: string | null
  sprintStates: Record<string, 'active' | 'upcoming'>
  blocks: ParsedBlock[]
  blackboard: BlackboardData
  prdHtml: string
  gitStatus: GitStatus | null
  preflightHtml: string | null
  reviewHtml: string | null
  codeReviewHtml: string | null
  layerScores: LayerScore[]
  demoHtml: string
  gapsHtml: string
  historyHtml: string
  streamEntries: StreamEntry[]
  inboxItems: string[]
}

type SprintStage  = 'plan' | 'build' | 'qa' | 'review' | 'done'
type WorkspaceTab = 'blackboard' | 'agents' | 'backlog' | 'stream' | 'adrs' | 'status'

interface ParsedAgent {
  name: string
  type: 'ai' | 'human'
  status: 'active' | 'idle' | 'unknown'
  context: string
  detail: string
  raw: string
}
type ActiveView = { mode: 'stage'; stage: SprintStage } | { mode: 'workspace'; tab: WorkspaceTab }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(secs: number): string {
  const h = Math.floor(secs / 3600).toString().padStart(2, '0')
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

function defaultStage(
  progressPct: number, totalTasks: number,
  hasCodeReview: boolean, hasReview: boolean,
): SprintStage {
  if (totalTasks === 0) return 'plan'
  if (progressPct === 0) return 'plan'
  if (progressPct === 100 && hasReview) return 'done'
  if (progressPct === 100 && hasCodeReview) return 'review'
  if (progressPct === 100) return 'qa'
  return 'build'
}

function parseAgents(terminals: string[]): ParsedAgent[] {
  return terminals.map(raw => {
    const nameMatch   = raw.match(/^\*\*(.+?)\*\*/)
    const ctxMatch    = raw.match(/\*\*[^*]+\*\*\s*\(([^)]+)\)/)
    const statusMatch = raw.match(/—\s*(active|idle)/i)
    const detailMatch = raw.match(/—\s*(?:active|idle)[^,]*,\s*(.+)$/i)
    const name    = nameMatch?.[1]  ?? raw.split(' ')[0] ?? 'Agent'
    const context = ctxMatch?.[1]   ?? ''
    const status  = (statusMatch?.[1]?.toLowerCase() ?? 'unknown') as ParsedAgent['status']
    const detail  = detailMatch?.[1]?.trim() ?? ''
    return { type: 'ai', name, status, context, detail, raw }
  })
}

function parseHumans(streamEntries: StreamEntry[]): ParsedAgent[] {
  const seen = new Map<string, StreamEntry>()
  for (const entry of streamEntries) {
    if (!entry.role?.startsWith('Human')) continue
    const existing = seen.get(entry.role)
    if (!existing || entry.timestamp > (existing.timestamp ?? '')) {
      seen.set(entry.role, entry)
    }
  }
  return Array.from(seen.entries()).map(([role, entry]) => {
    const nameRaw = role.replace(/^Human:?/, '').trim() || 'Human'
    return {
      type: 'human' as const,
      name: nameRaw,
      status: 'idle' as const,
      context: entry.type ?? '',
      detail: entry.title ?? '',
      raw: role,
    }
  })
}

const PROSE = [
  '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-zinc-100 [&_h1]:mb-3',
  '[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-zinc-100 [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-zinc-800 [&_h2]:pb-1',
  '[&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-zinc-200 [&_h3]:mt-4 [&_h3]:mb-1.5',
  '[&_p]:text-zinc-300 [&_p]:leading-relaxed [&_p]:mb-2 [&_p]:text-sm',
  '[&_strong]:text-zinc-100 [&_strong]:font-semibold',
  '[&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-2 [&_ul]:space-y-1',
  '[&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-2 [&_ol]:space-y-1',
  '[&_li]:text-zinc-300 [&_li]:text-sm',
  '[&_code]:text-emerald-400 [&_code]:bg-zinc-800/80 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono',
  '[&_pre]:bg-zinc-800 [&_pre]:border [&_pre]:border-zinc-700 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:mb-3 [&_pre]:text-xs',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-zinc-300',
  '[&_table]:w-full [&_table]:border-collapse [&_table]:mb-3 [&_table]:text-sm',
  '[&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-zinc-400 [&_th]:uppercase [&_th]:tracking-wide [&_th]:pb-1.5 [&_th]:border-b [&_th]:border-zinc-700',
  '[&_td]:py-1.5 [&_td]:pr-4 [&_td]:text-zinc-300 [&_td]:text-sm [&_td]:border-b [&_td]:border-zinc-800/60',
  '[&_hr]:border-zinc-800 [&_hr]:my-4',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-emerald-500/40 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-400 [&_blockquote]:italic [&_blockquote]:text-sm',
].join(' ')

// ─── TaskRow ──────────────────────────────────────────────────────────────────

function TaskRow({ task, checked, onToggle }: {
  task: ParsedTask; checked: boolean; onToggle: (v: boolean) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const has = task.files || task.what || task.logic || task.test

  return (
    <div className={`rounded-lg border transition-all ${
      task.critical ? 'border-red-500/30 bg-red-950/10'
      : checked ? 'border-zinc-800/40 bg-zinc-900/20'
      : 'border-zinc-800/60 bg-zinc-900/30'
    }`}>
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <button
          onClick={() => onToggle(!checked)}
          className={`mt-0.5 shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
            checked ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 hover:border-emerald-500/60'
          }`}
        >
          {checked && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-zinc-500 shrink-0">{task.id}</span>
            <span className={`text-[11px] px-1.5 py-px rounded border font-mono shrink-0 ${
              task.size === 'S' ? 'border-sky-600/40 text-sky-400 bg-sky-950/30' : 'border-amber-600/40 text-amber-400 bg-amber-950/30'
            }`}>{task.size}</span>
            <span className={`text-[13px] leading-snug ${checked ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
              {task.title}
            </span>
          </div>
        </div>
        {has && (
          <button onClick={() => setExpanded(e => !e)} className="shrink-0 text-zinc-600 hover:text-zinc-400 p-0.5">
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 14 14">
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      {expanded && has && (
        <div className="px-3 pb-3 pt-2 space-y-2 border-t border-zinc-800/40">
          {task.what  && <div><span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">What</span><p className="mt-0.5 text-xs text-zinc-300">{task.what}</p></div>}
          {task.files && <div><span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">Files</span><p className="mt-0.5 text-xs font-mono text-emerald-400 bg-zinc-800/50 rounded px-2 py-1">{task.files}</p></div>}
          {task.logic && <div><span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">Logic</span><pre className="mt-0.5 text-[11px] text-zinc-300 bg-zinc-800/50 rounded px-2 py-1.5 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">{task.logic.trim()}</pre></div>}
          {task.test  && <div><span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">Test</span><p className="mt-0.5 text-xs text-zinc-300 bg-emerald-950/15 border border-emerald-900/30 rounded px-2 py-1">{task.test}</p></div>}
        </div>
      )}
    </div>
  )
}

// ─── BlockCard ────────────────────────────────────────────────────────────────

function BlockCard({ block, checkedTasks, onToggle }: {
  block: ParsedBlock; checkedTasks: Set<string>; onToggle: (id: string, v: boolean) => void
}) {
  const done   = block.tasks.filter(t => checkedTasks.has(t.id)).length
  const allDone = done === block.tasks.length
  const [open, setOpen] = useState(!allDone)

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      allDone ? 'border-zinc-800/40 opacity-60' : 'border-zinc-800 bg-zinc-900/20'
    }`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/20 transition-colors text-left"
      >
        <div className="shrink-0 relative w-8 h-8">
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-800"/>
            <circle
              cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 12}`}
              strokeDashoffset={`${2 * Math.PI * 12 * (1 - done / Math.max(block.tasks.length, 1))}`}
              className="text-emerald-500 transition-all"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-zinc-400">
            {block.id}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-white">Block {block.id}: {block.name}</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            {done}/{block.tasks.length} tasks{block.time ? ` · ${block.time}` : ''}
          </p>
        </div>
        {allDone && (
          <span className="shrink-0 text-xs px-2.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Done
          </span>
        )}
        <svg className={`w-4 h-4 text-zinc-600 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} fill="none" viewBox="0 0 16 16">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-1.5 border-t border-zinc-800/40 pt-3">
          {block.tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              checked={checkedTasks.has(task.id)}
              onToggle={v => onToggle(task.id, v)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Inline markdown ──────────────────────────────────────────────────────────

function inlineMd(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-100 font-semibold">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="text-emerald-400 bg-zinc-800/70 px-1 rounded text-xs font-mono">$1</code>')
}

// ─── Blackboard sub-components ────────────────────────────────────────────────

function BbSection({ title, items, color, dot, defaultOpen = false }: {
  title: string; items: string[]; color: string; dot?: string; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`rounded-xl border overflow-hidden ${color}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/[0.02]">
        <svg className={`w-3 h-3 text-zinc-600 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} fill="none" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`}/>}
        <span className="text-sm font-semibold text-zinc-100 flex-1">{title}</span>
        <span className="text-xs font-mono text-zinc-600">{items.length}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/[0.04]">
          {items.length === 0
            ? <p className="text-sm text-zinc-600 pt-3">(none)</p>
            : <ul className="space-y-1.5 pt-3">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300 leading-relaxed">
                    <span className="text-zinc-600 mt-1.5 shrink-0">•</span>
                    <span dangerouslySetInnerHTML={{ __html: inlineMd(item) }}/>
                  </li>
                ))}
              </ul>
          }
        </div>
      )}
    </div>
  )
}

function DecisionsSection({ items, onResolved }: { items: string[]; onResolved: () => void }) {
  const [open, setOpen] = useState(items.length > 0)
  const [resolvingIdx, setResolvingIdx] = useState<number | null>(null)
  const [resolution, setResolution] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  async function submit(item: string) {
    if (!resolution.trim()) return
    setSubmitting(true)
    try {
      await fetch('/api/blackboard/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, resolution: resolution.trim(), action: 'close' }),
      })
      setResolvingIdx(null)
      setResolution('')
      router.refresh()
    } catch {} finally { setSubmitting(false) }
  }

  return (
    <div className="rounded-xl border overflow-hidden bg-amber-950/15 border-amber-500/30">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/[0.02]">
        <svg className={`w-3 h-3 text-zinc-600 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} fill="none" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-400"/>
        <span className="text-sm font-semibold text-zinc-100 flex-1">Open Decisions</span>
        <span className="text-xs font-mono text-zinc-600">{items.length}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/[0.04]">
          {items.length === 0
            ? <p className="text-sm text-zinc-600 pt-3">(none)</p>
            : <ul className="space-y-2 pt-3">
                {items.map((item, i) => (
                  <li key={i}>
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-600 mt-1.5 shrink-0">•</span>
                      <span className="flex-1 text-sm text-zinc-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineMd(item) }}/>
                      <button
                        onClick={() => { setResolvingIdx(resolvingIdx === i ? null : i); setResolution('') }}
                        className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold border transition-all mt-0.5 ${
                          resolvingIdx === i
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'text-zinc-600 border-zinc-700 hover:text-amber-400 hover:border-amber-500/30'
                        }`}
                      >
                        {resolvingIdx === i ? 'Cancel' : 'Resolve →'}
                      </button>
                    </div>
                    {resolvingIdx === i && (
                      <div className="mt-2 ml-4 rounded-lg border border-amber-500/15 bg-zinc-900 p-3 space-y-2">
                        <textarea
                          value={resolution}
                          onChange={e => setResolution(e.target.value)}
                          placeholder="What was decided and why?"
                          rows={2}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 resize-none outline-none focus:border-zinc-600 transition-colors"
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setResolvingIdx(null)} className="px-3 py-1 text-xs text-zinc-500 hover:text-zinc-300">Cancel</button>
                          <button
                            onClick={() => submit(item)}
                            disabled={!resolution.trim() || submitting}
                            className="px-3 py-1 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-40"
                          >
                            {submitting ? 'Saving…' : 'Close Decision'}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
          }
        </div>
      )}
    </div>
  )
}

// ─── Stream helpers ───────────────────────────────────────────────────────────

const TYPE_CFG: Record<string, { dot: string; badge: string; label: string }> = {
  finding:   { dot: 'bg-sky-400',     badge: 'bg-sky-500/15 text-sky-300 border-sky-500/25',             label: 'Note'      },
  decision:  { dot: 'bg-amber-400',   badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25',       label: 'Decision'  },
  blocker:   { dot: 'bg-red-400',     badge: 'bg-red-500/15 text-red-300 border-red-500/25',             label: 'Blocker'   },
  milestone: { dot: 'bg-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25', label: 'Milestone' },
  steer:     { dot: 'bg-violet-400',  badge: 'bg-violet-500/15 text-violet-300 border-violet-500/25',    label: 'Directive' },
  queued:    { dot: 'bg-violet-400',  badge: 'bg-violet-500/15 text-violet-300 border-violet-500/25',    label: 'Queued'    },
}

// ─── Stage: Plan ──────────────────────────────────────────────────────────────

function PlanStage({ version, preflightHtml, prdHtml, layerScores, blocks, onSwitchStage }: {
  version: string; preflightHtml: string | null; prdHtml: string
  layerScores: LayerScore[]; blocks: ParsedBlock[]; onSwitchStage: (s: SprintStage) => void
}) {
  const totalTasks  = blocks.reduce((n, b) => n + b.tasks.length, 0)
  const lowestLayer = layerScores.length > 0
    ? layerScores.reduce((min, l) => l.baseline < min.baseline ? l : min)
    : null

  const tools = [
    {
      icon: '◈', iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      title: 'Preflight Check',
      subtitle: 'Pre-sprint health gate — git, build, arch, infra, UX',
      status: preflightHtml
        ? { label: 'GO ✓', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
        : { label: 'Not run', color: 'text-zinc-500 bg-zinc-800 border-zinc-700' },
      cmd: `/preflight ${version}`, recommended: false,
      action: preflightHtml ? null : `Run /preflight ${version}`,
    },
    {
      icon: '◎', iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      title: 'Scorecard',
      subtitle: lowestLayer
        ? `Lowest: ${lowestLayer.name} at ${lowestLayer.baseline}%`
        : 'Architecture health audit — find gaps before planning',
      status: layerScores.length > 0
        ? { label: `${layerScores.length} layers`, color: 'text-zinc-400 bg-zinc-800 border-zinc-700' }
        : { label: 'Not run', color: 'text-zinc-500 bg-zinc-800 border-zinc-700' },
      cmd: `/scorecard`, recommended: false,
      action: layerScores.length === 0 ? 'Run /scorecard' : null,
    },
    {
      icon: '✦', iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      title: 'Sprint PRD',
      subtitle: totalTasks > 0
        ? `${totalTasks} tasks across ${blocks.length} blocks — ready to build`
        : 'Goals, acceptance criteria, task breakdown',
      status: totalTasks > 0
        ? { label: `${totalTasks} tasks`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
        : { label: 'Not planned', color: 'text-zinc-500 bg-zinc-800 border-zinc-700' },
      cmd: `/prd ${version}`, recommended: true,
      action: totalTasks === 0 ? `Run /prd ${version}` : null,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Sprint {version} — Planning</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Run these tools before writing a single line of code</p>
      </div>
      <div className="space-y-3">
        {tools.map((tool, i) => (
          <div key={i} className={`rounded-xl border p-5 transition-all ${
            tool.recommended ? 'border-emerald-500/20 bg-zinc-900/60' : 'border-zinc-800 bg-zinc-900/30'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center text-lg shrink-0 ${tool.iconBg}`}>
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-zinc-100">{tool.title}</h3>
                  {tool.recommended && (
                    <span className="text-[10px] px-1.5 py-px rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Start here
                    </span>
                  )}
                  <span className={`ml-auto text-[10px] px-1.5 py-px rounded border font-mono ${tool.status.color}`}>
                    {tool.status.label}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mt-1">{tool.subtitle}</p>
                <div className="flex items-center gap-3 mt-3">
                  <code className="text-[11px] font-mono text-zinc-600 bg-zinc-800/60 px-2 py-0.5 rounded">
                    {tool.cmd}
                  </code>
                  {totalTasks > 0 && tool.title === 'Sprint PRD' && (
                    <button
                      onClick={() => onSwitchStage('build')}
                      className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Start Building →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {preflightHtml && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Preflight Report</h3>
          <div className={`rounded-xl border border-zinc-800 bg-zinc-900/20 p-5 ${PROSE}`}
            dangerouslySetInnerHTML={{ __html: preflightHtml }}/>
        </div>
      )}
    </div>
  )
}

// ─── Stage: Build ─────────────────────────────────────────────────────────────

function BuildStage({ version, blocks, checkedTasks, onToggle, onResetAll,
  sprintStartTime, timeRemaining, timerColor, onStartSprint, onResetTimer,
  totalTasks, doneCount, progressPct, prdHtml,
}: {
  version: string; blocks: ParsedBlock[]; checkedTasks: Set<string>
  onToggle: (id: string, v: boolean) => void; onResetAll: () => void
  sprintStartTime: number | null; timeRemaining: number; timerColor: string
  onStartSprint: () => void; onResetTimer: () => void
  totalTasks: number; doneCount: number; progressPct: number; prdHtml: string
}) {
  const [showPrd, setShowPrd] = useState(false)

  if (totalTasks === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 text-center space-y-3">
        <p className="text-zinc-400 font-semibold">No tasks yet for sprint {version}</p>
        <p className="text-zinc-600 text-sm">
          Run <code className="text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded font-mono">/prd {version}</code> to plan this sprint first.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-6 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-zinc-400">Sprint {version}</span>
              <span className="text-xs font-mono text-zinc-500">{doneCount}/{totalTasks} · {progressPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPct}%` }}/>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-4 border-l border-zinc-800 shrink-0">
            <span className={`font-mono text-sm font-bold tabular-nums ${timerColor}`}>{fmt(timeRemaining)}</span>
            {!sprintStartTime
              ? <button onClick={onStartSprint} className="px-2 py-1 text-xs font-medium rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all">Start</button>
              : <button onClick={onResetTimer} className="px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all">Reset</button>
            }
          </div>
          <button
            onClick={() => setShowPrd(s => !s)}
            className={`px-2.5 py-1 text-xs rounded border transition-all shrink-0 ${
              showPrd ? 'bg-zinc-700 text-zinc-200 border-zinc-600' : 'text-zinc-500 border-zinc-700 hover:text-zinc-300'
            }`}
          >
            PRD
          </button>
          <button onClick={onResetAll} className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors shrink-0">Reset all</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {showPrd ? (
          <div className={`p-6 ${PROSE}`} dangerouslySetInnerHTML={{ __html: prdHtml }}/>
        ) : (
          <div className="p-6 space-y-3">
            {blocks.map(block => (
              <BlockCard key={block.id} block={block} checkedTasks={checkedTasks} onToggle={onToggle}/>
            ))}
            {doneCount === totalTasks && totalTasks > 0 && (
              <div className="text-center py-10 space-y-2">
                <p className="text-2xl">🎉</p>
                <p className="text-emerald-400 font-semibold">All {totalTasks} tasks complete</p>
                <p className="text-zinc-500 text-sm">
                  Run <code className="text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded font-mono">/test {version}</code> to open the QA gate
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Stage: QA ────────────────────────────────────────────────────────────────

function QAStage({ version, codeReviewHtml, gitStatus }: {
  version: string; codeReviewHtml: string | null; gitStatus: GitStatus | null
}) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Sprint {version} — QA Gate</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Build, lint, code review, ADR check, push</p>
      </div>
      {gitStatus && (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/60 bg-zinc-900/50">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Git Status</span>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {gitStatus.branches.map(b => (
              <div key={b.label} className="flex items-center gap-3 px-4 py-2.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${b.ok ? 'bg-emerald-500' : 'bg-amber-500'}`}/>
                <span className="font-mono text-xs text-zinc-400 w-44 shrink-0">{b.label}</span>
                <span className="font-mono text-xs text-emerald-500">{b.hash}</span>
                <span className={`text-xs ml-auto ${b.ok ? 'text-emerald-400' : 'text-amber-400'}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {codeReviewHtml ? (
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Code Review</h3>
          <div className={`rounded-xl border border-zinc-800 bg-zinc-900/20 p-5 ${PROSE}`}
            dangerouslySetInnerHTML={{ __html: codeReviewHtml }}/>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 px-5 py-8 text-center space-y-2">
          <p className="text-zinc-400 font-medium">QA not run yet</p>
          <p className="text-zinc-600 text-sm">
            Run <code className="text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded font-mono">/test {version}</code> to start the QA gate
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Stage: Review ────────────────────────────────────────────────────────────

function ReviewStage({ version, reviewHtml }: { version: string; reviewHtml: string | null }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Sprint {version} — Review</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Per-task narrative explaining what was built and why</p>
      </div>
      {reviewHtml ? (
        <div className={`rounded-xl border border-zinc-800 bg-zinc-900/20 p-5 ${PROSE}`}
          dangerouslySetInnerHTML={{ __html: reviewHtml }}/>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 px-5 py-8 text-center space-y-2">
          <p className="text-zinc-400 font-medium">Review not generated yet</p>
          <p className="text-zinc-600 text-sm">
            Run <code className="text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded font-mono">/walkthrough {version}</code> to generate the sprint narrative
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Stage: Done ──────────────────────────────────────────────────────────────

function DoneStage({ version, doneCount, totalTasks, gitStatus }: {
  version: string; doneCount: number; totalTasks: number; gitStatus: GitStatus | null
}) {
  const clean = gitStatus?.uncommittedCount === 0
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-64 text-center space-y-4">
      <div className="text-5xl">🚀</div>
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Sprint {version} complete</h2>
        <p className="text-zinc-500 mt-1">{doneCount}/{totalTasks} tasks · reviewed · {clean ? 'pushed' : 'ready to push'}</p>
      </div>
      {!clean && (
        <code className="text-xs font-mono text-zinc-500 bg-zinc-800/60 px-3 py-1.5 rounded">
          git push → deploys to your environment
        </code>
      )}
    </div>
  )
}

// ─── Workspace: Blackboard ────────────────────────────────────────────────────

function BlackboardView({ blackboard }: { blackboard: BlackboardData }) {
  const router = useRouter()
  return (
    <div className="p-6 space-y-3">
      {blackboard.lastUpdated && (
        <p className="text-xs text-zinc-600 italic">Last updated: {blackboard.lastUpdated}</p>
      )}
      <BbSection title="Active Blockers" items={blackboard.blockers} color="bg-red-950/15 border-red-500/30" dot="bg-red-400" defaultOpen={blackboard.blockers.length > 0}/>
      <DecisionsSection items={blackboard.decisions} onResolved={() => router.refresh()}/>
      <BbSection title="Directives" items={blackboard.directives} color="bg-violet-950/15 border-violet-500/30" dot="bg-violet-400"/>
      <BbSection title="Findings" items={blackboard.findings} color="bg-sky-950/15 border-sky-500/30" dot="bg-sky-400" defaultOpen={blackboard.findings.length > 0}/>
      <BbSection title="Agent Status" items={blackboard.terminals} color="bg-zinc-900/40 border-zinc-700/40" defaultOpen={blackboard.terminals.length > 0}/>
      <BbSection title="Activity" items={blackboard.activity} color="bg-zinc-900/30 border-zinc-800"/>
      <BbSection title="Resolved" items={blackboard.resolved} color="bg-zinc-900/20 border-zinc-800/50"/>
    </div>
  )
}

// ─── Workspace: Backlog ───────────────────────────────────────────────────────

function BacklogView({ items }: { items: string[] }) {
  const router = useRouter()
  const clean = (s: string) => s.replace(/^\[[ x]\]\s*/, '')
  const pending = items.filter(i => i.startsWith('[ ]'))
  const done    = items.filter(i => i.startsWith('[x]'))

  async function promote(item: string) {
    try {
      await fetch('/api/backlog/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: clean(item) }),
      })
      router.refresh()
    } catch {}
  }

  return (
    <div className="p-6 space-y-4">
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800/60 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
            <span className="text-sm font-semibold text-zinc-200">Inbox</span>
          </div>
          <span className="text-xs text-zinc-500">{pending.length} pending</span>
        </div>
        {pending.length === 0
          ? <p className="text-sm text-zinc-600 px-4 py-4">Empty — add via <code className="text-zinc-500 bg-zinc-800/60 px-1 rounded font-mono">/post queue [idea]</code></p>
          : <ul className="divide-y divide-zinc-800/40">
              {pending.map((item, i) => (
                <li key={i} className="px-4 py-2.5 flex items-start gap-3 group">
                  <span className="mt-1 w-3.5 h-3.5 rounded border border-zinc-600 shrink-0"/>
                  <span className="text-sm text-zinc-300 flex-1" dangerouslySetInnerHTML={{ __html: inlineMd(clean(item)) }}/>
                  <button
                    onClick={() => promote(item)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded text-[10px] font-semibold border border-red-500/25 text-red-400 hover:bg-red-500/10"
                  >
                    → Blocker
                  </button>
                </li>
              ))}
            </ul>
        }
      </div>
      {done.length > 0 && (
        <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/20 overflow-hidden">
          <ul className="divide-y divide-zinc-800/20">
            {done.map((item, i) => (
              <li key={i} className="px-4 py-2 flex items-start gap-3 opacity-40">
                <span className="mt-1 w-3.5 h-3.5 rounded bg-zinc-700 shrink-0"/>
                <span className="text-sm text-zinc-500 line-through">{clean(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Workspace: Stream ────────────────────────────────────────────────────────

function StreamView({ entries }: { entries: StreamEntry[] }) {
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const types = ['all', 'milestone', 'decision', 'blocker', 'queued', 'finding']
  const shown = filter === 'all' ? entries : entries.filter(e => e.type === filter)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-1.5 flex-wrap">
        {types.map(t => {
          const cfg   = TYPE_CFG[t]
          const count = t === 'all' ? entries.length : entries.filter(e => e.type === t).length
          return (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filter === t
                  ? cfg ? `${cfg.badge} border` : 'bg-zinc-700 text-zinc-100 border border-zinc-600'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t === 'all' ? 'All' : TYPE_CFG[t]?.label ?? t}
              {count > 0 && <span className="ml-1 opacity-60">{count}</span>}
            </button>
          )
        })}
      </div>
      {shown.length === 0
        ? <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 px-5 py-10 text-center">
            <p className="text-zinc-500 text-sm">No entries yet.</p>
          </div>
        : <div className="rounded-xl border border-zinc-800 divide-y divide-zinc-800/50 overflow-hidden">
            {shown.map(entry => {
              const cfg    = TYPE_CFG[entry.type] ?? TYPE_CFG.finding
              const isOpen = expanded.has(entry.filename)
              return (
                <div key={entry.filename} className="bg-zinc-900/30">
                  <div className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/15 transition-colors">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${cfg.dot}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className={`text-[10px] font-mono px-1.5 py-px rounded border ${cfg.badge}`}>{cfg.label}</span>
                        {entry.role && <span className="text-[10px] font-mono px-1.5 py-px rounded border border-emerald-500/20 bg-emerald-500/8 text-emerald-400">{entry.role}</span>}
                        {entry.timestamp && <span className="text-[10px] font-mono text-zinc-700">{entry.timestamp}</span>}
                      </div>
                      <p className="text-sm text-zinc-200">{entry.title}</p>
                    </div>
                    {entry.body && (
                      <button
                        onClick={() => setExpanded(prev => { const n = new Set(prev); n.has(entry.filename) ? n.delete(entry.filename) : n.add(entry.filename); return n })}
                        className="shrink-0 p-1 rounded hover:bg-zinc-700/40 transition-colors"
                      >
                        <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 14 14">
                          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  {isOpen && entry.body && (
                    <div className="px-4 pb-3 pt-1 border-t border-zinc-800/40">
                      <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{entry.body}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
      }
    </div>
  )
}

// ─── Workspace: Status ────────────────────────────────────────────────────────

function StatusView({ layerScores, demoHtml, gapsHtml, historyHtml }: {
  layerScores: LayerScore[]; demoHtml: string; gapsHtml: string; historyHtml: string
}) {
  function barColor(pct: number) {
    if (pct >= 76) return 'bg-emerald-500'
    if (pct >= 51) return 'bg-yellow-500'
    if (pct >= 26) return 'bg-amber-500'
    return 'bg-red-500'
  }
  return (
    <div className="p-6 space-y-8">
      {layerScores.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Platform Health</h2>
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            {layerScores.map((layer, i) => (
              <div key={layer.id} className={`flex items-center gap-4 px-4 py-3 border-b border-zinc-800/50 last:border-0 ${i % 2 === 0 ? 'bg-zinc-900/30' : 'bg-zinc-900/10'}`}>
                <span className="text-xs font-mono text-zinc-600 w-4 shrink-0">{layer.id.match(/^(\d+)\./)?.[1]}.</span>
                <span className="text-sm text-zinc-200 w-36 shrink-0">{layer.name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
                  <div className={`h-full rounded-full ${barColor(layer.baseline)}`} style={{ width: `${layer.baseline}%` }}/>
                </div>
                <span className="text-xs font-mono text-zinc-400 w-8 text-right">{layer.baseline}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {demoHtml    && <div><h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Safe to Demo</h2><div className={`rounded-xl border border-zinc-800 bg-zinc-900/20 p-5 ${PROSE}`} dangerouslySetInnerHTML={{ __html: demoHtml }}/></div>}
      {gapsHtml    && <div><h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Known Gaps</h2><div className={`rounded-xl border border-zinc-800 bg-zinc-900/20 p-5 ${PROSE}`} dangerouslySetInnerHTML={{ __html: gapsHtml }}/></div>}
      {historyHtml && <div><h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Sprint History</h2><div className={`rounded-xl border border-zinc-800 bg-zinc-900/20 p-5 ${PROSE}`} dangerouslySetInnerHTML={{ __html: historyHtml }}/></div>}
    </div>
  )
}

// ─── Workspace: Agents ────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: ParsedAgent }) {
  const isActive = agent.status === 'active'
  const isIdle   = agent.status === 'idle'
  const isHuman  = agent.type === 'human'

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isActive  ? 'border-emerald-500/25 bg-emerald-950/10'
      : isHuman ? 'border-sky-500/15 bg-sky-950/10'
      : 'border-zinc-800 bg-zinc-900/20'
    }`}>
      <div className="flex items-start gap-3">
        {isHuman ? (
          <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <span className="text-sky-400 text-[11px] font-bold font-mono">
              {agent.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        ) : (
          <div className="relative shrink-0 mt-1 w-2.5 h-2.5">
            <span className={`absolute inset-0 rounded-full ${isActive ? 'bg-emerald-400' : isIdle ? 'bg-zinc-600' : 'bg-zinc-700'}`}/>
            {isActive && <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50"/>}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-zinc-100">{agent.name}</span>
            {agent.context && (
              <span className={`text-[10px] font-mono px-1.5 py-px rounded ${isHuman ? 'text-sky-600 bg-sky-900/30' : 'text-zinc-600 bg-zinc-800/60'}`}>
                {agent.context}
              </span>
            )}
            <span className={`ml-auto text-[10px] font-mono px-2 py-px rounded-full border ${
              isActive  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
              : isHuman ? 'bg-sky-500/10 text-sky-500 border-sky-500/20'
              : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}>
              {isHuman ? 'human' : agent.status}
            </span>
          </div>
          {agent.detail && <p className="mt-1.5 text-sm text-zinc-400 leading-snug truncate">{agent.detail}</p>}
          {!agent.detail && !isHuman && <p className="mt-1.5 text-xs text-zinc-600 leading-snug font-mono">{agent.raw}</p>}
        </div>
      </div>
    </div>
  )
}

function AgentsView({ agents, humans }: { agents: ParsedAgent[]; humans: ParsedAgent[] }) {
  if (agents.length === 0 && humans.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-2 text-center">
        <p className="text-zinc-400 font-medium">No team activity yet</p>
        <p className="text-zinc-600 text-sm">Agent and human status appears here once activity is posted to the blackboard.</p>
      </div>
    )
  }
  return (
    <div className="p-6 space-y-6">
      {agents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">AI Agents</h2>
          {agents.map((agent, i) => <AgentCard key={i} agent={agent} />)}
        </div>
      )}
      {humans.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Humans</h2>
          {humans.map((human, i) => <AgentCard key={i} agent={human} />)}
        </div>
      )}
    </div>
  )
}

// ─── Left Sidebar ─────────────────────────────────────────────────────────────

function LeftSidebar({ version, versions, sprintStates, currentVersion, blackboard, inboxItems, streamEntries, activeView, onView }: {
  version: string; versions: string[]; sprintStates: Record<string, 'active' | 'upcoming'>
  currentVersion: string; blackboard: BlackboardData; inboxItems: string[]; streamEntries: StreamEntry[]
  activeView: ActiveView; onView: (v: ActiveView) => void
}) {
  const router = useRouter()
  const inboxCount = inboxItems.filter(i => i.startsWith('[ ]')).length
  const [pastOpen, setPastOpen] = useState(false)

  const pastSprints   = versions.filter(v => sprintStates[v] === 'active' && v !== currentVersion)
  const futureSprints = versions.filter(v => sprintStates[v] === 'upcoming')
  const hasBlockers   = blackboard.blockers.length > 0
  const hasDecisions  = blackboard.decisions.length > 0

  const agents = parseAgents(blackboard.terminals)
  const humans = parseHumans(streamEntries)
  const allTeam = [...agents, ...humans]

  const historyItems: { id: WorkspaceTab; label: string; badge?: number }[] = [
    { id: 'stream', label: 'Stream',  badge: streamEntries.length || undefined },
    { id: 'adrs',   label: 'ADRs',    badge: streamEntries.filter(e => e.type === 'decision').length || undefined },
    { id: 'status', label: 'Status' },
  ]

  const isBBActive = activeView.mode === 'workspace' && activeView.tab === 'blackboard'

  function SprintRow({ v }: { v: string }) {
    const isCurrent  = v === currentVersion && sprintStates[v] === 'active'
    const isDone     = sprintStates[v] === 'active' && v !== currentVersion
    const isViewing  = v === version && activeView.mode === 'stage'
    return (
      <button
        onClick={() => v !== version ? router.push(`/${v}`) : onView({ mode: 'stage', stage: 'build' })}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
          isViewing ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isCurrent ? 'bg-emerald-500' : isDone ? 'bg-zinc-600' : 'border border-zinc-700'
        }`}/>
        <span className="font-mono">{v}</span>
        {isCurrent && <span className="ml-auto text-[8px] text-emerald-600 tracking-wide">CUR</span>}
        {isDone    && <span className="ml-auto text-[8px] text-zinc-700">✓</span>}
      </button>
    )
  }

  return (
    <aside className="w-[196px] shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950 overflow-y-auto">

      {/* Header */}
      <div className="px-3 py-3.5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
            <Image src="/kapi_logo.png" alt={PROJECT.name} width={32} height={32} className="object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-100 truncate">{PROJECT.name}</p>
            <p className="text-[10px] text-zinc-500">Sprint {version}</p>
          </div>
        </div>
      </div>

      {/* Blackboard (pinned) */}
      <div className="border-b border-zinc-800/40 py-1.5">
        <button
          onClick={() => onView({ mode: 'workspace', tab: 'blackboard' })}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left ${
            isBBActive ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-100'
          }`}
        >
          <span className="relative shrink-0 w-2 h-2">
            <span className={`absolute inset-0 rounded-full ${hasBlockers ? 'bg-red-400' : hasDecisions ? 'bg-amber-400' : 'bg-emerald-500'}`}/>
            {(hasBlockers || hasDecisions) && (
              <span className={`absolute inset-0 rounded-full animate-ping opacity-60 ${hasBlockers ? 'bg-red-400' : 'bg-amber-400'}`}/>
            )}
          </span>
          <span className="flex-1 font-medium">Blackboard</span>
          {(blackboard.blockers.length > 0 || blackboard.decisions.length > 0) && (
            <span className={`text-[10px] font-mono px-1.5 py-px rounded ${
              hasBlockers ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
            }`}>
              {hasBlockers ? `${blackboard.blockers.length} block` : `${blackboard.decisions.length} dec`}
            </span>
          )}
        </button>
      </div>

      {/* Current sprint */}
      <div className="border-b border-zinc-800/40 py-1.5">
        <p className="px-3 pt-1 pb-0.5 text-[9px] text-zinc-600 uppercase tracking-[0.14em]">Current Sprint</p>
        <SprintRow v={currentVersion} />
      </div>

      {/* Team (AI agents + humans) */}
      {allTeam.length > 0 && (
        <div className="border-b border-zinc-800/40 py-1.5">
          <p className="px-3 pt-1 pb-0.5 text-[9px] text-zinc-600 uppercase tracking-[0.14em]">Team</p>
          {allTeam.map((member, i) => {
            const isTeamActive = activeView.mode === 'workspace' && activeView.tab === 'agents'
            const isActive = member.status === 'active'
            const isHuman  = member.type === 'human'
            return (
              <button
                key={i}
                onClick={() => onView({ mode: 'workspace', tab: 'agents' })}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors text-left ${
                  isTeamActive ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300'
                }`}
              >
                {isHuman ? (
                  <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-[7px] font-bold text-sky-400 font-mono">
                    {member.name.slice(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <span className="relative shrink-0 w-1.5 h-1.5">
                    <span className={`absolute inset-0 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-600'}`}/>
                    {isActive && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50"/>}
                  </span>
                )}
                <span className="flex-1 truncate">{member.name}</span>
                <span className={`text-[9px] font-mono ${isHuman ? 'text-sky-700' : isActive ? 'text-emerald-600' : 'text-zinc-700'}`}>
                  {isHuman ? 'human' : isActive ? 'active' : 'idle'}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Past sprints (collapsible) */}
      {pastSprints.length > 0 && (
        <div className="border-b border-zinc-800/40 py-1.5">
          <button
            onClick={() => setPastOpen(o => !o)}
            className="w-full flex items-center gap-2 px-3 pt-1 pb-0.5 text-[9px] text-zinc-600 uppercase tracking-[0.14em] hover:text-zinc-500 transition-colors"
          >
            <svg className={`w-2.5 h-2.5 transition-transform ${pastOpen ? '' : '-rotate-90'}`} fill="none" viewBox="0 0 10 10">
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Past ({pastSprints.length})
          </button>
          {pastOpen && pastSprints.map(v => <SprintRow key={v} v={v} />)}
        </div>
      )}

      {/* Planning (backlog + upcoming) */}
      <div className="border-b border-zinc-800/40 py-1.5">
        <p className="px-3 pt-1 pb-0.5 text-[9px] text-zinc-600 uppercase tracking-[0.14em]">Planning</p>
        <button
          onClick={() => onView({ mode: 'workspace', tab: 'backlog' })}
          className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors text-left ${
            activeView.mode === 'workspace' && activeView.tab === 'backlog'
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0 border border-zinc-700"/>
          <span className="flex-1">Backlog</span>
          {inboxCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-px rounded bg-zinc-800 text-zinc-500">{inboxCount}</span>
          )}
        </button>
        {futureSprints.map(v => (
          <button
            key={v}
            onClick={() => router.push(`/${v}`)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300 transition-colors text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0 border border-zinc-700"/>
            <span className="font-mono">{v}</span>
            <span className="ml-auto text-[8px] text-zinc-800">···</span>
          </button>
        ))}
      </div>

      {/* History */}
      <div className="py-1.5 flex-1">
        <p className="px-3 pt-1 pb-0.5 text-[9px] text-zinc-600 uppercase tracking-[0.14em]">History</p>
        {historyItems.map(item => {
          const isActive = activeView.mode === 'workspace' && activeView.tab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onView({ mode: 'workspace', tab: item.id })}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors text-left ${
                isActive ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300'
              }`}
            >
              <span className="w-1.5 h-1.5 shrink-0"/>
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-px rounded bg-zinc-800 text-zinc-500">{item.badge}</span>
              )}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

// ─── Stage Nav ────────────────────────────────────────────────────────────────

function StageNav({ version, activeView, onView, doneCount, totalTasks, hasCodeReview, hasReview }: {
  version: string; activeView: ActiveView; onView: (v: ActiveView) => void
  doneCount: number; totalTasks: number; hasCodeReview: boolean; hasReview: boolean
}) {
  const stages: { id: SprintStage; label: string; count?: string; unlocked: boolean }[] = [
    { id: 'plan',   label: 'Plan',   unlocked: true },
    { id: 'build',  label: 'Build',  count: totalTasks > 0 ? `${doneCount}/${totalTasks}` : undefined, unlocked: true },
    { id: 'qa',     label: 'QA',     count: hasCodeReview ? '1/1' : undefined, unlocked: doneCount > 0 },
    { id: 'review', label: 'Review', count: hasReview ? '1/1' : undefined, unlocked: hasCodeReview || doneCount === totalTasks },
    { id: 'done',   label: 'Done',   unlocked: hasReview },
  ]
  const activeStage = activeView.mode === 'stage' ? activeView.stage : null

  return (
    <div className="shrink-0 border-b border-zinc-800/80 flex items-center px-2 bg-zinc-950/80 backdrop-blur-sm">
      {stages.map(stage => {
        const isActive = activeStage === stage.id
        return (
          <button
            key={stage.id}
            onClick={() => stage.unlocked && onView({ mode: 'stage', stage: stage.id })}
            disabled={!stage.unlocked}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-emerald-500 text-emerald-400'
                : stage.unlocked
                  ? 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                  : 'border-transparent text-zinc-700 cursor-not-allowed'
            }`}
          >
            {stage.label}
            {stage.count && (
              <span className={`text-[11px] font-mono ${isActive ? 'text-emerald-600' : 'text-zinc-700'}`}>
                {stage.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── DevDashboard ─────────────────────────────────────────────────────────────

export function DevDashboard({
  version, versions, sprintState, currentVersion, prevVersion, nextVersion, sprintStates,
  blocks, blackboard, prdHtml, gitStatus, preflightHtml, reviewHtml, codeReviewHtml,
  layerScores, demoHtml, gapsHtml, historyHtml, streamEntries, inboxItems,
}: Props) {
  const router = useRouter()

  const totalTasks = blocks.reduce((n, b) => n + b.tasks.length, 0)

  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(
    () => new Set(blocks.flatMap(b => b.tasks).filter(t => t.checked).map(t => t.id))
  )
  const doneCount   = checkedTasks.size
  const progressPct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0

  const [activeView, setActiveView] = useState<ActiveView>(() => ({
    mode: 'workspace',
    tab: 'blackboard',
  }))

  const [sprintStartTime, setSprintStartTime] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining]     = useState(SPRINT_DURATION_SECS)
  const timerKey = `dev-dashboard-${version}-timer`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(timerKey)
      if (saved) setSprintStartTime(parseInt(saved, 10))
    } catch {}
  }, [timerKey])

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 30_000)
    return () => clearInterval(id)
  }, [router])

  useEffect(() => {
    if (!sprintStartTime) { setTimeRemaining(SPRINT_DURATION_SECS); return }
    const tick = () => {
      const elapsed = Math.floor((Date.now() - sprintStartTime) / 1000)
      setTimeRemaining(Math.max(0, SPRINT_DURATION_SECS - elapsed))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [sprintStartTime])

  const toggleTask = useCallback((taskId: string, checked: boolean) => {
    setCheckedTasks(prev => {
      const next = new Set(prev)
      checked ? next.add(taskId) : next.delete(taskId)
      return next
    })
    fetch(`/api/sprint/${version}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, checked }),
    }).then(r => { if (r.ok) router.refresh() }).catch(() => {})
  }, [version, router])

  const startSprint = () => {
    const t = Date.now()
    setSprintStartTime(t)
    try { localStorage.setItem(timerKey, String(t)) } catch {}
  }
  const resetTimer = () => {
    setSprintStartTime(null)
    try { localStorage.removeItem(timerKey) } catch {}
  }
  const resetAll = () => {
    if (!confirm(`Reset all progress for sprint ${version}?`)) return
    setCheckedTasks(new Set())
    resetTimer()
  }

  const timerColor = !sprintStartTime ? 'text-zinc-500'
    : timeRemaining > 3600 ? 'text-emerald-400'
    : timeRemaining > 1800 ? 'text-amber-400'
    : 'text-red-400'

  const buildHasFlex = activeView.mode === 'stage' && activeView.stage === 'build'

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">

      {/* Title bar */}
      <div className="h-9 shrink-0 flex items-center px-4 gap-3 border-b border-zinc-800/80 bg-zinc-950 select-none">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/kapi_logo.png" alt="Kapi Sprints" width={16} height={16} className="object-contain opacity-80" />
          <span className="text-xs font-medium text-zinc-400">Kapi Sprints</span>
        </Link>
        <span className="text-zinc-800">/</span>
        <span className="text-xs font-mono text-zinc-300">{version}</span>
        {sprintState === 'active' && version === currentVersion && (
          <span className="text-[9px] px-1.5 py-px rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 uppercase tracking-wide">current</span>
        )}
        <div className="ml-auto flex items-center gap-4 text-[10px] font-mono text-zinc-600">
          {gitStatus && (
            <>
              <span className="text-emerald-700">{gitStatus.currentBranch}</span>
              {gitStatus.uncommittedCount > 0 && <span className="text-amber-700">~{gitStatus.uncommittedCount}</span>}
            </>
          )}
          <a href="/docs" className="hover:text-zinc-400 transition-colors">docs</a>
          <span>
            <button onClick={() => prevVersion && router.push(`/${prevVersion}`)} disabled={!prevVersion} className="px-1 text-zinc-700 hover:text-zinc-500 disabled:opacity-20">‹</button>
            <button onClick={() => nextVersion && router.push(`/${nextVersion}`)} disabled={!nextVersion} className="px-1 text-zinc-700 hover:text-zinc-500 disabled:opacity-20">›</button>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        <LeftSidebar
          version={version} versions={versions} sprintStates={sprintStates}
          currentVersion={currentVersion} blackboard={blackboard}
          inboxItems={inboxItems} streamEntries={streamEntries}
          activeView={activeView} onView={setActiveView}
        />

        {/* Center panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <StageNav
            version={version} activeView={activeView} onView={setActiveView}
            doneCount={doneCount} totalTasks={totalTasks}
            hasCodeReview={!!codeReviewHtml} hasReview={!!reviewHtml}
          />

          <div className={`flex-1 ${buildHasFlex ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>
            {activeView.mode === 'stage' && activeView.stage === 'plan' && (
              <PlanStage version={version} preflightHtml={preflightHtml} prdHtml={prdHtml}
                layerScores={layerScores} blocks={blocks}
                onSwitchStage={s => setActiveView({ mode: 'stage', stage: s })}/>
            )}
            {activeView.mode === 'stage' && activeView.stage === 'build' && (
              <BuildStage
                version={version} blocks={blocks} checkedTasks={checkedTasks} onToggle={toggleTask}
                onResetAll={resetAll} sprintStartTime={sprintStartTime} timeRemaining={timeRemaining}
                timerColor={timerColor} onStartSprint={startSprint} onResetTimer={resetTimer}
                totalTasks={totalTasks} doneCount={doneCount} progressPct={progressPct} prdHtml={prdHtml}
              />
            )}
            {activeView.mode === 'stage' && activeView.stage === 'qa' && (
              <QAStage version={version} codeReviewHtml={codeReviewHtml} gitStatus={gitStatus}/>
            )}
            {activeView.mode === 'stage' && activeView.stage === 'review' && (
              <ReviewStage version={version} reviewHtml={reviewHtml}/>
            )}
            {activeView.mode === 'stage' && activeView.stage === 'done' && (
              <DoneStage version={version} doneCount={doneCount} totalTasks={totalTasks} gitStatus={gitStatus}/>
            )}
            {activeView.mode === 'workspace' && activeView.tab === 'blackboard' && (
              <BlackboardView blackboard={blackboard}/>
            )}
            {activeView.mode === 'workspace' && activeView.tab === 'agents' && (
              <AgentsView
                agents={parseAgents(blackboard.terminals)}
                humans={parseHumans(streamEntries)}
              />
            )}
            {activeView.mode === 'workspace' && activeView.tab === 'backlog' && (
              <BacklogView items={inboxItems}/>
            )}
            {activeView.mode === 'workspace' && activeView.tab === 'stream' && (
              <StreamView entries={streamEntries}/>
            )}
            {activeView.mode === 'workspace' && activeView.tab === 'adrs' && (
              <StreamView entries={streamEntries.filter(e => e.type === 'decision')}/>
            )}
            {activeView.mode === 'workspace' && activeView.tab === 'status' && (
              <StatusView layerScores={layerScores} demoHtml={demoHtml} gapsHtml={gapsHtml} historyHtml={historyHtml}/>
            )}
          </div>
        </div>

        <RightPanel/>
      </div>

      {/* Status bar */}
      <div className="h-6 shrink-0 flex items-center px-4 gap-4 border-t border-zinc-800/80 bg-zinc-900/40 text-[10px] font-mono text-zinc-600 select-none">
        {gitStatus && (
          <>
            <span className="text-emerald-700">⎇ {gitStatus.currentBranch}</span>
            {gitStatus.uncommittedCount > 0 && <span className="text-amber-700">~{gitStatus.uncommittedCount} uncommitted</span>}
          </>
        )}
        {totalTasks > 0 && (
          <>
            <span className="text-zinc-700">·</span>
            <span>{version} · {doneCount}/{totalTasks} tasks · {progressPct}%</span>
          </>
        )}
        {sprintStartTime && (
          <>
            <span className="text-zinc-700">·</span>
            <span className={timerColor}>{fmt(timeRemaining)}</span>
          </>
        )}
        <span className="ml-auto text-zinc-800">/{version}</span>
      </div>

    </div>
  )
}

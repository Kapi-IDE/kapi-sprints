'use client'

import { useState } from 'react'
import type { ParsedBlock, LayerScore, BlackboardData, StreamEntry, Snapshot } from '../page'

export interface FoundationDoc {
  label: string
  path: string
  status: 'ok' | 'thin' | 'missing'
}

export interface SpecStatus {
  docs: FoundationDoc[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60_000) return 'just now'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`
  return `${Math.floor(diff / 86400_000)}d ago`
}

const STATUS_DOT: Record<string, string> = {
  green: 'bg-emerald-400',
  yellow: 'bg-amber-400',
  red: 'bg-red-400',
}

// ─── Top card ─────────────────────────────────────────────────────────────────

function TopCard({ label, value, sub, color }: {
  label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 flex flex-col gap-1 min-w-0">
      <p className="text-[10px] uppercase tracking-[0.13em] text-zinc-500 font-semibold">{label}</p>
      <p className={`text-xl font-bold tabular-nums leading-none ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-zinc-500 truncate mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Progress ring ────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 48, stroke = 5 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const cx = size / 2
  const c = 2 * Math.PI * r
  const capped = Math.min(Math.max(pct, 0), 1)
  const color = pct >= 1 ? '#10b981' : pct >= 0.5 ? '#6366f1' : '#f59e0b'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#27272a" strokeWidth={stroke} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${capped * c} ${c}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-zinc-100 tabular-nums">{Math.round(pct * 100)}%</span>
      </div>
    </div>
  )
}

// ─── Horizontal collapsible panel ─────────────────────────────────────────────

function HPanel({ title, count, dotColor, badgeColor, emptyText, items, defaultOpen }: {
  title: string
  count: number
  dotColor: string
  badgeColor: string
  emptyText: string
  items: { text: string; meta?: string }[]
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen ?? count > 0)

  if (!open) {
    // Collapsed: thin vertical strip
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center py-4 px-2 gap-2 hover:border-zinc-700 transition-colors min-w-[52px] shrink-0"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
        <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md border font-semibold ${badgeColor}`}>
          {count}
        </span>
        <span className="text-[10px] text-zinc-500 [writing-mode:vertical-lr] rotate-180 tracking-wider uppercase mt-1">
          {title}
        </span>
      </button>
    )
  }

  // Expanded
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col min-w-[200px] flex-1 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(false)}
        className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60 shrink-0 hover:bg-zinc-800/30 transition-colors"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
        <span className="text-sm font-semibold text-zinc-200 flex-1 text-left">{title}</span>
        <span className={`text-xs font-mono px-2 py-0.5 rounded-md border font-semibold ${badgeColor}`}>
          {count}
        </span>
      </button>
      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-zinc-600 italic">{emptyText}</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 pb-2 border-b border-zinc-800/30 last:border-0 last:pb-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${dotColor} opacity-60`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-300 leading-snug">{item.text}</p>
                {item.meta && <p className="text-[10px] text-zinc-600 mt-0.5">{item.meta}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Directive Input ──────────────────────────────────────────────────────────

function DirectiveInput({ agents }: { agents: string[] }) {
  const [input, setInput] = useState('')
  const [target, setTarget] = useState('all')
  const [sending, setSending] = useState(false)

  async function send() {
    const text = input.trim()
    if (!text) return
    setSending(true)
    try {
      await fetch('http://127.0.0.1:8790/directive', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          text,
          title: text,
          from: 'Human',
          assigned_to: target === 'all' ? undefined : target,
        }),
      })
      setInput('')
    } catch (err) {
      console.error('Failed to post:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
        placeholder="Post a directive..."
        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
        disabled={sending}
      />
      <select
        value={target}
        onChange={e => setTarget(e.target.value)}
        className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none cursor-pointer"
      >
        <option value="all">All agents</option>
        {agents.map(a => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
      <button
        onClick={send}
        disabled={sending || !input.trim()}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
      >
        {sending ? '...' : 'Post'}
      </button>
    </div>
  )
}

// ─── OverviewPanel ────────────────────────────────────────────────────────────

interface Props {
  version: string
  specStatus: SpecStatus
  snapshot: Snapshot | null
  blocks: ParsedBlock[]
  layerScores: LayerScore[]
  blackboard: BlackboardData
  streamEntries: StreamEntry[]
}

export function OverviewPanel({ version, specStatus, snapshot, blocks, layerScores, blackboard, streamEntries }: Props) {
  // Compute task stats
  const allTasks = blocks.flatMap(b => b.tasks)
  const total = allTasks.length
  const done = allTasks.filter(t => t.checked).length
  const inProgress = allTasks.filter(t => !t.checked).slice(0, 3) // next unchecked = in progress
  const nextUp = allTasks.filter(t => !t.checked).slice(3, 6)
  const pct = total > 0 ? done / total : 0

  // Agent names for directive input
  const agentNames = blackboard.terminals
    .map(t => t.match(/^\*\*([^*]+)\*\*/)?.[1])
    .filter((n): n is string => !!n)

  // Parse directives into items
  const directiveItems = blackboard.directives.map(d => {
    const clean = d.replace(/^\*\*([^*]+)\*\*\s*/, '')
    const label = d.match(/^\*\*([^*]+)\*\*/)?.[1] ?? d
    return { text: label, meta: clean !== label ? clean : undefined }
  })

  // Parse blockers, decisions, findings
  const blockerItems = blackboard.blockers.map(b => ({
    text: b.replace(/^\*\*[^*]+\*\*\s*—?\s*/, ''),
    meta: b.match(/^\*\*([^*]+)\*\*/)?.[1],
  }))
  const decisionItems = blackboard.decisions.map(d => ({
    text: d.replace(/^\*\*[^*]+\*\*\s*—?\s*/, ''),
    meta: d.match(/^\*\*([^*]+)\*\*/)?.[1],
  }))
  const findingItems = blackboard.findings.map(f => ({
    text: f.replace(/^\*\*[^*]+\*\*\s*—?\s*/, ''),
    meta: f.match(/^\*\*([^*]+)\*\*/)?.[1],
  }))

  // Milestones from snapshot
  const milestones = snapshot?.milestones ?? []

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-hidden">

      {/* Row 1 — Top metric cards */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        <TopCard
          label="In Progress"
          value={Math.min(total - done, 3)}
          sub={inProgress[0]?.title ?? (total === 0 ? `Run /prd ${version}` : 'All done')}
          color="text-indigo-400"
        />
        <TopCard
          label="Next Up"
          value={nextUp.length}
          sub={nextUp[0]?.title ?? 'Queue empty'}
          color="text-zinc-300"
        />
        <TopCard
          label="Blockers"
          value={blackboard.blockers.length}
          sub={blackboard.blockers.length === 0 ? 'All clear' : blockerItems[0]?.text ?? ''}
          color={blackboard.blockers.length > 0 ? 'text-red-400' : 'text-emerald-400'}
        />
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 flex items-center gap-3">
          <ProgressRing pct={pct} />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.13em] text-zinc-500 font-semibold">Completion</p>
            <p className="text-sm font-bold text-zinc-100 tabular-nums">{done}/{total} tasks</p>
            <p className="text-[11px] text-zinc-500">Sprint {version}</p>
          </div>
        </div>
      </div>

      {/* Status text — PM-curated snapshot */}
      {snapshot && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-4 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[snapshot.status] ?? 'bg-zinc-500'}`} />
            <span className="text-sm font-semibold text-zinc-100">{snapshot.headline}</span>
            <span className="text-[10px] font-mono text-zinc-600 ml-auto">{snapshot.phase} · {snapshot.progress}</span>
            <span className="text-[10px] text-zinc-600">{timeAgo(snapshot.updated)}</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">{snapshot.text}</p>
        </div>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-3 shrink-0">
          <p className="text-[10px] uppercase tracking-[0.13em] text-zinc-500 font-semibold mb-2">Milestones</p>
          <div className="space-y-1.5">
            {milestones.slice().reverse().map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 text-xs mt-0.5 shrink-0">✓</span>
                <span className="text-xs text-zinc-300 flex-1">{m.text}</span>
                <span className="text-[10px] text-zinc-600 shrink-0 font-mono">{m.agent} · {timeAgo(m.ts)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Directive input */}
      <div className="shrink-0">
        <DirectiveInput agents={agentNames} />
      </div>

      {/* Row 2 — Horizontal collapsible signal panels */}
      <div className="flex gap-3 flex-1 min-h-0 overflow-x-auto">
        <HPanel
          title="Directives"
          count={directiveItems.length}
          dotColor="bg-violet-400"
          badgeColor="bg-violet-500/10 text-violet-300 border-violet-500/25"
          emptyText="No directives"
          items={directiveItems}
          defaultOpen={directiveItems.length > 0}
        />
        <HPanel
          title="Blockers"
          count={blockerItems.length}
          dotColor="bg-red-400"
          badgeColor={blockerItems.length > 0 ? 'bg-red-500/10 text-red-300 border-red-500/25' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'}
          emptyText="All clear"
          items={blockerItems}
          defaultOpen={blockerItems.length > 0}
        />
        <HPanel
          title="Decisions"
          count={decisionItems.length}
          dotColor="bg-amber-400"
          badgeColor="bg-amber-500/10 text-amber-300 border-amber-500/25"
          emptyText="No open decisions"
          items={decisionItems}
        />
        <HPanel
          title="Findings"
          count={findingItems.length}
          dotColor="bg-sky-400"
          badgeColor="bg-sky-500/10 text-sky-300 border-sky-500/25"
          emptyText="No findings yet"
          items={findingItems}
        />
      </div>

    </div>
  )
}

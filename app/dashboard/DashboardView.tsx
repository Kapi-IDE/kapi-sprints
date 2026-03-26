'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useBlackboard, type BlackboardAgent } from '@/app/hooks/use-blackboard'
import { AgentSidebar, isStale } from '@/app/agents/_components/agent-sidebar'
import type { Snapshot } from './page'

const SERVER_URL = 'http://127.0.0.1:8790'

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

// ─── Progress Ring ───────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 44, stroke = 4 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const cx = size / 2
  const c = 2 * Math.PI * r
  const capped = Math.min(Math.max(pct, 0), 1)
  const color = pct >= 1 ? '#10b981' : pct >= 0.5 ? '#6366f1' : pct > 0 ? '#f59e0b' : '#3f3f46'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#27272a" strokeWidth={stroke} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${capped * c} ${c}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-zinc-100 tabular-nums">{Math.round(pct * 100)}%</span>
      </div>
    </div>
  )
}

// ─── Directive Input ─────────────────────────────────────────────────────────

function DirectiveInput({ agents }: { agents: [string, BlackboardAgent][] }) {
  const [input, setInput] = useState('')
  const [target, setTarget] = useState('all')
  const [sending, setSending] = useState(false)

  async function send() {
    const text = input.trim()
    if (!text) return
    setSending(true)
    try {
      await fetch(`${SERVER_URL}/directive`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          text, title: text, from: 'Human',
          assigned_to: target === 'all' ? undefined : target,
        }),
      })
      setInput('')
    } catch {}
    setSending(false)
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
        placeholder="Post a directive..."
        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
        disabled={sending}
      />
      <select
        value={target}
        onChange={e => setTarget(e.target.value)}
        className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
      >
        <option value="all">All agents</option>
        {agents.map(([id]) => (
          <option key={id} value={id}>{id}</option>
        ))}
      </select>
      <button
        onClick={send}
        disabled={sending || !input.trim()}
        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
      >
        {sending ? '...' : 'Post'}
      </button>
    </div>
  )
}

// ─── Score Card (with pie) ───────────────────────────────────────────────────

type CardKey = 'score' | 'blockers' | 'decisions' | 'findings'

function ScoreCard({ pct, active, onClick }: { pct: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-4 flex items-center gap-3 transition-colors ${
        active ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <ProgressRing pct={pct} />
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-[0.13em] text-zinc-500 font-semibold">Score</p>
        <p className="text-xs text-zinc-400 mt-0.5">Sprint progress</p>
      </div>
    </button>
  )
}

// ─── Signal Card ─────────────────────────────────────────────────────────────

function SignalCard({ title, count, dotColor, badgeColor, active, onClick }: {
  title: string; count: number; dotColor: string; badgeColor: string
  active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-4 flex items-center gap-3 transition-colors ${
        active ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
      <div className="text-left flex-1">
        <p className="text-[10px] uppercase tracking-[0.13em] text-zinc-500 font-semibold">{title}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{count === 0 ? 'All clear' : `${count} item${count !== 1 ? 's' : ''}`}</p>
      </div>
      <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
        {count}
      </span>
    </button>
  )
}

// ─── Expanded Detail Panel ───────────────────────────────────────────────────

function DetailPanel({ items, empty, emptyText }: { items: string[]; empty?: string; emptyText?: string }) {
  if (items.length === 0) {
    return <p className="text-xs text-zinc-600 italic px-1 py-2">{emptyText ?? empty}</p>
  }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 pb-2 border-b border-zinc-800/30 last:border-0 last:pb-0">
          <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 bg-zinc-600" />
          <p className="text-xs text-zinc-300 leading-snug">{item}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function DashboardView({ blockers, decisions, findings, status, inboxCount, sprints, snapshot }: {
  blockers: string[]
  decisions: string[]
  findings: string[]
  status: string[]
  inboxCount: number
  sprints: { id: string; hasTasks: boolean }[]
  snapshot: Snapshot | null
}) {
  const { state, connected } = useBlackboard()
  const [sweeping, setSweeping] = useState(false)
  const [expandedCard, setExpandedCard] = useState<CardKey | null>(null)

  const agents = state?.agents || {}
  const agentEntries = Object.entries(agents).filter(([id, a]) => a != null && !id.startsWith('shim-')) as [string, BlackboardAgent][]
  const staleCount = agentEntries.filter(([, a]) => isStale(a)).length

  // Live directives
  const liveDirectives = (state?.directives ?? [])
    .filter(d => d.status !== 'done')
    .map(d => {
      const assignee = d.assigned_to ?? ''
      return `${d.title ?? d.text ?? d.id}${assignee ? ` → ${assignee}` : ''} (${d.status ?? 'pending'})`
    })

  async function sweepStale() {
    setSweeping(true)
    try {
      await fetch(`${SERVER_URL}/sweep`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ stale_minutes: 10 }),
      })
    } catch {}
    setSweeping(false)
  }

  const activeSprint = sprints.find(s => s.hasTasks)
  const milestones = snapshot?.milestones ?? []

  // Score from snapshot progress (e.g. "5/8")
  const progressMatch = snapshot?.progress?.match(/(\d+)\s*\/\s*(\d+)/)
  const scorePct = progressMatch ? parseInt(progressMatch[1]) / parseInt(progressMatch[2]) : 0

  function toggleCard(key: CardKey) {
    setExpandedCard(prev => prev === key ? null : key)
  }

  const expandedItems: Record<CardKey, { items: string[]; empty: string }> = {
    score: { items: liveDirectives, empty: 'No active directives' },
    blockers: { items: blockers, empty: 'All clear — no blockers' },
    decisions: { items: decisions, empty: 'No open decisions' },
    findings: { items: findings, empty: 'No findings yet' },
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <AgentSidebar
        agentEntries={agentEntries}
        connected={connected}
        staleCount={staleCount}
        onSweep={sweepStale}
        sweeping={sweeping}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-zinc-800/80 bg-zinc-950 shrink-0">
          <div className="px-6 py-4">
            <h1 className="text-lg font-bold text-zinc-100">Dashboard</h1>
            <p className="text-[11px] text-zinc-500">
              {agentEntries.length} agent{agentEntries.length !== 1 ? 's' : ''} connected
              {activeSprint && (
                <span> &middot; Active sprint: <Link href={`/sprints/${activeSprint.id}`} className="text-emerald-400 hover:text-emerald-300">{activeSprint.id}</Link></span>
              )}
            </p>
          </div>
        </header>

        <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">

          {/* Directive input */}
          <section>
            <DirectiveInput agents={agentEntries} />
          </section>

          {/* Top 4 cards */}
          <section className="grid grid-cols-4 gap-3">
            <ScoreCard
              pct={scorePct}
              active={expandedCard === 'score'}
              onClick={() => toggleCard('score')}
            />
            <SignalCard
              title="Blockers"
              count={blockers.length}
              dotColor={blockers.length > 0 ? 'bg-red-400' : 'bg-emerald-400'}
              badgeColor={blockers.length > 0 ? 'bg-red-500/10 text-red-300 border-red-500/25' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'}
              active={expandedCard === 'blockers'}
              onClick={() => toggleCard('blockers')}
            />
            <SignalCard
              title="Decisions"
              count={decisions.length}
              dotColor="bg-amber-400"
              badgeColor="bg-amber-500/10 text-amber-300 border-amber-500/25"
              active={expandedCard === 'decisions'}
              onClick={() => toggleCard('decisions')}
            />
            <SignalCard
              title="Findings"
              count={findings.length}
              dotColor="bg-sky-400"
              badgeColor="bg-sky-500/10 text-sky-300 border-sky-500/25"
              active={expandedCard === 'findings'}
              onClick={() => toggleCard('findings')}
            />
          </section>

          {/* Expanded detail (below cards) */}
          {expandedCard && (
            <section className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.13em] text-zinc-500 font-semibold mb-3">
                {expandedCard === 'score' ? 'Active Directives' : expandedCard}
              </p>
              <DetailPanel {...expandedItems[expandedCard]} />
            </section>
          )}

          {/* Status + Milestones side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Status text — PM-curated snapshot */}
            {snapshot && (
              <section className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT[snapshot.status] ?? 'bg-zinc-500'}`} />
                  <h2 className="text-sm font-semibold text-zinc-100 flex-1">{snapshot.headline}</h2>
                  <span className="text-[10px] font-mono text-zinc-600">{snapshot.phase} · {snapshot.progress}</span>
                  <span className="text-[10px] text-zinc-600">{timeAgo(snapshot.updated)}</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">{snapshot.text}</p>
              </section>
            )}

            {/* Milestones */}
            <section className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-4">
              <h2 className="text-[10px] uppercase tracking-[0.13em] text-zinc-500 font-semibold mb-3">Milestones</h2>
              {milestones.length === 0 ? (
                <p className="text-xs text-zinc-600 italic">No milestones yet</p>
              ) : (
                <div className="space-y-2">
                  {milestones.slice().reverse().map((m, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 text-xs mt-0.5 shrink-0">✓</span>
                      <span className="text-xs text-zinc-300 flex-1">{m.text}</span>
                      <span className="text-[10px] text-zinc-600 shrink-0 font-mono">{m.agent} · {timeAgo(m.ts)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sprints + Backlog */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section>
              <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">Sprints</h2>
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4">
                {sprints.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-zinc-600">No sprints yet</p>
                    <p className="text-[11px] text-zinc-700 mt-1">
                      Run <code className="text-zinc-500">/prd v1</code> to plan your first sprint
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sprints.map(s => (
                      <Link
                        key={s.id}
                        href={`/sprints/${s.id}`}
                        className={`rounded-lg border p-3 flex items-center gap-3 transition-colors ${
                          s.hasTasks
                            ? 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${s.hasTasks ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                        <span className="text-sm font-medium text-zinc-200">{s.id}</span>
                        <span className={`text-[10px] font-mono ${s.hasTasks ? 'text-emerald-500' : 'text-zinc-600'}`}>
                          {s.hasTasks ? 'active' : 'empty'}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Backlog</h2>
                <Link href="/backlog" className="text-[10px] text-emerald-400 hover:text-emerald-300">View all &rarr;</Link>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <span className="text-lg font-bold text-zinc-300 tabular-nums">{inboxCount}</span>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-200">items in inbox</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      <Link href="/backlog" className="text-emerald-400 hover:text-emerald-300">Manage backlog</Link>
                      {' '}&middot;{' '}
                      <code className="text-zinc-600">/post queue [idea]</code>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="border-t border-zinc-800/60 py-3 shrink-0">
          <div className="px-6 flex items-center justify-between text-[10px] font-mono text-zinc-600">
            <span>blackboard: {SERVER_URL}</span>
            <span>kapi-sprints &middot; command center</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

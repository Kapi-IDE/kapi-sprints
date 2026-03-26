'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useBlackboard, type BlackboardAgent, type BlackboardDirective, type BlackboardLogEntry } from '@/app/hooks/use-blackboard'
import { AgentSidebar, isStale } from '@/app/agents/_components/agent-sidebar'

const SERVER_URL = 'http://127.0.0.1:8790'
const STALE_MS = 10 * 60 * 1000

// ─── Agent file data ─────────────────────────────────────────────────────────

interface AgentFileData {
  id: string
  name?: string
  role?: string
  model?: string
  status?: string
  registered?: string
  body: string | null
}

function useAgentFile(agentId: string) {
  const [data, setData] = useState<AgentFileData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/${encodeURIComponent(agentId)}`)
      const json = await res.json() as AgentFileData
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [agentId])

  useEffect(() => { fetchData() }, [fetchData])

  return { data, loading, refetch: fetchData }
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60_000) return 'just now'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`
  return `${Math.floor(diff / 86400_000)}d ago`
}

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch { return ts }
}

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  active:  { dot: 'bg-emerald-500', bg: 'bg-emerald-950/20', text: 'text-emerald-400' },
  idle:    { dot: 'bg-zinc-500',    bg: 'bg-zinc-900/40',    text: 'text-zinc-400' },
  working: { dot: 'bg-amber-500',   bg: 'bg-amber-950/20',   text: 'text-amber-400' },
  error:   { dot: 'bg-red-500',     bg: 'bg-red-950/20',     text: 'text-red-400' },
  blocked: { dot: 'bg-red-400',     bg: 'bg-red-950/20',     text: 'text-red-400' },
  stale:   { dot: 'bg-zinc-600',    bg: 'bg-zinc-900/20',    text: 'text-zinc-600' },
}

// ─── Single Message Input ────────────────────────────────────────────────────
// Human writes here. Agent decides if it's a task, question, or chat.

function MessageInput({ agentId }: { agentId: string }) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  async function send() {
    const text = input.trim()
    if (!text) return
    setSending(true)
    try {
      const res = await fetch(`${SERVER_URL}/directive`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, title: text, from: 'Human', assigned_to: agentId }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setInput('')
    } catch (err) {
      console.error('Failed to send:', err)
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
        placeholder={`Message ${agentId}...`}
        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
        disabled={sending}
      />
      <button
        onClick={send}
        disabled={sending || !input.trim()}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
      >
        {sending ? '...' : 'Send'}
      </button>
    </div>
  )
}

// ─── Activity Tab (all log entries for this agent) ───────────────────────────

function AgentActivity({ agentId, log }: { agentId: string; log: BlackboardLogEntry[] }) {
  const streamRef = useRef<HTMLDivElement>(null)

  const agentLog = useMemo(() =>
    log.filter(entry =>
      entry.entry.toLowerCase().includes(agentId.toLowerCase())
    ).reverse(),
  [log, agentId])

  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = 0
  }, [agentLog.length])

  return (
    <div ref={streamRef} className="space-y-0.5 max-h-[500px] overflow-y-auto">
      {agentLog.length === 0 && (
        <p className="text-[10px] text-zinc-700 italic py-6 text-center">
          No activity yet.
        </p>
      )}
      {agentLog.map((entry, i) => (
        <div key={`${entry.ts}-${i}`} className="flex gap-3 py-1.5 px-3 rounded hover:bg-zinc-900/60 transition-colors">
          <span className="text-[10px] text-zinc-600 font-mono shrink-0 w-20 pt-0.5">
            {entry.ts ? formatTime(entry.ts) : ''}
          </span>
          <span className="text-xs text-zinc-400 leading-relaxed">{entry.entry}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Tasks Tab (directives assigned to this agent) ───────────────────────────

function AgentTasks({ agentId, directives }: { agentId: string; directives: BlackboardDirective[] }) {
  const mine = useMemo(() =>
    directives.filter(d =>
      d.assigned_to === agentId || d.assignee === agentId
    ).reverse(),
  [directives, agentId])

  const statusColors: Record<string, { badge: string; border: string }> = {
    pending:     { badge: 'text-zinc-400 bg-zinc-800', border: 'border-zinc-800' },
    claimed:     { badge: 'text-amber-400 bg-amber-950/40', border: 'border-amber-500/20' },
    in_progress: { badge: 'text-blue-400 bg-blue-950/40', border: 'border-blue-500/20' },
    done:        { badge: 'text-emerald-400 bg-emerald-950/40', border: 'border-emerald-500/20' },
    completed:   { badge: 'text-emerald-400 bg-emerald-950/40', border: 'border-emerald-500/20' },
    blocked:     { badge: 'text-red-400 bg-red-950/40', border: 'border-red-500/20' },
  }

  return (
    <div className="space-y-2">
      {mine.length === 0 && (
        <p className="text-[10px] text-zinc-700 italic py-4 text-center">
          No tasks assigned to this agent.
        </p>
      )}
      {mine.map(d => {
        const status = d.status || 'pending'
        const colors = statusColors[status] || statusColors.pending
        const updates = Array.isArray(d.updates) ? d.updates as Array<{ ts: string; text: string }> : null
        const result = d.result as string | undefined
        return (
          <div key={d.id} className={`bg-zinc-900/60 border ${colors.border} rounded-lg p-3`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-zinc-200 leading-snug font-medium">{d.title || d.text || d.id}</p>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ${colors.badge}`}>
                {status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-600">
              {d.from && <span>from {d.from}</span>}
              {d.posted_at && <span>{timeAgo(d.posted_at)}</span>}
            </div>
            {updates && updates.length > 0 && (
              <div className="mt-3 border-t border-zinc-800/40 pt-2 space-y-1">
                <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-medium">Progress</p>
                {updates.map((u: { ts: string; text: string }, i: number) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-[9px] text-zinc-600 font-mono shrink-0 w-16 pt-px">
                      {formatTime(u.ts)}
                    </span>
                    <span className="text-[11px] text-zinc-400">{u.text}</span>
                  </div>
                ))}
              </div>
            )}
            {result && (
              <div className="mt-3 border-t border-emerald-500/10 pt-2">
                <p className="text-[9px] text-emerald-600 uppercase tracking-wider font-medium">Result</p>
                <p className="text-[11px] text-zinc-300 mt-1">{result}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Signals Tab (blockers, decisions, milestones posted by agent) ───────────

interface Signal {
  type: 'blocker' | 'decision' | 'milestone' | 'note'
  text: string
  ts: string
}

const SIGNAL_STYLES: Record<string, { icon: string; label: string; bg: string; border: string; text: string }> = {
  blocker:   { icon: '!', label: 'BLOCKER',   bg: 'bg-red-950/30',     border: 'border-red-500/20',     text: 'text-red-400' },
  decision:  { icon: '?', label: 'DECISION',  bg: 'bg-amber-950/30',   border: 'border-amber-500/20',   text: 'text-amber-400' },
  milestone: { icon: '*', label: 'MILESTONE', bg: 'bg-emerald-950/30', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  note:      { icon: '#', label: 'NOTE',      bg: 'bg-zinc-900/40',    border: 'border-zinc-800',       text: 'text-zinc-400' },
}

function AgentSignals({ agentId, state }: { agentId: string; state: Record<string, unknown> | null }) {
  // Read signals from agents.<agentId>.signals on the blackboard
  const signals = useMemo(() => {
    if (!state) return []
    const agents = state.agents as Record<string, Record<string, unknown>> | undefined
    if (!agents?.[agentId]?.signals) return []
    const raw = agents[agentId].signals
    if (!Array.isArray(raw)) return []
    return (raw as Signal[]).slice().reverse()
  }, [state, agentId])

  return (
    <div className="space-y-2">
      {signals.length === 0 && (
        <p className="text-[10px] text-zinc-700 italic py-4 text-center">
          No signals posted by this agent yet.
          <br />
          <span className="text-zinc-600">Agents can post blockers, decisions, milestones, and notes here.</span>
        </p>
      )}
      {signals.map((s, i) => {
        const style = SIGNAL_STYLES[s.type] || SIGNAL_STYLES.note
        return (
          <div key={i} className={`${style.bg} border ${style.border} rounded-lg p-3`}>
            <div className="flex items-start gap-2">
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ${style.text} bg-zinc-950/50`}>
                {style.label}
              </span>
              <p className="text-sm text-zinc-200 leading-snug flex-1">{s.text}</p>
            </div>
            <p className="text-[10px] text-zinc-600 mt-1.5 ml-9">{s.ts ? timeAgo(s.ts) : ''}</p>
          </div>
        )
      })}
    </div>
  )
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function AgentProfile({ data }: { data: AgentFileData }) {
  if (!data.body) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-zinc-600">No profile file found.</p>
        <p className="text-[11px] text-zinc-700 mt-1">
          Create <code className="text-zinc-500">kapi/agents/{data.id}.md</code> to add a persistent profile.
        </p>
      </div>
    )
  }

  const lines = data.body.split('\n')

  return (
    <div className="space-y-4">
      {data.registered && (
        <div className="flex items-center gap-4 text-[10px] text-zinc-600">
          <span>Registered: <span className="text-zinc-400 font-mono">{data.registered}</span></span>
          {data.model && <span>Model: <span className="text-zinc-400 font-mono">{data.model}</span></span>}
        </div>
      )}
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 space-y-2">
        {lines.map((line, i) => {
          if (line.startsWith('# ')) return <h1 key={i} className="text-lg font-bold text-zinc-100">{line.slice(2)}</h1>
          if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-semibold text-zinc-300 mt-3">{line.slice(3)}</h2>
          if (line.startsWith('- ')) return <li key={i} className="text-xs text-zinc-400 ml-4 list-disc">{line.slice(2)}</li>
          if (line.trim() === '') return <div key={i} className="h-1" />
          return <p key={i} className="text-xs text-zinc-400 leading-relaxed">{line}</p>
        })}
      </div>
    </div>
  )
}

// ─── Live State Tab ──────────────────────────────────────────────────────────

function AgentProperties({ agent }: { agent: BlackboardAgent }) {
  const entries = Object.entries(agent).filter(([k]) =>
    !['name', 'capabilities', 'signals'].includes(k)
  )

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-baseline gap-2">
          <span className="text-[10px] text-zinc-600 font-mono w-24 shrink-0 text-right">{key}</span>
          <span className="text-xs text-zinc-300 font-mono truncate">
            {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AgentDetailPage() {
  const params = useParams()
  const agentId = decodeURIComponent(params.agentId as string)
  const { state, connected } = useBlackboard()
  const { data: fileData, loading: fileLoading } = useAgentFile(agentId)
  const [tab, setTab] = useState<'activity' | 'tasks' | 'signals' | 'profile' | 'state'>('activity')
  const [sweeping, setSweeping] = useState(false)

  useEffect(() => {
    document.title = `${agentId} · Kapi Sprints`
  }, [agentId])

  const agents = state?.agents || {}
  const agent = agents[agentId] ?? null
  const directives = state?.directives || []
  const log = state?.log || []

  const role = agent?.role || fileData?.role || 'Agent'
  const model = (agent?.model as string) || fileData?.model

  const agentIsStale = agent
    ? (() => {
        const lastSeen = agent.last_seen as string | undefined
        if (!lastSeen) return true
        return Date.now() - new Date(lastSeen).getTime() > STALE_MS
      })()
    : true

  const status = !agent ? 'offline' : agentIsStale ? 'stale' : (agent.status || 'idle')
  const colors = STATUS_COLORS[status] || STATUS_COLORS.stale

  const taskCount = directives.filter(d => d.assigned_to === agentId || d.assignee === agentId).length
  const activityCount = log.filter(e => e.entry.toLowerCase().includes(agentId.toLowerCase())).length
  const signalCount = Array.isArray((agent as Record<string, unknown>)?.signals) ? ((agent as Record<string, unknown>).signals as unknown[]).length : 0

  // Sidebar data
  const agentEntries = Object.entries(agents).filter(([id, a]) => a != null && !id.startsWith('shim-')) as [string, BlackboardAgent][]
  const staleCount = agentEntries.filter(([, a]) => isStale(a)).length

  async function sweepStale() {
    setSweeping(true)
    try {
      await fetch(`${SERVER_URL}/sweep`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ stale_minutes: 10 }),
      })
    } catch (err) {
      console.error('Sweep failed:', err)
    } finally {
      setSweeping(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <AgentSidebar
        agentEntries={agentEntries}
        connected={connected}
        staleCount={staleCount}
        onSweep={sweepStale}
        sweeping={sweeping}
        activeAgentId={agentId}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-zinc-800/80 bg-zinc-950 shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${colors.bg} ${colors.text} border border-current/10`}>
                {role.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-zinc-100">{agentId}</h1>
                  <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <span className={`text-xs font-mono ${colors.text}`}>{status.toUpperCase()}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {role}
                  {model && <span> &middot; {model}</span>}
                  {agent && typeof agent.last_seen === 'string' && <span> &middot; last seen {timeAgo(agent.last_seen)}</span>}
                  {!agent && fileData?.registered && <span> &middot; registered {timeAgo(fileData.registered)}</span>}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">

          {/* Single message input */}
          <section>
            <MessageInput agentId={agentId} />
            <p className="text-[10px] text-zinc-600 mt-1.5">
              Send a message — the agent decides if it&apos;s a task, question, or status check.
            </p>
          </section>

          {/* Tabs — read-only views of agent output */}
          <div className="flex items-center gap-1 border-b border-zinc-800/60">
            {([
              { key: 'activity', label: 'Activity', count: activityCount },
              { key: 'tasks', label: 'Tasks', count: taskCount },
              { key: 'signals', label: 'Signals', count: signalCount },
              { key: 'profile', label: 'Profile', count: undefined },
              { key: 'state', label: 'Live State', count: undefined },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.label}
                {t.count != null && t.count > 0 && (
                  <span className="ml-1.5 text-[9px] font-mono px-1 py-px rounded bg-zinc-800 text-zinc-500">{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="min-h-[300px]">
            {tab === 'activity' && (
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-2">
                <AgentActivity agentId={agentId} log={log} />
              </div>
            )}

            {tab === 'tasks' && (
              <AgentTasks agentId={agentId} directives={directives} />
            )}

            {tab === 'signals' && (
              <AgentSignals agentId={agentId} state={state as Record<string, unknown> | null} />
            )}

            {tab === 'profile' && (
              fileLoading
                ? <p className="text-[10px] text-zinc-600 py-8 text-center">Loading profile...</p>
                : <AgentProfile data={fileData || { id: agentId, body: null }} />
            )}

            {tab === 'state' && agent && (
              <div className="space-y-4">
                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4">
                  <h3 className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-3">Properties</h3>
                  <AgentProperties agent={agent} />
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4">
                  <h3 className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-3">Raw State</h3>
                  <pre className="text-[10px] text-zinc-500 font-mono leading-relaxed overflow-auto">
                    {JSON.stringify(agent, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {tab === 'state' && !agent && (
              <div className="text-center py-12">
                <p className="text-sm text-zinc-600">Agent not registered in blackboard state.</p>
                <p className="text-[11px] text-zinc-700 mt-1">It may have exited or never registered.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-800/60 py-3 shrink-0">
          <div className="px-6 flex items-center justify-between text-[10px] font-mono text-zinc-600">
            <span>agent: {agentId} &middot; file: kapi/agents/{agentId}.md</span>
            <span>blackboard: {SERVER_URL}</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

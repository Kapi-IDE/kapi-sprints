'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useBlackboard, type BlackboardState, type BlackboardAgent, type BlackboardDirective, type BlackboardLogEntry } from '@/app/hooks/use-blackboard'
import Link from 'next/link'

const SERVER_URL = 'http://127.0.0.1:8790'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60_000) return 'just now'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`
  return `${Math.floor(diff / 3600_000)}h ago`
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500',
  idle: 'bg-zinc-600',
  working: 'bg-amber-500',
  error: 'bg-red-500',
  blocked: 'bg-red-400',
}

const DIRECTIVE_STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  pending:     { bg: 'bg-zinc-900/60',    border: 'border-zinc-700',    text: 'text-zinc-400' },
  claimed:     { bg: 'bg-amber-950/30',   border: 'border-amber-500/30', text: 'text-amber-400' },
  in_progress: { bg: 'bg-blue-950/30',    border: 'border-blue-500/30',  text: 'text-blue-400' },
  done:        { bg: 'bg-emerald-950/30', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  blocked:     { bg: 'bg-red-950/30',     border: 'border-red-500/30',   text: 'text-red-400' },
}

const ROLE_ICONS: Record<string, string> = {
  Dev: '{}',
  Test: 'QA',
  PM: 'PM',
  Research: 'RS',
  Human: 'HU',
}

// ─── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({ id, agent }: { id: string; agent: BlackboardAgent }) {
  const status = agent.status || 'idle'
  const role = agent.role || 'Agent'
  const dotColor = STATUS_COLORS[status] || 'bg-zinc-600'
  const icon = ROLE_ICONS[role] || role.slice(0, 2).toUpperCase()

  return (
    <div className="flex items-start gap-3 bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 min-w-[200px]">
      <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-200 truncate">{id}</span>
          <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
        </div>
        <p className="text-[10px] text-zinc-500 mt-0.5">{role} &middot; {status}</p>
        {agent.capabilities && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {(agent.capabilities as string[]).slice(0, 3).map(c => (
              <span key={c} className="text-[9px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500">{c}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Directive Card ───────────────────────────────────────────────────────────

function DirectiveCard({ directive }: { directive: BlackboardDirective }) {
  const status = directive.status || 'pending'
  const colors = DIRECTIVE_STATUS_COLORS[status] || DIRECTIVE_STATUS_COLORS.pending

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-3 space-y-1.5`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-zinc-200 font-medium leading-snug">
          {directive.title || directive.text || directive.id}
        </p>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ${colors.text} bg-zinc-950/50`}>
          {status.toUpperCase()}
        </span>
      </div>
      {(directive.assigned_to ?? directive.assignee) && (
        <p className="text-[10px] text-zinc-500">
          → <span className="text-zinc-400">{directive.assigned_to ?? directive.assignee}</span>
        </p>
      )}
      {directive.from && (
        <p className="text-[10px] text-zinc-600">from {directive.from}</p>
      )}
    </div>
  )
}

// ─── Directive Kanban ─────────────────────────────────────────────────────────

function DirectiveKanban({ directives }: { directives: BlackboardDirective[] }) {
  const columns: { key: string; label: string; items: BlackboardDirective[] }[] = [
    { key: 'pending', label: 'Pending', items: directives.filter(d => !d.status || d.status === 'pending') },
    { key: 'in_progress', label: 'In Progress', items: directives.filter(d => d.status === 'claimed' || d.status === 'in_progress') },
    { key: 'done', label: 'Done', items: directives.filter(d => d.status === 'done' || d.status === 'completed') },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {columns.map(col => (
        <div key={col.key}>
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{col.label}</h4>
            {col.items.length > 0 && (
              <span className="text-[9px] font-mono px-1.5 py-px rounded bg-zinc-800 text-zinc-500">{col.items.length}</span>
            )}
          </div>
          <div className="space-y-2 min-h-[80px]">
            {col.items.length === 0 && (
              <div className="text-[10px] text-zinc-700 italic py-4 text-center border border-dashed border-zinc-800 rounded-lg">
                No directives
              </div>
            )}
            {col.items.map(d => <DirectiveCard key={d.id} directive={d} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Activity Stream ──────────────────────────────────────────────────────────

function ActivityStream({ log }: { log: BlackboardLogEntry[] }) {
  const streamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight
    }
  }, [log.length])

  const recent = log.slice(-50).reverse()

  return (
    <div ref={streamRef} className="space-y-1 max-h-[400px] overflow-y-auto">
      {recent.length === 0 && (
        <p className="text-[10px] text-zinc-700 italic py-4 text-center">No activity yet. Post a directive to get started.</p>
      )}
      {recent.map((entry, i) => (
        <div key={`${entry.ts}-${i}`} className="flex gap-2 py-1 px-2 rounded hover:bg-zinc-900/60 transition-colors">
          <span className="text-[9px] text-zinc-600 font-mono shrink-0 pt-0.5 w-14">
            {entry.ts ? timeAgo(entry.ts) : ''}
          </span>
          <span className="text-xs text-zinc-400 leading-relaxed">{entry.entry}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Raw YAML View ────────────────────────────────────────────────────────────

function RawStateView({ state }: { state: BlackboardState | null }) {
  const yaml = useMemo(() => {
    if (!state) return '# Waiting for blackboard connection...'
    return JSON.stringify(state, null, 2)
  }, [state])

  return (
    <pre className="text-[10px] leading-relaxed text-zinc-500 font-mono bg-zinc-950 rounded-lg p-3 overflow-auto max-h-[500px] border border-zinc-800/50">
      {yaml}
    </pre>
  )
}

// ─── Command Input ────────────────────────────────────────────────────────────

function CommandInput() {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  async function send() {
    const text = input.trim()
    if (!text) return
    setSending(true)

    // Parse target: "@agent_name message" or "Role: message" or just "message"
    let assigned_to: string | undefined
    let title: string

    const agentMatch = text.match(/^@(\S+)\s+(.+)/)
    const roleMatch = text.match(/^(Dev|Test|PM|Research):\s*(.+)/i)

    if (agentMatch) {
      assigned_to = agentMatch[1]
      title = agentMatch[2]
    } else if (roleMatch) {
      assigned_to = roleMatch[1]
      title = roleMatch[2]
    } else {
      title = text
    }

    try {
      const res = await fetch(`${SERVER_URL}/directive`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: title, title, from: 'Human', assigned_to }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setInput('')
    } catch (err) {
      console.error('Failed to post directive:', err)
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
        placeholder='@agent_name task, Dev: task, or just a task for everyone'
        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
        disabled={sending}
      />
      <button
        onClick={send}
        disabled={sending || !input.trim()}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
      >
        {sending ? 'Sending...' : 'Post'}
      </button>
    </div>
  )
}

// ─── Connection Status ────────────────────────────────────────────────────────

function ConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-full ${
      connected ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
      {connected ? 'live' : 'disconnected'}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const { state, connected } = useBlackboard()
  const [showRaw, setShowRaw] = useState(false)

  const agents = state?.agents || {}
  const directives = state?.directives || []
  const log = state?.log || []
  const agentCount = Object.keys(agents).length

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm">
              &larr; Dashboard
            </Link>
            <div className="w-px h-5 bg-zinc-800" />
            <div>
              <h1 className="text-lg font-bold text-zinc-100">Multi-Agent Coordination</h1>
              <p className="text-[11px] text-zinc-500">Blackboard architecture &middot; Real-time agent orchestration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionBadge connected={connected} />
            <button
              onClick={() => setShowRaw(r => !r)}
              className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                showRaw
                  ? 'bg-violet-950/40 text-violet-400 border-violet-500/20'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
              }`}
            >
              {showRaw ? 'YAML ON' : 'YAML'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 space-y-6">

        {/* Zone 1: The Swarm — Agent Cards */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Agent Swarm</h2>
            <span className="text-[9px] font-mono px-1.5 py-px rounded bg-zinc-800 text-zinc-500">
              {agentCount} connected
            </span>
          </div>
          {agentCount === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center">
              <p className="text-sm text-zinc-600">No agents connected</p>
              <p className="text-[11px] text-zinc-700 mt-1">
                Start a Claude Code session in kapi-sprints to register an agent.
                <br/>
                The agent will appear here when it calls <code className="text-emerald-600">write_to_blackboard</code> to register.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {Object.entries(agents).map(([id, agent]) => (
                <AgentCard key={id} id={id} agent={agent} />
              ))}
            </div>
          )}
        </section>

        {/* Zone 2: Command Input */}
        <section>
          <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">Human Directive</h2>
          <CommandInput />
          <p className="text-[10px] text-zinc-600 mt-1.5">
            Target: <code className="text-zinc-500">@agent_name</code> for a specific agent, <code className="text-zinc-500">Dev:</code> <code className="text-zinc-500">Test:</code> <code className="text-zinc-500">PM:</code> for a role, or no prefix for all agents
          </p>
        </section>

        {/* Zone 3 + 4: Kanban + Activity (side by side) */}
        <div className={`grid gap-6 ${showRaw ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {/* Kanban — takes 2 cols */}
          <section className="lg:col-span-2">
            <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">Directive Queue</h2>
            <DirectiveKanban directives={directives} />
          </section>

          {/* Activity Stream */}
          <section>
            <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">Activity Stream</h2>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-3">
              <ActivityStream log={log} />
            </div>
          </section>
        </div>

        {/* Zone 5: Raw YAML (toggle) */}
        {showRaw && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Raw Blackboard State</h2>
              <span className="text-[9px] font-mono px-1.5 py-px rounded bg-violet-950/40 text-violet-400 border border-violet-500/20">
                EDUCATIONAL VIEW
              </span>
            </div>
            <p className="text-[10px] text-zinc-600 mb-2">
              This is the actual YAML state that all agents read and write. Every change above is reflected here in real-time.
            </p>
            <RawStateView state={state} />
          </section>
        )}

        {/* Protocol Reference */}
        <section className="border-t border-zinc-800/40 pt-6">
          <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">Protocol Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4">
              <h3 className="text-sm font-medium text-emerald-400 mb-2">Agent Lifecycle</h3>
              <ol className="text-[11px] text-zinc-500 space-y-1 list-decimal list-inside">
                <li>Register under <code className="text-zinc-400">agents.&lt;name&gt;</code></li>
                <li>Set status: <code className="text-zinc-400">active</code></li>
                <li>Read directives, claim matching tasks</li>
                <li>Update status while working</li>
                <li>Log results, signal handoff</li>
              </ol>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4">
              <h3 className="text-sm font-medium text-amber-400 mb-2">Directive Flow</h3>
              <div className="text-[11px] text-zinc-500 space-y-1">
                <p><span className="text-zinc-400">pending</span> &rarr; Human posts task</p>
                <p><span className="text-blue-400">claimed</span> &rarr; Agent picks it up</p>
                <p><span className="text-blue-400">in_progress</span> &rarr; Agent working</p>
                <p><span className="text-emerald-400">done</span> &rarr; Work complete</p>
                <p><span className="text-red-400">blocked</span> &rarr; Needs help</p>
              </div>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4">
              <h3 className="text-sm font-medium text-violet-400 mb-2">Handoff Pattern</h3>
              <div className="text-[11px] text-zinc-500 space-y-1">
                <p>Dev finishes &rarr; sets status <code className="text-zinc-400">done</code></p>
                <p>Posts new directive &rarr; <code className="text-zinc-400">Test: verify auth</code></p>
                <p>Test agent picks up &rarr; runs tests</p>
                <p>Reports back &rarr; pass/fail on board</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-3 shrink-0">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-[10px] font-mono text-zinc-600">
          <span>blackboard server: {SERVER_URL}</span>
          <span>kapi-sprints &middot; multi-agent coordination</span>
        </div>
      </footer>
    </div>
  )
}

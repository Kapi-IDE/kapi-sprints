'use client'

import Link from 'next/link'
import { type BlackboardAgent } from '@/app/hooks/use-blackboard'

const STALE_MS = 10 * 60 * 1000

export function isStale(agent: BlackboardAgent): boolean {
  const lastSeen = agent.last_seen as string | undefined
  if (!lastSeen) return true
  return Date.now() - new Date(lastSeen).getTime() > STALE_MS
}

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

function getNavItems(currentSprint?: string) {
  const sprintHref = currentSprint ? `/sprints/${currentSprint}` : '/sprints/v1'
  const sprintLabel = currentSprint ? `Sprint ${currentSprint}` : 'Sprint'
  return [
    { href: '/dashboard',  icon: '\u25C8', label: 'Dashboard' },
    { href: sprintHref,    icon: '\u25B7', label: sprintLabel },
    { href: '/backlog',    icon: '\u25A1', label: 'Backlog' },
    { href: '/decisions',  icon: '\u25C7', label: 'Decisions' },
    { href: '/lessons',    icon: '\u25CB', label: 'Lessons' },
    { href: '/docs',       icon: '\u25FB', label: 'Docs' },
  ]
}

export function Sidebar({ agentEntries, connected, staleCount, onSweep, sweeping, activeAgentId, activePage, currentSprint }: {
  agentEntries: [string, BlackboardAgent][]
  connected: boolean
  staleCount: number
  onSweep: () => void
  sweeping: boolean
  activeAgentId?: string
  activePage?: string
  currentSprint?: string
}) {
  const NAV_ITEMS = getNavItems(currentSprint)
  return (
    <aside className="w-[196px] shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950 overflow-y-auto">
      {/* Header */}
      <div className="px-3 py-3.5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <span className="text-emerald-400 text-xs font-bold">KS</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-100 truncate">Kapi Sprints</p>
            <p className="text-[10px] text-zinc-500">Multi-agent coordination</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-zinc-800/40 py-1.5">
        {NAV_ITEMS.map(item => {
          const isActive = activePage === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100'
              }`}
            >
              <span className="shrink-0 text-[10px]">{item.icon}</span>
              <span className={`flex-1 ${isActive ? 'font-medium' : ''}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Team */}
      <div className="border-b border-zinc-800/40 py-1.5">
        <div className="flex items-center gap-2 px-3 pt-1 pb-0.5">
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.14em]">Team</p>
          <span className="text-[9px] font-mono px-1.5 py-px rounded bg-zinc-800 text-zinc-500">
            {agentEntries.length}
          </span>
        </div>
        {agentEntries.length === 0 ? (
          <p className="px-3 py-2 text-[10px] text-zinc-700 italic">No agents connected</p>
        ) : (
          agentEntries.map(([id, agent]) => {
            const stale = isStale(agent)
            const status = stale ? 'stale' : (agent.status || 'idle')
            const isActive = status === 'active'
            const isCurrent = id === activeAgentId
            return (
              <Link
                key={id}
                href={`/agents/${encodeURIComponent(id)}`}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                  stale ? 'opacity-50' : ''
                } ${isCurrent ? 'bg-emerald-950/20 text-emerald-300' : 'text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300'}`}
              >
                <span className="relative shrink-0 w-1.5 h-1.5">
                  <span className={`absolute inset-0 rounded-full ${stale ? 'bg-zinc-600' : isActive ? 'bg-emerald-500' : 'bg-zinc-600'}`}/>
                  {isActive && !stale && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50"/>}
                </span>
                <span className="flex-1 truncate">{id}</span>
                <span className={`text-[9px] font-mono ${
                  stale ? 'text-red-400/70' : isActive ? 'text-emerald-600' : 'text-zinc-700'
                }`}>
                  {stale ? 'stale' : status}
                </span>
              </Link>
            )
          })
        )}
        {staleCount > 0 && (
          <button
            onClick={onSweep}
            disabled={sweeping}
            className="mx-3 mt-1 mb-0.5 text-[9px] font-mono px-2 py-0.5 rounded bg-red-950/30 text-red-400/80 border border-red-500/20 hover:bg-red-950/50 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {sweeping ? 'Sweeping...' : `Sweep ${staleCount} stale`}
          </button>
        )}
      </div>

      {/* Connection status */}
      <div className="mt-auto border-t border-zinc-800/60 px-3 py-2.5">
        <ConnectionBadge connected={connected} />
      </div>
    </aside>
  )
}

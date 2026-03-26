'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useBlackboard, type BlackboardAgent } from '@/app/hooks/use-blackboard'
import { Sidebar, isStale } from '@/app/_components/sidebar'

const SERVER_URL = 'http://127.0.0.1:8790'

interface TaskItem {
  id: string
  title: string
  size: string
  checked: boolean
  what: string
  files: string
  logic: string
  test: string
  depends: string
}

interface Block {
  id: string
  name: string
  time: string
  tasks: TaskItem[]
}

// ─── Progress Bar ────────────────────────────────────────────────────────────

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const color = pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-zinc-400 tabular-nums shrink-0">{done}/{total} ({pct}%)</span>
    </div>
  )
}

// ─── Task Row ────────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: TaskItem }) {
  const [expanded, setExpanded] = useState(false)
  const hasDetails = task.what || task.files || task.logic || task.test || task.depends
  return (
    <div className="border-b border-zinc-800/30 last:border-0">
      <button
        onClick={() => setExpanded(o => !o)}
        className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-zinc-900/40 transition-colors"
      >
        <span className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
          task.checked
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            : 'border-zinc-700 text-transparent'
        }`}>
          {task.checked && '✓'}
        </span>
        <div className="flex-1 min-w-0">
          <span className={`text-sm ${task.checked ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
            {task.title}
          </span>
          {task.what && !expanded && (
            <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{task.what}</p>
          )}
        </div>
        <span className="text-[10px] font-mono text-zinc-600 shrink-0">{task.size}</span>
        {hasDetails && (
          <span className={`text-[10px] text-zinc-700 transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
        )}
      </button>
      {expanded && hasDetails && (
        <div className="px-10 pb-3 space-y-1.5">
          {task.what && (
            <div className="flex gap-2">
              <span className="text-[10px] text-zinc-600 font-mono w-14 shrink-0 text-right">What:</span>
              <span className="text-[11px] text-zinc-400">{task.what}</span>
            </div>
          )}
          {task.files && (
            <div className="flex gap-2">
              <span className="text-[10px] text-zinc-600 font-mono w-14 shrink-0 text-right">Files:</span>
              <span className="text-[11px] text-zinc-400 font-mono">{task.files}</span>
            </div>
          )}
          {task.logic && (
            <div className="flex gap-2">
              <span className="text-[10px] text-zinc-600 font-mono w-14 shrink-0 text-right">Logic:</span>
              <pre className="text-[11px] text-zinc-500 whitespace-pre-wrap flex-1">{task.logic}</pre>
            </div>
          )}
          {task.depends && (
            <div className="flex gap-2">
              <span className="text-[10px] text-zinc-600 font-mono w-14 shrink-0 text-right">Deps:</span>
              <span className="text-[11px] text-zinc-400 font-mono">{task.depends}</span>
            </div>
          )}
          {task.test && (
            <div className="flex gap-2">
              <span className="text-[10px] text-zinc-600 font-mono w-14 shrink-0 text-right">Test:</span>
              <span className="text-[11px] text-emerald-500/70">{task.test}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main View ───────────────────────────────────────────────────────────────

export function SprintDetailView({ version, prdHtml, blocks, totalTasks, doneTasks }: {
  version: string
  prdHtml: string
  blocks: Block[]
  totalTasks: number
  doneTasks: number
}) {
  const { state, connected } = useBlackboard()
  const [sweeping, setSweeping] = useState(false)
  const [activeTab, setActiveTab] = useState<'tasks' | 'prd'>('tasks')

  const agents = state?.agents || {}
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
    } catch {}
    setSweeping(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <Sidebar
        agentEntries={agentEntries}
        connected={connected}
        staleCount={staleCount}
        onSweep={sweepStale}
        sweeping={sweeping}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-zinc-800/80 bg-zinc-950 shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">← dashboard</Link>
              <span className="text-zinc-800">/</span>
              <h1 className="text-lg font-bold text-zinc-100">Sprint {version}</h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                doneTasks === totalTasks && totalTasks > 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {doneTasks === totalTasks && totalTasks > 0 ? 'DONE' : 'IN PROGRESS'}
              </span>
            </div>
            <div className="mt-3">
              <ProgressBar done={doneTasks} total={totalTasks} />
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="border-b border-zinc-800/60 px-6">
          <div className="flex gap-1">
            {([
              { key: 'tasks' as const, label: 'Tasks', count: totalTasks },
              { key: 'prd' as const, label: 'PRD', count: undefined },
            ]).map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === t.key
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.label}
                {t.count != null && (
                  <span className="ml-1.5 text-[9px] font-mono px-1 py-px rounded bg-zinc-800 text-zinc-500">{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          {activeTab === 'tasks' && (
            <div className="space-y-6 max-w-3xl">
              {blocks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-zinc-500">No tasks yet.</p>
                  <p className="text-[11px] text-zinc-600 mt-1">
                    Run <code className="text-zinc-400">/prd {version}</code> to plan this sprint.
                  </p>
                </div>
              ) : (
                blocks.map(block => (
                  <div key={block.id} className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-800/60 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-600">Block {block.id}</span>
                      <h3 className="text-sm font-semibold text-zinc-200 flex-1">{block.name}</h3>
                      <span className="text-[10px] font-mono text-zinc-600">
                        {block.tasks.filter(t => t.checked).length}/{block.tasks.length}
                      </span>
                    </div>
                    <div>
                      {block.tasks.map(task => (
                        <TaskRow key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'prd' && (
            <div className="max-w-3xl">
              {prdHtml ? (
                <div
                  className="prose-doc"
                  dangerouslySetInnerHTML={{ __html: prdHtml }}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-zinc-500">No PRD found.</p>
                  <p className="text-[11px] text-zinc-600 mt-1">
                    Run <code className="text-zinc-400">/prd {version}</code> to create one.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="border-t border-zinc-800/60 py-3 shrink-0">
          <div className="px-6 flex items-center justify-between text-[10px] font-mono text-zinc-600">
            <span>sprint: {version} · kapi/sprints/{version}/</span>
            <span>kapi-sprints</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

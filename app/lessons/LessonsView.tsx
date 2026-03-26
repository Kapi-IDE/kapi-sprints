'use client'

import { useState } from 'react'
import { useBlackboard, type BlackboardAgent } from '@/app/hooks/use-blackboard'
import { Sidebar, isStale } from '@/app/_components/sidebar'

const SERVER_URL = 'http://127.0.0.1:8790'

export function LessonsView({ html }: { html: string }) {
  const { state, connected } = useBlackboard()
  const [sweeping, setSweeping] = useState(false)

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
        <header className="border-b border-zinc-800/80 bg-zinc-950 shrink-0">
          <div className="px-6 py-4">
            <h1 className="text-lg font-bold text-zinc-100">Lessons Learned</h1>
            <p className="text-[11px] text-zinc-500">Append-only log of learnings &middot; source: kapi/lessons.md</p>
          </div>
        </header>

        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <div
            className="prose prose-invert prose-sm prose-zinc max-w-3xl
              prose-headings:text-zinc-100 prose-h1:text-xl prose-h2:text-base prose-h2:border-b prose-h2:border-zinc-800 prose-h2:pb-2 prose-h2:mt-8
              prose-p:text-zinc-400 prose-strong:text-zinc-200
              prose-hr:border-zinc-800
              prose-code:text-emerald-400 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        <footer className="border-t border-zinc-800/60 py-3 shrink-0">
          <div className="px-6 text-[10px] font-mono text-zinc-600">
            kapi/lessons.md &middot; append-only
          </div>
        </footer>
      </div>
    </div>
  )
}

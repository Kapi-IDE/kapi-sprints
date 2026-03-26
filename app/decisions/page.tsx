import fs from 'fs/promises'
import path from 'path'
import YAML from 'yaml'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { KAPI_DIR } from '../../project.config'

export const metadata: Metadata = {
  title: 'Decisions · Kapi Sprints',
}

interface Decision {
  id: string
  type: 'adr' | 'review'
  title: string
  status?: string
  result?: string
  date: string
  agent?: string
  task?: string
  sprint?: string
  category?: string
  context?: string
  decision?: string
  consequences?: string
  notes?: string
}

const STATUS_STYLES: Record<string, string> = {
  accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  proposed: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  deprecated: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/25',
  superseded: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/25',
}

const RESULT_STYLES: Record<string, string> = {
  approve: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  reject: 'bg-red-500/10 text-red-400 border-red-500/25',
  edit: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
}

function AdrCard({ d }: { d: Decision }) {
  const statusStyle = STATUS_STYLES[d.status ?? ''] ?? STATUS_STYLES.proposed
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center gap-3">
        <span className="text-[10px] font-mono text-zinc-500 shrink-0">{d.id}</span>
        <h3 className="text-sm font-semibold text-zinc-100 flex-1">{d.title}</h3>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${statusStyle}`}>
          {d.status ?? 'proposed'}
        </span>
        <span className="text-[10px] text-zinc-600">{d.date}</span>
      </div>
      <div className="px-5 py-4 space-y-3">
        {d.context && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Context</p>
            <p className="text-xs text-zinc-400 leading-relaxed">{d.context}</p>
          </div>
        )}
        {d.decision && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Decision</p>
            <p className="text-xs text-zinc-300 leading-relaxed">{d.decision}</p>
          </div>
        )}
        {d.consequences && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Consequences</p>
            <p className="text-xs text-zinc-400 leading-relaxed">{d.consequences}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewCard({ d }: { d: Decision }) {
  const resultStyle = RESULT_STYLES[d.result ?? ''] ?? RESULT_STYLES.approve
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center gap-3">
        <span className="text-[10px] font-mono text-zinc-500 shrink-0">{d.id}</span>
        <h3 className="text-sm font-semibold text-zinc-100 flex-1">{d.title}</h3>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${resultStyle}`}>
          {d.result ?? 'approve'}
        </span>
        <span className="text-[10px] text-zinc-600">{d.date}</span>
      </div>
      <div className="px-5 py-4">
        <div className="flex gap-4 text-xs text-zinc-500">
          {d.agent && <span>Agent: <span className="text-zinc-300">{d.agent}</span></span>}
          {d.task && <span>Task: <span className="text-zinc-300">{d.task}</span></span>}
          {d.sprint && <span>Sprint: <span className="text-zinc-300">{d.sprint}</span></span>}
          {d.category && <span>Category: <span className="text-zinc-300">{d.category}</span></span>}
        </div>
        {d.notes && (
          <p className="text-xs text-zinc-400 leading-relaxed mt-3">{d.notes}</p>
        )}
      </div>
    </div>
  )
}

export default async function DecisionsPage() {
  let decisions: Decision[] = []
  try {
    const raw = await fs.readFile(path.join(KAPI_DIR, 'decisions.yaml'), 'utf-8')
    const parsed = YAML.parse(raw)
    decisions = Array.isArray(parsed?.decisions) ? parsed.decisions : []
  } catch {}

  const adrs = decisions.filter(d => d.type === 'adr')
  const reviews = decisions.filter(d => d.type === 'review')

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="h-9 flex items-center px-4 gap-3 border-b border-zinc-800/80 bg-zinc-950 select-none">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/kapi_logo.png" alt="Kapi Sprints" width={16} height={16} className="object-contain opacity-80" />
          <span className="text-xs font-medium text-zinc-400">Kapi Sprints</span>
        </Link>
        <span className="text-zinc-800">/</span>
        <span className="text-xs font-mono text-zinc-300">decisions</span>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">
            ← dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Decisions</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Architecture decisions and agent review records.
            {decisions.length > 0 && (
              <span className="text-zinc-600"> {adrs.length} ADR{adrs.length !== 1 ? 's' : ''}, {reviews.length} review{reviews.length !== 1 ? 's' : ''}.</span>
            )}
          </p>
        </div>

        {decisions.length === 0 ? (
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-10 text-center">
            <p className="text-sm text-zinc-500">No decisions recorded yet.</p>
            <p className="text-xs text-zinc-600 mt-2">
              Resolve an Open Decision from the board, or run <code className="text-zinc-400">/review</code> after reviewing agent work.
            </p>
          </div>
        ) : (
          <>
            {adrs.length > 0 && (
              <section>
                <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-4">
                  Architecture Decisions ({adrs.length})
                </h2>
                <div className="space-y-4">
                  {adrs.map(d => <AdrCard key={d.id} d={d} />)}
                </div>
              </section>
            )}

            {reviews.length > 0 && (
              <section>
                <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-4">
                  Agent Reviews ({reviews.length})
                </h2>
                <div className="space-y-4">
                  {reviews.map(d => <ReviewCard key={d.id} d={d} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

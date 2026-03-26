'use client'

import Link from 'next/link'
import type { SprintStats } from '../page'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] text-zinc-600 uppercase tracking-[0.14em] mb-2">{children}</p>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const isEmpty = value === '—'
  return (
    <div className="rounded bg-zinc-900 px-2.5 py-2 space-y-1">
      <p className="text-[9px] text-zinc-600 uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-bold leading-none font-mono ${isEmpty ? 'text-zinc-700' : 'text-zinc-100'}`}>
        {value}
      </p>
      {sub && <p className="text-[9px] text-zinc-600">{sub}</p>}
    </div>
  )
}

function TokenBar({ label, value, max, color }: {
  label: string; value: number | null; max: number; color: string
}) {
  const pct   = value != null && max > 0 ? Math.min((value / max) * 100, 100) : 0
  const fmt   = (n: number | null) => n == null ? '—' : n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n)
  const empty = value == null
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-zinc-500">{label}</span>
        <span className={`text-[10px] font-mono tabular-nums font-semibold ${empty ? 'text-zinc-700' : 'text-zinc-300'}`}>
          {fmt(value)}
        </span>
      </div>
      <div className="h-[3px] rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── RightPanel ───────────────────────────────────────────────────────────────

export function RightPanel({ sprintStats }: { sprintStats: SprintStats }) {
  const { costUsd, apiTime, wallTime, tokensIn, tokensOut, cacheRead, authors } = sprintStats
  const hasCost    = costUsd != null
  const hasTokens  = tokensIn != null || tokensOut != null
  const hasAuthors = authors.length > 0

  const tokenMax = Math.max(tokensIn ?? 0, tokensOut ?? 0, cacheRead ?? 0, 1)

  return (
    <div className="w-[220px] shrink-0 border-l border-zinc-800 overflow-y-auto bg-zinc-950 font-mono text-[11px]">

      {/* Header */}
      <div className="px-3 py-2.5 border-b border-zinc-800/60 sticky top-0 bg-zinc-950 z-10">
        <span className="text-[9px] text-zinc-500 uppercase tracking-[0.15em]">Sprint Stats</span>
      </div>

      {/* Cost summary */}
      <section className="px-3 py-3 border-b border-zinc-800/30">
        <SectionLabel>Cost</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Total" value={costUsd ?? '—'} sub={hasCost ? undefined : 'run /cost'} />
          <Stat label="API Time" value={apiTime ?? '—'} />
        </div>
        {wallTime && (
          <div className="mt-2 rounded bg-zinc-900 px-2.5 py-1.5 flex justify-between items-center">
            <span className="text-[9px] text-zinc-600 uppercase tracking-wide">Wall time</span>
            <span className="text-[11px] font-bold text-zinc-400 font-mono">{wallTime}</span>
          </div>
        )}
        {!hasCost && (
          <p className="text-[9px] text-zinc-700 mt-2 leading-relaxed">
            Write output of <span className="text-zinc-600">/cost</span> to{' '}
            <span className="text-zinc-600">sprints/{'{v}'}/cost.md</span>
          </p>
        )}
      </section>

      {/* Token usage */}
      <section className="px-3 py-3 border-b border-zinc-800/30">
        <SectionLabel>Tokens</SectionLabel>
        <div className="rounded bg-zinc-900 px-2.5 py-2.5 space-y-2.5">
          <TokenBar label="Input"      value={tokensIn}  max={tokenMax} color="bg-emerald-500" />
          <TokenBar label="Output"     value={tokensOut} max={tokenMax} color="bg-sky-500"     />
          <TokenBar label="Cache read" value={cacheRead} max={tokenMax} color="bg-violet-500"  />
          {!hasTokens && (
            <p className="text-[9px] text-zinc-700 pt-1 leading-relaxed">
              Add token counts to cost.md or enable OTel export
            </p>
          )}
        </div>
      </section>

      {/* Code output per author */}
      <section className="px-3 py-3 border-b border-zinc-800/30">
        <SectionLabel>Code Output</SectionLabel>
        {!hasAuthors ? (
          <div className="rounded bg-zinc-900 px-2.5 py-3 text-center">
            <p className="text-[10px] text-zinc-700">No commits yet</p>
          </div>
        ) : (
          <div className="rounded bg-zinc-900 px-2.5 py-2 space-y-3">
            {authors.map(a => (
              <div key={a.name} className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[7px] font-bold text-zinc-400 shrink-0">
                    {a.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-zinc-300 flex-1 truncate">{a.name}</span>
                  <span className="text-[9px] text-zinc-600 tabular-nums">{a.commits}c</span>
                </div>
                <div className="flex gap-1.5 items-center pl-[22px]">
                  <span className="text-[10px] text-emerald-500 font-semibold tabular-nums">+{a.added.toLocaleString()}</span>
                  <span className="text-zinc-700 text-[9px]">/</span>
                  <span className="text-[10px] text-red-400 tabular-nums">−{a.removed.toLocaleString()}</span>
                </div>
                {/* lines bar */}
                {(() => {
                  const maxLines = Math.max(...authors.map(x => x.added + x.removed), 1)
                  const pct = Math.round(((a.added + a.removed) / maxLines) * 100)
                  return (
                    <div className="pl-[22px] h-[2px] rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-600/60" style={{ width: `${pct}%` }} />
                    </div>
                  )
                })()}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Getting started (shown when no real data yet) */}
      {!hasCost && !hasAuthors && (
        <section className="px-3 py-3 space-y-2">
          <SectionLabel>Getting Started</SectionLabel>
          <div className="rounded bg-zinc-900 px-2.5 py-2.5 space-y-2">
            {[
              { n: '1', t: 'Edit project.config.ts with your project name' },
              { n: '2', t: 'Run /sprint init — foundation gate + scaffold' },
              { n: '3', t: 'Run /prd v1 to plan your first sprint' },
              { n: '4', t: 'Run /dev v1 to build with TDD' },
            ].map(({ n, t }) => (
              <div key={n} className="flex items-start gap-2">
                <span className="text-[9px] font-bold text-emerald-700 mt-0.5 shrink-0">{n}.</span>
                <p className="text-[10px] text-zinc-500 leading-relaxed">{t}</p>
              </div>
            ))}
          </div>
          <Link
            href="/get-started"
            className="block text-center text-[10px] text-emerald-600 hover:text-emerald-400 transition-colors py-1"
          >
            Full setup guide →
          </Link>
        </section>
      )}

    </div>
  )
}

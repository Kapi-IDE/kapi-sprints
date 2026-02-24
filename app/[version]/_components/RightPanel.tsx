'use client'

import Link from 'next/link'

// ─── RightPanel ───────────────────────────────────────────────────────────────
// Team health metrics panel (right sidebar).
// Numbers are illustrative — replace with real instrumentation when you wire
// your observability backend.

const FLOW = {
  inOut:  { value: '—', unit: '/day', trend: 'no data', trendColor: 'text-zinc-600' },
  avgTtr: { value: '—', unit: 'min',  trend: 'no data', trendColor: 'text-zinc-600' },
}

const MODES = [
  { label: 'PAIR',    value: 0, color: 'bg-emerald-500' },
  { label: 'HANDOFF', value: 0, color: 'bg-sky-500'     },
  { label: 'CONSULT', value: 0, color: 'bg-amber-500'   },
  { label: 'AUTO',    value: 0, color: 'bg-zinc-600'    },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] text-zinc-600 uppercase tracking-[0.14em] mb-2">{children}</p>
  )
}

export function RightPanel() {
  return (
    <div className="w-[220px] shrink-0 border-l border-zinc-800 overflow-y-auto bg-zinc-950 font-mono text-[11px]">

      {/* Header */}
      <div className="px-3 py-2.5 border-b border-zinc-800/60 sticky top-0 bg-zinc-950 z-10">
        <span className="text-[9px] text-zinc-500 uppercase tracking-[0.15em]">Team Health</span>
      </div>

      {/* Flow */}
      <section className="px-3 py-3 border-b border-zinc-800/30">
        <SectionLabel>Flow</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded bg-zinc-900 px-2.5 py-2">
            <p className="text-[9px] text-zinc-600 uppercase tracking-wide mb-1.5">In / Out</p>
            <p className="text-[22px] font-bold text-zinc-100 leading-none">
              {FLOW.inOut.value}
              <span className="text-[11px] font-normal text-zinc-500 ml-0.5">{FLOW.inOut.unit}</span>
            </p>
            <p className={`text-[10px] mt-1.5 ${FLOW.inOut.trendColor}`}>{FLOW.inOut.trend}</p>
          </div>
          <div className="rounded bg-zinc-900 px-2.5 py-2">
            <p className="text-[9px] text-zinc-600 uppercase tracking-wide mb-1.5">Avg TTR</p>
            <p className="text-[22px] font-bold text-zinc-100 leading-none">
              {FLOW.avgTtr.value}
              <span className="text-[11px] font-normal text-zinc-500 ml-0.5">{FLOW.avgTtr.unit}</span>
            </p>
            <p className={`text-[10px] mt-1.5 ${FLOW.avgTtr.trendColor}`}>{FLOW.avgTtr.trend}</p>
          </div>
        </div>
      </section>

      {/* Mode Usage */}
      <section className="px-3 py-3 border-b border-zinc-800/30">
        <SectionLabel>Mode Usage · Last 7 Days</SectionLabel>
        <div className="rounded bg-zinc-900 px-2.5 py-2 space-y-2">
          {MODES.map((mode, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 w-14 shrink-0">{mode.label}</span>
              <div className="flex-1 h-[3px] rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full ${mode.color} transition-all`}
                  style={{ width: `${mode.value}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-600 tabular-nums w-6 text-right">{mode.value}%</span>
            </div>
          ))}
          <p className="text-[9px] text-zinc-700 pt-1">Wire your observability backend to populate these.</p>
        </div>
      </section>

      {/* Getting Started */}
      <section className="px-3 py-3 space-y-2">
        <SectionLabel>Getting Started</SectionLabel>
        <div className="rounded bg-zinc-900 px-2.5 py-2.5 space-y-2">
          {[
            { step: '1', text: 'Edit project.config.ts with your project name' },
            { step: '2', text: 'Run /sprint init in Claude Code — foundation gate + scaffold' },
            { step: '3', text: 'Run /prd v1 to plan your first sprint' },
            { step: '4', text: 'Run /dev v1 to build with TDD' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-2">
              <span className="text-[9px] font-bold text-emerald-700 mt-0.5 shrink-0">{step}.</span>
              <p className="text-[10px] text-zinc-500 leading-relaxed">{text}</p>
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

    </div>
  )
}

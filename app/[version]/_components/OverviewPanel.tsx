'use client'

import type { ParsedBlock, LayerScore, BlackboardData, StreamEntry } from '../page'

export interface FoundationDoc {
  label: string
  path: string
  status: 'ok' | 'thin' | 'missing'
}

export interface SpecStatus {
  docs: FoundationDoc[]
}

// ─── SVG ring ─────────────────────────────────────────────────────────────────

function Ring({
  pct, size = 56, stroke = 5, color, trackColor = '#27272a', children,
}: {
  pct: number; size?: number; stroke?: number; color: string; trackColor?: string
  children?: React.ReactNode
}) {
  const r  = (size - stroke) / 2
  const cx = size / 2
  const c  = 2 * Math.PI * r
  const capped = Math.min(Math.max(pct, 0), 1)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${capped * c} ${c}`} strokeLinecap="round" />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
      )}
    </div>
  )
}

// ─── Compact metric card ──────────────────────────────────────────────────────

function MetricCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 flex flex-col gap-3 min-w-0">
      <p className="text-[9px] uppercase tracking-[0.14em] text-zinc-600 font-mono">{title}</p>
      {children}
    </div>
  )
}

// ─── 1. Spec Status ───────────────────────────────────────────────────────────

function SpecCard({ specStatus }: { specStatus: SpecStatus }) {
  const total = specStatus.docs.length
  const done  = specStatus.docs.filter(d => d.status === 'ok').length
  const pct   = total > 0 ? done / total : 0
  const color = pct === 1 ? '#10b981' : pct >= 0.5 ? '#f59e0b' : '#ef4444'

  const dotCls: Record<string, string> = {
    ok: 'bg-emerald-400', thin: 'bg-amber-400', missing: 'bg-zinc-700',
  }
  const txtCls: Record<string, string> = {
    ok: 'text-emerald-400', thin: 'text-amber-400', missing: 'text-zinc-600',
  }

  return (
    <MetricCard title="Spec Status">
      <div className="flex items-center gap-3">
        <Ring pct={pct} size={52} stroke={5} color={color}>
          <span className="text-sm font-bold text-zinc-100 leading-none">{done}/{total}</span>
        </Ring>
        <div className="flex-1 space-y-1.5 min-w-0">
          {specStatus.docs.map(doc => (
            <div key={doc.path} className="flex items-center gap-1.5 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls[doc.status]}`} />
              <span className="text-[10px] text-zinc-400 flex-1 truncate">{doc.label}</span>
              <span className={`text-[9px] font-mono shrink-0 ${txtCls[doc.status]}`}>
                {doc.status === 'ok' ? 'Ready' : doc.status === 'thin' ? 'Thin' : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MetricCard>
  )
}

// ─── 2. Sprint Velocity ───────────────────────────────────────────────────────

function VelocityCard({ blocks }: { blocks: ParsedBlock[] }) {
  const allTasks = blocks.flatMap(b => b.tasks)
  const total    = allTasks.length
  const done     = allTasks.filter(t => t.checked).length
  const pct      = total > 0 ? done / total : 0
  const pctInt   = Math.round(pct * 100)
  const color    = pct === 1 ? '#10b981' : '#6366f1'

  return (
    <MetricCard title="Sprint Velocity">
      <div className="flex items-center gap-3">
        <Ring pct={pct} size={52} stroke={5} color={color} trackColor="#1e1e2a">
          <span className="text-sm font-bold text-zinc-100 leading-none">{pctInt}%</span>
        </Ring>
        <div className="flex-1 space-y-1.5 min-w-0">
          {total === 0 ? (
            <p className="text-[10px] text-zinc-600">Run /prd v1</p>
          ) : (
            <>
              {[['Done', done], ['Left', total - done], ['Total', total]].map(([l, v]) => (
                <div key={String(l)} className="flex justify-between">
                  <span className="text-[10px] text-zinc-500">{l}</span>
                  <span className="text-[10px] font-mono tabular-nums text-zinc-200">{v}</span>
                </div>
              ))}
              <div className="w-full h-[2px] rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pctInt}%`, background: color }} />
              </div>
            </>
          )}
        </div>
      </div>
    </MetricCard>
  )
}

// ─── 3. QA Quality ────────────────────────────────────────────────────────────

function QACard({ layerScores }: { layerScores: LayerScore[] }) {
  const avg      = layerScores.length > 0
    ? Math.round(layerScores.reduce((s, l) => s + l.baseline, 0) / layerScores.length) : 0
  const barColor = (n: number) => n >= 80 ? '#10b981' : n >= 60 ? '#f59e0b' : '#ef4444'
  const top4     = [...layerScores].sort((a, b) => a.baseline - b.baseline).slice(0, 4)

  return (
    <MetricCard title="QA Quality">
      {layerScores.length === 0 ? (
        <div className="flex items-center gap-3">
          <Ring pct={0} size={52} stroke={5} color="#3f3f46">
            <span className="text-sm font-bold text-zinc-600">—</span>
          </Ring>
          <p className="text-[10px] text-zinc-600">Run /scorecard v1</p>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Ring pct={avg / 100} size={52} stroke={5} color={barColor(avg)}>
            <span className="text-sm font-bold text-zinc-100 leading-none">{avg}</span>
          </Ring>
          <div className="flex-1 space-y-1.5 min-w-0">
            {top4.map(layer => (
              <div key={layer.name} className="space-y-[2px]">
                <div className="flex justify-between">
                  <span className="text-[10px] text-zinc-500 truncate">{layer.name}</span>
                  <span className="text-[9px] font-mono tabular-nums ml-1 shrink-0"
                    style={{ color: barColor(layer.baseline) }}>{layer.baseline}%</span>
                </div>
                <div className="h-[2px] rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{ width: `${layer.baseline}%`, background: barColor(layer.baseline) }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </MetricCard>
  )
}

// ─── 4. Blockers ─────────────────────────────────────────────────────────────

function BlockersCard({ blackboard }: { blackboard: BlackboardData }) {
  const count = blackboard.blockers.length
  const clear = count === 0
  const fg    = clear ? '#10b981' : '#ef4444'

  return (
    <MetricCard title="Blockers">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0" style={{ width: 52, height: 52 }}>
          <svg width={52} height={52}>
            <circle cx={26} cy={26} r={24} fill="none" stroke={clear ? '#10b98118' : '#ef444418'} strokeWidth={1} />
            <circle cx={26} cy={26} r={18} fill={clear ? '#10b9810a' : '#ef44440a'}
              stroke={clear ? '#10b98128' : '#ef444428'} strokeWidth={1} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold leading-none tabular-nums" style={{ color: fg }}>{count}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {clear ? (
            <div>
              <p className="text-[10px] text-emerald-400">All clear</p>
              <p className="text-[9px] text-zinc-600 mt-0.5">No active blockers</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {blackboard.blockers.slice(0, 3).map((b, i) => (
                <li key={i} className="flex gap-1 items-start">
                  <span className="text-red-500 text-[8px] mt-px shrink-0">▲</span>
                  <span className="text-[10px] text-zinc-400 leading-snug line-clamp-1">
                    {b.replace(/^\*\*[^*]+\*\*\s*—\s*/, '')}
                  </span>
                </li>
              ))}
              {blackboard.blockers.length > 3 && (
                <li className="text-[9px] text-zinc-600 font-mono">+{blackboard.blockers.length - 3} more</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </MetricCard>
  )
}

// ─── Blackboard section panel ─────────────────────────────────────────────────

interface SectionConfig {
  title: string
  dot: string
  emptyText: string
}

const SECTION_CFG: Record<string, SectionConfig> = {
  decisions: { title: 'Open Decisions', dot: 'bg-amber-400',  emptyText: 'No open decisions' },
  queue:     { title: 'Queue',          dot: 'bg-violet-400', emptyText: 'Queue is empty'    },
  findings:  { title: 'Findings',       dot: 'bg-sky-400',    emptyText: 'No findings yet'   },
  directives:{ title: 'Directives',     dot: 'bg-violet-400', emptyText: 'No directives'     },
}

const BADGE_CFG: Record<string, string> = {
  decisions:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  queue:      'bg-violet-500/10 text-violet-400 border-violet-500/20',
  findings:   'bg-sky-500/10 text-sky-400 border-sky-500/20',
  directives: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

function BlackboardSection({ type, items }: { type: string; items: string[] }) {
  const cfg = SECTION_CFG[type]
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/50 shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-mono flex-1">{cfg.title}</span>
        {items.length > 0 && (
          <span className={`text-[9px] font-mono px-1.5 py-px rounded border ${BADGE_CFG[type]}`}>
            {items.length}
          </span>
        )}
      </div>
      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {items.length === 0 ? (
          <p className="text-[11px] text-zinc-700 py-2">{cfg.emptyText}</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 py-1 border-b border-zinc-800/30 last:border-0">
              <span className={`w-1 h-1 rounded-full shrink-0 mt-1.5 ${cfg.dot} opacity-60`} />
              <p className="text-[11px] text-zinc-400 leading-relaxed">{item.replace(/^\*\*[^*]+\*\*\s*—?\s*/, '')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── OverviewPanel ────────────────────────────────────────────────────────────

interface Props {
  specStatus: SpecStatus
  blocks: ParsedBlock[]
  layerScores: LayerScore[]
  blackboard: BlackboardData
  streamEntries: StreamEntry[]
}

export function OverviewPanel({ specStatus, blocks, layerScores, blackboard, streamEntries }: Props) {
  const queueItems = streamEntries.filter(e => e.type === 'queued').map(e => e.title ?? e.raw ?? '')

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-hidden">

      {/* Row 1 — compact metric cards */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <SpecCard     specStatus={specStatus} />
        <VelocityCard blocks={blocks} />
        <QACard       layerScores={layerScores} />
        <BlockersCard blackboard={blackboard} />
      </div>

      {/* Row 2 — blackboard intel 2×2 */}
      <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1 min-h-0">
        <BlackboardSection type="decisions"  items={blackboard.decisions} />
        <BlackboardSection type="queue"      items={queueItems} />
        <BlackboardSection type="findings"   items={blackboard.findings} />
        <BlackboardSection type="directives" items={blackboard.directives} />
      </div>

    </div>
  )
}

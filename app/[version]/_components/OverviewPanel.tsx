'use client'

import type { ParsedBlock, LayerScore, BlackboardData } from '../page'

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
  pct, size = 72, stroke = 6, color, trackColor = '#27272a', children,
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
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${capped * c} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 px-5 pt-4 pb-5 flex flex-col gap-4 min-w-0">
      <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 font-mono">{title}</p>
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

  const dotColor: Record<string, string> = {
    ok:      'bg-emerald-400',
    thin:    'bg-amber-400',
    missing: 'bg-zinc-700',
  }
  const labelColor: Record<string, string> = {
    ok:      'text-emerald-400',
    thin:    'text-amber-400',
    missing: 'text-zinc-600',
  }

  return (
    <Card title="Spec Status">
      {/* Ring centered */}
      <div className="flex justify-center">
        <Ring pct={pct} size={76} stroke={7} color={color}>
          <span className="text-lg font-bold text-zinc-100 leading-none">{done}/{total}</span>
          <span className="text-[9px] text-zinc-500 mt-0.5">docs</span>
        </Ring>
      </div>
      {/* Doc list */}
      <div className="space-y-2">
        {specStatus.docs.map(doc => (
          <div key={doc.path} className="flex items-center gap-2 min-w-0">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor[doc.status]}`} />
            <span className="text-[11px] text-zinc-400 flex-1 truncate">{doc.label}</span>
            <span className={`text-[10px] font-mono shrink-0 ${labelColor[doc.status]}`}>
              {doc.status === 'ok' ? 'Ready' : doc.status === 'thin' ? 'Thin' : 'Missing'}
            </span>
          </div>
        ))}
      </div>
    </Card>
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
    <Card title="Sprint Velocity">
      {/* Ring centered */}
      <div className="flex justify-center">
        <Ring pct={pct} size={76} stroke={8} color={color} trackColor="#1e1e2a">
          <span className="text-lg font-bold text-zinc-100 leading-none">{pctInt}%</span>
          <span className="text-[9px] text-zinc-500 mt-0.5">done</span>
        </Ring>
      </div>
      {/* Stats */}
      {total === 0 ? (
        <p className="text-[11px] text-zinc-600 text-center">Run /prd v1 to add tasks</p>
      ) : (
        <div className="space-y-2">
          {[
            { label: 'Completed', value: done },
            { label: 'Remaining', value: total - done },
            { label: 'Total',     value: total },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-[11px] text-zinc-500">{label}</span>
              <span className="text-[11px] font-mono tabular-nums text-zinc-200">{value}</span>
            </div>
          ))}
          <div className="w-full h-[3px] rounded-full bg-zinc-800 overflow-hidden mt-1">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pctInt}%`, background: color }}
            />
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── 3. QA Quality ────────────────────────────────────────────────────────────

function QACard({ layerScores }: { layerScores: LayerScore[] }) {
  const avg = layerScores.length > 0
    ? Math.round(layerScores.reduce((s, l) => s + l.baseline, 0) / layerScores.length)
    : 0
  const barColor = (n: number) => n >= 80 ? '#10b981' : n >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <Card title="QA Quality">
      {layerScores.length === 0 ? (
        <>
          <div className="flex justify-center">
            <Ring pct={0} size={76} stroke={7} color="#3f3f46">
              <span className="text-lg font-bold text-zinc-600 leading-none">—</span>
            </Ring>
          </div>
          <p className="text-[11px] text-zinc-600 text-center">Run /scorecard v1</p>
        </>
      ) : (
        <>
          {/* Ring centered */}
          <div className="flex justify-center">
            <Ring pct={avg / 100} size={76} stroke={7} color={barColor(avg)}>
              <span className="text-lg font-bold text-zinc-100 leading-none">{avg}</span>
              <span className="text-[9px] text-zinc-500 mt-0.5">avg%</span>
            </Ring>
          </div>
          {/* Layer bars */}
          <div className="space-y-1.5">
            {layerScores.map(layer => (
              <div key={layer.name} className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-[10px] text-zinc-500 truncate">{layer.name}</span>
                  <span className="text-[10px] font-mono tabular-nums shrink-0 ml-1" style={{ color: barColor(layer.baseline) }}>
                    {layer.baseline}%
                  </span>
                </div>
                <div className="h-[3px] rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${layer.baseline}%`, background: barColor(layer.baseline) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}

// ─── 4. Blockers ─────────────────────────────────────────────────────────────

function BlockersCard({ blackboard }: { blackboard: BlackboardData }) {
  const count = blackboard.blockers.length
  const clear = count === 0
  const fg    = clear ? '#10b981' : '#ef4444'

  return (
    <Card title="Blockers">
      {/* Number centered in rings */}
      <div className="flex justify-center">
        <div className="relative" style={{ width: 76, height: 76 }}>
          <svg width={76} height={76}>
            <circle cx={38} cy={38} r={35} fill="none" stroke={clear ? '#10b98118' : '#ef444418'} strokeWidth={1} />
            <circle cx={38} cy={38} r={27} fill={clear ? '#10b9810a' : '#ef44440a'} stroke={clear ? '#10b98128' : '#ef444428'} strokeWidth={1} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold leading-none tabular-nums" style={{ color: fg }}>{count}</span>
            <span className="text-[9px] text-zinc-500 mt-0.5">
              {clear ? 'clear' : count === 1 ? 'blocker' : 'blockers'}
            </span>
          </div>
        </div>
      </div>
      {/* List */}
      {clear ? (
        <div className="text-center space-y-0.5">
          <p className="text-xs text-emerald-400">All clear</p>
          <p className="text-[11px] text-zinc-600">No active blockers</p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {blackboard.blockers.slice(0, 3).map((b, i) => (
            <li key={i} className="flex gap-1.5 items-start">
              <span className="text-red-500 text-[9px] mt-[3px] shrink-0">▲</span>
              <span className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                {b.replace(/^\*\*[^*]+\*\*\s*—\s*/, '')}
              </span>
            </li>
          ))}
          {blackboard.blockers.length > 3 && (
            <li className="text-[10px] text-zinc-600 font-mono">+{blackboard.blockers.length - 3} more</li>
          )}
        </ul>
      )}
    </Card>
  )
}

// ─── OverviewPanel ────────────────────────────────────────────────────────────

interface Props {
  specStatus: SpecStatus
  blocks: ParsedBlock[]
  layerScores: LayerScore[]
  blackboard: BlackboardData
}

export function OverviewPanel({ specStatus, blocks, layerScores, blackboard }: Props) {
  return (
    <div className="p-5 overflow-y-auto h-full">
      <div className="grid grid-cols-4 gap-4 h-full">
        <SpecCard     specStatus={specStatus} />
        <VelocityCard blocks={blocks} />
        <QACard       layerScores={layerScores} />
        <BlockersCard blackboard={blackboard} />
      </div>
    </div>
  )
}

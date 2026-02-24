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

// ─── SVG helpers ──────────────────────────────────────────────────────────────

function RadialRing({
  pct, size = 96, stroke = 7, color, trackColor = '#27272a',
}: {
  pct: number; size?: number; stroke?: number; color: string; trackColor?: string
}) {
  const r  = (size - stroke) / 2
  const cx = size / 2
  const c  = 2 * Math.PI * r
  const capped = Math.min(Math.max(pct, 0), 1)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${capped * c} ${c}`}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 flex flex-col gap-4">
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

  const statusDot: Record<string, string> = {
    ok:      'bg-emerald-400',
    thin:    'bg-amber-400',
    missing: 'bg-zinc-700',
  }
  const statusLabel: Record<string, string> = {
    ok:      'Ready',
    thin:    'Thin',
    missing: 'Missing',
  }
  const statusText: Record<string, string> = {
    ok:      'text-emerald-400',
    thin:    'text-amber-400',
    missing: 'text-zinc-600',
  }

  return (
    <Card title="Spec Status">
      <div className="flex items-center gap-5">
        {/* Ring */}
        <div className="relative shrink-0">
          <RadialRing pct={pct} size={88} stroke={8} color={color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-zinc-100 leading-none">{done}/{total}</span>
            <span className="text-[9px] text-zinc-500 mt-0.5">docs</span>
          </div>
        </div>
        {/* Doc list */}
        <div className="flex-1 space-y-2.5">
          {specStatus.docs.map(doc => (
            <div key={doc.path} className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[doc.status]}`} />
              <span className="text-xs text-zinc-400 flex-1 truncate">{doc.label}</span>
              <span className={`text-[10px] font-mono ${statusText[doc.status]}`}>
                {statusLabel[doc.status]}
              </span>
            </div>
          ))}
        </div>
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
  const pctLabel = Math.round(pct * 100)

  const color = pct === 1 ? '#10b981' : pct >= 0.5 ? '#10b981' : '#6366f1'

  return (
    <Card title="Sprint Velocity">
      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="relative shrink-0">
          <RadialRing pct={pct} size={88} stroke={10} color={color} trackColor="#1c1c22" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-zinc-100 leading-none">{pctLabel}%</span>
            <span className="text-[9px] text-zinc-500 mt-0.5">done</span>
          </div>
        </div>
        {/* Block breakdown */}
        <div className="flex-1 space-y-2.5">
          {total === 0 ? (
            <p className="text-xs text-zinc-600">No tasks yet — run /prd v1</p>
          ) : (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Completed</span>
                <span className="text-zinc-200 font-mono tabular-nums">{done}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Remaining</span>
                <span className="text-zinc-200 font-mono tabular-nums">{total - done}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Total</span>
                <span className="text-zinc-200 font-mono tabular-nums">{total}</span>
              </div>
              {/* Mini progress bar */}
              <div className="w-full h-1 rounded-full bg-zinc-800 mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pctLabel}%`, background: color }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── 3. QA Quality ────────────────────────────────────────────────────────────

function QACard({ layerScores }: { layerScores: LayerScore[] }) {
  const avg = layerScores.length > 0
    ? Math.round(layerScores.reduce((s, l) => s + l.baseline, 0) / layerScores.length)
    : 0

  const barColor = (score: number) =>
    score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <Card title="QA Quality">
      {layerScores.length === 0 ? (
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <RadialRing pct={0} size={88} stroke={8} color="#3f3f46" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-zinc-600 leading-none">—</span>
            </div>
          </div>
          <p className="text-xs text-zinc-600 flex-1">Run /scorecard v1 to assess quality layers</p>
        </div>
      ) : (
        <div className="flex items-center gap-5">
          {/* Avg ring */}
          <div className="relative shrink-0">
            <RadialRing pct={avg / 100} size={88} stroke={8} color={barColor(avg)} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-zinc-100 leading-none">{avg}</span>
              <span className="text-[9px] text-zinc-500 mt-0.5">avg%</span>
            </div>
          </div>
          {/* Per-layer bars */}
          <div className="flex-1 space-y-2">
            {layerScores.map(layer => (
              <div key={layer.name} className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-[10px] text-zinc-500 truncate">{layer.name}</span>
                  <span className="text-[10px] font-mono tabular-nums" style={{ color: barColor(layer.baseline) }}>
                    {layer.baseline}%
                  </span>
                </div>
                <div className="h-[3px] rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${layer.baseline}%`, background: barColor(layer.baseline) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── 4. Blockers ─────────────────────────────────────────────────────────────

function BlockersCard({ blackboard }: { blackboard: BlackboardData }) {
  const count = blackboard.blockers.length
  const clear = count === 0

  return (
    <Card title="Blockers">
      <div className="flex items-start gap-5">
        {/* Big number with ring */}
        <div className="relative shrink-0">
          <svg width={88} height={88}>
            {/* Outer ring — pulses if blockers exist */}
            <circle
              cx={44} cy={44} r={38}
              fill="none"
              stroke={clear ? '#10b98122' : '#ef444420'}
              strokeWidth={1}
            />
            <circle
              cx={44} cy={44} r={30}
              fill={clear ? '#10b9810a' : '#ef44440a'}
              stroke={clear ? '#10b98130' : '#ef444430'}
              strokeWidth={1}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-3xl font-bold leading-none tabular-nums"
              style={{ color: clear ? '#10b981' : '#ef4444' }}
            >
              {count}
            </span>
            <span className="text-[9px] text-zinc-500 mt-0.5">
              {clear ? 'clear' : count === 1 ? 'blocker' : 'blockers'}
            </span>
          </div>
        </div>

        {/* Blocker list */}
        <div className="flex-1 min-w-0">
          {clear ? (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs text-emerald-400">All clear</p>
              <p className="text-[11px] text-zinc-600">No active blockers on the board.</p>
            </div>
          ) : (
            <ul className="space-y-2 pt-1">
              {blackboard.blockers.slice(0, 4).map((b, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="text-red-500 text-[10px] mt-0.5 shrink-0">▲</span>
                  <span className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                    {b.replace(/^\*\*[^*]+\*\*\s*—\s*/, '')}
                  </span>
                </li>
              ))}
              {blackboard.blockers.length > 4 && (
                <li className="text-[10px] text-zinc-600 font-mono">
                  +{blackboard.blockers.length - 4} more on the blackboard
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
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
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <SpecCard     specStatus={specStatus} />
        <VelocityCard blocks={blocks} />
        <QACard       layerScores={layerScores} />
        <BlockersCard blackboard={blackboard} />
      </div>
    </div>
  )
}

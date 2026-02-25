'use client'

import Link from 'next/link'
import type { ParsedBlock, LayerScore, BlackboardData, StreamEntry } from '../page'

export interface FoundationDoc {
  label: string
  path: string   // e.g. "docs/foundation/vision.md" — becomes "/{path}" for doc viewer
  status: 'ok' | 'thin' | 'missing'
}

export interface SpecStatus {
  docs: FoundationDoc[]
}

const BOARD_URL = '/docs/operations/blackboard/board.md'

// ─── SVG ring ─────────────────────────────────────────────────────────────────

function Ring({
  pct, size = 64, stroke = 6, color, trackColor = '#27272a', children,
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

// ─── Metric card shell ────────────────────────────────────────────────────────

function MetricCard({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-4 flex flex-col gap-3 min-w-0">
      <Link
        href={href}
        className="flex items-center gap-1.5 group/title"
      >
        <p className="text-[11px] uppercase tracking-[0.13em] text-zinc-500 font-semibold flex-1 group-hover/title:text-zinc-300 transition-colors">{title}</p>
        <span className="text-[10px] font-mono text-zinc-700 group-hover/title:text-zinc-400 transition-colors">→</span>
      </Link>
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
    ok: 'bg-emerald-400', thin: 'bg-amber-400', missing: 'bg-zinc-600',
  }
  const txtCls: Record<string, string> = {
    ok: 'text-emerald-400', thin: 'text-amber-400', missing: 'text-zinc-600',
  }

  return (
    <MetricCard title="Spec Status" href="/docs/foundation">
      <div className="flex items-center gap-4">
        <Ring pct={pct} size={64} stroke={6} color={color}>
          <span className="text-base font-bold text-zinc-100 leading-none">{done}/{total}</span>
        </Ring>
        <div className="flex-1 space-y-2 min-w-0">
          {specStatus.docs.map(doc => (
            <Link
              key={doc.path}
              href={`/${doc.path}`}
              className="flex items-center gap-2 min-w-0 hover:bg-zinc-800/40 rounded px-1 -mx-1 transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls[doc.status]}`} />
              <span className="text-xs text-zinc-300 flex-1 truncate">{doc.label}</span>
              <span className={`text-[11px] font-mono shrink-0 ${txtCls[doc.status]}`}>
                {doc.status === 'ok' ? 'Ready' : doc.status === 'thin' ? 'Thin' : '—'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </MetricCard>
  )
}

// ─── 2. Sprint Velocity ───────────────────────────────────────────────────────

function VelocityCard({ blocks, version }: { blocks: ParsedBlock[]; version: string }) {
  const allTasks = blocks.flatMap(b => b.tasks)
  const total    = allTasks.length
  const done     = allTasks.filter(t => t.checked).length
  const pct      = total > 0 ? done / total : 0
  const pctInt   = Math.round(pct * 100)
  const color    = pct === 1 ? '#10b981' : '#6366f1'

  return (
    <MetricCard title="Sprint Velocity" href={`/docs/operations/sprints/${version}/tasks.md`}>
      <div className="flex items-center gap-4">
        <Ring pct={pct} size={64} stroke={6} color={color} trackColor="#1e1e2a">
          <span className="text-base font-bold text-zinc-100 leading-none">{pctInt}%</span>
        </Ring>
        <div className="flex-1 space-y-2 min-w-0">
          {total === 0 ? (
            <p className="text-xs text-zinc-500">Run /prd {version}</p>
          ) : (
            <>
              {[['Done', done], ['Left', total - done], ['Total', total]].map(([l, v]) => (
                <div key={String(l)} className="flex justify-between">
                  <span className="text-xs text-zinc-500">{l}</span>
                  <span className="text-xs font-mono tabular-nums text-zinc-200 font-semibold">{v}</span>
                </div>
              ))}
              <div className="w-full h-[3px] rounded-full bg-zinc-800 overflow-hidden">
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
    <MetricCard title="QA Quality" href="/docs/operations/scorecard.md">
      {layerScores.length === 0 ? (
        <div className="flex items-center gap-4">
          <Ring pct={0} size={64} stroke={6} color="#3f3f46">
            <span className="text-base font-bold text-zinc-600">—</span>
          </Ring>
          <p className="text-xs text-zinc-500">Run /scorecard</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Ring pct={avg / 100} size={64} stroke={6} color={barColor(avg)}>
            <span className="text-base font-bold text-zinc-100 leading-none">{avg}</span>
          </Ring>
          <div className="flex-1 space-y-2 min-w-0">
            {top4.map(layer => (
              <div key={layer.name} className="space-y-[3px]">
                <div className="flex justify-between">
                  <span className="text-xs text-zinc-400 truncate">{layer.name}</span>
                  <span className="text-[11px] font-mono tabular-nums ml-1 shrink-0 font-semibold"
                    style={{ color: barColor(layer.baseline) }}>{layer.baseline}%</span>
                </div>
                <div className="h-[3px] rounded-full bg-zinc-800 overflow-hidden">
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
    <MetricCard title="Blockers" href={BOARD_URL}>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
          <svg width={64} height={64}>
            <circle cx={32} cy={32} r={30} fill="none" stroke={clear ? '#10b98118' : '#ef444418'} strokeWidth={1.5} />
            <circle cx={32} cy={32} r={22} fill={clear ? '#10b9810a' : '#ef44440a'}
              stroke={clear ? '#10b98130' : '#ef444430'} strokeWidth={1.5} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold leading-none tabular-nums" style={{ color: fg }}>{count}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {clear ? (
            <div>
              <p className="text-sm font-semibold text-emerald-400">All clear</p>
              <p className="text-xs text-zinc-500 mt-0.5">No active blockers</p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {blackboard.blockers.slice(0, 3).map((b, i) => (
                <li key={i} className="flex gap-1.5 items-start">
                  <span className="text-red-400 text-[10px] mt-0.5 shrink-0">▲</span>
                  <span className="text-xs text-zinc-300 leading-snug line-clamp-1">
                    {b.replace(/^\*\*[^*]+\*\*\s*—\s*/, '')}
                  </span>
                </li>
              ))}
              {blackboard.blockers.length > 3 && (
                <li className="text-xs text-zinc-500 font-mono">+{blackboard.blockers.length - 3} more</li>
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
  badge: string
  href: string
  emptyText: string
  hint: string
}

const SECTION_CFG: Record<string, SectionConfig> = {
  decisions:  {
    title: 'Open Decisions', dot: 'bg-amber-400',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    href: BOARD_URL, emptyText: 'No open decisions',
    hint: '- **Label** — question  in ## Open Decisions',
  },
  queue:      {
    title: 'Queue', dot: 'bg-violet-400',
    badge: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
    href: '/docs/operations/blackboard/entries',
    emptyText: 'Queue is empty',
    hint: 'entries/YYYY-MM-DD-HHMM-role-queued.md',
  },
  findings:   {
    title: 'Findings', dot: 'bg-sky-400',
    badge: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
    href: BOARD_URL, emptyText: 'No findings yet',
    hint: '- **Label** — text  in ## Findings',
  },
  directives: {
    title: 'Directives', dot: 'bg-violet-400',
    badge: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
    href: BOARD_URL, emptyText: 'No directives',
    hint: '- **Label** — instruction  in ## Directives',
  },
}

function BlackboardSection({ type, items }: { type: string; items: string[] }) {
  const cfg = SECTION_CFG[type]
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <Link
        href={cfg.href}
        className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-800/60 shrink-0 hover:bg-zinc-800/30 transition-colors group/hdr"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
        <span className="text-sm font-semibold text-zinc-200 flex-1 group-hover/hdr:text-zinc-100">{cfg.title}</span>
        {items.length > 0 && (
          <span className={`text-xs font-mono px-2 py-0.5 rounded-md border font-semibold ${cfg.badge}`}>
            {items.length}
          </span>
        )}
        <span className="text-[10px] font-mono text-zinc-700 group-hover/hdr:text-zinc-400 transition-colors ml-1">→</span>
      </Link>
      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-600 py-1">{cfg.emptyText}</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 pb-2.5 border-b border-zinc-800/40 last:border-0 last:pb-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${cfg.dot} opacity-70`} />
              <p className="text-sm text-zinc-300 leading-relaxed">{item.replace(/^\*\*[^*]+\*\*\s*—?\s*/, '')}</p>
            </div>
          ))
        )}
      </div>
      {/* Write hint */}
      <div className="shrink-0 px-4 py-2 border-t border-zinc-800/40">
        <p className="text-[10px] font-mono text-zinc-700 truncate">{cfg.hint}</p>
      </div>
    </div>
  )
}

// ─── OverviewPanel ────────────────────────────────────────────────────────────

interface Props {
  version: string
  specStatus: SpecStatus
  blocks: ParsedBlock[]
  layerScores: LayerScore[]
  blackboard: BlackboardData
  streamEntries: StreamEntry[]
}

export function OverviewPanel({ version, specStatus, blocks, layerScores, blackboard, streamEntries }: Props) {
  const queueItems = streamEntries.filter(e => e.type === 'queued').map(e => e.title ?? '')

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-hidden">

      {/* Row 1 — metric cards */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <SpecCard     specStatus={specStatus} />
        <VelocityCard blocks={blocks} version={version} />
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

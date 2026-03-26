'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBlackboard, type BlackboardAgent } from '@/app/hooks/use-blackboard'
import { Sidebar, isStale } from '@/app/_components/sidebar'

const SERVER_URL = 'http://127.0.0.1:8790'

interface BacklogItem {
  id: string
  text: string
  priority?: 'P0' | 'P1' | 'P2'
  tags: string[]
  done: boolean
}

function parseItemText(raw: string): { text: string; priority?: 'P0' | 'P1' | 'P2'; tags: string[] } {
  let text = raw
  let priority: 'P0' | 'P1' | 'P2' | undefined
  const tags: string[] = []

  // Extract priority
  const pMatch = text.match(/\[(P[012])\]/)
  if (pMatch) {
    priority = pMatch[1] as 'P0' | 'P1' | 'P2'
    text = text.replace(pMatch[0], '').trim()
  }

  // Extract tags
  const tagPattern = /#(\w+)/g
  let tMatch
  while ((tMatch = tagPattern.exec(text)) !== null) {
    tags.push(tMatch[1])
  }
  text = text.replace(/#\w+/g, '').trim()

  return { text, priority, tags }
}

function priorityColor(p?: string): string {
  if (p === 'P0') return 'bg-red-500/20 text-red-400 border-red-500/30'
  if (p === 'P1') return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  if (p === 'P2') return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  return 'bg-zinc-800 text-zinc-500 border-zinc-700'
}

// ─── Add Item Input ──────────────────────────────────────────────────────────

function AddItemInput({ onAdd }: { onAdd: () => void }) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  async function submit() {
    const text = input.trim()
    if (!text) return
    setSending(true)
    try {
      const res = await fetch('/api/backlog', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ item: text }),
      })
      if (res.ok) {
        setInput('')
        onAdd()
      }
    } catch (err) {
      console.error('Failed to add:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
          placeholder="Add to backlog... (use [P0] [P1] [P2] for priority, #tag for tags)"
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
          disabled={sending}
        />
        <button
          onClick={submit}
          disabled={sending || !input.trim()}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
        >
          {sending ? '...' : 'Add'}
        </button>
      </div>
      <p className="text-[10px] text-zinc-600">
        Tip: <code className="text-zinc-500">[P0]</code> critical, <code className="text-zinc-500">[P1]</code> important, <code className="text-zinc-500">[P2]</code> nice-to-have, <code className="text-zinc-500">#ui #api</code> for tags
      </p>
    </div>
  )
}

// ─── Backlog Item Card ───────────────────────────────────────────────────────

function BacklogItemCard({ item, rawText, index, onComplete, onRemove, onEdit }: {
  item: BacklogItem
  rawText: string
  index: number
  onComplete: () => void
  onRemove: () => void
  onEdit: (index: number, newText: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(rawText)
  const [saving, setSaving] = useState(false)

  async function saveEdit() {
    if (!editValue.trim() || editValue.trim() === rawText) {
      setEditing(false)
      return
    }
    setSaving(true)
    onEdit(index, editValue.trim())
    setSaving(false)
    setEditing(false)
  }

  function startEditing(e: React.MouseEvent) {
    if (item.done) return
    e.stopPropagation()
    setEditValue(rawText)
    setEditing(true)
  }

  return (
    <div
      className={`border rounded-lg transition-all ${
        item.done
          ? 'bg-zinc-900/30 border-zinc-800/50 opacity-60'
          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div
        className="flex items-start gap-3 p-3 cursor-pointer"
        onClick={() => !editing && setExpanded(!expanded)}
      >
        {/* Checkbox */}
        <button
          onClick={e => { e.stopPropagation(); onComplete() }}
          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
            item.done
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'border-zinc-600 hover:border-emerald-500'
          }`}
        >
          {item.done && (
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveEdit()
                  if (e.key === 'Escape') { setEditing(false); setEditValue(rawText) }
                }}
                autoFocus
                className="w-full bg-zinc-950 border border-emerald-500/40 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/70"
                disabled={saving}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="text-[10px] px-2 py-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-950/60 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => { setEditing(false); setEditValue(rawText) }}
                  className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <span className="text-[9px] text-zinc-600">Enter to save, Esc to cancel</span>
              </div>
            </div>
          ) : (
            <>
              <p
                className={`text-sm leading-snug ${item.done ? 'text-zinc-500 line-through' : 'text-zinc-200 hover:text-emerald-300'}`}
                onDoubleClick={startEditing}
                title={item.done ? '' : 'Double-click to edit'}
              >
                {item.text}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {item.priority && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${priorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                )}
                {item.tags.map(tag => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Expand arrow */}
        {!editing && (
          <span className={`text-zinc-600 text-xs shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}>
            &#9656;
          </span>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && !editing && (
        <div className="border-t border-zinc-800/60 px-3 py-2.5 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            {!item.done && (
              <>
                <button
                  onClick={() => { setEditValue(rawText); setEditing(true); setExpanded(false) }}
                  className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={onComplete}
                  className="text-[10px] px-2 py-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-950/60 transition-colors"
                >
                  Mark Done
                </button>
              </>
            )}
            <button
              onClick={onRemove}
              className="text-[10px] px-2 py-1 rounded bg-red-950/30 text-red-400/80 border border-red-500/20 hover:bg-red-950/50 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BacklogPage() {
  const { state, connected } = useBlackboard()
  const [inbox, setInbox] = useState<string[]>([])
  const [done, setDone] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'P0' | 'P1' | 'P2'>('all')
  const [sweeping, setSweeping] = useState(false)

  const agents = state?.agents || {}
  const agentEntries = Object.entries(agents).filter(([id, a]) => a != null && !id.startsWith('shim-')) as [string, BlackboardAgent][]
  const staleCount = agentEntries.filter(([, a]) => isStale(a)).length

  const fetchBacklog = useCallback(async () => {
    try {
      const res = await fetch('/api/backlog')
      const data = await res.json() as { inbox: string[]; done: string[] }
      setInbox(data.inbox || [])
      setDone(data.done || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchBacklog() }, [fetchBacklog])

  async function completeItem(item: string) {
    await fetch('/api/backlog', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ item, action: 'done' }),
    })
    fetchBacklog()
  }

  async function removeItem(item: string, fromDone = false) {
    if (fromDone) return
    await fetch('/api/backlog', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ item, action: 'remove' }),
    })
    fetchBacklog()
  }

  async function editItem(index: number, newText: string) {
    await fetch('/api/backlog', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ index, newText }),
    })
    fetchBacklog()
  }

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

  // Parse all items
  const inboxItems: BacklogItem[] = inbox.map((raw, i) => {
    const parsed = parseItemText(raw)
    return { id: `inbox-${i}`, text: parsed.text, priority: parsed.priority, tags: parsed.tags, done: false }
  })

  const doneItems: BacklogItem[] = done.map((raw, i) => {
    const parsed = parseItemText(raw)
    return { id: `done-${i}`, text: parsed.text, priority: parsed.priority, tags: parsed.tags, done: true }
  })

  // Filter
  const filteredInbox = filter === 'all'
    ? inboxItems
    : inboxItems.filter(item => item.priority === filter)

  // Stats
  const p0Count = inboxItems.filter(i => i.priority === 'P0').length
  const p1Count = inboxItems.filter(i => i.priority === 'P1').length
  const p2Count = inboxItems.filter(i => i.priority === 'P2').length

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-zinc-100">Backlog</h1>
                <p className="text-[11px] text-zinc-500">
                  {inboxItems.length} item{inboxItems.length !== 1 ? 's' : ''} in inbox &middot; {doneItems.length} done
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {(['all', 'P0', 'P1', 'P2'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                      filter === f
                        ? f === 'P0' ? 'bg-red-950/40 text-red-400 border-red-500/20'
                        : f === 'P1' ? 'bg-amber-950/40 text-amber-400 border-amber-500/20'
                        : f === 'P2' ? 'bg-blue-950/40 text-blue-400 border-blue-500/20'
                        : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    {f === 'all' ? `All (${inboxItems.length})` : `${f} (${f === 'P0' ? p0Count : f === 'P1' ? p1Count : p2Count})`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">

          {/* Add item */}
          <section>
            <AddItemInput onAdd={fetchBacklog} />
          </section>

          {/* Inbox */}
          <section>
            <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">
              Inbox
              {filter !== 'all' && <span className="ml-2 text-zinc-600">filtered by {filter}</span>}
            </h2>
            {loading ? (
              <p className="text-[10px] text-zinc-600 py-8 text-center">Loading...</p>
            ) : filteredInbox.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-sm text-zinc-600">
                  {filter !== 'all' ? `No ${filter} items` : 'Backlog is empty'}
                </p>
                <p className="text-[11px] text-zinc-700 mt-1">Add items above or use <code className="text-zinc-500">/post queue [idea]</code> from the terminal</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredInbox.map((item) => {
                  const originalIndex = inboxItems.indexOf(item)
                  return (
                    <BacklogItemCard
                      key={item.id}
                      item={item}
                      rawText={inbox[originalIndex]}
                      index={originalIndex}
                      onComplete={() => completeItem(inbox[originalIndex])}
                      onRemove={() => removeItem(inbox[originalIndex])}
                      onEdit={editItem}
                    />
                  )
                })}
              </div>
            )}
          </section>

          {/* Done */}
          {doneItems.length > 0 && (
            <section>
              <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">
                Done <span className="text-zinc-600 font-normal">({doneItems.length})</span>
              </h2>
              <div className="space-y-1.5">
                {doneItems.map((item, i) => (
                  <BacklogItemCard
                    key={item.id}
                    item={item}
                    rawText={done[i]}
                    index={i}
                    onComplete={() => {}}
                    onRemove={() => {}}
                    onEdit={() => {}}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-800/60 py-3 shrink-0">
          <div className="px-6 flex items-center justify-between text-[10px] font-mono text-zinc-600">
            <span>source: kapi/backlog.md</span>
            <span>kapi-sprints &middot; backlog</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

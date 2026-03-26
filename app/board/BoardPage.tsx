'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBlackboard, type BlackboardAgent } from '@/app/hooks/use-blackboard'
import { Sidebar, isStale } from '@/app/_components/sidebar'

const SERVER_URL = 'http://127.0.0.1:8790'

interface BoardSection {
  title: string
  items: string[]
  color: { dot: string; badge: string; border: string; bg: string }
  emptyText: string
}

const SECTION_STYLES: Record<string, BoardSection['color']> = {
  blockers:  { dot: 'bg-red-400',    badge: 'text-red-400 bg-red-950/40',       border: 'border-red-500/20',    bg: 'bg-red-950/10' },
  decisions: { dot: 'bg-amber-400',  badge: 'text-amber-400 bg-amber-950/40',   border: 'border-amber-500/20',  bg: 'bg-amber-950/10' },
  findings:  { dot: 'bg-sky-400',    badge: 'text-sky-400 bg-sky-950/40',       border: 'border-sky-500/20',    bg: 'bg-sky-950/10' },
  status:    { dot: 'bg-emerald-400', badge: 'text-emerald-400 bg-emerald-950/40', border: 'border-emerald-500/20', bg: 'bg-emerald-950/10' },
}

function AddItemInput({ section, onAdd }: { section: string; onAdd: () => void }) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  async function submit() {
    const text = input.trim()
    if (!text) return
    setSending(true)
    try {
      const res = await fetch('/api/board', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ section, item: text }),
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
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
        placeholder={`Add ${section === 'blockers' ? 'a blocker' : section === 'decisions' ? 'a decision' : section === 'findings' ? 'a finding' : 'a status update'}...`}
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
  )
}

function BoardItem({ item, section, index, onRemove, onEdit }: {
  item: string
  section: string
  index: number
  onRemove: () => void
  onEdit: (newText: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(item)
  const color = SECTION_STYLES[section] || SECTION_STYLES.status

  return (
    <div className={`border ${color.border} rounded-lg transition-all hover:border-zinc-600`}>
      <div
        className="flex items-start gap-3 p-3 cursor-pointer"
        onClick={() => !editing && setExpanded(!expanded)}
      >
        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${color.dot}`} />
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { onEdit(editValue.trim()); setEditing(false) }
                  if (e.key === 'Escape') { setEditing(false); setEditValue(item) }
                }}
                autoFocus
                className="w-full bg-zinc-950 border border-emerald-500/40 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/70"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { onEdit(editValue.trim()); setEditing(false) }}
                  className="text-[10px] px-2 py-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                >
                  Save
                </button>
                <button
                  onClick={() => { setEditing(false); setEditValue(item) }}
                  className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              className="text-sm text-zinc-200 leading-snug hover:text-emerald-300"
              onDoubleClick={e => { e.stopPropagation(); setEditValue(item); setEditing(true) }}
              title="Double-click to edit"
            >
              {item}
            </p>
          )}
        </div>
        {!editing && (
          <span className={`text-zinc-600 text-xs shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}>
            &#9656;
          </span>
        )}
      </div>
      {expanded && !editing && (
        <div className="border-t border-zinc-800/60 px-3 py-2.5 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditValue(item); setEditing(true); setExpanded(false) }}
              className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors"
            >
              Edit
            </button>
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

export function BoardPageView({ section, title }: { section: string; title: string }) {
  const { state, connected } = useBlackboard()
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [sweeping, setSweeping] = useState(false)

  const agents = state?.agents || {}
  const agentEntries = Object.entries(agents).filter(([id, a]) => a != null && !id.startsWith('shim-')) as [string, BlackboardAgent][]
  const staleCount = agentEntries.filter(([, a]) => isStale(a)).length

  const color = SECTION_STYLES[section] || SECTION_STYLES.status

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/board?section=${section}`)
      const data = await res.json() as { items: string[] }
      setItems(data.items || [])
    } catch {}
    setLoading(false)
  }, [section])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function addItem() { fetchItems() }

  async function removeItem(index: number) {
    await fetch('/api/board', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ section, index }),
    })
    fetchItems()
  }

  async function editItem(index: number, newText: string) {
    await fetch('/api/board', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ section, index, newText }),
    })
    fetchItems()
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
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${color.dot}`} />
              <h1 className="text-lg font-bold text-zinc-100">{title}</h1>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${color.badge}`}>
                {items.length}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Source: kapi/board.md
            </p>
          </div>
        </header>

        <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto">
          <AddItemInput section={section} onAdd={addItem} />

          {loading ? (
            <p className="text-[10px] text-zinc-600 py-8 text-center">Loading...</p>
          ) : items.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
              <p className="text-sm text-zinc-600">No items</p>
              <p className="text-[11px] text-zinc-700 mt-1">Add one above or use <code className="text-zinc-500">/post</code> from the terminal</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {items.map((item, i) => (
                <BoardItem
                  key={`${section}-${i}`}
                  item={item}
                  section={section}
                  index={i}
                  onRemove={() => removeItem(i)}
                  onEdit={(newText) => editItem(i, newText)}
                />
              ))}
            </div>
          )}
        </div>

        <footer className="border-t border-zinc-800/60 py-3 shrink-0">
          <div className="px-6 text-[10px] font-mono text-zinc-600">
            kapi/board.md &middot; {section}
          </div>
        </footer>
      </div>
    </div>
  )
}

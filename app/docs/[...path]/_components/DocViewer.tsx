'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { TreeNode } from '../page'

// ─── File tree ────────────────────────────────────────────────────────────────

function FileIcon({ name }: { name: string }) {
  if (name.endsWith('.md')) return <span className="text-zinc-600">◻</span>
  return null
}

function FolderNode({
  node,
  activePath,
  depth = 0,
}: {
  node: TreeNode
  activePath: string
  depth?: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(() => activePath.startsWith(node.path))

  if (node.type === 'file') {
    const isActive = activePath === node.path
    const label = node.name.replace('.md', '')
    return (
      <button
        onClick={() => router.push(`/docs/${node.path}`)}
        className={`w-full text-left flex items-center gap-1.5 px-2 py-[3px] rounded text-[11px] font-mono transition-colors
          ${isActive
            ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
          }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        <FileIcon name={node.name} />
        <span className="truncate">{label}</span>
      </button>
    )
  }

  // Directory
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left flex items-center gap-1.5 px-2 py-[3px] text-[10px] font-mono uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors"
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        <span className="text-[8px]">{open ? '▼' : '▶'}</span>
        <span>{node.name}</span>
      </button>
      {open && node.children?.map(child => (
        <FolderNode key={child.path} node={child} activePath={activePath} depth={depth + 1} />
      ))}
    </div>
  )
}

// ─── Mermaid renderer ─────────────────────────────────────────────────────────

function useMermaid(contentRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const codeBlocks = el.querySelectorAll('code.language-mermaid')
    if (codeBlocks.length === 0) return

    import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          background: '#18181b',
          primaryColor: '#10b981',
          primaryTextColor: '#f4f4f5',
          primaryBorderColor: '#3f3f46',
          lineColor: '#52525b',
          secondaryColor: '#27272a',
          tertiaryColor: '#27272a',
          fontFamily: 'ui-monospace, monospace',
        },
      })

      codeBlocks.forEach(async (block, i) => {
        const source = block.textContent ?? ''
        const pre = block.closest('pre')
        if (!pre) return

        const id = `mermaid-${i}-${Date.now()}`
        try {
          const { svg } = await mermaid.render(id, source)
          const wrapper = document.createElement('div')
          wrapper.className = 'mermaid-output my-6 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 p-4'
          wrapper.innerHTML = svg
          pre.replaceWith(wrapper)
        } catch (err) {
          const errDiv = document.createElement('div')
          errDiv.className = 'my-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono'
          errDiv.textContent = `Mermaid error: ${err}`
          pre.replaceWith(errDiv)
        }
      })
    })
  }, [contentRef])
}

// ─── DocViewer ────────────────────────────────────────────────────────────────

interface Props {
  html: string
  tree: TreeNode[]
  activePath: string
}

export function DocViewer({ html, tree, activePath }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  useMermaid(contentRef)

  const segments = activePath.split('/')
  const filename = segments[segments.length - 1]?.replace('.md', '') ?? ''

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">

      {/* Title bar */}
      <div className="h-9 shrink-0 flex items-center px-4 gap-3 border-b border-zinc-800/80 bg-zinc-950 select-none">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/kapi_logo.png" alt="Kapi Sprints" width={16} height={16} className="object-contain opacity-80" />
          <span className="text-xs font-medium text-zinc-400">Kapi Sprints</span>
        </Link>
        <span className="text-zinc-800">/</span>
        <Link href="/docs" className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors">
          docs
        </Link>
        {segments.slice(0, -1).map((seg, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="text-zinc-800">/</span>
            <span className="text-xs font-mono text-zinc-500">{seg}</span>
          </span>
        ))}
        <span className="text-zinc-800">/</span>
        <span className="text-xs font-mono text-zinc-300">{filename}</span>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/v1" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-mono">
            ← dashboard
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* File tree sidebar */}
        <aside className="w-[200px] shrink-0 border-r border-zinc-800 overflow-y-auto bg-zinc-950 py-3 space-y-0.5">
          <div className="px-3 pb-2 border-b border-zinc-800/40 mb-2">
            <span className="text-[9px] text-zinc-600 uppercase tracking-[0.15em] font-mono">docs</span>
          </div>
          {tree.map(node => (
            <FolderNode key={node.path} node={node} activePath={activePath} />
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-10 py-10">
            <div
              ref={contentRef}
              className="prose-doc"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </main>

      </div>
    </div>
  )
}

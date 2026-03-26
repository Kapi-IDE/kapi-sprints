import fs from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import type { Metadata } from 'next'
import { DocViewer } from './_components/DocViewer'
import { DOCS_DIR } from '../../../project.config'

// Prefer docs/ subfolder if it exists; otherwise create it
const DOCS_SUBFOLDER = path.join(DOCS_DIR, 'docs')
const DOCS_ROOT = existsSync(DOCS_SUBFOLDER) ? DOCS_SUBFOLDER : (() => {
  mkdirSync(DOCS_SUBFOLDER, { recursive: true })
  return DOCS_SUBFOLDER
})()

// ─── File tree ────────────────────────────────────────────────────────────────

export interface TreeNode {
  name: string
  path: string   // relative to docs/, e.g. "foundation/vision.md"
  type: 'file' | 'dir'
  children?: TreeNode[]
}

async function buildTree(dir: string, rel = ''): Promise<TreeNode[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const nodes: TreeNode[] = []

  // Dirs first, then files — skip hidden and non-md files in dirs
  const dirs  = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'))
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.md'))

  for (const d of dirs) {
    const childRel = rel ? `${rel}/${d.name}` : d.name
    const children = await buildTree(path.join(dir, d.name), childRel)
    if (children.length > 0) {
      nodes.push({ name: d.name, path: childRel, type: 'dir', children })
    }
  }

  for (const f of files) {
    const fileRel = rel ? `${rel}/${f.name}` : f.name
    nodes.push({ name: f.name, path: fileRel, type: 'file' })
  }

  return nodes
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Metadata> {
  const { path: segments } = await params
  const filename = segments[segments.length - 1] ?? ''
  const title = filename.replace('.md', '').replace(/-/g, ' ')
  return { title: `${title} · Kapi Sprints Docs` }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DocsPage(
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  const relPath = segments.join('/')
  const filePath = path.join(DOCS_ROOT, relPath)

  // Must be a .md file
  if (!relPath.endsWith('.md')) notFound()

  let raw: string
  try {
    raw = await fs.readFile(filePath, 'utf-8')
  } catch {
    notFound()
  }

  // Render markdown → HTML (mermaid blocks are rendered client-side)
  const html = await marked(raw, { async: false })

  // Build full tree for the sidebar
  const tree = await buildTree(DOCS_ROOT)

  return (
    <DocViewer
      html={html as string}
      tree={tree}
      activePath={relPath}
    />
  )
}

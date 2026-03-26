import fs from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import { DocViewer } from './[...path]/_components/DocViewer'
import { DOCS_DIR } from '../../project.config'
import type { TreeNode } from './[...path]/page'

// Prefer docs/ subfolder if it exists; otherwise fall back to project root
const DOCS_SUBFOLDER = path.join(DOCS_DIR, 'docs')
const DOCS_ROOT = existsSync(DOCS_SUBFOLDER) ? DOCS_SUBFOLDER : (() => {
  mkdirSync(DOCS_SUBFOLDER, { recursive: true })
  return DOCS_SUBFOLDER
})()

async function buildTree(dir: string, rel = ''): Promise<TreeNode[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const nodes: TreeNode[] = []

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

function countFiles(nodes: TreeNode[]): number {
  let count = 0
  for (const n of nodes) {
    if (n.type === 'file') count++
    if (n.children) count += countFiles(n.children)
  }
  return count
}

export default async function DocsIndex() {
  const tree = await buildTree(DOCS_ROOT)
  const fileCount = countFiles(tree)
  const folderCount = tree.filter(n => n.type === 'dir').length

  const welcomeHtml = `
    <h1>Documentation</h1>
    <p>Browse the project docs using the sidebar. <strong>${fileCount}</strong> documents across <strong>${folderCount}</strong> folders.</p>
    <h2>Folders</h2>
    <ul>
      ${tree.filter(n => n.type === 'dir').map(n =>
        `<li><strong>${n.name}</strong> — ${n.children?.length ?? 0} item${(n.children?.length ?? 0) !== 1 ? 's' : ''}</li>`
      ).join('\n')}
    </ul>
    <p><em>Select a document from the sidebar to get started.</em></p>
  `

  return (
    <DocViewer
      html={welcomeHtml}
      tree={tree}
      activePath=""
    />
  )
}

import { notFound } from 'next/navigation'
import fs from 'fs/promises'
import path from 'path'
import { marked } from 'marked'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { KAPI_DIR } from '../../../project.config'
import { parseTasks, parseBlockTimes } from '../../../lib/parsers'
import type { ParsedBlock } from '../../../lib/parsers'
import { SprintDetailView } from './_components/SprintDetailView'

export async function generateMetadata(
  { params }: { params: Promise<{ version: string }> }
): Promise<Metadata> {
  const { version } = await params
  return { title: `Sprint ${version} · Kapi Sprints` }
}

export default async function SprintPage(
  { params }: { params: Promise<{ version: string }> }
) {
  const { version } = await params
  const sprintDir = path.join(KAPI_DIR, 'sprints', version)

  // Check sprint exists
  try {
    await fs.access(sprintDir)
  } catch {
    notFound()
  }

  // Read PRD
  let prdHtml = ''
  try {
    const prdMd = await fs.readFile(path.join(sprintDir, 'prd.md'), 'utf-8')
    prdHtml = marked.parse(prdMd) as string
  } catch {}

  // Read tasks
  let blocks: ParsedBlock[] = []
  try {
    const tasksMd = await fs.readFile(path.join(sprintDir, 'tasks.md'), 'utf-8')
    const blockTimes = parseBlockTimes(tasksMd)
    blocks = parseTasks(tasksMd, blockTimes)
  } catch {}

  const totalTasks = blocks.reduce((n, b) => n + b.tasks.length, 0)
  const doneTasks = blocks.reduce((n, b) => n + b.tasks.filter(t => t.checked).length, 0)

  return (
    <SprintDetailView
      version={version}
      prdHtml={prdHtml}
      blocks={blocks}
      totalTasks={totalTasks}
      doneTasks={doneTasks}
    />
  )
}

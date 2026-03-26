import fs from 'fs/promises'
import path from 'path'
import { marked } from 'marked'
import { KAPI_DIR } from '@/project.config'
import { LessonsView } from './LessonsView'

export default async function LessonsPage() {
  let html = ''
  try {
    const md = await fs.readFile(path.join(KAPI_DIR, 'lessons.md'), 'utf-8')
    marked.setOptions({ gfm: true, breaks: false })
    html = marked.parse(md) as string
  } catch {
    html = '<p class="text-zinc-600">No lessons file found. Create <code>kapi/lessons.md</code> to start logging learnings.</p>'
  }

  return <LessonsView html={html} />
}

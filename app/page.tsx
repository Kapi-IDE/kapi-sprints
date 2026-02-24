import { redirect } from 'next/navigation'
import fs from 'fs/promises'
import path from 'path'

export default async function RootPage() {
  const docsDir = path.join(process.cwd(), 'docs/operations/sprints')
  try {
    const entries = await fs.readdir(docsDir, { withFileTypes: true })
    const versions = entries
      .filter(e => e.isDirectory() && /^v\d+$/.test(e.name))
      .map(e => e.name)
      .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))

    // Latest sprint with tasks.md = current active sprint
    for (let i = versions.length - 1; i >= 0; i--) {
      try {
        await fs.access(path.join(docsDir, versions[i], 'tasks.md'))
        redirect(`/${versions[i]}`)
      } catch {}
    }
    if (versions.length > 0) redirect(`/${versions[versions.length - 1]}`)
  } catch {}

  redirect('/v1')
}

import { redirect } from 'next/navigation'

// /docs → first meaningful doc
export default function DocsIndex() {
  redirect('/docs/guides/principles.md')
}

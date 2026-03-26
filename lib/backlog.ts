/**
 * Backlog parsing/serialization — extracted from app/api/backlog/route.ts for testability.
 */

export function parseBacklog(raw: string): { inbox: string[]; done: string[]; header: string } {
  const inboxMatch = raw.match(/## Inbox\s*\n([\s\S]*?)(?=\n---\n|\n## |$)/)
  const doneMatch = raw.match(/## Done\s*\n([\s\S]*?)$/)

  const inbox = inboxMatch
    ? inboxMatch[1].split('\n').filter(l => l.startsWith('[ ] ')).map(l => l.slice(4))
    : []
  const done = doneMatch
    ? doneMatch[1].split('\n').filter(l => l.startsWith('[x] ')).map(l => l.slice(4))
    : []

  // Everything before ## Inbox
  const headerEnd = raw.indexOf('## Inbox')
  const header = headerEnd > 0 ? raw.slice(0, headerEnd) : '# Backlog\n\n---\n\n'

  return { inbox, done, header }
}

export function serializeBacklog(header: string, inbox: string[], done: string[]): string {
  const lines = [
    header.trimEnd(),
    '',
    '## Inbox',
    '',
    ...inbox.map(i => `[ ] ${i}`),
    '',
    '---',
    '',
    '## Done',
    '',
    ...done.map(d => `[x] ${d}`),
    '',
  ]
  return lines.join('\n')
}

/**
 * Helper functions extracted from app/api/blackboard/resolve/route.ts for testability.
 */

export function now(): string {
  const d = new Date()
  const mon = d.toLocaleString('en-US', { month: 'short' }).toLowerCase()
  const day = d.getDate()
  let hour = d.getHours()
  const ampm = hour >= 12 ? 'pm' : 'am'
  hour = hour % 12 || 12
  return `${mon} ${day} ${hour}${ampm}`
}

export function datestamp(): string {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
}

export function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
}

export function extractTitle(item: string): string {
  return item.match(/^\*\*(.+?)\*\*/)?.[1] ?? item.replace(/→.*$/, '').trim().slice(0, 60)
}

export function extractContext(item: string): string {
  return item
    .replace(/^\*\*[^*]+\*\*\s*—\s*/, '')
    .replace(/\s*→\s*`entries\/[^`]+`/, '')
    .replace(/\*\*/g, '')
    .trim()
}

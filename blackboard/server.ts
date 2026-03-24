#!/usr/bin/env bun
/**
 * Blackboard Server — shared singleton for multi-agent coordination.
 *
 * This is the true blackboard: one process, one YAML file, multiple observers.
 * Agents connect via thin MCP shims that register callback ports.
 * On any write, the server broadcasts to ALL registered agents.
 *
 * Run independently:  BLACKBOARD_PORT=8790 bun blackboard/server.ts
 *
 * Architecture:
 *   blackboard-live.yaml ← this server owns the file
 *   POST /register       ← shims register their callback port
 *   POST /unregister     ← shims deregister on shutdown
 *   POST /read           ← shims read state via HTTP
 *   POST /write          ← shims write state via HTTP (triggers broadcast)
 *   POST /directive      ← dashboard posts directives (triggers broadcast)
 *   GET  /state          ← raw JSON state
 *   GET  /agents         ← registered agent callbacks (debug)
 *   GET  /               ← embedded dashboard UI
 *   WS   /ws             ← live dashboard updates
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync, renameSync } from 'fs'
import { join, dirname, basename } from 'path'
import YAML from 'yaml'
import type { ServerWebSocket } from 'bun'

// --- Config ---
const PORT = Number(process.env.BLACKBOARD_PORT ?? 8790)
const DASHBOARD_PORT = Number(process.env.DASHBOARD_PORT ?? 8791)
const DIR = process.env.BLACKBOARD_DIR ?? dirname(new URL(import.meta.url).pathname)
const TEMPLATE = join(DIR, 'blackboard.yaml')
const LIVE = join(DIR, 'blackboard-live.yaml')

// --- Helpers ---
function now(): string {
  return new Date().toISOString().replace(/\.\d+Z$/, 'Z')
}

function ensureLive(): void {
  if (!existsSync(LIVE)) {
    if (!existsSync(TEMPLATE)) {
      writeFileSync(LIVE, YAML.stringify({
        blackboard: { project: basename(DIR), description: 'Shared state' },
        agents: {},
        directives: [],
        log: [],
      }))
    } else {
      copyFileSync(TEMPLATE, LIVE)
    }
  }
}

function readBlackboard(): any {
  ensureLive()
  return YAML.parse(readFileSync(LIVE, 'utf-8')) ?? {}
}

function writeBlackboard(data: any): void {
  const tmp = LIVE + '.tmp'
  writeFileSync(tmp, YAML.stringify(data))
  renameSync(tmp, LIVE)
}

function appendLog(data: any, entry: string): void {
  if (!Array.isArray(data.log)) data.log = []
  data.log.push({ ts: now(), entry })
  if (data.log.length > 200) data.log = data.log.slice(-200)
}

// --- Agent registry: callback_port → agent_name ---
const agentCallbacks = new Map<number, string>()

async function broadcastToAgents(source: string, message: string): Promise<void> {
  const promises: Promise<void>[] = []
  for (const [callbackPort, agentName] of agentCallbacks) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    promises.push(
      fetch(`http://127.0.0.1:${callbackPort}/notify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...corsHeaders },
        body: JSON.stringify({ source, message }),
        signal: controller.signal,
      })
        .then(r => {
          if (!r.ok) console.error(`notify ${agentName}@${callbackPort}: HTTP ${r.status}`)
        })
        .catch(err => {
          console.error(`notify ${agentName}@${callbackPort}: ${err.message}`)
          agentCallbacks.delete(callbackPort)
        })
        .finally(() => clearTimeout(timeout))
    )
  }
  await Promise.allSettled(promises)
}

// --- WebSocket clients for dashboard live updates ---
const wsClients = new Set<ServerWebSocket<unknown>>()

function broadcastDashboard(): void {
  try {
    const state = readBlackboard()
    const msg = JSON.stringify({ type: 'state', data: state })
    for (const ws of wsClients) {
      if (ws.readyState === 1) ws.send(msg)
    }
  } catch (err) {
    console.error('broadcastDashboard failed:', err)
  }
}

async function broadcastAll(source: string, message: string): Promise<void> {
  broadcastDashboard()
  await broadcastToAgents(source, message)
}

// --- HTTP + WebSocket server ---
ensureLive()

Bun.serve({
  port: PORT,
  hostname: '127.0.0.1',
  fetch(req, server) {
    const url = new URL(req.url)

    // CORS — allow dashboard on any local port
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'content-type',
        },
      })
    }
    const corsHeaders = { 'Access-Control-Allow-Origin': '*' }

    // WebSocket upgrade
    if (url.pathname === '/ws') {
      if (server.upgrade(req)) return
      return new Response('upgrade failed', { status: 400 })
    }

    // POST /register
    if (url.pathname === '/register' && req.method === 'POST') {
      return (async () => {
        try {
          const body = await req.json() as { agent: string; callback_port: number }
          agentCallbacks.set(body.callback_port, body.agent)
          console.log(`registered: ${body.agent} @ callback port ${body.callback_port}`)
          return new Response(JSON.stringify({ ok: true, agents: agentCallbacks.size }), {
            headers: { 'content-type': 'application/json', ...corsHeaders },
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), { status: 400 })
        }
      })()
    }

    // POST /unregister
    if (url.pathname === '/unregister' && req.method === 'POST') {
      return (async () => {
        try {
          const body = await req.json() as { callback_port: number }
          const name = agentCallbacks.get(body.callback_port)
          agentCallbacks.delete(body.callback_port)
          console.log(`unregistered: ${name ?? 'unknown'} @ callback port ${body.callback_port}`)
          return new Response(JSON.stringify({ ok: true }), {
            headers: { 'content-type': 'application/json', ...corsHeaders },
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), { status: 400 })
        }
      })()
    }

    // POST /read
    if (url.pathname === '/read' && req.method === 'POST') {
      return (async () => {
        try {
          const body = await req.json() as { section?: string }
          const data = readBlackboard()
          if (body.section && body.section in data) {
            return new Response(JSON.stringify({ data: data[body.section] }), {
              headers: { 'content-type': 'application/json', ...corsHeaders },
            })
          }
          return new Response(JSON.stringify({ data }), {
            headers: { 'content-type': 'application/json', ...corsHeaders },
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), { status: 400 })
        }
      })()
    }

    // POST /write
    if (url.pathname === '/write' && req.method === 'POST') {
      return (async () => {
        try {
          const body = await req.json() as { path: string; value: any; log_entry?: string; source?: string }
          const data = readBlackboard()

          const FORBIDDEN = new Set(['__proto__', 'constructor', 'prototype'])
          const parts = body.path.split('.')
          if (parts.some(p => FORBIDDEN.has(p))) {
            return new Response(JSON.stringify({ error: 'invalid path' }), { status: 400 })
          }
          let target = data
          for (let i = 0; i < parts.length - 1; i++) {
            if (target[parts[i]] === undefined || target[parts[i]] === null) {
              target[parts[i]] = {}
            }
            target = target[parts[i]]
          }
          target[parts[parts.length - 1]] = body.value

          if (body.log_entry) {
            appendLog(data, body.log_entry)
          }

          writeBlackboard(data)
          await broadcastAll(body.source ?? 'agent', `write to ${body.path}`)

          return new Response(JSON.stringify({ ok: true }), {
            headers: { 'content-type': 'application/json', ...corsHeaders },
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), { status: 400 })
        }
      })()
    }

    // POST /directive
    if (url.pathname === '/directive' && req.method === 'POST') {
      return (async () => {
        try {
          const body = await req.json() as { text: string; title?: string; assignee?: string; assigned_to?: string; from?: string }
          const data = readBlackboard()
          if (!Array.isArray(data.directives)) data.directives = []
          const assignee = body.assigned_to ?? body.assignee
          const directive: any = {
            id: `d${Date.now()}`,
            title: body.title ?? body.text,
            text: body.text,
            from: body.from ?? 'dashboard',
            posted_at: now(),
            status: 'pending',
          }
          if (assignee) directive.assigned_to = assignee
          data.directives.push(directive)
          const target = assignee ? ` → ${assignee}` : ''
          appendLog(data, `directive posted: ${body.text}${target}`)
          writeBlackboard(data)
          await broadcastAll('dashboard', `New directive: ${body.text}${target}`)

          return new Response(JSON.stringify({ ok: true, id: directive.id }), {
            headers: { 'content-type': 'application/json', ...corsHeaders },
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), { status: 400 })
        }
      })()
    }

    // GET /state
    if (url.pathname === '/state') {
      const data = readBlackboard()
      return new Response(JSON.stringify(data), {
        headers: { 'content-type': 'application/json', ...corsHeaders },
      })
    }

    // GET /agents
    if (url.pathname === '/agents') {
      const agents: Record<string, number> = {}
      for (const [port, name] of agentCallbacks) agents[name] = port
      return new Response(JSON.stringify(agents), {
        headers: { 'content-type': 'application/json', ...corsHeaders },
      })
    }

    // GET / — redirect to Next.js dashboard
    if (url.pathname === '/') {
      return new Response(null, {
        status: 302,
        headers: { 'Location': `http://localhost:${DASHBOARD_PORT}` },
      })
    }

    return new Response('404', { status: 404 })
  },
  websocket: {
    open: (ws) => {
      wsClients.add(ws)
      const state = readBlackboard()
      ws.send(JSON.stringify({ type: 'state', data: state }))
    },
    close: (ws) => { wsClients.delete(ws) },
    message: () => {},
  },
})

console.log(`blackboard-server: http://localhost:${PORT}`)
console.log(`  dashboard: http://localhost:${DASHBOARD_PORT}`)
console.log(`  agents register via POST /register`)

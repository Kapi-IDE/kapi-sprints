#!/usr/bin/env bun
/**
 * Blackboard Shim — thin MCP stdio proxy to the shared blackboard server.
 *
 * Claude Code spawns one of these per agent session. It:
 *   1. Declares claude/channel capability (so Claude gets <channel> notifications)
 *   2. On startup, registers a callback port with the shared blackboard server
 *   3. Proxies read/write tools via HTTP to the shared server
 *   4. Listens on callback port for broadcast notifications from the server
 *   5. Translates HTTP POST /notify → notifications/claude/channel over stdio
 *   6. (Optional) Exposes Gemini AI tools when GEMINI_API_KEY or GCP ADC is available
 *
 * Env:
 *   BLACKBOARD_SERVER  — URL of the shared server (default: http://127.0.0.1:8790)
 *   SHIM_PORT          — callback port for this shim (default: auto-assign)
 *   GEMINI_API_KEY     — Modern AI Pro proxy key (mai_gk_...) for students
 *   GEMINI_PROXY_URL   — Proxy endpoint (default: https://learn.modernaipro.com/api/gemini/v1)
 *   GOOGLE_CLOUD_PROJECT — GCP project for direct Vertex AI (fallback when no proxy key)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { dirname, join } from 'path'

const SERVER_URL = process.env.BLACKBOARD_SERVER ?? 'http://127.0.0.1:8790'
const SHIM_PORT = Number(process.env.SHIM_PORT || 0) // 0 = auto-assign

// --- Gemini configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_PROXY_URL = process.env.GEMINI_PROXY_URL || 'https://learn.modernaipro.com/api/gemini/v1'
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'kapi-ai-458922'

type GeminiMode = 'proxy' | 'vertex' | 'disabled'

// Determine Gemini mode: proxy key > ADC > disabled
async function detectGeminiMode(): Promise<GeminiMode> {
  if (GEMINI_API_KEY) return 'proxy'

  // Check for ADC credentials
  try {
    const { execSync } = await import('child_process')
    const result = execSync('gcloud auth application-default print-access-token 2>/dev/null', { timeout: 5000 })
    if (result.toString().trim()) return 'vertex'
  } catch {}

  return 'disabled'
}

let geminiMode: GeminiMode = 'disabled'

// Call Gemini via proxy (students) or direct Vertex AI (non-students)
async function callGemini(prompt: string, model = 'gemini-2.5-flash'): Promise<string> {
  if (geminiMode === 'proxy') {
    const res = await fetch(`${GEMINI_PROXY_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } })) as { error?: { message?: string } }
      throw new Error(`Gemini proxy error (${res.status}): ${err.error?.message || 'Unknown'}`)
    }
    const data = await res.json() as { choices: Array<{ message: { content: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number } }
    const text = data.choices?.[0]?.message?.content || ''
    const usage = data.usage
    const tokens = usage ? ` [${usage.prompt_tokens}→${usage.completion_tokens} tokens]` : ''
    return `${text}\n\n---\n_Model: ${model}${tokens} (via proxy)_`
  }

  if (geminiMode === 'vertex') {
    // Direct Vertex AI call using ADC
    const { execSync } = await import('child_process')
    const token = execSync('gcloud auth application-default print-access-token', { timeout: 5000 }).toString().trim()

    const vertexModels: Record<string, { id: string; endpoint: string }> = {
      'gemini-3.1-pro': { id: 'gemini-3.1-pro-preview', endpoint: 'https://aiplatform.googleapis.com/v1/projects/{project}/locations/global/publishers/google/models/gemini-3.1-pro-preview:generateContent' },
      'gemini-pro': { id: 'gemini-3.1-pro-preview', endpoint: 'https://aiplatform.googleapis.com/v1/projects/{project}/locations/global/publishers/google/models/gemini-3.1-pro-preview:generateContent' },
      'gemini-2.5-pro': { id: 'gemini-2.5-pro', endpoint: 'https://us-central1-aiplatform.googleapis.com/v1/projects/{project}/locations/us-central1/publishers/google/models/gemini-2.5-pro:generateContent' },
      'gemini-2.5-flash': { id: 'gemini-2.5-flash', endpoint: 'https://us-central1-aiplatform.googleapis.com/v1/projects/{project}/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent' },
      'gemini-flash': { id: 'gemini-2.5-flash', endpoint: 'https://us-central1-aiplatform.googleapis.com/v1/projects/{project}/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent' },
    }

    const resolved = vertexModels[model] || vertexModels['gemini-2.5-flash']
    const url = resolved.endpoint.replace('{project}', GOOGLE_CLOUD_PROJECT)

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Vertex AI error (${res.status}): ${err.slice(0, 200)}`)
    }
    const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const usage = data.usageMetadata
    const tokens = usage ? ` [${usage.promptTokenCount}→${usage.candidatesTokenCount} tokens]` : ''
    return `${text}\n\n---\n_Model: ${resolved.id}${tokens} (via Vertex AI)_`
  }

  throw new Error('Gemini is not configured. Set GEMINI_API_KEY or configure gcloud ADC.')
}

function now(): string {
  return new Date().toISOString().replace(/\.\d+Z$/, 'Z')
}

// --- MCP Server ---
const mcp = new Server(
  { name: 'blackboard-channel', version: '0.1.0' },
  {
    capabilities: { tools: {}, experimental: { 'claude/channel': {} } },
    instructions: [
      `You are connected to a MAS blackboard coordination channel.`,
      `The shared blackboard server is at ${SERVER_URL}`,
      ``,
      `## On startup`,
      `1. Use read_blackboard to see current state`,
      `2. Use write_to_blackboard to register yourself under agents: with your name, role, and status: "active"`,
      ``,
      `## When you receive a <channel> notification`,
      `1. Use read_blackboard to see what changed`,
      `2. Check directives: for any tasks assigned to you`,
      `3. Do the work`,
      `4. Use write_to_blackboard to update your status and log results`,
      ``,
      `## Rules`,
      `- Only write to your own section under agents:`,
      `- Write results under your agent key`,
      `- Add log entries for significant actions`,
      `- All agents share one blackboard — you will be notified when anyone writes`,
      ``,
      `Dashboard: ${SERVER_URL}`,
    ].join('\n'),
  },
)

// Gemini tool definitions — only included when Gemini is available
const GEMINI_TOOLS = [
  {
    name: 'gemini_query',
    description: 'Ask Gemini a question. Use for second opinions, alternative approaches, or when you want a different AI perspective.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'The question or prompt to send to Gemini' },
        model: { type: 'string', enum: ['gemini-3.1-pro', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-flash', 'gemini-pro'], description: 'Model to use (default: gemini-2.5-flash)' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'gemini_review_code',
    description: 'Send code to Gemini for review. Returns suggestions for improvements, bugs, and best practices.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'The code to review' },
        language: { type: 'string', description: 'Programming language (e.g., typescript, python)' },
        context: { type: 'string', description: 'Additional context about what this code does' },
      },
      required: ['code', 'language'],
    },
  },
  {
    name: 'gemini_generate_code',
    description: 'Ask Gemini to generate code for a specific task.',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'Description of what the code should do' },
        language: { type: 'string', description: 'Target programming language' },
        context: { type: 'string', description: 'Existing code or architecture context' },
      },
      required: ['task', 'language'],
    },
  },
  {
    name: 'gemini_explain',
    description: 'Ask Gemini to explain code or a technical concept.',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'The code or concept to explain' },
        depth: { type: 'string', enum: ['brief', 'detailed'], description: 'Level of detail (default: brief)' },
      },
      required: ['content'],
    },
  },
]

mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'read_blackboard',
      description: 'Read the current blackboard state. Returns the full shared state including all agents, directives, and log.',
      inputSchema: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            description: 'Optional: return only this top-level key (e.g. "agents", "directives", "log"). Omit for full state.',
          },
        },
      },
    },
    {
      name: 'write_to_blackboard',
      description: 'Write to a section of the blackboard. All connected agents will be notified of the change.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Dot-separated path to the key to write (e.g. "agents.researcher", "directives").',
          },
          value: {
            description: 'The value to set at that path. Can be any JSON-compatible value.',
          },
          log_entry: {
            type: 'string',
            description: 'Optional log message describing what changed.',
          },
        },
        required: ['path', 'value'],
      },
    },
    // Gemini tools — only appear when configured
    ...(geminiMode !== 'disabled' ? GEMINI_TOOLS : []),
  ],
}))

mcp.setRequestHandler(CallToolRequestSchema, async (req) => {
  const args = (req.params.arguments ?? {}) as Record<string, unknown>

  try {
    switch (req.params.name) {
      case 'read_blackboard': {
        const resp = await fetch(`${SERVER_URL}/read`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ section: args.section }),
        })
        const result = await resp.json() as { data: any; error?: string }
        if (result.error) throw new Error(result.error)

        const YAML = (await import('yaml')).default
        return { content: [{ type: 'text', text: YAML.stringify(result.data) }] }
      }

      case 'write_to_blackboard': {
        const resp = await fetch(`${SERVER_URL}/write`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            path: args.path,
            value: args.value,
            log_entry: args.log_entry,
            source: `shim@${actualPort}`,
          }),
        })
        const result = await resp.json() as { ok: boolean; error?: string }
        if (result.error) throw new Error(result.error)
        return { content: [{ type: 'text', text: `wrote to ${args.path}` }] }
      }

      // --- Gemini tools ---
      case 'gemini_query': {
        const result = await callGemini(args.prompt as string, (args.model as string) || 'gemini-2.5-flash')
        return { content: [{ type: 'text', text: result }] }
      }

      case 'gemini_review_code': {
        const lang = args.language as string
        const ctx = args.context ? `\n\nContext: ${args.context}` : ''
        const prompt = `Review this ${lang} code. Identify bugs, suggest improvements, and note best practices.${ctx}\n\n\`\`\`${lang}\n${args.code}\n\`\`\``
        const result = await callGemini(prompt, 'gemini-3.1-pro')
        return { content: [{ type: 'text', text: result }] }
      }

      case 'gemini_generate_code': {
        const ctx = args.context ? `\n\nExisting context:\n${args.context}` : ''
        const prompt = `Generate ${args.language} code for the following task:\n\n${args.task}${ctx}\n\nProvide clean, production-ready code with brief comments.`
        const result = await callGemini(prompt, 'gemini-3.1-pro')
        return { content: [{ type: 'text', text: result }] }
      }

      case 'gemini_explain': {
        const level = args.depth === 'detailed' ? 'Provide a detailed, thorough explanation with examples.' : 'Provide a concise, clear explanation.'
        const prompt = `${level}\n\n${args.content}`
        const result = await callGemini(prompt, 'gemini-2.5-flash')
        return { content: [{ type: 'text', text: result }] }
      }

      default:
        return { content: [{ type: 'text', text: `unknown tool: ${req.params.name}` }], isError: true }
    }
  } catch (err) {
    return {
      content: [{ type: 'text', text: `${req.params.name}: ${err instanceof Error ? err.message : err}` }],
      isError: true,
    }
  }
})

// Connect MCP over stdio
await mcp.connect(new StdioServerTransport())

// Deliver a channel notification into this Claude session
function deliverNotification(source: string, message: string): void {
  void mcp.notification({
    method: 'notifications/claude/channel',
    params: {
      content: message,
      meta: { source, ts: now() },
    },
  })
}

// --- Callback HTTP server (receives broadcasts from shared server) ---
const httpServer = Bun.serve({
  port: SHIM_PORT,
  hostname: '127.0.0.1',
  fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === '/notify' && req.method === 'POST') {
      return (async () => {
        try {
          const body = await req.json() as { source?: string; message?: string }
          deliverNotification(body.source ?? 'server', body.message ?? 'blackboard updated')
          return new Response(JSON.stringify({ ok: true }), {
            headers: { 'content-type': 'application/json' },
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), { status: 400 })
        }
      })()
    }

    return new Response('blackboard-shim callback', { status: 200 })
  },
})

const actualPort = httpServer.port
process.stderr.write(`blackboard-shim: callback on port ${actualPort}, server at ${SERVER_URL}\n`)

// Register with the shared blackboard server
async function register(): Promise<void> {
  try {
    const resp = await fetch(`${SERVER_URL}/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ agent: `shim-${actualPort}`, callback_port: actualPort }),
    })
    const result = await resp.json() as { ok: boolean; agents: number }
    process.stderr.write(`blackboard-shim: registered (${result.agents} agents connected)\n`)
  } catch (err) {
    process.stderr.write(`blackboard-shim: failed to register with server: ${err}\n`)
  }
}

// Unregister on exit
async function unregister(): Promise<void> {
  try {
    await fetch(`${SERVER_URL}/unregister`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ callback_port: actualPort }),
    })
  } catch {}
}

process.on('SIGINT', async () => { await unregister(); process.exit(0) })
process.on('SIGTERM', async () => { await unregister(); process.exit(0) })

// --- Auto-start server if not running ---
async function ensureServerRunning(): Promise<boolean> {
  const serverPort = new URL(SERVER_URL).port || '8790'

  try {
    const resp = await fetch(`${SERVER_URL}/state`, { signal: AbortSignal.timeout(1000) })
    if (resp.ok) {
      process.stderr.write(`blackboard-shim: server already running at ${SERVER_URL}\n`)
      return true
    }
  } catch {
    // Server not running — spawn it
  }

  process.stderr.write(`blackboard-shim: server not running, starting it...\n`)

  const serverPath = join(dirname(new URL(import.meta.url).pathname), 'server.ts')
  const projectDir = process.cwd()

  Bun.spawn(['bun', serverPath], {
    env: { ...process.env, BLACKBOARD_DIR: projectDir, BLACKBOARD_PORT: serverPort },
    stdio: ['ignore', 'ignore', 'ignore'],
  })

  for (let i = 0; i < 10; i++) {
    await Bun.sleep(500)
    try {
      const resp = await fetch(`${SERVER_URL}/state`, { signal: AbortSignal.timeout(1000) })
      if (resp.ok) {
        process.stderr.write(`blackboard-shim: server started (BLACKBOARD_DIR=${projectDir})\n`)
        return true
      }
    } catch {}
  }

  process.stderr.write(`blackboard-shim: WARNING — server did not start within 5s\n`)
  return false
}

// Detect Gemini availability
geminiMode = await detectGeminiMode()
if (geminiMode !== 'disabled') {
  process.stderr.write(`blackboard-shim: gemini enabled (${geminiMode} mode)\n`)
} else {
  process.stderr.write(`blackboard-shim: gemini disabled (no GEMINI_API_KEY or ADC)\n`)
}

await ensureServerRunning()
await register()

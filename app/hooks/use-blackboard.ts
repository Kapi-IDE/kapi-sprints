'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export interface BlackboardAgent {
  name?: string
  role?: string
  model?: string
  status?: string
  capabilities?: string[]
  [key: string]: unknown
}

export interface BlackboardDirective {
  id: string
  text?: string
  title?: string
  from?: string
  assigned_to?: string
  assignee?: string
  priority?: string
  status?: string
  posted_at?: string
  plan?: Record<string, unknown>
  [key: string]: unknown
}

export interface BlackboardLogEntry {
  ts: string
  entry: string
}

export interface BlackboardState {
  blackboard?: { project?: string; description?: string }
  agents?: Record<string, BlackboardAgent>
  directives?: BlackboardDirective[]
  log?: BlackboardLogEntry[]
}

interface UseBlackboardOptions {
  url?: string
  enabled?: boolean
}

export function useBlackboard(options: UseBlackboardOptions = {}) {
  const { url = 'ws://127.0.0.1:8790/ws', enabled = true } = options
  const [state, setState] = useState<BlackboardState | null>(null)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    if (!enabled) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        setConnected(true)
      }

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.type === 'state' && msg.data) {
            setState(msg.data)
          }
        } catch {}
      }

      ws.onclose = () => {
        setConnected(false)
        wsRef.current = null
        // Reconnect after 3s
        reconnectTimer.current = setTimeout(connect, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }

      wsRef.current = ws
    } catch {
      // Server not running — retry silently
      reconnectTimer.current = setTimeout(connect, 5000)
    }
  }, [url, enabled])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [connect])

  return { state, connected }
}

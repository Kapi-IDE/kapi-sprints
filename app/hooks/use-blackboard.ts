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
  const mountedRef = useRef(true)

  const clearReconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!enabled || !mountedRef.current) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    clearReconnect()

    try {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        if (mountedRef.current) setConnected(true)
      }

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.type === 'state' && msg.data && mountedRef.current) {
            setState(msg.data)
          }
        } catch {}
      }

      ws.onclose = () => {
        wsRef.current = null
        if (!mountedRef.current) return
        setConnected(false)
        setState(null)
        clearReconnect()
        reconnectTimer.current = setTimeout(connect, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }

      wsRef.current = ws
    } catch {
      if (!mountedRef.current) return
      clearReconnect()
      reconnectTimer.current = setTimeout(connect, 5000)
    }
  }, [url, enabled, clearReconnect])

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      clearReconnect()
      if (wsRef.current) wsRef.current.close()
    }
  }, [connect, clearReconnect])

  return { state, connected }
}

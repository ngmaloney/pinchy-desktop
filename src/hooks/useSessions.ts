import { useCallback, useEffect, useState } from 'react'
import type { GatewayClient } from '../lib/gateway-client'
import type { SessionInfo, SessionsListResponse, ConnectionStatus } from '../types/protocol'

const DEFAULT_SESSION_KEY = 'agent:main:main'

export interface SessionsHandle {
  sessions: SessionInfo[]
  activeSessionKey: string
  setActiveSessionKey: (key: string) => void
  refreshSessions: () => Promise<void>
  loading: boolean
}

export function useSessions(client: GatewayClient | null, status: ConnectionStatus): SessionsHandle {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [activeSessionKey, setActiveSessionKey] = useState(DEFAULT_SESSION_KEY)
  const [loading, setLoading] = useState(false)

  const refreshSessions = useCallback(async () => {
    if (!client || status !== 'connected') return
    setLoading(true)
    try {
      const res = await client.call('sessions.list', {}) as unknown as SessionsListResponse
      // Filter to only show active sessions:
      // - Main session always shown
      // - Sessions with actual conversation (totalTokens > 0)
      const activeSessions = (res.sessions ?? []).filter(s => 
        s.key === DEFAULT_SESSION_KEY || (s.totalTokens ?? 0) > 0
      )
      setSessions(activeSessions)
    } catch (err) {
      console.error('[useSessions] Failed to list sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [client, status])

  // Fetch sessions on connect
  useEffect(() => {
    if (status === 'connected') {
      void refreshSessions()
    } else if (status === 'disconnected') {
      setSessions([])
    }
  }, [status, refreshSessions])

  // Subscribe to chat events to auto-refresh session list when new activity occurs
  useEffect(() => {
    if (!client || status !== 'connected') return

    const unsub = client.on('chat', () => {
      // Refresh session list whenever any chat event occurs
      // This ensures new sessions and updated sessions appear automatically
      void refreshSessions()
    })

    return unsub
  }, [client, status, refreshSessions])

  return {
    sessions,
    activeSessionKey,
    setActiveSessionKey,
    refreshSessions,
    loading,
  }
}

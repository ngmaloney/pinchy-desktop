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
      setSessions(res.sessions ?? [])
    } catch (err) {
      console.error('[useSessions] Failed to list sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [client])

  // Fetch sessions on connect
  useEffect(() => {
    if (status === 'connected') {
      void refreshSessions()
    } else if (status === 'disconnected') {
      setSessions([])
    }
  }, [status, refreshSessions])

  return {
    sessions,
    activeSessionKey,
    setActiveSessionKey,
    refreshSessions,
    loading,
  }
}

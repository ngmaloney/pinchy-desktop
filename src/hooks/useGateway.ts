import { useCallback, useEffect, useRef, useState } from 'react'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface UseGatewayOptions {
  url: string
  token: string
  autoConnect?: boolean
  onMessage?: (data: unknown) => void
}

const MAX_RETRIES = 5
const BASE_DELAY = 1000

export function useGateway({ url, token, autoConnect = false, onMessage }: UseGatewayOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.onopen = null
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onmessage = null
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!url || !token) return

    cleanup()
    setStatus('connecting')

    const wsUrl = `${url}${url.includes('?') ? '&' : '?'}token=${token}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected')
      retriesRef.current = 0
      console.log('[Gateway] Connected')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage?.(data)
      } catch {
        console.warn('[Gateway] Non-JSON message:', event.data)
      }
    }

    ws.onclose = (event) => {
      console.log(`[Gateway] Disconnected (code: ${event.code})`)
      setStatus('disconnected')

      // Reconnect with exponential backoff
      if (retriesRef.current < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, retriesRef.current)
        retriesRef.current++
        console.log(`[Gateway] Reconnecting in ${delay}ms (attempt ${retriesRef.current})`)
        reconnectTimerRef.current = setTimeout(connect, delay)
      } else {
        setStatus('error')
        console.error('[Gateway] Max retries reached')
      }
    }

    ws.onerror = (err) => {
      console.error('[Gateway] Error:', err)
      setStatus('error')
    }
  }, [url, token, cleanup, onMessage])

  const disconnect = useCallback(() => {
    retriesRef.current = MAX_RETRIES // prevent reconnect
    cleanup()
    setStatus('disconnected')
  }, [cleanup])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data))
    }
  }, [])

  useEffect(() => {
    if (autoConnect && url && token) {
      connect()
    }
    return cleanup
  }, [autoConnect, url, token, connect, cleanup])

  return { status, connect, disconnect, send }
}

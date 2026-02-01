import { useCallback, useEffect, useRef, useState } from 'react'
import { GatewayClient } from '../lib/gateway-client'
import type { ConnectionStatus } from '../types/protocol'

export type { ConnectionStatus }

interface UseGatewayOptions {
  url: string
  token: string
  autoConnect?: boolean
}

export interface GatewayHandle {
  status: ConnectionStatus
  client: GatewayClient | null
  connect: () => void
  disconnect: () => void
}

export function useGateway({ url, token, autoConnect = false }: UseGatewayOptions): GatewayHandle {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const clientRef = useRef<GatewayClient | null>(null)

  // Create / recreate the client when url or token change
  useEffect(() => {
    if (!url || !token) return

    const client = new GatewayClient({
      url,
      token,
      onStatusChange: (s) => setStatus(s),
    })

    clientRef.current = client

    if (autoConnect) {
      client.connect()
    }

    return () => {
      client.disconnect()
      clientRef.current = null
    }
  }, [url, token, autoConnect])

  const connect = useCallback(() => {
    clientRef.current?.connect()
  }, [])

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect()
    setStatus('disconnected')
  }, [])

  return {
    status,
    client: clientRef.current,
    connect,
    disconnect,
  }
}

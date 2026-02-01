import { useCallback, useEffect, useState } from 'react'
import { ConnectScreen } from './components/ConnectScreen'
import { Dashboard } from './components/Dashboard'
import { useGateway } from './hooks/useGateway'

function App() {
  const [credentials, setCredentials] = useState<{ url: string; token: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // Load saved credentials on mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const url = await window.api.store.get('gatewayUrl') as string
        const token = await window.api.store.get('token') as string
        if (url && token) {
          setCredentials({ url, token })
        }
      } catch (e) {
        console.error('Failed to load credentials:', e)
      } finally {
        setLoading(false)
      }
    }
    loadCredentials()
  }, [])

  const { status, client, disconnect } = useGateway({
    url: credentials?.url || '',
    token: credentials?.token || '',
    autoConnect: !!credentials,
  })

  const handleConnect = useCallback(async (url: string, token: string) => {
    setCredentials({ url, token })
    await window.api.store.set('gatewayUrl', url)
    await window.api.store.set('token', token)
  }, [])

  const handleDisconnect = useCallback(async () => {
    disconnect()
    await window.api.store.delete('token')
    setCredentials(null)
  }, [disconnect])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#888',
      }}>
        Loading...
      </div>
    )
  }

  if (!credentials) {
    return <ConnectScreen onConnect={handleConnect} status={status} />
  }

  return <Dashboard status={status} client={client} onDisconnect={handleDisconnect} />
}

export default App

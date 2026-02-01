import { ConnectionStatus } from '../hooks/useGateway'

interface DashboardProps {
  status: ConnectionStatus
  onDisconnect: () => void
}

export function Dashboard({ status, onDisconnect }: DashboardProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#1a1a2e',
      color: '#e0e0e0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #2a2a4a',
        backgroundColor: '#16213e',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🦀</span>
          <span style={{ fontWeight: 600 }}>Pinchy Desktop</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.75rem',
            color: status === 'connected' ? '#22c55e' : '#ef4444',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: status === 'connected' ? '#22c55e' : '#ef4444',
              display: 'inline-block',
            }} />
            {status === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <button
          onClick={onDisconnect}
          style={{
            padding: '0.375rem 0.75rem',
            backgroundColor: 'transparent',
            border: '1px solid #2a2a4a',
            borderRadius: '4px',
            color: '#888',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          Disconnect
        </button>
      </div>

      {/* Main Content — placeholder for Phase 3 */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#555',
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🦀</span>
          <p style={{ marginTop: '1rem' }}>
            Connected to Gateway. Chat UI coming in Phase 3!
          </p>
        </div>
      </div>
    </div>
  )
}

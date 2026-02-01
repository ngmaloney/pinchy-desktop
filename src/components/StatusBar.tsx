import type { ConnectionStatus } from '../types/protocol'

interface StatusBarProps {
  status: ConnectionStatus
  activeSession: string
  onDisconnect: () => void
}

const statusColors: Record<ConnectionStatus, string> = {
  connected: '#22c55e',
  connecting: '#f59e0b',
  handshaking: '#f59e0b',
  disconnected: '#ef4444',
  error: '#ef4444',
}

const statusLabels: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  connecting: 'Connecting…',
  handshaking: 'Handshaking…',
  disconnected: 'Disconnected',
  error: 'Error',
}

export function StatusBar({ status, activeSession, onDisconnect }: StatusBarProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.5rem 1rem',
      borderTop: '1px solid #2a2a4a',
      backgroundColor: '#16213e',
      fontSize: '0.75rem',
      color: '#888',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: statusColors[status],
            display: 'inline-block',
            animation: status === 'connecting' || status === 'handshaking'
              ? 'pulse 1.5s ease-in-out infinite' : undefined,
          }} />
          <span>{statusLabels[status]}</span>
        </div>
        <span style={{ color: '#555' }}>|</span>
        <span style={{ color: '#aaa' }}>{activeSession}</span>
      </div>

      <button
        onClick={onDisconnect}
        style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: 'transparent',
          border: '1px solid #2a2a4a',
          borderRadius: '4px',
          color: '#888',
          fontSize: '0.7rem',
          cursor: 'pointer',
        }}
      >
        Disconnect
      </button>
    </div>
  )
}

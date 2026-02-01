import type { SessionInfo } from '../types/protocol'

interface SidebarProps {
  sessions: SessionInfo[]
  activeSessionKey: string
  onSelectSession: (key: string) => void
  loading: boolean
}

function sessionLabel(s: SessionInfo): string {
  if (s.label) return s.label
  // Derive a nicer label from the key
  // e.g. "agent:main:main" → "Main Agent"
  const parts = s.key.split(':')
  if (parts.length >= 3) {
    const name = parts[2] === 'main' ? 'Main' : parts[2]
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} Agent`
  }
  return s.key
}

export function Sidebar({ sessions, activeSessionKey, onSelectSession, loading }: SidebarProps) {
  return (
    <div style={{
      width: '220px',
      minWidth: '220px',
      backgroundColor: '#0f1629',
      borderRight: '1px solid #2a2a4a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #2a2a4a',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexShrink: 0,
      }}>
        <span>🦀</span>
        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
          Sessions
        </span>
      </div>

      {/* Session list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.5rem',
      }}>
        {loading && (
          <div style={{
            textAlign: 'center',
            color: '#555',
            padding: '1rem',
            fontSize: '0.8rem',
          }}>
            Loading…
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#555',
            padding: '1rem',
            fontSize: '0.8rem',
          }}>
            No sessions
          </div>
        )}

        {sessions.map((s) => {
          const isActive = s.key === activeSessionKey
          return (
            <button
              key={s.key}
              onClick={() => onSelectSession(s.key)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.625rem',
                marginBottom: '0.25rem',
                backgroundColor: isActive ? '#1a1a2e' : 'transparent',
                border: isActive ? '1px solid #2a2a4a' : '1px solid transparent',
                borderRadius: '6px',
                color: isActive ? '#fff' : '#888',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s',
                boxSizing: 'border-box',
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#22c55e' : '#555',
                flexShrink: 0,
              }} />
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {sessionLabel(s)}
              </span>
              {s.model && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '0.65rem',
                  color: '#555',
                  flexShrink: 0,
                }}>
                  {s.model}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

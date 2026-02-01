import { useCallback, useRef, useState, type KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (text: string) => void
  onAbort: () => void
  isStreaming: boolean
  disabled: boolean
}

export function MessageInput({ onSend, onAbort, isStreaming, disabled }: MessageInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, disabled, onSend])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleInput = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      borderTop: '1px solid #2a2a4a',
      backgroundColor: '#16213e',
      flexShrink: 0,
    }}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={disabled ? 'Disconnected…' : 'Message Pinchy… (Enter to send, Shift+Enter for newline)'}
        disabled={disabled || isStreaming}
        rows={1}
        style={{
          flex: 1,
          padding: '0.625rem 0.75rem',
          backgroundColor: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: '8px',
          color: '#e0e0e0',
          fontSize: '0.875rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: 1.5,
          resize: 'none',
          outline: 'none',
          maxHeight: '200px',
          overflow: 'auto',
          boxSizing: 'border-box',
        }}
      />

      {isStreaming ? (
        <button
          onClick={onAbort}
          title="Stop generation"
          style={{
            padding: '0.625rem 1rem',
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
            lineHeight: 1.5,
          }}
        >
          ■ Stop
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          title="Send message"
          style={{
            padding: '0.625rem 1rem',
            backgroundColor: (!text.trim() || disabled) ? '#333' : '#e85d04',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: (!text.trim() || disabled) ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            lineHeight: 1.5,
          }}
        >
          Send
        </button>
      )}
    </div>
  )
}

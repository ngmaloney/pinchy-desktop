import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { DisplayMessage } from '../hooks/useChat'
import type { ComponentPropsWithoutRef } from 'react'

interface MessageBubbleProps {
  message: DisplayMessage
}

function formatTime(ts?: string | number): string {
  if (!ts) return ''
  try {
    const d = new Date(typeof ts === 'number' ? ts : ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      padding: '0.25rem 1rem',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{
        maxWidth: '80%',
        minWidth: '60px',
        padding: '0.625rem 0.875rem',
        borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        backgroundColor: isUser ? '#e85d04' : '#16213e',
        color: isUser ? '#fff' : '#e0e0e0',
        border: isUser ? 'none' : '1px solid #2a2a4a',
        fontSize: '0.875rem',
        lineHeight: 1.5,
        wordBreak: 'break-word',
        position: 'relative',
      }}>
        {/* Error state */}
        {message.error && (
          <div style={{
            color: '#ef4444',
            fontSize: '0.8rem',
            padding: '0.25rem 0',
          }}>
            ⚠ {message.error}
          </div>
        )}

        {/* Message text with markdown */}
        {message.text && (
          <div style={{ overflow: 'hidden' }} className="msg-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props: ComponentPropsWithoutRef<'code'> & { inline?: boolean; className?: string }) {
                  const { inline, className, children, ...rest } = props
                  const match = /language-(\w+)/.exec(className || '')
                  if (!inline && match) {
                    return (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: '0.5rem 0',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    )
                  }
                  return (
                    <code
                      {...rest}
                      className={className}
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        padding: '0.15rem 0.35rem',
                        borderRadius: '3px',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      {children}
                    </code>
                  )
                },
                a(props: ComponentPropsWithoutRef<'a'>) {
                  return (
                    <a
                      {...props}
                      style={{ color: '#60a5fa', textDecoration: 'underline' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  )
                },
                p(props: ComponentPropsWithoutRef<'p'>) {
                  return <p {...props} style={{ margin: '0.35rem 0' }} />
                },
                ul(props: ComponentPropsWithoutRef<'ul'>) {
                  return <ul {...props} style={{ margin: '0.35rem 0', paddingLeft: '1.25rem' }} />
                },
                ol(props: ComponentPropsWithoutRef<'ol'>) {
                  return <ol {...props} style={{ margin: '0.35rem 0', paddingLeft: '1.25rem' }} />
                },
                blockquote(props: ComponentPropsWithoutRef<'blockquote'>) {
                  return (
                    <blockquote
                      {...props}
                      style={{
                        borderLeft: '3px solid #e85d04',
                        margin: '0.35rem 0',
                        paddingLeft: '0.75rem',
                        color: '#aaa',
                      }}
                    />
                  )
                },
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        )}

        {/* Streaming indicator */}
        {message.streaming && (
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '14px',
            backgroundColor: '#e85d04',
            marginLeft: '2px',
            animation: 'blink 1s step-end infinite',
            verticalAlign: 'text-bottom',
          }} />
        )}

        {/* Timestamp */}
        {message.timestamp && !message.streaming && (
          <div style={{
            fontSize: '0.65rem',
            color: isUser ? 'rgba(255,255,255,0.6)' : '#555',
            marginTop: '0.25rem',
            textAlign: 'right',
          }}>
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  )
}

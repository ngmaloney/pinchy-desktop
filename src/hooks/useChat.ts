import { useCallback, useEffect, useRef, useState } from 'react'
import type { GatewayClient } from '../lib/gateway-client'
import type {
  ChatMessage,
  ChatHistoryResponse,
  ChatSendAck,
  ChatAbortResponse,
  ChatEventPayload,
  ConnectionStatus,
  ChatAttachment,
} from '../types/protocol'

export interface DisplayMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp?: string | number
  streaming?: boolean
  error?: string
  attachments?: ChatAttachment[]
}

export interface ChatHandle {
  messages: DisplayMessage[]
  send: (text: string, attachments?: ChatAttachment[]) => Promise<void>
  abort: () => Promise<void>
  loadHistory: (sessionKey: string) => Promise<void>
  isStreaming: boolean
  historyLoading: boolean
}

let _msgId = 0
function newMsgId(): string {
  return `msg-${++_msgId}-${Date.now()}`
}

function uuid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function extractText(msg: ChatMessage): string {
  if (!msg.content) return ''
  // Handle content as plain string (common for user messages in history)
  if (typeof msg.content === 'string') return msg.content
  // Handle content as array of blocks
  if (!Array.isArray(msg.content) || msg.content.length === 0) return ''
  return msg.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
}

export function useChat(
  client: GatewayClient | null,
  status: ConnectionStatus,
  activeSessionKey: string,
): ChatHandle {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const activeRunIdRef = useRef<string | null>(null)
  const sessionKeyRef = useRef(activeSessionKey)

  // Keep ref in sync
  sessionKeyRef.current = activeSessionKey

  // Subscribe to chat events
  useEffect(() => {
    if (!client) return

    const unsub = client.on('chat', (payload) => {
      const ev = payload as unknown as ChatEventPayload
      // Only process events for the active session
      if (ev.sessionKey !== sessionKeyRef.current) return

      if (ev.state === 'delta') {
        const text = extractText(ev.message)
        const attachments = ev.message.attachments
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.streaming && m.role === 'assistant')
          if (idx >= 0) {
            const updated = [...prev]
            updated[idx] = { ...updated[idx], text, attachments, streaming: true }
            return updated
          }
          // First delta — create streaming message
          return [...prev, {
            id: newMsgId(),
            role: 'assistant' as const,
            text,
            attachments,
            streaming: true,
          }]
        })
      } else if (ev.state === 'final') {
        const text = extractText(ev.message)
        const attachments = ev.message.attachments
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.streaming && m.role === 'assistant')
          if (idx >= 0) {
            const updated = [...prev]
            updated[idx] = {
              ...updated[idx],
              text,
              attachments,
              streaming: false,
              timestamp: ev.message.timestamp,
            }
            return updated
          }
          return [...prev, {
            id: newMsgId(),
            role: 'assistant' as const,
            text,
            attachments,
            timestamp: ev.message.timestamp,
            streaming: false,
          }]
        })
        activeRunIdRef.current = null
        setIsStreaming(false)
      } else if (ev.state === 'error') {
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.streaming && m.role === 'assistant')
          if (idx >= 0) {
            const updated = [...prev]
            updated[idx] = {
              ...updated[idx],
              streaming: false,
              error: ev.errorMessage,
            }
            return updated
          }
          return [...prev, {
            id: newMsgId(),
            role: 'assistant' as const,
            text: '',
            streaming: false,
            error: ev.errorMessage,
          }]
        })
        activeRunIdRef.current = null
        setIsStreaming(false)
      }
    })

    return unsub
  }, [client])

  // Load history when session changes
  const loadHistory = useCallback(async (sessionKey: string) => {
    if (!client || status !== 'connected') return
    setHistoryLoading(true)
    try {
      const res = await client.call('chat.history', {
        sessionKey,
        limit: 200,
      }) as unknown as ChatHistoryResponse

      const history: DisplayMessage[] = (res.messages ?? [])
        .filter((m) => (m.role === 'user' || m.role === 'assistant') && extractText(m).trim())
        .map((m) => ({
          id: newMsgId(),
          role: m.role as 'user' | 'assistant',
          text: extractText(m),
          timestamp: m.timestamp,
          attachments: m.attachments,
          streaming: false,
        }))
      setMessages(history)
    } catch (err) {
      console.error('[useChat] Failed to load history:', err)
      setMessages([])
    } finally {
      setHistoryLoading(false)
    }
  }, [client, status])

  // Reload history when active session changes
  useEffect(() => {
    if (status === 'connected' && activeSessionKey) {
      void loadHistory(activeSessionKey)
    } else {
      setMessages([])
    }
    // Reset streaming state on session switch
    activeRunIdRef.current = null
    setIsStreaming(false)
  }, [activeSessionKey, status, loadHistory])

  const send = useCallback(async (text: string, attachments?: ChatAttachment[]) => {
    if (!client || status !== 'connected' || !text.trim()) return

    // Append user message immediately
    const userMsg: DisplayMessage = {
      id: newMsgId(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      attachments,
    }
    setMessages((prev) => [...prev, userMsg])
    setIsStreaming(true)

    try {
      const params: {
        sessionKey: string
        message: string
        idempotencyKey: string
        attachments?: ChatAttachment[]
      } = {
        sessionKey: sessionKeyRef.current,
        message: text.trim(),
        idempotencyKey: uuid(),
      }
      
      if (attachments && attachments.length > 0) {
        params.attachments = attachments
      }

      const ack = await client.call('chat.send', params) as unknown as ChatSendAck

      activeRunIdRef.current = ack.runId ?? null
    } catch (err) {
      console.error('[useChat] Failed to send:', err)
      setMessages((prev) => [...prev, {
        id: newMsgId(),
        role: 'assistant',
        text: '',
        streaming: false,
        error: err instanceof Error ? err.message : 'Failed to send message',
      }])
      setIsStreaming(false)
    }
  }, [client, status])

  const abort = useCallback(async () => {
    if (!client || status !== 'connected') return
    try {
      await client.call('chat.abort', {
        sessionKey: sessionKeyRef.current,
      }) as unknown as ChatAbortResponse
    } catch (err) {
      console.error('[useChat] Failed to abort:', err)
    }
    // Streaming end will be handled by the final/error event
  }, [client, status])

  return {
    messages,
    send,
    abort,
    loadHistory,
    isStreaming,
    historyLoading,
  }
}

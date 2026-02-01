/**
 * Protocol-aware WebSocket client for OpenClaw Gateway (Protocol v3).
 *
 * Handles:
 *  - connect.challenge → connect handshake → hello-ok
 *  - Request/response correlation (id-based)
 *  - Event emitter for "chat", "agent", "tick" events
 *  - call(method, params) → Promise
 *  - Reconnect with exponential backoff
 */

import type {
  Frame,
  RequestFrame,
  ResponseFrame,
  EventFrame,
  ConnectParams,
  ConnectionStatus,
} from '../types/protocol'

// ── Types ────────────────────────────────────────────────────

type EventCallback = (payload: Record<string, unknown>) => void

interface PendingRequest {
  resolve: (payload: Record<string, unknown>) => void
  reject: (err: Error) => void
  timer: ReturnType<typeof setTimeout>
}

export interface GatewayClientOptions {
  url: string
  token: string
  onStatusChange?: (status: ConnectionStatus) => void
  onEvent?: (event: string, payload: Record<string, unknown>) => void
  maxRetries?: number
  requestTimeoutMs?: number
}

// ── Client ───────────────────────────────────────────────────

const MAX_RETRIES = 10
const BASE_DELAY = 1000
const MAX_DELAY = 30000
const REQUEST_TIMEOUT = 30000

let _nextId = 1
function nextId(): string {
  return `pd-${_nextId++}`
}

export class GatewayClient {
  private ws: WebSocket | null = null
  private status: ConnectionStatus = 'disconnected'
  private pending = new Map<string, PendingRequest>()
  private listeners = new Map<string, Set<EventCallback>>()
  private retryCount = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private intentionalClose = false

  private readonly url: string
  private readonly token: string
  private readonly onStatusChange?: (status: ConnectionStatus) => void
  private readonly onEvent?: (event: string, payload: Record<string, unknown>) => void
  private readonly maxRetries: number
  private readonly requestTimeoutMs: number

  constructor(opts: GatewayClientOptions) {
    this.url = opts.url
    this.token = opts.token
    this.onStatusChange = opts.onStatusChange
    this.onEvent = opts.onEvent
    this.maxRetries = opts.maxRetries ?? MAX_RETRIES
    this.requestTimeoutMs = opts.requestTimeoutMs ?? REQUEST_TIMEOUT
  }

  // ── Public API ───────────────────────────────────────────

  getStatus(): ConnectionStatus {
    return this.status
  }

  connect(): void {
    this.intentionalClose = false
    this.retryCount = 0
    this._connect()
  }

  disconnect(): void {
    this.intentionalClose = true
    this._cleanup()
    this._setStatus('disconnected')
  }

  /**
   * Send a request and await the response.
   */
  async call(method: string, params?: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (this.status !== 'connected' && method !== 'connect') {
      throw new Error(`Cannot call "${method}" — not connected (status: ${this.status})`)
    }

    const id = nextId()
    const frame: RequestFrame = { type: 'req', id, method, params }

    return new Promise<Record<string, unknown>>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`Request "${method}" timed out after ${this.requestTimeoutMs}ms`))
      }, this.requestTimeoutMs)

      this.pending.set(id, { resolve, reject, timer })
      this._send(frame)
    })
  }

  /**
   * Subscribe to gateway events (e.g. "chat", "agent", "tick").
   */
  on(event: string, cb: EventCallback): () => void {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(cb)
    return () => { set?.delete(cb) }
  }

  /**
   * Remove a specific listener.
   */
  off(event: string, cb: EventCallback): void {
    this.listeners.get(event)?.delete(cb)
  }

  // ── Internals ────────────────────────────────────────────

  private _setStatus(s: ConnectionStatus): void {
    if (this.status !== s) {
      this.status = s
      this.onStatusChange?.(s)
    }
  }

  private _connect(): void {
    this._cleanup()
    this._setStatus('connecting')

    // Append token as query param for the initial WS upgrade
    const sep = this.url.includes('?') ? '&' : '?'
    const wsUrl = `${this.url}${sep}token=${encodeURIComponent(this.token)}`

    const ws = new WebSocket(wsUrl)
    this.ws = ws

    ws.onopen = () => {
      console.log('[GatewayClient] WS open, awaiting connect.challenge…')
      this._setStatus('handshaking')
    }

    ws.onmessage = (ev) => {
      this._onMessage(ev)
    }

    ws.onclose = (ev) => {
      console.log(`[GatewayClient] WS closed (code: ${ev.code})`)
      this.ws = null
      this._rejectAllPending('WebSocket closed')

      if (!this.intentionalClose) {
        this._scheduleReconnect()
      } else {
        this._setStatus('disconnected')
      }
    }

    ws.onerror = (err) => {
      console.error('[GatewayClient] WS error:', err)
      // onclose will fire after this
    }
  }

  private _cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws.onmessage = null
      this.ws.close()
      this.ws = null
    }
    this._rejectAllPending('Client cleanup')
  }

  private _rejectAllPending(reason: string): void {
    for (const [id, req] of this.pending) {
      clearTimeout(req.timer)
      req.reject(new Error(reason))
      this.pending.delete(id)
    }
  }

  private _send(frame: Frame): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(frame))
    }
  }

  private _onMessage(ev: MessageEvent): void {
    let frame: Frame
    try {
      frame = JSON.parse(ev.data as string) as Frame
    } catch {
      console.warn('[GatewayClient] Non-JSON message:', ev.data)
      return
    }

    switch (frame.type) {
      case 'event':
        this._handleEvent(frame as EventFrame)
        break
      case 'res':
        this._handleResponse(frame as ResponseFrame)
        break
      default:
        console.log('[GatewayClient] Unknown frame type:', frame)
    }
  }

  private _handleEvent(frame: EventFrame): void {
    const { event, payload } = frame

    // Handle connect.challenge → perform handshake
    if (event === 'connect.challenge') {
      this._doHandshake()
      return
    }

    // Notify registered listeners
    const cbs = this.listeners.get(event)
    if (cbs) {
      for (const cb of cbs) {
        try { cb(payload) } catch (e) { console.error('[GatewayClient] Event listener error:', e) }
      }
    }

    // Also notify the generic onEvent handler
    this.onEvent?.(event, payload)
  }

  private _handleResponse(frame: ResponseFrame): void {
    const req = this.pending.get(frame.id)
    if (!req) {
      console.warn('[GatewayClient] Unmatched response id:', frame.id)
      return
    }

    this.pending.delete(frame.id)
    clearTimeout(req.timer)

    if (frame.ok) {
      req.resolve(frame.payload ?? {})
    } else {
      const msg = frame.error?.message ?? 'Unknown error'
      req.reject(new Error(msg))
    }
  }

  private async _doHandshake(): Promise<void> {
    console.log('[GatewayClient] Performing connect handshake…')
    const params: ConnectParams = {
      role: 'operator',
      scopes: ['operator.read', 'operator.write'],
      auth: { token: this.token },
      client: {
        id: 'pinchy-desktop',
        platform: 'electron',
        mode: 'operator',
      },
      minProtocol: 3,
      maxProtocol: 3,
    }

    try {
      // Temporarily allow calls during handshaking
      const prevStatus = this.status
      this._setStatus('handshaking')

      const id = nextId()
      const frame: RequestFrame = { type: 'req', id, method: 'connect', params: params as unknown as Record<string, unknown> }

      const payload = await new Promise<Record<string, unknown>>((resolve, reject) => {
        const timer = setTimeout(() => {
          this.pending.delete(id)
          reject(new Error('Handshake timed out'))
        }, this.requestTimeoutMs)

        this.pending.set(id, { resolve, reject, timer })
        this._send(frame)
      })

      if ((payload as Record<string, unknown>).type === 'hello-ok') {
        console.log('[GatewayClient] Handshake complete — connected!')
        this.retryCount = 0
        this._setStatus('connected')
      } else {
        console.error('[GatewayClient] Unexpected handshake payload:', payload)
        this._setStatus(prevStatus)
      }
    } catch (err) {
      console.error('[GatewayClient] Handshake failed:', err)
      this._setStatus('error')
      this.ws?.close()
    }
  }

  private _scheduleReconnect(): void {
    if (this.retryCount >= this.maxRetries) {
      console.error(`[GatewayClient] Max retries (${this.maxRetries}) reached`)
      this._setStatus('error')
      return
    }

    const delay = Math.min(BASE_DELAY * Math.pow(2, this.retryCount), MAX_DELAY)
    this.retryCount++
    console.log(`[GatewayClient] Reconnecting in ${delay}ms (attempt ${this.retryCount})`)
    this._setStatus('connecting')
    this.reconnectTimer = setTimeout(() => this._connect(), delay)
  }
}

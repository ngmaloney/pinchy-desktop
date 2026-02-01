# Phase 3: Chat UI — PRD

## Goal

Deliver a **fully functional** chat interface for Pinchy Desktop. Users should be able to have real conversations with their OpenClaw agent — send messages, see streamed responses, view history, and manage sessions. This is the "ship it" phase.

## Gateway Protocol Summary

The app connects via WebSocket to the Gateway (`ws://host:port/?token=...`).

### Handshake

1. Gateway sends `{ type: "event", event: "connect.challenge", payload: { nonce, ts } }`
2. Client sends `{ type: "req", id, method: "connect", params: { ... } }` with role `operator`, scopes `["operator.read", "operator.write"]`, auth token, and `allowInsecureAuth`-compatible mode (no device identity for now).
3. Gateway responds `{ type: "res", id, ok: true, payload: { type: "hello-ok", protocol: 3, ... } }`

### Chat Methods (req/res)

- **`chat.history`** — `{ sessionKey, limit? }` → `{ messages[], sessionKey, sessionId, thinkingLevel }`
- **`chat.send`** — `{ sessionKey, message, idempotencyKey, thinking? }` → ack `{ runId, status: "started" }` (non-blocking; response streams via events)
- **`chat.abort`** — `{ sessionKey }` → `{ ok, aborted, runIds }`

### Chat Events (streamed via `type: "event"`)

- `event: "chat"` with payload:
  - `state: "delta"` — streaming text chunk (`payload.message.content[0].text` = full accumulated text so far)
  - `state: "final"` — completed response (`payload.message`)
  - `state: "error"` — run failed (`payload.errorMessage`)
- `event: "agent"` — tool calls, lifecycle events (for verbose/tool output display)

### Sessions

- **`sessions.list`** — list available sessions
- **`sessions.preview`** — preview a session

## Features

### 1. Protocol Client (refactor `useGateway`)

Replace the bare WebSocket hook with a proper protocol client:

- Handle `connect.challenge` → send `connect` request → await `hello-ok`
- Request/response tracking with `id` correlation
- Event listener registry (`on("chat", cb)`, `on("agent", cb)`)
- Methods: `call(method, params)` returns `Promise<payload>`
- Reconnect with backoff (existing logic, but after handshake)
- Connection state: `disconnected | connecting | handshaking | connected | error`

### 2. Session Sidebar

- Fetch sessions via `sessions.list` on connect
- Display session list with names/keys
- Click to switch active session
- Show active indicator (green dot)
- Default to `agent:main:main` session

### 3. Chat View

- **Message list**: scrollable, auto-scroll on new messages
- **Message bubbles**: user (right, accent color) vs assistant (left, dark)
- **Markdown rendering**: code blocks, bold, italic, links, lists
- **Streaming**: show delta text as it arrives, replace with final on completion
- **Loading indicator**: typing/thinking animation while waiting for response
- **Timestamps**: subtle timestamps on messages
- **Auto-scroll**: scroll to bottom on new messages, but respect manual scroll-up

### 4. Message Input

- Multi-line text input (auto-grow textarea)
- Send on Enter (Shift+Enter for newline)
- Send button
- Disabled while disconnected
- Stop button (calls `chat.abort`) while agent is responding

### 5. History

- Load history via `chat.history` when switching sessions
- Show previous messages on session load
- Scroll to bottom after history loads

### 6. Connection Status

- Status indicator in header (connected/disconnected/connecting)
- Auto-reconnect on drop
- Session selector + disconnect button

## Architecture

```
src/
  lib/
    gateway-client.ts     # Protocol-aware WS client (req/res, events, handshake)
  hooks/
    useGateway.ts         # React hook wrapping gateway-client
    useChat.ts            # Chat state: messages, send, abort, streaming
    useSessions.ts        # Session list + active session
  components/
    App.tsx               # Layout: sidebar + chat area
    Sidebar.tsx           # Session list
    ChatView.tsx          # Message list + input
    MessageBubble.tsx     # Single message with markdown
    MessageInput.tsx      # Textarea + send/stop
    ConnectScreen.tsx     # (existing) Auth form
    StatusBar.tsx         # Connection status indicator
  types/
    protocol.ts           # TypeScript types for Gateway protocol
    global.d.ts           # (existing) Window.api types
```

### Dependencies (new)

- `react-markdown` + `remark-gfm` — Markdown rendering
- `react-syntax-highlighter` — Code block syntax highlighting (or use a lightweight alternative)

### No New Dependencies (if possible)

Consider using a lightweight custom markdown renderer to avoid heavy deps. The Control UI uses Lit — we can go lighter.

## Non-Goals (this phase)

- File/image attachments
- Voice input/output
- Notion sidebar
- ClawMail integration
- System/admin commands (config, cron, etc.)
- Multi-agent switching (just sessions)

## Success Criteria

- User can connect, see sessions, send messages, and receive streamed responses
- History loads on session switch
- Markdown renders properly in messages
- Stop button aborts in-flight responses
- Reconnect works transparently after network drops

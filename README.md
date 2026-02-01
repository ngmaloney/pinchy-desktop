# 💬 ClawChat

A desktop chat client for [OpenClaw](https://github.com/openclaw/openclaw) — chat with your AI agent directly from your desktop.

![Logo](clawchat-logo.png)

![Electron](https://img.shields.io/badge/Electron-30-47848F?logo=electron)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

## Features

- **Full chat UI** — Send messages, receive streamed responses with live text updates
- **Markdown rendering** — Code blocks with syntax highlighting, bold, italic, links, lists
- **Image attachments** — Upload and view images inline (user→assistant, with workarounds for assistant→user)
- **Session management** — Switch between sessions from the sidebar
- **Gateway protocol v3** — Proper handshake, request/response correlation, event streaming
- **Auto-reconnect** — Exponential backoff reconnection on network drops
- **Persistent credentials** — Gateway URL and token saved locally via `electron-store`
- **Stop button** — Abort in-flight agent responses
- **DevTools toggle** — F12 or Ctrl+Shift+I to open developer tools

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A running [OpenClaw Gateway](https://docs.openclaw.ai)

### Install

```bash
git clone git@github.com:ngmaloney/clawchat.git
cd clawchat
npm install
```

### Run (dev mode)

```bash
npm run dev
```

This launches the Electron app with Vite HMR for the renderer process.

### Build

```bash
npm run build
```

Produces packaged Electron binaries via `electron-builder`.

## Connecting

1. Launch the app
2. Enter your Gateway URL (default: `ws://localhost:18789`)
3. Enter your Gateway auth token
4. Click **Connect**

Credentials are saved locally and the app will auto-connect on next launch.

> **Note:** The Gateway must have `gateway.controlUi.allowInsecureAuth: true` set in config if connecting over plain WebSocket without device identity.

## Architecture

```
electron/
  main.ts              # Electron main process + IPC handlers (electron-store, file dialogs)
  preload.ts           # Context bridge (secure API for renderer)

src/
  lib/
    gateway-client.ts  # Protocol-aware WebSocket client (handshake, req/res, events)
  hooks/
    useGateway.ts      # React hook wrapping GatewayClient
    useChat.ts         # Chat state: messages, send, abort, streaming, attachment filtering
    useSessions.ts     # Session list + active session management
  components/
    ConnectScreen.tsx   # Auth form (URL + token)
    Dashboard.tsx       # Main layout (sidebar + chat + status bar)
    Sidebar.tsx         # Session list
    ChatView.tsx        # Message list with auto-scroll + streaming indicator
    MessageBubble.tsx   # Individual message with markdown + syntax highlighting + attachments
    MessageInput.tsx    # Auto-grow textarea + send/stop buttons + file upload
    MessageAttachment.tsx # Display image/file attachments with size limits
    StatusBar.tsx       # Connection status indicator
  types/
    protocol.ts        # TypeScript types for Gateway WS protocol v3
    global.d.ts        # Window.api type declarations
```

## Tech Stack

- **Electron** — Desktop shell
- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tooling + HMR
- **react-markdown** + **remark-gfm** — Markdown rendering
- **react-syntax-highlighter** — Code block highlighting
- **electron-store** — Persistent local storage

## Roadmap

- [x] Phase 1: Scaffold (Electron + React + Vite + Tailwind)
- [x] Phase 2: WebSocket Connection & Auth
- [x] Phase 3: Chat UI (streaming, markdown, sessions)
- [x] Phase 3.5: File & Image Attachments (user→assistant)
- [ ] Phase 4: Assistant→user attachments (pending OpenClaw operator protocol support)
- [ ] Phase 5: Settings/Config Screen
- [ ] Phase 6: Session Management UI
- [ ] Future: Additional integrations

## Part of the Claw Family

ClawChat is part of the growing Claw ecosystem of AI agent tools:

- 🦀 **[ClawMail](https://clawmail.dev)** — Email proxy for AI agents
- 💬 **ClawChat** — Desktop chat client (this project)
- 📦 **ClawDrop** — Ephemeral file storage (coming soon)

## License

Private — not yet published.

## Website

[clawchat.dev](https://clawchat.dev)

# 💬 ClawChat

A desktop chat client for [OpenClaw](https://github.com/openclaw/openclaw) — chat with your AI agent directly from your desktop.

![ClawChat](clawchat-logo.png)

![Electron](https://img.shields.io/badge/Electron-30-47848F?logo=electron)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

## Privacy-First, Self-Hosted

ClawChat is designed to run entirely on your own network. Your conversations, credentials, and data never leave your infrastructure.

- **Local gateway connection** — Connect to your self-hosted OpenClaw gateway via WebSocket
- **Private credentials** — Stored locally on your machine, never transmitted to third parties
- **Full control** — Run OpenClaw on your own hardware, manage your own data
- **Air-gapped deployments** — Works without internet connectivity (gateway and client on local network)

## Features

- **Full chat UI** — Send messages, receive streamed responses with live text updates
- **Markdown rendering** — Code blocks with syntax highlighting, bold, italic, links, lists
- **Image attachments** — Upload and view images inline
- **Session management** — Switch between multiple chat sessions
- **Auto-reconnect** — Resilient WebSocket connection with exponential backoff
- **Persistent credentials** — Saved locally for auto-connect on launch
- **DevTools access** — F12 or Ctrl+Shift+I for debugging

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A running [OpenClaw Gateway](https://docs.openclaw.ai)

### Install

```bash
git clone git@github.com:ngmaloney/clawchat.git
cd clawchat
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Outputs packaged binaries to `release/` directory.

## Connecting

### Local Gateway

1. Launch ClawChat
2. Enter your gateway URL (e.g., `ws://localhost:18789`)
3. Enter your gateway auth token
4. Click **Connect**

Your credentials are saved locally and the app will auto-connect on subsequent launches.

### Remote Gateway via SSH Tunnel

If your OpenClaw gateway runs on a different machine (e.g., a dedicated server), use SSH port forwarding to securely tunnel the connection:

```bash
ssh -N -L 18789:127.0.0.1:18789 your-gateway-host
```

Example:
```bash
ssh -N -L 18789:127.0.0.1:18789 ts140
```

Then connect ClawChat to `ws://localhost:18789` as if the gateway were local. The SSH tunnel encrypts all traffic between your desktop and the gateway server.

> **Note:** For local WebSocket connections without device identity, ensure your gateway config has `gateway.controlUi.allowInsecureAuth: true` set.

## Tech Stack

- **Electron** — Cross-platform desktop runtime
- **React 18** — UI framework with hooks
- **TypeScript** — Type safety
- **Vite** — Fast build tooling with HMR
- **react-markdown** + **remark-gfm** — Markdown rendering
- **react-syntax-highlighter** — Code syntax highlighting
- **electron-store** — Local credential storage

## Architecture

ClawChat implements the OpenClaw Gateway Protocol v3, including proper handshake, request/response correlation, and event streaming.

```
electron/          # Main process (Node.js)
  main.ts          # App lifecycle, IPC handlers
  preload.ts       # Secure context bridge

src/               # Renderer process (React)
  lib/
    gateway-client.ts    # WebSocket protocol implementation
  hooks/
    useGateway.ts        # Connection state management
    useChat.ts           # Message & session state
  components/
    Dashboard.tsx        # Main UI layout
    ChatView.tsx         # Message list
    MessageInput.tsx     # Input with file upload
    ...
```

## Part of the Claw Ecosystem

- 🦀 **[ClawMail](https://clawmail.dev)** — Email proxy for AI agents
- 💬 **ClawChat** — Desktop chat client
- 📦 **ClawDrop** — Ephemeral file storage (coming soon)

All Claw tools prioritize privacy, self-hosting, and giving you complete control over your AI agent infrastructure.

## License

Private — not yet published.

---

**Website:** [clawchat.dev](https://clawchat.dev)

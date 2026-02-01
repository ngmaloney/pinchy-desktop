# PRD: Phase 2 — Authentication & WebSocket Connection
**Project:** Pinchy Desktop
**Status:** DRAFT

## 1. Overview
Implement the connection logic to link the Desktop Client with the local OpenClaw Gateway. This involves building the initial "Connect" screen, persisting credentials, and establishing a live WebSocket connection.

## 2. Functional Requirements

### 2.1 Connect Screen
- **UI:** Simple, clean form centered in the window.
- **Inputs:**
  - **Gateway URL:** Defaults to `ws://localhost:18789`.
  - **Auth Token:** Password field for the Gateway Token.
- **Actions:**
  - "Connect" button (disabled if inputs empty).
  - Loading state ("Connecting...") during handshake.
  - Error state ("Connection failed: Invalid token").

### 2.2 Persistence
- Use `electron-store` (via IPC) to save the URL and Token upon successful connection.
- **Auto-Connect:** On app launch, check store. If credentials exist, attempt connection immediately (skip Connect Screen).
- **Logout:** Button to clear credentials and return to Connect Screen.

### 2.3 WebSocket Integration
- **Library:** Native `WebSocket` API (wrapped in a React Context or Hook).
- **Protocol:** Connect to `ws://host:port/?token=...`.
- **Events:**
  - `onopen`: Update UI state to "Connected", switch to Main View.
  - `onclose`: Show disconnected warning, attempt reconnect (exponential backoff).
  - `onerror`: Show error toast/alert.

## 3. Technical Architecture

### 3.1 IPC Bridge (`electron/preload.ts`)
- Expose `window.api.store` methods:
  - `get(key)`
  - `set(key, value)`
  - `delete(key)`
- *Note:* We do not expose the raw Token to the renderer indefinitely; ideally, we load it into memory. For V1, simple store access is acceptable.

### 3.2 State Management
- **Store:** `useGatewayStore` (Zustand) to hold:
  - `socket`: WebSocket instance (or reference).
  - `status`: `disconnected` | `connecting` | `connected` | `error`.
  - `gatewayUrl`: string.
  - `token`: string (in memory).

## 4. Deliverables
- [ ] `ConnectScreen.tsx` component.
- [ ] IPC handlers for `electron-store` in Main process.
- [ ] `useGateway` hook for socket management.
- [ ] Successful connection verified by receiving the initial "Hello" or state packet from Gateway.

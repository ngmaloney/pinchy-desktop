# Pinchy Desktop - Backlog

## Features

### Settings/Config Screen
- [ ] Add settings screen accessible from Dashboard
- [ ] Settings options:
  - Gateway URL and token (editable, not just stored)
  - Toggle developer tools (keyboard shortcut + menu item)
  - Theme selection (if we add themes later)
  - Notification preferences
  - Session management (clear history, etc.)
- [ ] Keyboard shortcut to open settings (e.g., Cmd/Ctrl+,)
- [ ] Persist settings in electron-store

### Assistant Image Attachments
- [ ] **Blocked**: Waiting on OpenClaw to add `attachments` to operator WebSocket protocol chat events
- [ ] Current state: User → Assistant images work, Assistant → User images don't
- [ ] Issue: OpenClaw sends attachments to channels (Discord, Telegram) but not to operator clients
- [ ] Once OpenClaw adds support, Pinchy Desktop is ready (attachment rendering already implemented)

### Session Management
- [ ] Session list view (switch between sessions)
- [ ] Session search/filter
- [ ] Session labels/tags
- [ ] Delete/archive old sessions

### Enhanced Chat Features
- [ ] Message editing
- [ ] Message deletion
- [ ] Message search within session
- [ ] Markdown preview toggle
- [ ] Code block copy button
- [ ] Syntax highlighting theme options

### Notifications
- [ ] Desktop notifications for new messages when app is in background
- [ ] Sound effects (toggleable)
- [ ] Badge count on app icon

### Performance
- [ ] Virtual scrolling for large message histories
- [ ] Message pagination (load older messages on demand)
- [ ] Optimize large attachment handling

### Platform
- [ ] Windows build and testing
- [ ] macOS build and testing (currently Linux-focused)
- [ ] Auto-update mechanism
- [ ] Proper app icon (replace default Electron icon)

## Bug Fixes

### Known Issues
- None currently tracked

## Documentation
- [ ] Add screenshots to README
- [ ] Document keyboard shortcuts
- [ ] Add development setup guide
- [ ] Add troubleshooting section

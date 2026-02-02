# ClawChat Feature Backlog

## 🔥 In Progress

### Auto-refresh session list on `/new` command
**Status:** In development (feature/session-creation-ui-update)  
**Priority:** High  
**Assignee:** Pinchy

**Problem:**
When a user types `/new` to create a new session, ClawChat doesn't update the UI:
- New session is created on the gateway ✅
- Sidebar doesn't refresh to show the new session ❌
- User can't see or switch to the new session ❌
- Workaround: Close and reopen ClawChat (not acceptable)

**Expected Behavior:**
1. User types `/new` in message input
2. Gateway creates new session and returns sessionKey
3. ClawChat intercepts the response
4. Sidebar refreshes and shows new session
5. UI auto-switches to the new session (or highlights it for manual switch)

**Technical Approach:**
- Detect `/new` command in useChat hook
- After receiving response, call `refetchSessions()` from useSessions
- Auto-select the newly created session
- Update UI to reflect active session

**Files to modify:**
- `src/hooks/useChat.ts` - Intercept `/new` response
- `src/hooks/useSessions.ts` - Add refresh trigger
- `src/components/Sidebar.tsx` - Update active session highlight

**Acceptance Criteria:**
- [ ] User types `/new` and sends message
- [ ] Sidebar updates within 1 second showing new session
- [ ] New session is auto-selected (or clearly highlighted)
- [ ] User can immediately start chatting in new session
- [ ] No page refresh required

---

## 📋 Future Enhancements

### Node Mode (camera, screen, system commands)
**Status:** Future  
**Branch:** feature/node-mode-poc (experimental)

Cross-platform node capabilities for Windows/Linux users. Implementation paused pending protocol clarity.


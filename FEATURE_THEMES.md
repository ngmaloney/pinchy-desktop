# Feature Enhancement: Custom Skins/Themes

## Summary
Add customizable UI themes to ClawChat, allowing users to switch between different visual styles for a personalized experience.

## Proposed Themes

### 1. Retro Mac OS (Classic)
- **Inspiration**: Mac OS 9 / early Mac OS X aesthetic
- **Visual Elements**:
  - Platinum/Aqua color scheme (brushed metal or pinstripes)
  - Classic Mac window controls (colored traffic lights: red/yellow/green)
  - System font: Chicago or Geneva
  - Subtle drop shadows and beveled edges
  - Classic Mac menu bar styling
- **Color Palette**: Grays, silvers, light blues
- **Target Feel**: Nostalgic, warm, friendly

### 2. Retro Windows (Classic)
- **Inspiration**: Windows 95/98/XP aesthetic
- **Visual Elements**:
  - Classic Windows blue title bars (#0000AA)
  - Windows 95-style 3D beveled borders
  - System font: MS Sans Serif or Tahoma
  - Start button-inspired UI elements
  - Classic taskbar-style status bar
- **Color Palette**: Teal/gray (#008080), Windows blue, silver
- **Target Feel**: Nostalgic, utilitarian, clean

### 3. Terminal/Hacker Theme
- **Inspiration**: Classic terminal emulators (green screen, amber, etc.)
- **Visual Elements**:
  - Monospace fonts (Fira Code, JetBrains Mono, or Courier)
  - CRT scanline effects (optional, subtle)
  - Minimal chrome, focus on text
  - Blinking cursor
  - Multiple color schemes:
    - Green on black (classic terminal)
    - Amber on black (vintage VT100)
    - White/gray on dark (modern terminal)
- **Color Palette**: High contrast, dark backgrounds
- **Target Feel**: Technical, focused, minimalist

## Implementation Ideas

### Theme System Architecture
```typescript
interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
    border: string;
    // ... more color definitions
  };
  fonts: {
    primary: string;
    mono: string;
    size: string;
  };
  effects?: {
    scanlines?: boolean;
    shadows?: string;
    borders?: string;
  };
}
```

### Storage
- Store selected theme in `electron-store` (same as credentials)
- Auto-apply on launch
- Export/import custom themes (future enhancement)

### UI Controls
- Settings panel accessible via:
  - Menu: `View > Themes`
  - Keyboard shortcut: `Cmd/Ctrl + T`
  - Slash command: `/theme`
- Theme preview thumbnails
- Live preview (apply without saving)

### CSS Implementation
- Use CSS custom properties (CSS variables) for all themeable values
- Single source of truth for theme definitions
- Smooth transitions between theme switches

## Benefits
- **Personalization**: Users can match their aesthetic preferences
- **Accessibility**: Different contrast levels for different needs
- **Fun Factor**: Nostalgia and personality
- **Differentiation**: Sets ClawChat apart from generic Electron apps
- **Community**: Could accept user-contributed themes (future)

## Technical Considerations
- Bundle retro fonts or use system fallbacks?
- Performance impact of visual effects (scanlines, shadows)
- Ensure accessibility (contrast ratios) for all themes
- Test on all platforms (Mac, Windows, Linux)

## Future Enhancements
- User-created custom themes (JSON config)
- Theme marketplace/repository
- Per-session themes
- Time-based theme switching (light during day, dark at night)
- More retro themes (Commodore 64, Amiga Workbench, BeOS)

## Priority
**Medium** — Nice-to-have enhancement that adds personality and user delight without being critical to core functionality.

## Mockup Ideas
(To be added: screenshots or wireframes showing each theme)

---

**Related:**
- Could tie into broader settings panel (#TBD)
- Might want to add keyboard shortcut customization at the same time

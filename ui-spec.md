# Ping Pong Game — UI Specification

**Version**: 1.0.0
**Style**: Retro Arcade Neon
**Target**: Desktop + Mobile

---

## 1. Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| `--bg-primary` | `#0a0a1a` | Page background |
| `--bg-secondary` | `#12122e` | Card/dialog backgrounds |
| `--bg-overlay` | `rgba(10, 10, 26, 0.9)` | Modal overlays |

### Neon Accents
| Name | Hex | Usage |
|------|-----|-------|
| `--neon-cyan` | `#00f0ff` | Primary accent, player paddle, highlights |
| `--neon-magenta` | `#ff00aa` | Secondary accent, opponent paddle |
| `--neon-lime` | `#39ff14` | Success, score increments, active states |
| `--neon-yellow` | `#ffee00` | Warnings, countdown timer |
| `--neon-red` | `#ff2a2a` | Failures, quit button |

### Neutral
| Name | Hex | Usage |
|------|-----|-------|
| `--text-primary` | `#ffffff` | Headings, primary text |
| `--text-secondary` | `#b8b8d0` | Body text, descriptions |
| `--text-muted` | `#68688a` | Placeholders, disabled |
| `--border-subtle` | `rgba(0, 240, 255, 0.2)` | Card borders |
| `--border-glow` | `rgba(0, 240, 255, 0.6)` | Focus states |

### Game Elements
| Name | Hex | Usage |
|------|-----|-------|
| `--ball-glow` | `#00f0ff` | Ball with glow effect |
| `--paddle-player` | `#00f0ff` | Player paddle (left) |
| `--paddle-ai` | `#ff00aa` | AI paddle (right) |
| `--center-line` | `rgba(255, 255, 255, 0.15)` | Court center line |
| `--wall-color` | `#ffffff` | Top/bottom walls |

---

## 2. Typography

| Role | Font | Size | Weight | Usage |
|------|------|------|--------|-------|
| Display | 'Press Start 2P', monospace | 48px | 400 | Game title |
| H1 | 'Press Start 2P', monospace | 32px | 400 | Screen headings |
| H2 | 'Press Start 2P', monospace | 24px | 400 | Section headings |
| Score | 'Press Start 2P', monospace | 64px | 400 | In-game score |
| Body | 'Inter', sans-serif | 16px | 400 | Paragraphs, descriptions |
| Caption | 'Inter', sans-serif | 12px | 400 | Labels, metadata |
| Button | 'Press Start 2P', monospace | 14px | 400 | Button text |

**Fallback stack**: `'Press Start 2P', 'Courier New', monospace`

---

## 3. Game Screens

### 3.1 Title Screen
```
+------------------------------------------+
|                                          |
|     [Neon Title: PING PONG]              |
|     (Cyan pulse animation)               |
|                                          |
|     ┌──────────────────────┐             |
|     │   START GAME         │ ← Primary  |
|     └──────────────────────┘             |
|                                          |
|     ┌──────────────────────┐             |
|     │   LEADERBOARD        │ ← Secondary|
|     └──────────────────────┘             |
|                                          |
|     ┌──────────────────────┐             |
|     │   SETTINGS           │ ← Secondary|
|     └──────────────────────┘             |
|                                          |
|     [Version 1.0]                        |
+------------------------------------------+
```

### 3.2 Gameplay Screen
```
+------------------------------------------+
|  ┌──────────┐                            |
|  │   05     │  Player Score (Cyan)      |
|  └──────────┘                            |
|                                          |
|     |                                    |
|     |  [Ball]   →   (AI Paddle)         |
|     |            (Magenta)               |
|  (Player Paddle)                         |
|     (Cyan)                               |
|                                          |
|  ┌──────────┐                            |
|  │   03     │  AI Score (Magenta)       |
|  └──────────┘                            |
|                                          |
|  [ESC] Pause  |  FPS: 60                 |
+------------------------------------------+
```

### 3.3 Pause Overlay (50% opacity background)
```
+------------------------------------------+
|                                          |
|     ┌──────────────────────┐             |
|     │     PAUSED           │             |
|     └──────────────────────┘             |
|                                          |
|     ┌──────────────────────┐             |
|     │   RESUME             │             |
|     └──────────────────────┘             |
|                                          |
|     ┌──────────────────────┐             |
|     │   RESTART            │             |
|     └──────────────────────┘             |
|                                          |
|     ┌──────────────────────┐             |
|     │   MENU               │             |
|     └──────────────────────┘             |
+------------------------------------------+
```

### 3.4 Game Over Screen
```
+------------------------------------------+
|                                          |
|     YOU WIN / YOU LOSE                   |
|     (Lime / Red neon glow)               |
|                                          |
|     FINAL SCORE: 11 - 7                  |
|                                          |
|     ┌──────────────────────┐             |
|     │   PLAY AGAIN         │             |
|     └──────────────────────┘             |
|                                          |
|     ┌──────────────────────┐             |
|     │   SUBMIT SCORE       │             |
|     └──────────────────────┘             |
|                                          |
|     [OR PRESS ENTER]                     |
+------------------------------------------+
```

### 3.5 Leaderboard Screen
```
+------------------------------------------+
|     HIGH SCORES                          |
|                                          |
|     Rank  Player        Score  Date      |
|     ───────────────────────────────────  |
|     1    NEON_KING      2500   06/05    |
|     2    PADDLE_PRO     1800   06/05    |
|          (Cyan row highlight)            |
|                                            |
|     [Your Best: 1200]                    |
|                                          |
|     ┌──────────────────────┐             |
|     │   BACK TO MENU       │             |
|     └──────────────────────┘             |
+------------------------------------------+
```

---

## 4. Component Specifications

### 4.1 Buttons

**Primary Button (Start Game)**
- Background: `--neon-cyan` at 15% opacity
- Border: 2px solid `--neon-cyan`
- Text: `--neon-cyan`
- Padding: 16px 32px
- Border-radius: 4px
- Hover: Background increases to 30%, glow shadow appears
- Active: Scale to 0.98
- Font: Press Start 2P, 14px

**Secondary Button (Leaderboard, Settings)**
- Background: transparent
- Border: 2px solid `--border-subtle`
- Text: `--text-secondary`
- Hover: Border brightens to `--border-glow`, text becomes white

**Danger Button (Quit)**
- Background: `--neon-red` at 15% opacity
- Border: 2px solid `--neon-red`
- Text: `--neon-red`

### 4.2 Cards / Panels
- Background: `--bg-secondary`
- Border: 1px solid `--border-subtle`
- Border-radius: 8px
- Padding: 24px
- Box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5)

### 4.3 Score Display
- Font: Press Start 2P, 64px
- Player score: `--neon-cyan` with text-shadow glow
- AI score: `--neon-magenta` with text-shadow glow
- Position: Top corners of game area

### 4.4 Input Fields
- Background: `--bg-primary`
- Border: 1px solid `--border-subtle`
- Text: `--text-primary`
- Placeholder: `--text-muted`
- Focus: Border color transitions to `--neon-cyan`, subtle glow
- Border-radius: 4px
- Padding: 12px 16px

---

## 5. Animations

| Animation | Duration | Easing | Description |
|-----------|----------|--------|-------------|
| Button hover | 200ms | ease-out | Background opacity 15% → 30%, scale 1.02 |
| Button press | 100ms | ease-in | Scale 1.0 → 0.98 |
| Menu fade in | 400ms | ease-out | Opacity 0 → 1, translateY(20px) → 0 |
| Score pop | 300ms | cubic-bezier(0.175, 0.885, 0.32, 1.275) | Scale 1.5 → 1.0, lime flash |
| Game over text | 600ms | ease-out | Scale 0.5 → 1.0, glow intensifies |
| Neon pulse | 2s | ease-in-out | Infinite text-shadow intensity oscillation |
| Ball trail | 100ms | linear | Fade out trail segments |

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Adjustments |
|------------|-------|-------------|
| Mobile | < 640px | Single column, 32px score font, full-screen canvas |
| Tablet | 640-1024px | Two column possible, 48px score font |
| Desktop | > 1024px | Max-width 1200px centered, 64px score font |

### Mobile-Specific
- Touch controls: Full-height left/right paddle zones
- Swipe up/down for paddle movement
- Virtual pause button (top-right corner, 44x44px)
- Prevent default touch behaviors (scrolling, zooming)

---

## 7. Accessibility

- Color contrast ratios all ≥ WCAG AA (4.5:1 for text)
- Focus indicators: 2px solid `--neon-cyan` outline
- Reduced motion: Disable particle effects and neon pulse
- Keyboard navigation: Tab through all interactive elements
- ARIA labels on all buttons and interactive canvas zones

---

## 8. Asset Requirements

### Fonts
- Google Fonts: Press Start 2P (display), Inter (body)

### Icons (optional, could use text)
- Pause: ⏸ or "II"
- Play: ▶ or ">"
- Sound on/off: ♪ / ♪̸
- Trophy: 🏆
- Gear: ⚙

### Canvas Effects (procedural)
- Ball glow: Radial gradient + shadowBlur
- Paddle glow: Shadow with neon colors
- Trail: Array of fading circles
- Particle spark: Small squares/blocks on collision

# Menus Design Document

> **Component:** `PauseMenu`, `GameOverScreen`, `ConfirmDialog`  
> **Design System:** rally-pro-3d  
> **Aesthetic:** Retro-Futurism Neon  
> **Based on:** `ui-component-registry.json` — PauseMenu, GameOverScreen

---

## Overview

Menu overlays handle game flow interruptions: pausing mid-match, presenting end-of-match results, and confirming destructive actions. All menus use a glassmorphism-neon hybrid treatment with backdrop blur and neon borders. They must fully capture pointer events to prevent interaction with the game beneath.

---

## Color Tokens

| Token | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Primary Neon | `#7C3AED` | `--neon-primary` | Borders, accents, WIN badge |
| Secondary Neon | `#A78BFA` | `--neon-secondary` | Subtitles, secondary borders |
| CTA Neon | `#F43F5E` | `--neon-cta` | Restart, quit, LOSS badge |
| Background | `#0F0F23` | `--color-background` | Modal bg, overlay bg |
| Surface | `#1A1A2E` | `--color-surface` | Panels, buttons, cards |
| Text Primary | `#E2E8F0` | `--color-text` | Headings, scores |
| Text Muted | `#94A3B8` | `--color-text-muted` | Descriptions, labels |
| Neon Cyan | `#06B6D4` | `--neon-cyan` | Focus rings, DRAW badge |
| Neon Green | `#10B981` | `--neon-green` | Resume buttons, WIN glow |
| Neon Amber | `#F59E0B` | `--neon-amber` | Warning text, stats highlights |
| Neon Red | `#EF4444` | `--neon-red` | Danger actions, error borders |

---

## Typography

```css
.font-menu-heading {
  font-family: 'Press Start 2P', cursive;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.font-menu-body {
  font-family: 'VT323', monospace;
  letter-spacing: 0.03em;
}
```

| Element | Font | Desktop | Mobile | Line Height |
|---------|------|---------|--------|-------------|
| Menu Title | Press Start 2P | 28px | 18px | 1.3 |
| Result Banner | Press Start 2P | 48px | 28px | 1.2 |
| Score Display | Press Start 2P | 36px | 22px | 1.1 |
| Stat Value | VT323 | 32px | 20px | 1.2 |
| Stat Label | VT323 | 18px | 14px | 1.3 |
| Button Text | Press Start 2P | 12px | 9px | 1.4 |
| Dialog Text | VT323 | 22px | 16px | 1.4 |

---

## Layout Structure

### Pause Menu

```
.pause-overlay                 /* Fixed full-screen, z-index: 20 */
  .pause-backdrop              /* Backdrop blur + darkening */
  .pause-modal                 /* Centered card */
    .pause-title               /* "PAUSED" */
    .pause-divider             /* Neon horizontal line */
    .pause-buttons             /* Vertical stack */
      .btn-neon-resume         /* Resume Game */
      .btn-neon-secondary      /* Settings (optional) */
      .btn-neon-restart        /* Restart Match */
      .btn-neon-danger         /* Quit to Menu */
```

### Game Over Screen

```
.gameover-overlay              /* Fixed full-screen, z-index: 20 */
  .gameover-backdrop           /* Backdrop blur + darkening */
  .gameover-container          /* Centered content */
    .result-banner             /* WIN / LOSS / DRAW */
      .result-icon             /* Trophy / Skull / Scale SVG */
      .result-text             /* "YOU WIN!" etc. */
    .final-score-board         /* Player vs Opponent score */
      .score-final--player
      .score-final--opponent
    .stats-grid                /* 2x2 or 1x4 grid */
      .stat-card               /* Duration, Longest Rally, Total Rallies, Difficulty */
    .rank-badge                /* "RANK #42" (if achieved) */
    .action-buttons            /* Play Again / Main Menu / Submit Score */
```

### Confirmation Dialog

```
.confirm-overlay              /* Fixed full-screen, z-index: 30 */
  .confirm-backdrop           /* Darker than pause */
  .confirm-modal              /* Compact centered card */
    .confirm-icon             /* Warning triangle SVG */
    .confirm-title            /* "Quit to Menu?" */
    .confirm-message          /* "Progress will be lost." */
    .confirm-actions          /* Horizontal button row */
      .btn-neon-secondary     /* Cancel */
      .btn-neon-danger        /* Confirm */
```

---

## Core CSS Classes

### Shared Overlay & Backdrop

```css
.menu-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  opacity: 0;
  transition: opacity 300ms ease;
}

.menu-overlay--open {
  opacity: 1;
}

.menu-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 15, 35, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.menu-modal {
  position: relative;
  background: var(--color-surface);
  border: 2px solid var(--neon-primary);
  border-radius: 12px;
  padding: var(--space-2xl);
  box-shadow:
    0 0 20px rgba(124, 58, 237, 0.2),
    0 0 60px rgba(124, 58, 237, 0.1),
    0 20px 40px rgba(0, 0, 0, 0.4);
  max-width: 480px;
  width: 90%;
  transform: scale(0.9) translateY(20px);
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 21;
}

.menu-overlay--open .menu-modal {
  transform: scale(1) translateY(0);
}

/* Modal closing state */
.menu-overlay--closing {
  opacity: 0;
}

.menu-overlay--closing .menu-modal {
  transform: scale(0.95) translateY(10px);
}
```

### Pause Menu Specifics

```css
.pause-title {
  font-family: 'Press Start 2P', cursive;
  font-size: 28px;
  color: var(--color-text);
  text-align: center;
  text-shadow:
    0 0 10px var(--neon-primary),
    0 0 20px var(--neon-primary);
  animation: menu-glitch 0.6s ease-out;
}

.pause-divider {
  width: 60%;
  height: 2px;
  margin: var(--space-lg) auto;
  background: linear-gradient(90deg, transparent, var(--neon-primary), transparent);
  box-shadow: 0 0 8px var(--neon-primary);
}

.pause-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}
```

### Game Over Specifics

```css
.gameover-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-2xl);
  background: var(--color-surface);
  border: 2px solid var(--neon-primary);
  border-radius: 16px;
  box-shadow:
    0 0 30px rgba(124, 58, 237, 0.2),
    0 0 80px rgba(124, 58, 237, 0.1),
    0 25px 50px rgba(0, 0, 0, 0.5);
  z-index: 21;
  transform: scale(0.9);
  transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.menu-overlay--open .gameover-container {
  transform: scale(1);
}

.result-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.result-icon {
  width: 64px;
  height: 64px;
  filter: drop-shadow(0 0 10px currentColor);
}

.result-text {
  font-family: 'Press Start 2P', cursive;
  font-size: 48px;
  text-align: center;
}

.result-text--win {
  color: var(--neon-green);
  text-shadow:
    0 0 10px var(--neon-green),
    0 0 30px var(--neon-green),
    0 0 60px rgba(16, 185, 129, 0.4);
  animation: result-glow 2s infinite alternate;
}

.result-text--loss {
  color: var(--neon-cta);
  text-shadow:
    0 0 10px var(--neon-cta),
    0 0 30px var(--neon-cta);
}

.result-text--draw {
  color: var(--neon-cyan);
  text-shadow:
    0 0 10px var(--neon-cyan),
    0 0 30px var(--neon-cyan);
}

.final-score-board {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
  padding: var(--space-lg) var(--space-xl);
  background: rgba(15, 15, 35, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.score-final {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-final__value {
  font-family: 'Press Start 2P', cursive;
  font-size: 36px;
  color: var(--color-text);
}

.score-final__label {
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}

.score-final__divider {
  font-family: 'Press Start 2P', cursive;
  font-size: 24px;
  color: var(--color-text-muted);
  opacity: 0.5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  width: 100%;
  margin-bottom: var(--space-xl);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-md);
  background: rgba(15, 15, 35, 0.5);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 8px;
  transition: all 200ms ease;
}

.stat-card:hover {
  border-color: rgba(124, 58, 237, 0.5);
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.1);
  transform: translateY(-2px);
}

.stat-card__value {
  font-family: 'VT323', monospace;
  font-size: 32px;
  color: var(--neon-amber);
  text-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}

.stat-card__label {
  font-family: 'VT323', monospace;
  font-size: 16px;
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}

.rank-badge {
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  padding: var(--space-sm) var(--space-lg);
  background: linear-gradient(135deg, var(--neon-primary), var(--neon-cta));
  color: white;
  border-radius: 4px;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
  margin-bottom: var(--space-xl);
  animation: rank-pop 500ms ease-out;
}

.gameover-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-md);
  width: 100%;
}
```

### Confirmation Dialog Specifics

```css
.confirm-modal {
  max-width: 400px;
  padding: var(--space-xl);
  border-color: var(--neon-amber);
  box-shadow:
    0 0 20px rgba(245, 158, 11, 0.2),
    0 0 50px rgba(245, 158, 11, 0.1);
}

.confirm-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--space-md);
  color: var(--neon-amber);
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.5));
}

.confirm-title {
  font-family: 'Press Start 2P', cursive;
  font-size: 18px;
  color: var(--color-text);
  text-align: center;
  margin-bottom: var(--space-sm);
}

.confirm-message {
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: var(--color-text-muted);
  text-align: center;
  margin-bottom: var(--space-xl);
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}
```

### Button Variants

```css
.btn-neon-resume {
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  text-transform: uppercase;
  padding: 14px 32px;
  background: var(--neon-green);
  color: white;
  border: 2px solid var(--neon-green);
  border-radius: 4px;
  cursor: pointer;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
  transition: all 200ms ease;
}

.btn-neon-resume:hover {
  background: #34d399;
  border-color: #34d399;
  box-shadow: 0 0 24px rgba(16, 185, 129, 0.6), 0 0 48px rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

.btn-neon-restart {
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  text-transform: uppercase;
  padding: 14px 32px;
  background: transparent;
  color: var(--neon-amber);
  border: 2px solid var(--neon-amber);
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.2);
  transition: all 200ms ease;
}

.btn-neon-restart:hover {
  background: rgba(245, 158, 11, 0.1);
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.4), 0 0 32px rgba(245, 158, 11, 0.2);
  transform: translateY(-2px);
}

.btn-neon-danger {
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  text-transform: uppercase;
  padding: 14px 32px;
  background: transparent;
  color: var(--neon-red);
  border: 2px solid var(--neon-red);
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.2);
  transition: all 200ms ease;
}

.btn-neon-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  box-shadow: 0 0 16px rgba(239, 68, 68, 0.4), 0 0 32px rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

.btn-neon-submit {
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  text-transform: uppercase;
  padding: 14px 32px;
  background: var(--neon-primary);
  color: white;
  border: 2px solid var(--neon-primary);
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.4);
  transition: all 200ms ease;
}

.btn-neon-submit:hover {
  background: #8b5cf6;
  box-shadow: 0 0 24px rgba(124, 58, 237, 0.6), 0 0 48px rgba(124, 58, 237, 0.3);
  transform: translateY(-2px);
}
```

---

## Animations & Keyframes

```css
/* Menu glitch entrance */
@keyframes menu-glitch {
  0% {
    opacity: 0;
    transform: translateX(-15px);
    clip-path: inset(0 100% 0 0);
  }
  30% {
    opacity: 1;
    transform: translateX(8px);
    clip-path: inset(0 40% 0 0);
  }
  60% {
    transform: translateX(-4px);
    clip-path: inset(0 20% 0 0);
  }
  100% {
    transform: translateX(0);
    clip-path: inset(0 0 0 0);
  }
}

/* Result banner glow pulse */
@keyframes result-glow {
  0% {
    text-shadow:
      0 0 10px var(--neon-green),
      0 0 30px var(--neon-green),
      0 0 60px rgba(16, 185, 129, 0.4);
  }
  100% {
    text-shadow:
      0 0 15px var(--neon-green),
      0 0 40px var(--neon-green),
      0 0 80px rgba(16, 185, 129, 0.6),
      0 0 120px rgba(16, 185, 129, 0.3);
  }
}

/* Rank badge pop-in */
@keyframes rank-pop {
  0% {
    transform: scale(0) rotate(-10deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.1) rotate(2deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

/* Stats stagger reveal */
@keyframes stat-reveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply stagger to stat cards */
.stat-card:nth-child(1) { animation: stat-reveal 300ms ease-out 0.1s both; }
.stat-card:nth-child(2) { animation: stat-reveal 300ms ease-out 0.2s both; }
.stat-card:nth-child(3) { animation: stat-reveal 300ms ease-out 0.3s both; }
.stat-card:nth-child(4) { animation: stat-reveal 300ms ease-out 0.4s both; }
```

---

## Interaction States

| Element | State | Visual Treatment |
|---------|-------|------------------|
| `.menu-overlay` | Closed | opacity: 0, pointer-events: none |
| | Opening | opacity: 0 -> 1 (300ms) |
| | Open | opacity: 1, modal scaled in |
| | Closing | opacity: 1 -> 0 (250ms), modal scale down |
| `.btn-neon-resume` | Default | Green bg, green glow |
| | Hover | Brighter green, expanded glow, translateY(-2px) |
| | Active | translateY(0), reduced glow |
| `.btn-neon-restart` | Default | Amber border, transparent bg |
| | Hover | Amber tint, expanded glow |
| `.btn-neon-danger` | Default | Red border, transparent bg |
| | Hover | Red tint, expanded glow |
| `.btn-neon-submit` | Default | Purple bg, purple glow |
| | Hover | Brighter purple, expanded glow |
| `.stat-card` | Default | Subtle border, dark bg |
| | Hover | Brighter border, slight lift, glow |
| `.result-text--win` | Default | `result-glow` infinite alternate |

---

## Responsive Breakpoints

```css
/* Mobile: 375px */
@media (max-width: 767px) {
  .menu-modal { padding: var(--space-lg); }
  .gameover-container { padding: var(--space-lg); max-height: 85vh; }
  .pause-title { font-size: 18px; }
  .result-text { font-size: 28px; }
  .result-icon { width: 40px; height: 40px; }
  .score-final__value { font-size: 22px; }
  .score-final__label { font-size: 14px; }
  .stats-grid { grid-template-columns: 1fr; }
  .stat-card__value { font-size: 24px; }
  .stat-card__label { font-size: 14px; }
  .rank-badge { font-size: 10px; }
  .btn-neon-resume,
  .btn-neon-restart,
  .btn-neon-danger,
  .btn-neon-submit { font-size: 9px; padding: 10px 20px; }
  .confirm-title { font-size: 14px; }
  .confirm-message { font-size: 16px; }
}

/* Tablet: 768px */
@media (min-width: 768px) and (max-width: 1023px) {
  .result-text { font-size: 36px; }
  .score-final__value { font-size: 28px; }
}

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) {
  .pause-title { font-size: 32px; }
  .result-text { font-size: 56px; }
  .score-final__value { font-size: 42px; }
  .stat-card__value { font-size: 36px; }
  .menu-modal { max-width: 520px; }
  .gameover-container { max-width: 700px; }
}
```

---

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .pause-title,
  .result-text--win,
  .rank-badge,
  .stat-card {
    animation: none;
  }
  .menu-overlay,
  .menu-modal,
  .gameover-container {
    transition: none;
  }
  * { transition-duration: 0.01ms !important; }
}

/* Keyboard focus */
*:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 3px;
}

/* Ensure sufficient contrast for all button states */
.btn-neon-resume,
.btn-neon-submit {
  color: #fff;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## State Transitions

| Transition | Duration | Easing | Effect |
|------------|----------|--------|--------|
| Pause open | 300ms | ease | Backdrop opacity, modal scale + translateY |
| Pause close | 250ms | ease-in | Reverse |
| Game Over enter | 400ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Scale bounce-in |
| Game Over exit | 300ms | ease-in | Scale down + fade |
| Confirm open | 300ms | ease | Same as pause |
| Confirm close | 250ms | ease-in | Reverse |
| Stat reveal | 300ms each | ease-out | Staggered 100ms |
| Rank badge | 500ms | ease-out | Scale + rotate pop |

---

## Slots & Overrides

| Slot | Selector | Purpose |
|------|----------|---------|
| `menu_buttons` | `.pause-buttons` | Pause action buttons |
| `background_blur` | `.menu-backdrop` | Backdrop blur layer |
| `result_banner` | `.result-banner` | WIN/LOSS/DRAW display |
| `score_board` | `.final-score-board` | Final scores |
| `stats_grid` | `.stats-grid` | Match statistics cards |
| `action_buttons` | `.gameover-actions` | Post-match actions |

# HUD Design Document

> **Component:** `HUD`  
> **Design System:** rally-pro-3d  
> **Aesthetic:** Retro-Futurism Neon  
> **Based on:** `ui-component-registry.json` — HUD, CountdownOverlay, ScoreCelebration, NotificationToast

---

## Overview

The HUD (Heads-Up Display) is the persistent in-game overlay visible during `PLAYING` and `SERVING` states. It displays real-time match information: score, sets, serve indicator, timer, difficulty badge, rally count, and provides access to pause. All HUD elements must not obstruct gameplay and should fade subtly when not actively updating.

---

## Color Tokens

| Token | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Primary Neon | `#7C3AED` | `--neon-primary` | Player indicators, borders |
| Secondary Neon | `#A78BFA` | `--neon-secondary` | Subtle accents |
| CTA Neon | `#F43F5E` | `--neon-cta` | Opponent indicators, alerts |
| Background | `#0F0F23` | `--color-background` | HUD panel bg |
| Surface | `#1A1A2E` | `--color-surface` | Score boxes, badges |
| Text Primary | `#E2E8F0` | `--color-text` | Scores, labels |
| Text Muted | `#94A3B8` | `--color-text-muted` | Timer, rally count |
| Neon Cyan | `#06B6D4` | `--neon-cyan` | Serve indicator, active states |
| Neon Green | `#10B981` | `--neon-green` | Player 1 accent, win glow |
| Neon Amber | `#F59E0B` | `--neon-amber` | Warning, low time |
| Neon Red | `#EF4444` | `--neon-red` | Match point, danger |

---

## Typography

```css
.font-hud-display {
  font-family: 'Press Start 2P', cursive;
  text-transform: uppercase;
}

.font-hud-body {
  font-family: 'VT323', monospace;
}
```

| Element | Font | Desktop | Mobile | Line Height |
|---------|------|---------|--------|-------------|
| Score | Press Start 2P | 64px | 36px | 1.1 |
| Sets | Press Start 2P | 14px | 10px | 1.4 |
| Timer | VT323 | 24px | 16px | 1.2 |
| Difficulty Badge | Press Start 2P | 10px | 8px | 1.4 |
| Rally Count | VT323 | 20px | 14px | 1.2 |
| Serve Indicator | Press Start 2P | 12px | 8px | 1.4 |
| Countdown Number | Press Start 2P | 120px | 72px | 1.0 |

---

## Layout Structure

```
.hud-overlay                    /* Fixed, full viewport, pointer-events: none */
  .hud-top-bar                  /* Top flex row, space-between */
    .hud-difficulty-badge       /* Top-left corner */
    .hud-timer                  /* Top-center */
    .hud-pause-btn              /* Top-right, pointer-events: auto */
  .hud-score-area               /* Centered horizontally, upper third */
    .hud-score-box--player      /* Left score panel */
      .hud-score-value          /* Big number */
      .hud-score-label          /* "YOU" */
      .hud-sets-indicator       /* Small circles for sets won */
    .hud-score-divider          /* Neon vertical line or "-" */
    .hud-score-box--opponent    /* Right score panel */
      .hud-score-value
      .hud-score-label          /* "CPU" */
      .hud-sets-indicator
  .hud-rally-bar                /* Below score area */
    .hud-rally-label            /* "RALLY" */
    .hud-rally-value            /* Number */
  .hud-serve-indicator          /* Center, below rally bar */
    .serve-arrow--left          /* Animated arrow pointing to server */
    .serve-text                 /* "SERVE" */
    .serve-arrow--right
  .countdown-overlay            /* Full-screen overlay, z-index above HUD */
    .countdown-number           /* 3, 2, 1... */
    .countdown-go               /* "GO!" flash */
  .score-celebration            /* Positioned at score location */
    .celebration-text           /* "+1", "SET POINT!", etc. */
  .notification-toast-container /* Top-right stack */
    .toast-item                 /* Achievement/error popup */
```

---

## Core CSS Classes

### HUD Overlay

```css
.hud-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 15;
  display: flex;
  flex-direction: column;
  padding: var(--space-md);
}

/* Allow clicks on interactive HUD elements */
.hud-overlay .interactive {
  pointer-events: auto;
}
```

### Top Bar

```css
.hud-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.hud-difficulty-badge {
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  padding: 6px 12px;
  background: var(--color-surface);
  border: 1px solid var(--neon-primary);
  border-radius: 4px;
  color: var(--neon-primary);
  text-shadow: 0 0 6px rgba(124, 58, 237, 0.6);
  box-shadow: 0 0 8px rgba(124, 58, 237, 0.15);
}

.hud-timer {
  font-family: 'VT323', monospace;
  font-size: 24px;
  color: var(--color-text-muted);
  text-shadow: 0 0 4px rgba(148, 163, 184, 0.3);
  min-width: 80px;
  text-align: center;
}

.hud-timer--warning {
  color: var(--neon-amber);
  text-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
  animation: timer-pulse 1s infinite;
}

.hud-timer--critical {
  color: var(--neon-red);
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
  animation: timer-pulse 0.5s infinite;
}

.hud-pause-btn {
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  padding: 8px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-text-muted);
  border-radius: 4px;
  color: var(--color-text-muted);
  cursor: pointer;
  pointer-events: auto;
  transition: all 200ms ease;
}

.hud-pause-btn:hover {
  color: var(--color-text);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
  transform: scale(1.05);
}
```

### Score Area

```css
.hud-score-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2xl);
  margin-top: var(--space-xl);
}

.hud-score-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-lg) var(--space-xl);
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid transparent;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  min-width: 120px;
  transition: all 200ms ease;
}

.hud-score-box--player {
  border-color: var(--neon-green);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
}

.hud-score-box--opponent {
  border-color: var(--neon-cta);
  box-shadow: 0 0 12px rgba(244, 63, 94, 0.15);
}

.hud-score-value {
  font-family: 'Press Start 2P', cursive;
  font-size: 64px;
  color: var(--color-text);
  text-shadow:
    0 0 10px currentColor,
    0 0 20px currentColor;
  line-height: 1.1;
  transition: all 300ms ease;
}

.hud-score-value--changed {
  animation: score-pop 400ms ease-out;
}

.hud-score-label {
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: var(--space-sm);
}

.hud-sets-indicator {
  display: flex;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}

.hud-set-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-text-muted);
  transition: all 300ms ease;
}

.hud-set-dot--won {
  background: var(--neon-primary);
  border-color: var(--neon-primary);
  box-shadow: 0 0 6px var(--neon-primary);
}

.hud-score-divider {
  font-family: 'Press Start 2P', cursive;
  font-size: 32px;
  color: var(--color-text-muted);
  opacity: 0.5;
}
```

### Rally Bar

```css
.hud-rally-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  opacity: 0.7;
  transition: opacity 200ms ease;
}

.hud-rally-bar--active {
  opacity: 1;
}

.hud-rally-label {
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  color: var(--color-text-muted);
}

.hud-rally-value {
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: var(--neon-cyan);
  text-shadow: 0 0 6px rgba(6, 182, 212, 0.5);
  min-width: 24px;
  text-align: center;
}

.hud-rally-value--milestone {
  animation: rally-flash 500ms ease-out;
}
```

### Serve Indicator

```css
.hud-serve-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  opacity: 0;
  transition: opacity 300ms ease;
}

.hud-serve-indicator--visible {
  opacity: 1;
}

.serve-text {
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  color: var(--neon-cyan);
  text-shadow: 0 0 8px rgba(6, 182, 212, 0.6);
  animation: serve-blink 1s infinite;
}

.serve-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  transition: all 200ms ease;
}

.serve-arrow--left {
  border-width: 6px 10px 6px 0;
  border-color: transparent var(--neon-cyan) transparent transparent;
  filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.6));
}

.serve-arrow--right {
  border-width: 6px 0 6px 10px;
  border-color: transparent transparent transparent var(--neon-cyan);
  filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.6));
}

.serve-arrow--hidden {
  opacity: 0;
  transform: scale(0.5);
}
```

### Countdown Overlay

```css
.countdown-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 15, 35, 0.7);
  z-index: 25;
  pointer-events: none;
}

.countdown-number {
  font-family: 'Press Start 2P', cursive;
  font-size: 120px;
  color: var(--color-text);
  text-shadow:
    0 0 20px var(--neon-primary),
    0 0 40px var(--neon-primary),
    0 0 80px var(--neon-primary);
  animation: countdown-pop 1s ease-out;
}

.countdown-go {
  font-family: 'Press Start 2P', cursive;
  font-size: 80px;
  color: var(--neon-cta);
  text-shadow:
    0 0 20px var(--neon-cta),
    0 0 40px var(--neon-cta),
    0 0 80px var(--neon-cta);
  animation: go-flash 0.8s ease-out;
}
```

### Score Celebration

```css
.score-celebration {
  position: absolute;
  pointer-events: none;
  z-index: 20;
  text-align: center;
}

.celebration-text {
  font-family: 'Press Start 2P', cursive;
  color: var(--color-text);
  text-shadow:
    0 0 10px var(--neon-primary),
    0 0 20px var(--neon-primary);
}

.celebration-text--normal {
  font-size: 24px;
  animation: celebration-rise 1s ease-out forwards;
}

.celebration-text--set-point {
  font-size: 28px;
  color: var(--neon-amber);
  text-shadow: 0 0 10px var(--neon-amber), 0 0 20px var(--neon-amber);
  animation: celebration-rise 1.2s ease-out forwards;
}

.celebration-text--match-point {
  font-size: 32px;
  color: var(--neon-red);
  text-shadow: 0 0 15px var(--neon-red), 0 0 30px var(--neon-red);
  animation: celebration-rise-shake 1.5s ease-out forwards;
}

.celebration-text--deuce {
  font-size: 36px;
  color: var(--neon-cyan);
  text-shadow: 0 0 15px var(--neon-cyan), 0 0 30px var(--neon-cyan);
  animation: celebration-pulse 1.5s ease-out forwards;
}
```

### Notification Toast

```css
.notification-toast-container {
  position: fixed;
  top: var(--space-lg);
  right: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  z-index: 30;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface);
  border-left: 4px solid var(--neon-primary);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  animation: toast-slide-in 300ms ease-out;
  min-width: 240px;
}

.toast-item--success { border-left-color: var(--neon-green); }
.toast-item--warning { border-left-color: var(--neon-amber); }
.toast-item--error { border-left-color: var(--neon-red); }
.toast-item--achievement { border-left-color: var(--neon-cyan); }

.toast-item--exiting {
  animation: toast-slide-out 300ms ease-in forwards;
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-message {
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: var(--color-text);
}

.toast-dismiss {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  transition: color 150ms ease;
}

.toast-dismiss:hover {
  color: var(--color-text);
}
```

---

## Animations & Keyframes

```css
/* Score pop on update */
@keyframes score-pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.3); color: var(--neon-cyan); }
  100% { transform: scale(1); }
}

/* Timer pulse for warning states */
@keyframes timer-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Rally flash on milestone */
@keyframes rally-flash {
  0% { transform: scale(1); text-shadow: 0 0 6px rgba(6, 182, 212, 0.5); }
  50% { transform: scale(1.3); text-shadow: 0 0 20px rgba(6, 182, 212, 0.8); }
  100% { transform: scale(1); text-shadow: 0 0 6px rgba(6, 182, 212, 0.5); }
}

/* Serve indicator blink */
@keyframes serve-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Countdown number pop */
@keyframes countdown-pop {
  0% {
    transform: scale(2);
    opacity: 0;
    filter: blur(8px);
  }
  50% {
    transform: scale(0.9);
    opacity: 1;
    filter: blur(0);
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* GO! flash */
@keyframes go-flash {
  0% {
    transform: scale(0.5);
    opacity: 0;
    filter: blur(10px);
  }
  30% {
    transform: scale(1.1);
    opacity: 1;
    filter: blur(0);
  }
  70% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* Score celebration rise */
@keyframes celebration-rise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-60px) scale(1.2);
    opacity: 0;
  }
}

/* Celebration with shake for match point */
@keyframes celebration-rise-shake {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  20% { transform: translateY(-10px) scale(1.1) rotate(-2deg); }
  40% { transform: translateY(-20px) scale(1.15) rotate(2deg); }
  60% { transform: translateY(-35px) scale(1.2) rotate(-1deg); }
  100% {
    transform: translateY(-80px) scale(1.3);
    opacity: 0;
  }
}

/* Deuce pulse */
@keyframes celebration-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  25% { transform: scale(1.2); }
  50% { transform: scale(1); }
  75% { transform: scale(1.15); }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* Toast slide in */
@keyframes toast-slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Toast slide out */
@keyframes toast-slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
```

---

## Interaction States

| Element | State | Visual Treatment |
|---------|-------|------------------|
| `.hud-score-value` | Default | Solid color glow |
| | Changed | `score-pop` animation, brief cyan tint |
| `.hud-pause-btn` | Default | Muted border |
| | Hover | Cyan border glow, scale(1.05) |
| | Active | scale(0.95) |
| `.hud-set-dot` | Default | Empty border |
| | Won | Filled with neon, glow shadow |
| `.toast-item` | Entering | `toast-slide-in` |
| | Exiting | `toast-slide-out` |
| `.countdown-number` | Active | `countdown-pop` per tick |
| `.serve-text` | Visible | `serve-blink` infinite |

---

## Responsive Breakpoints

```css
/* Mobile: 375px (compact mode) */
@media (max-width: 767px) {
  .hud-score-area { gap: var(--space-md); margin-top: var(--space-md); }
  .hud-score-value { font-size: 36px; }
  .hud-score-box { padding: var(--space-sm) var(--space-md); min-width: 80px; }
  .hud-score-label { font-size: 8px; }
  .hud-score-divider { font-size: 20px; }
  .hud-timer { font-size: 16px; }
  .hud-difficulty-badge { font-size: 8px; padding: 4px 8px; }
  .hud-pause-btn { font-size: 8px; padding: 6px 10px; }
  .hud-rally-value { font-size: 14px; }
  .countdown-number { font-size: 72px; }
  .countdown-go { font-size: 48px; }
  .celebration-text--normal { font-size: 16px; }
  .celebration-text--match-point { font-size: 22px; }
}

/* Tablet: 768px */
@media (min-width: 768px) and (max-width: 1023px) {
  .hud-score-value { font-size: 48px; }
  .countdown-number { font-size: 96px; }
}

/* Desktop+ */
@media (min-width: 1440px) {
  .hud-score-value { font-size: 80px; }
  .hud-timer { font-size: 28px; }
  .countdown-number { font-size: 144px; }
}
```

---

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .hud-score-value--changed,
  .hud-rally-value--milestone,
  .countdown-number,
  .countdown-go,
  .celebration-text,
  .serve-text,
  .hud-timer--warning,
  .hud-timer--critical,
  .toast-item {
    animation: none;
  }
  .hud-score-value--changed { transform: none; }
  * { transition-duration: 0.01ms !important; }
}

/* High contrast mode support */
@media (prefers-contrast: more) {
  .hud-score-box {
    border-width: 3px;
    background: rgba(0, 0, 0, 0.9);
  }
  .hud-score-value {
    text-shadow: none;
    -webkit-text-stroke: 1px currentColor;
  }
}
```

---

## State Transitions

| Transition | Duration | Easing | Effect |
|------------|----------|--------|--------|
| Score update | 400ms | ease-out | `score-pop` |
| Rally milestone | 500ms | ease-out | `rally-flash` |
| Countdown tick | 1000ms | ease-out | `countdown-pop` |
| GO! flash | 800ms | ease-out | `go-flash` |
| Celebration | 1000-1500ms | ease-out | Rise + fade |
| Toast enter | 300ms | ease-out | Slide in |
| Toast exit | 300ms | ease-in | Slide out |
| Serve indicator show | 300ms | ease | Opacity 0 -> 1 |

---

## Slots & Overrides

| Slot | Selector | Purpose |
|------|----------|---------|
| `score_area` | `.hud-score-area` | Score display container |
| `timer_area` | `.hud-timer` | Match elapsed time |
| `set_indicator` | `.hud-sets-indicator` | Sets won dots |
| `difficulty_badge` | `.hud-difficulty-badge` | Current difficulty |
| `pause_button` | `.hud-pause-btn` | Pause trigger |
| `number_display` | `.countdown-number` | Countdown digits |
| `go_display` | `.countdown-go` | Final GO! text |
| `text_display` | `.celebration-text` | Score popup text |

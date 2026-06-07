# TitleScreen Design Document

> **Component:** `TitleScreen`  
> **Design System:** rally-pro-3d  
> **Aesthetic:** Retro-Futurism Neon  
> **Based on:** `ui-component-registry.json` — TitleScreen, DifficultySelect, LoadingScreen

---

## Overview

The TitleScreen is the primary entry overlay for Neon Pong. It presents the animated neon title, subtitle, primary navigation actions, and an optional difficulty-select sub-overlay. All elements are DOM-based overlays rendered above the Three.js canvas.

---

## Color Tokens

| Token | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Primary Neon | `#7C3AED` | `--neon-primary` | Title glow, borders, accents |
| Secondary Neon | `#A78BFA` | `--neon-secondary` | Subtitle, secondary borders |
| CTA Neon | `#F43F5E` | `--neon-cta` | Start button, active states, pulse |
| Background | `#0F0F23` | `--color-background` | Overlay bg, card bg |
| Surface | `#1A1A2E` | `--color-surface` | Buttons, cards, panels |
| Text Primary | `#E2E8F0` | `--color-text` | Headings, body |
| Text Muted | `#94A3B8` | `--color-text-muted` | Subtitles, hints |
| Neon Cyan | `#06B6D4` | `--neon-cyan` | Difficulty cards, alt accents |
| Neon Green | `#10B981` | `--neon-green` | Success states, easy diff |
| Neon Amber | `#F59E0B` | `--neon-amber` | Warning, medium diff |
| Neon Red | `#EF4444` | `--neon-red` | Danger, hard diff |

---

## Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

.font-heading {
  font-family: 'Press Start 2P', cursive;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.font-body {
  font-family: 'VT323', monospace;
  letter-spacing: 0.04em;
}
```

| Element | Font | Size (desktop) | Size (mobile) | Line Height |
|---------|------|----------------|---------------|-------------|
| Title | Press Start 2P | 48px | 28px | 1.2 |
| Subtitle | VT323 | 32px | 20px | 1.3 |
| Nav Button | Press Start 2P | 14px | 10px | 1.4 |
| Difficulty Label | Press Start 2P | 16px | 12px | 1.4 |
| Difficulty Desc | VT323 | 24px | 16px | 1.3 |

---

## Layout Structure

```
.title-screen-overlay          /* Full-screen overlay, z-index: 10 */
  .crt-scanlines               /* ::before pseudo, CRT effect overlay */
  .vignette                    /* ::after pseudo, edge darkening */
  .background-video            /* Optional <video> loop */
  .title-container             /* Centered flex column */
    .neon-title                /* Animated glitch text */
    .neon-subtitle             /* Scanline reveal text */
  .action-buttons              /* Vertical stack, gap: --space-lg */
    .btn-neon-primary          /* Start Game */
    .btn-neon-secondary        /* Leaderboard */
    .btn-neon-ghost            /* Settings */
    .btn-neon-ghost            /* Tutorial (optional) */
  .version-badge               /* Bottom-right corner */
```

---

## Core CSS Classes

### Overlay Container

```css
.title-screen-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  z-index: 10;
  overflow: hidden;
}

/* CRT Scanlines Overlay */
.title-screen-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0) 0px,
    rgba(0, 0, 0, 0) 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  pointer-events: none;
  z-index: 11;
  animation: scanline-flicker 0.15s infinite;
}

/* Vignette */
.title-screen-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%);
  pointer-events: none;
  z-index: 12;
}
```

### Neon Title

```css
.neon-title {
  font-family: 'Press Start 2P', cursive;
  font-size: 48px;
  color: var(--color-text);
  text-align: center;
  text-shadow:
    0 0 5px var(--neon-primary),
    0 0 10px var(--neon-primary),
    0 0 20px var(--neon-primary),
    0 0 40px var(--neon-primary),
    0 0 80px rgba(124, 58, 237, 0.5);
  animation: neon-flicker 3s infinite alternate, glitch-in 0.8s ease-out;
  position: relative;
  z-index: 13;
}

.neon-title--minimal {
  font-size: 32px;
  text-shadow:
    0 0 3px var(--neon-primary),
    0 0 6px var(--neon-primary),
    0 0 12px var(--neon-primary);
}
```

### Neon Subtitle

```css
.neon-subtitle {
  font-family: 'VT323', monospace;
  font-size: 32px;
  color: var(--neon-secondary);
  text-align: center;
  margin-top: var(--space-md);
  text-shadow:
    0 0 4px rgba(167, 139, 250, 0.6),
    0 0 8px rgba(167, 139, 250, 0.3);
  animation: scanline-reveal 1.2s ease-out 0.5s both;
  position: relative;
  z-index: 13;
}
```

### Action Buttons

```css
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  margin-top: var(--space-3xl);
  align-items: center;
  position: relative;
  z-index: 13;
}

.btn-neon-primary {
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  text-transform: uppercase;
  padding: 16px 48px;
  background: var(--neon-cta);
  color: white;
  border: 2px solid var(--neon-cta);
  border-radius: 4px;
  cursor: pointer;
  text-shadow: 0 0 8px rgba(244, 63, 94, 0.8);
  box-shadow:
    0 0 10px rgba(244, 63, 94, 0.5),
    inset 0 0 10px rgba(255, 255, 255, 0.1);
  transition: all 200ms ease;
  position: relative;
  overflow: hidden;
}

.btn-neon-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 400ms ease;
}

.btn-neon-primary:hover {
  background: #fb7185;
  border-color: #fb7185;
  box-shadow:
    0 0 20px rgba(244, 63, 94, 0.8),
    0 0 40px rgba(244, 63, 94, 0.4),
    inset 0 0 15px rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-neon-primary:hover::before {
  left: 100%;
}

.btn-neon-primary:active {
  transform: translateY(0);
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.6);
}

.btn-neon-primary:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 4px;
}

.btn-neon-secondary {
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  text-transform: uppercase;
  padding: 14px 40px;
  background: transparent;
  color: var(--neon-primary);
  border: 2px solid var(--neon-primary);
  border-radius: 4px;
  cursor: pointer;
  text-shadow: 0 0 6px rgba(124, 58, 237, 0.6);
  box-shadow: 0 0 8px rgba(124, 58, 237, 0.2);
  transition: all 200ms ease;
}

.btn-neon-secondary:hover {
  background: rgba(124, 58, 237, 0.15);
  box-shadow:
    0 0 16px rgba(124, 58, 237, 0.5),
    0 0 32px rgba(124, 58, 237, 0.2);
  transform: translateY(-2px);
}

.btn-neon-ghost {
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  text-transform: uppercase;
  padding: 12px 32px;
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 200ms ease;
}

.btn-neon-ghost:hover {
  color: var(--color-text);
  border-color: var(--color-text-muted);
  background: rgba(148, 163, 184, 0.08);
  transform: translateY(-1px);
}
```

### Difficulty Select Overlay

```css
.difficulty-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(15, 15, 35, 0.95);
  z-index: 20;
  animation: fade-in 300ms ease;
}

.difficulty-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);
  max-width: 900px;
  width: 90%;
  position: relative;
  z-index: 13;
}

.difficulty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-xl);
  background: var(--color-surface);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
  overflow: hidden;
}

.difficulty-card--novice {
  border-color: var(--neon-green);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
}

.difficulty-card--intermediate {
  border-color: var(--neon-amber);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.2);
}

.difficulty-card--expert {
  border-color: var(--neon-cta);
  box-shadow: 0 0 8px rgba(244, 63, 94, 0.2);
}

.difficulty-card--pro {
  border-color: var(--neon-red);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.2);
}

.difficulty-card:hover {
  transform: translateY(-4px) scale(1.02);
}

.difficulty-card--novice:hover {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.2);
}

.difficulty-card--intermediate:hover {
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245, 158, 11, 0.2);
}

.difficulty-card--expert:hover {
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.5), 0 0 40px rgba(244, 63, 94, 0.2);
}

.difficulty-card--pro:hover {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.2);
}

.difficulty-card--selected {
  animation: card-pulse 2s infinite;
}

.difficulty-card__label {
  font-family: 'Press Start 2P', cursive;
  font-size: 16px;
  margin-bottom: var(--space-sm);
}

.difficulty-card__desc {
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: var(--color-text-muted);
  text-align: center;
}

.difficulty-card__icon {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-md);
}

.difficulty-back-btn {
  margin-top: var(--space-2xl);
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  padding: 10px 24px;
  cursor: pointer;
  transition: all 200ms ease;
}

.difficulty-back-btn:hover {
  color: var(--color-text);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.3);
}
```

### Loading Screen

```css
.loading-screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  z-index: 100;
}

.loading-title {
  font-family: 'Press Start 2P', cursive;
  font-size: 24px;
  color: var(--neon-primary);
  text-shadow: 0 0 10px var(--neon-primary);
  margin-bottom: var(--space-xl);
}

.loading-progress-container {
  width: 300px;
  height: 8px;
  background: var(--color-surface);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.loading-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-primary), var(--neon-cta));
  box-shadow: 0 0 10px var(--neon-primary);
  transition: width 200ms ease;
  border-radius: 4px;
}

.loading-stage {
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: var(--color-text-muted);
  margin-top: var(--space-md);
}

.loading-tip {
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: var(--neon-secondary);
  margin-top: var(--space-lg);
  text-align: center;
  max-width: 400px;
  animation: tip-fade 4s infinite;
}
```

---

## Animations & Keyframes

```css
/* Neon flicker effect for title */
@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow:
      0 0 5px var(--neon-primary),
      0 0 10px var(--neon-primary),
      0 0 20px var(--neon-primary),
      0 0 40px var(--neon-primary),
      0 0 80px rgba(124, 58, 237, 0.5);
    opacity: 1;
  }
  20%, 24%, 55% {
    text-shadow: none;
    opacity: 0.8;
  }
}

/* Glitch-in entrance */
@keyframes glitch-in {
  0% {
    opacity: 0;
    transform: translateX(-20px) skewX(-10deg);
    clip-path: inset(0 100% 0 0);
  }
  30% {
    opacity: 1;
    transform: translateX(10px) skewX(5deg);
    clip-path: inset(0 20% 0 0);
  }
  60% {
    transform: translateX(-5px) skewX(-3deg);
    clip-path: inset(0 50% 0 0);
  }
  100% {
    opacity: 1;
    transform: translateX(0) skewX(0);
    clip-path: inset(0 0 0 0);
  }
}

/* Scanline text reveal */
@keyframes scanline-reveal {
  0% {
    opacity: 0;
    clip-path: inset(0 0 100% 0);
    filter: blur(4px);
  }
  50% {
    clip-path: inset(0 0 0 0);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    clip-path: inset(0 0 0 0);
    filter: blur(0);
  }
}

/* CRT scanline flicker */
@keyframes scanline-flicker {
  0% { opacity: 0.95; }
  50% { opacity: 1; }
  100% { opacity: 0.97; }
}

/* Fade in for overlays */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Card pulse for selected difficulty */
@keyframes card-pulse {
  0%, 100% {
    box-shadow: 0 0 15px currentColor, 0 0 30px currentColor;
  }
  50% {
    box-shadow: 0 0 25px currentColor, 0 0 50px currentColor;
  }
}

/* Tip text cycling fade */
@keyframes tip-fade {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Button shimmer sweep */
@keyframes shimmer-sweep {
  from { left: -100%; }
  to { left: 100%; }
}
```

---

## Interaction States

| Element | State | Visual Treatment |
|---------|-------|------------------|
| `.btn-neon-primary` | Default | Rose bg, neon shadow |
| | Hover | Brighter rose, larger glow, translateY(-2px), shimmer sweep |
| | Active | translateY(0), reduced shadow |
| | Focus | 2px cyan outline, offset 4px |
| `.btn-neon-secondary` | Default | Transparent, purple border |
| | Hover | Purple tint bg, expanded glow, translateY(-2px) |
| | Focus | 2px cyan outline, offset 4px |
| `.difficulty-card` | Default | Colored border, subtle glow |
| | Hover | translateY(-4px) scale(1.02), expanded glow |
| | Selected | `card-pulse` animation, brighter border |
| `.neon-title` | Idle | `neon-flicker` infinite |
| | Entering | `glitch-in` once |

---

## Responsive Breakpoints

```css
/* Mobile: 375px */
@media (max-width: 767px) {
  .neon-title { font-size: 28px; }
  .neon-subtitle { font-size: 20px; }
  .btn-neon-primary { font-size: 10px; padding: 12px 32px; }
  .btn-neon-secondary { font-size: 10px; padding: 10px 28px; }
  .btn-neon-ghost { font-size: 10px; padding: 8px 20px; }
  .difficulty-grid {
    grid-template-columns: 1fr;
    max-width: 300px;
  }
  .action-buttons { gap: var(--space-md); margin-top: var(--space-2xl); }
}

/* Tablet: 768px */
@media (min-width: 768px) and (max-width: 1023px) {
  .neon-title { font-size: 36px; }
  .neon-subtitle { font-size: 26px; }
  .difficulty-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 600px;
  }
}

/* Desktop: 1024px */
@media (min-width: 1024px) and (max-width: 1439px) {
  .neon-title { font-size: 42px; }
  .difficulty-grid { grid-template-columns: repeat(4, 1fr); }
}

/* Large: 1440px+ */
@media (min-width: 1440px) {
  .neon-title { font-size: 56px; }
  .neon-subtitle { font-size: 36px; }
  .btn-neon-primary { font-size: 16px; padding: 18px 56px; }
}
```

---

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .neon-title,
  .neon-subtitle,
  .difficulty-card--selected,
  .title-screen-overlay::before,
  .loading-tip {
    animation: none;
  }
  .btn-neon-primary::before,
  .btn-neon-secondary::before {
    display: none;
  }
  * {
    transition-duration: 0.01ms !important;
  }
}

/* Focus-visible for keyboard navigation */
*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 3px;
}
```

---

## State Transitions

| Transition | Duration | Easing | Effect |
|------------|----------|--------|--------|
| Entering | 800ms | ease-out | `glitch-in` + scanline reveal |
| Exiting | 400ms | ease-in | Opacity 1 -> 0, scale 1 -> 0.95 |
| Difficulty overlay open | 300ms | ease | `fade-in` |
| Difficulty overlay close | 250ms | ease-in | Opacity -> 0 |
| Loading screen fade-out | 500ms | ease | Opacity -> 0, then hidden |

---

## Slots & Overrides

| Slot | Selector | Purpose |
|------|----------|---------|
| `title` | `.neon-title` | Main game title text |
| `subtitle` | `.neon-subtitle` | Tagline text |
| `action_buttons` | `.action-buttons` | Nav button container |
| `background` | `.background-video` | Optional looping video |
| `difficulty_cards` | `.difficulty-grid` | Difficulty selection grid |
| `preview_text` | `.difficulty-card__desc` | Difficulty description text |

# Settings Design Document

> **Component:** `SettingsPanel`  
> **Design System:** rally-pro-3d  
> **Aesthetic:** Retro-Futurism Neon  
> **Based on:** `ui-component-registry.json` — SettingsPanel

---

## Overview

The SettingsPanel is a configuration overlay providing tabs for Game, Audio, Graphics, and Input settings. It uses a retro-futurism neon aesthetic with toggle switches styled as arcade buttons, sliders with neon fill tracks, and segmented controls with glowing active states. All settings are persisted via `on_save` callback.

---

## Color Tokens

| Token | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Primary Neon | `#7C3AED` | `--neon-primary` | Active tabs, toggles on, sliders |
| Secondary Neon | `#A78BFA` | `--neon-secondary` | Focus rings, secondary accents |
| CTA Neon | `#F43F5E` | `--neon-cta` | Reset defaults, danger actions |
| Background | `#0F0F23` | `--color-background` | Overlay bg |
| Surface | `#1A1A2E` | `--color-surface` | Panel bg, input bg |
| Surface Raised | `#252542` | `--color-surface-raised` | Hover states, active inputs |
| Text Primary | `#E2E8F0` | `--color-text` | Labels, values |
| Text Muted | `#94A3B8` | `--color-text-muted` | Descriptions, placeholders |
| Neon Cyan | `#06B6D4` | `--neon-cyan` | Save button, success states |
| Neon Green | `#10B981` | `--neon-green` | Toggles on, enabled states |
| Neon Amber | `#F59E0B` | `--neon-amber` | Warnings, medium quality |
| Neon Red | `#EF4444` | `--neon-red` | Errors, reset actions |

---

## Typography

```css
.font-settings-heading {
  font-family: 'Press Start 2P', cursive;
  text-transform: uppercase;
}

.font-settings-body {
  font-family: 'VT323', monospace;
}
```

| Element | Font | Desktop | Mobile | Line Height |
|---------|------|---------|--------|-------------|
| Panel Title | Press Start 2P | 24px | 18px | 1.3 |
| Tab Label | Press Start 2P | 10px | 8px | 1.4 |
| Section Title | Press Start 2P | 12px | 9px | 1.4 |
| Setting Label | VT323 | 22px | 16px | 1.3 |
| Setting Description | VT323 | 18px | 14px | 1.4 |
| Input Value | VT323 | 20px | 16px | 1.2 |
| Button Text | Press Start 2P | 11px | 8px | 1.4 |

---

## Layout Structure

```
.settings-overlay              /* Fixed full-screen, z-index: 20 */
  .settings-backdrop          /* Dark blur backdrop */
  .settings-panel             /* Centered panel card */
    .settings-header          /* Title + close button */
      .settings-title         /* "SETTINGS" */
      .settings-close-btn     /* X icon */
    .settings-tabs            /* Horizontal tab row */
      .settings-tab           /* GAME | AUDIO | GRAPHICS | INPUT */
    .settings-content         /* Scrollable tab content */
      .settings-section       /* Grouped settings */
        .section-title        /* "Game Difficulty" */
        .settings-row         /* Individual setting */
          .setting-label      /* Label + description */
            .setting-name
            .setting-desc
          .setting-control    /* Input, toggle, slider, or segmented */
    .settings-footer          /* Save / Cancel / Reset */
      .btn-neon-reset         /* Reset to Defaults */
      .btn-neon-cancel        /* Cancel */
      .btn-neon-save          /* Save Changes */
```

---

## Core CSS Classes

### Overlay & Panel

```css
.settings-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  opacity: 0;
  transition: opacity 300ms ease;
}

.settings-overlay--open {
  opacity: 1;
}

.settings-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 15, 35, 0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.settings-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 90%;
  max-width: 640px;
  max-height: 85vh;
  background: var(--color-surface);
  border: 2px solid var(--neon-primary);
  border-radius: 12px;
  box-shadow:
    0 0 20px rgba(124, 58, 237, 0.2),
    0 0 60px rgba(124, 58, 237, 0.1),
    0 20px 50px rgba(0, 0, 0, 0.5);
  transform: scale(0.95) translateY(10px);
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  z-index: 21;
}

.settings-overlay--open .settings-panel {
  transform: scale(1) translateY(0);
}
```

### Header

```css
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg) var(--space-xl);
  border-bottom: 2px solid rgba(124, 58, 237, 0.3);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
  flex-shrink: 0;
}

.settings-title {
  font-family: 'Press Start 2P', cursive;
  font-size: 24px;
  color: var(--color-text);
  text-shadow: 0 0 8px var(--neon-primary);
}

.settings-close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 6px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 200ms ease;
}

.settings-close-btn:hover {
  color: var(--neon-red);
  border-color: var(--neon-red);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
  transform: rotate(90deg);
}
```

### Tabs

```css
.settings-tabs {
  display: flex;
  gap: var(--space-xs);
  padding: var(--space-md) var(--space-xl);
  border-bottom: 1px solid rgba(124, 58, 237, 0.2);
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
}

.settings-tabs::-webkit-scrollbar {
  display: none;
}

.settings-tab {
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  text-transform: uppercase;
  padding: 10px 16px;
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 200ms ease;
  position: relative;
}

.settings-tab:hover {
  color: var(--color-text);
  background: rgba(124, 58, 237, 0.08);
}

.settings-tab--active {
  color: var(--neon-primary);
  border-color: var(--neon-primary);
  background: rgba(124, 58, 237, 0.12);
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.15);
  text-shadow: 0 0 6px rgba(124, 58, 237, 0.3);
}

.settings-tab--active::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--color-surface);
}
```

### Content & Sections

```css
.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg) var(--space-xl);
}

.settings-section {
  margin-bottom: var(--space-xl);
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  color: var(--neon-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-md);
  text-shadow: 0 0 4px rgba(167, 139, 250, 0.2);
}

.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-md) 0;
  border-bottom: 1px solid rgba(124, 58, 237, 0.1);
}

.settings-row:last-child {
  border-bottom: none;
}

.setting-label {
  flex: 1;
  min-width: 0;
}

.setting-name {
  font-family: 'VT323', monospace;
  font-size: 22px;
  color: var(--color-text);
  line-height: 1.2;
}

.setting-desc {
  font-family: 'VT323', monospace;
  font-size: 16px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.setting-control {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
```

### Toggle Switch

```css
.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
  background: var(--color-background);
  border: 2px solid var(--color-text-muted);
  border-radius: 12px;
  cursor: pointer;
  transition: all 200ms ease;
}

.toggle-switch--on {
  background: var(--neon-green);
  border-color: var(--neon-green);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

.toggle-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: var(--color-text);
  border-radius: 50%;
  transition: all 200ms ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle-switch--on .toggle-switch__thumb {
  left: 26px;
  background: white;
}

.toggle-switch:hover {
  border-color: var(--color-text);
}

.toggle-switch--on:hover {
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.6);
}

.toggle-switch:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 3px;
}

/* Screen reader text */
.toggle-switch__label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

### Segmented Control

```css
.segmented-control {
  display: flex;
  background: var(--color-background);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 6px;
  padding: 3px;
  gap: 2px;
}

.segmented-control__option {
  font-family: 'VT323', monospace;
  font-size: 18px;
  padding: 6px 14px;
  background: transparent;
  color: var(--color-text-muted);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
}

.segmented-control__option:hover {
  color: var(--color-text);
}

.segmented-control__option--active {
  background: var(--neon-primary);
  color: white;
  box-shadow: 0 0 10px rgba(124, 58, 237, 0.4);
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
}

.segmented-control__option--active:hover {
  background: #8b5cf6;
}

.segmented-control__option:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
}
```

### Slider

```css
.range-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 160px;
  height: 6px;
  background: var(--color-background);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--neon-primary);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(124, 58, 237, 0.6);
  border: 2px solid white;
  transition: all 150ms ease;
}

.range-slider::-webkit-slider-thumb:hover {
  box-shadow: 0 0 16px rgba(124, 58, 237, 0.8);
  transform: scale(1.15);
}

.range-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: var(--neon-primary);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(124, 58, 237, 0.6);
  border: 2px solid white;
}

.range-slider:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 4px;
}

.range-slider__value {
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: var(--neon-primary);
  text-shadow: 0 0 6px rgba(124, 58, 237, 0.4);
  min-width: 40px;
  text-align: right;
  margin-left: var(--space-sm);
}
```

### Text Input

```css
.neon-input {
  font-family: 'VT323', monospace;
  font-size: 20px;
  padding: 8px 14px;
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 6px;
  min-width: 180px;
  transition: all 200ms ease;
}

.neon-input::placeholder {
  color: var(--color-text-muted);
}

.neon-input:hover {
  border-color: rgba(124, 58, 237, 0.6);
}

.neon-input:focus {
  border-color: var(--neon-primary);
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.2);
  outline: none;
}

.neon-input:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 3px;
}
```

### Footer Actions

```css
.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-xl);
  border-top: 1px solid rgba(124, 58, 237, 0.2);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.btn-neon-save {
  font-family: 'Press Start 2P', cursive;
  font-size: 11px;
  text-transform: uppercase;
  padding: 12px 28px;
  background: var(--neon-cyan);
  color: white;
  border: 2px solid var(--neon-cyan);
  border-radius: 4px;
  cursor: pointer;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.4);
  transition: all 200ms ease;
}

.btn-neon-save:hover {
  background: #22d3ee;
  border-color: #22d3ee;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.6), 0 0 40px rgba(6, 182, 212, 0.3);
  transform: translateY(-2px);
}

.btn-neon-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-neon-cancel {
  font-family: 'Press Start 2P', cursive;
  font-size: 11px;
  text-transform: uppercase;
  padding: 12px 28px;
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 200ms ease;
}

.btn-neon-cancel:hover {
  color: var(--color-text);
  border-color: var(--color-text-muted);
  background: rgba(148, 163, 184, 0.08);
}

.btn-neon-reset {
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  text-transform: uppercase;
  padding: 10px 20px;
  background: transparent;
  color: var(--neon-red);
  border: 1px solid var(--neon-red);
  border-radius: 4px;
  cursor: pointer;
  margin-right: auto;
  transition: all 200ms ease;
}

.btn-neon-reset:hover {
  background: rgba(239, 68, 68, 0.1);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
}
```

### Compact Variant

```css
.settings-panel--compact {
  max-width: 480px;
  max-height: 90vh;
}

.settings-panel--compact .settings-title {
  font-size: 18px;
}

.settings-panel--compact .settings-tab {
  font-size: 8px;
  padding: 8px 12px;
}

.settings-panel--compact .setting-name {
  font-size: 18px;
}

.settings-panel--compact .setting-desc {
  font-size: 14px;
}

.settings-panel--compact .settings-footer {
  flex-direction: column;
  gap: var(--space-sm);
}

.settings-panel--compact .btn-neon-reset {
  margin-right: 0;
  width: 100%;
}

.settings-panel--compact .btn-neon-save,
.settings-panel--compact .btn-neon-cancel {
  width: 100%;
  text-align: center;
}
```

---

## Animations & Keyframes

```css
/* Settings title flicker */
@keyframes settings-title-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow: 0 0 8px var(--neon-primary);
    opacity: 1;
  }
  20%, 24%, 55% {
    text-shadow: none;
    opacity: 0.9;
  }
}

.settings-title {
  animation: settings-title-flicker 4s infinite;
}

/* Tab content transition */
@keyframes tab-content-enter {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.settings-content--transitioning {
  animation: tab-content-enter 200ms ease-out;
}

/* Section stagger reveal */
@keyframes section-reveal {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-section {
  animation: section-reveal 250ms ease-out both;
}

.settings-section:nth-child(1) { animation-delay: 0.05s; }
.settings-section:nth-child(2) { animation-delay: 0.1s; }
.settings-section:nth-child(3) { animation-delay: 0.15s; }
.settings-section:nth-child(4) { animation-delay: 0.2s; }

/* Saving state spinner */
@keyframes save-spinner {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-neon-save--saving .save-icon {
  animation: save-spinner 1s linear infinite;
}

/* Close button rotation reset */
.settings-close-btn {
  transition: all 200ms ease;
}
```

---

## Interaction States

| Element | State | Visual Treatment |
|---------|-------|------------------|
| `.settings-tab` | Default | Muted text, transparent bg |
| | Hover | Lighter text, subtle tint |
| | Active | Purple border + bg, glow, downward caret |
| `.toggle-switch` | Off | Dark bg, muted border |
| | Off Hover | Border lightens |
| | On | Green bg/border, glow, thumb right |
| | On Hover | Glow intensifies |
| `.segmented-control__option` | Default | Muted text |
| | Hover | Lighter text |
| | Active | Purple bg, white text, glow |
| `.range-slider` | Default | Dark track |
| | Hover/Focus | Thumb scales up, glow intensifies |
| `.neon-input` | Default | Subtle border |
| | Hover | Border brightens |
| | Focus | Purple border, glow shadow |
| `.btn-neon-save` | Default | Cyan bg, glow |
| | Hover | Brighter cyan, expanded glow, lift |
| | Disabled | 50% opacity, no hover effects |
| `.btn-neon-cancel` | Default | Muted border |
| | Hover | Lighter text, tinted bg |
| `.btn-neon-reset` | Default | Red border, transparent |
| | Hover | Red tint bg, red glow |
| `.settings-close-btn` | Default | Muted border |
| | Hover | Red color/border, glow, 90deg rotate |

---

## Tab Specifications

### Game Tab

| Setting | Control | Options / Range |
|---------|---------|-----------------|
| Player Name | Text Input | Max 12 chars |
| Difficulty | Segmented | Novice / Intermediate / Expert / Pro |
| Camera Shake | Toggle | On / Off |

### Audio Tab

| Setting | Control | Options / Range |
|---------|---------|-----------------|
| Sound Effects | Toggle | On / Off |
| Music | Toggle | On / Off |
| Master Volume | Slider | 0% - 100% |
| SFX Volume | Slider | 0% - 100% |
| Music Volume | Slider | 0% - 100% |

### Graphics Tab

| Setting | Control | Options / Range |
|---------|---------|-----------------|
| Particle Quality | Segmented | Low / Medium / High |
| CRT Scanlines | Toggle | On / Off |
| Neon Intensity | Slider | 0% - 100% |
| Screen Shake | Toggle | On / Off |

### Input Tab

| Setting | Control | Options / Range |
|---------|---------|-----------------|
| Input Device | Segmented | Auto / Keyboard / Mouse / Touch |
| Paddle Sensitivity | Slider | 1 - 10 |
| Invert Controls | Toggle | On / Off |

---

## Responsive Breakpoints

```css
/* Mobile: 375px */
@media (max-width: 767px) {
  .settings-panel { max-height: 92vh; width: 95%; }
  .settings-title { font-size: 18px; }
  .settings-tab { font-size: 8px; padding: 8px 10px; }
  .section-title { font-size: 9px; }
  .setting-name { font-size: 16px; }
  .setting-desc { font-size: 14px; }
  .settings-row { flex-direction: column; align-items: flex-start; gap: var(--space-sm); }
  .setting-control { width: 100%; justify-content: flex-start; }
  .range-slider { width: 100%; }
  .segmented-control { width: 100%; }
  .segmented-control__option { flex: 1; text-align: center; }
  .neon-input { width: 100%; min-width: auto; }
  .settings-footer { flex-direction: column-reverse; }
  .btn-neon-save,
  .btn-neon-cancel,
  .btn-neon-reset { width: 100%; text-align: center; }
  .btn-neon-reset { margin-right: 0; order: 3; }
}

/* Tablet: 768px */
@media (min-width: 768px) and (max-width: 1023px) {
  .settings-panel { max-width: 560px; }
  .settings-title { font-size: 22px; }
}

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) {
  .settings-panel { max-width: 720px; }
  .settings-title { font-size: 28px; }
  .setting-name { font-size: 24px; }
  .range-slider { width: 200px; }
}
```

---

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .settings-title,
  .settings-content--transitioning,
  .settings-section {
    animation: none;
  }
  .settings-panel,
  .settings-overlay {
    transition: none;
  }
  * { transition-duration: 0.01ms !important; }
}

/* Focus states */
*:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 3px;
}

/* High contrast mode */
@media (prefers-contrast: more) {
  .settings-panel {
    border-width: 3px;
  }
  .settings-tab--active {
    text-shadow: none;
    -webkit-text-stroke: 0.5px white;
  }
  .toggle-switch--on {
    outline: 2px solid white;
  }
  .range-slider::-webkit-slider-thumb {
    border-width: 3px;
  }
}

/* Reduced transparency */
@media (prefers-reduced-transparency: reduce) {
  .settings-backdrop {
    backdrop-filter: none;
    background: rgba(15, 15, 35, 0.97);
  }
}
```

---

## State Transitions

| Transition | Duration | Easing | Effect |
|------------|----------|--------|--------|
| Panel open | 300ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Scale + translateY bounce |
| Panel close | 250ms | ease-in | Scale down + fade |
| Tab switch | 200ms | ease-out | Content fade/slide |
| Toggle switch | 200ms | ease | Thumb slide, color change |
| Slider drag | real-time | — | Thumb follows pointer |
| Segmented select | 200ms | ease | Background color shift |
| Save action | 300ms | ease | Button shows spinner, then close |
| Reset confirm | 0ms | — | Immediate value reset |

---

## Slots & Overrides

| Slot | Selector | Purpose |
|------|----------|---------|
| `tabs` | `.settings-tabs` | Tab navigation container |
| `game_settings` | `.settings-content[data-tab="game"]` | Game difficulty, name, camera |
| `audio_settings` | `.settings-content[data-tab="audio"]` | Sound, music, volume sliders |
| `graphics_settings` | `.settings-content[data-tab="graphics"]` | Particles, scanlines, neon |
| `input_settings` | `.settings-content[data-tab="input"]` | Device, sensitivity, invert |
| `action_buttons` | `.settings-footer` | Save, cancel, reset |

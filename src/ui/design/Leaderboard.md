# Leaderboard Design Document

> **Component:** `LeaderboardScreen`  
> **Design System:** rally-pro-3d  
> **Aesthetic:** Retro-Futurism Neon  
> **Based on:** `ui-component-registry.json` — LeaderboardScreen

---

## Overview

The LeaderboardScreen is a full-screen overlay displaying global, weekly, and daily high scores. It features a neon-styled data table with filter tabs, player highlighting, loading states, and empty/error states. The design evokes an 80s arcade high-score board with CRT flicker and neon column separators.

---

## Color Tokens

| Token | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Primary Neon | `#7C3AED` | `--neon-primary` | Headers, borders, rank 1 highlight |
| Secondary Neon | `#A78BFA` | `--neon-secondary` | Subheaders, secondary borders |
| CTA Neon | `#F43F5E` | `--neon-cta` | Active filters, player highlight bg |
| Background | `#0F0F23` | `--color-background` | Overlay bg |
| Surface | `#1A1A2E` | `--color-surface` | Table rows, cards, panels |
| Surface Elevated | `#252542` | `--color-surface-raised` | Hover row bg |
| Text Primary | `#E2E8F0` | `--color-text` | Scores, names |
| Text Muted | `#94A3B8` | `--color-text-muted` | Dates, ranks beyond top 3 |
| Neon Cyan | `#06B6D4` | `--neon-cyan` | Rank 2 highlight, focus rings |
| Neon Amber | `#F59E0B` | `--neon-amber` | Rank 3 highlight, streak indicators |
| Neon Green | `#10B981` | `--neon-green` | New entry pulse, positive change |
| Neon Red | `#EF4444` | `--neon-red` | Error states, negative change |

---

## Typography

```css
.font-leaderboard-heading {
  font-family: 'Press Start 2P', cursive;
  text-transform: uppercase;
}

.font-leaderboard-body {
  font-family: 'VT323', monospace;
}
```

| Element | Font | Desktop | Mobile | Line Height |
|---------|------|---------|--------|-------------|
| Page Title | Press Start 2P | 32px | 20px | 1.3 |
| Tab Label | Press Start 2P | 11px | 8px | 1.4 |
| Table Header | Press Start 2P | 10px | 8px | 1.4 |
| Rank Number | VT323 | 28px | 20px | 1.1 |
| Player Name | VT323 | 24px | 18px | 1.2 |
| Score Value | Press Start 2P | 14px | 10px | 1.4 |
| Date/Detail | VT323 | 18px | 14px | 1.3 |
| Empty State Text | VT323 | 22px | 16px | 1.4 |

---

## Layout Structure

```
.leaderboard-overlay           /* Fixed full-screen, z-index: 20 */
  .lb-backdrop                 /* Dark backdrop */
  .lb-container                /* Max-width container, centered */
    .lb-header                 /* Title + back button row */
      .lb-title                /* "LEADERBOARD" */
      .lb-back-btn             /* Arrow + "BACK" */
    .lb-filter-bar             /* Period tabs + difficulty filter */
      .lb-period-tabs          /* ALL TIME | WEEKLY | DAILY */
      .lb-difficulty-select    /* Dropdown or segmented control */
    .lb-table-container        /* Scrollable table wrapper */
      .lb-table                /* Main data table */
        .lb-thead              /* Sticky header row */
          .lb-th--rank
          .lb-th--player
          .lb-th--score
          .lb-th--sets
          .lb-th--date
        .lb-tbody              /* Scrollable body */
          .lb-row              /* Data row */
            .lb-cell--rank
            .lb-cell--player
            .lb-cell--score
            .lb-cell--sets
            .lb-cell--date
          .lb-row--highlight   /* Current player row */
          .lb-row--top3        /* Top 3 special styling */
    .lb-empty-state            /* No scores message */
    .lb-error-state            /* Error retry view */
    .lb-loading-state          /* Skeleton rows */
    .lb-footer                 /* Refresh button + pagination hint */
```

---

## Core CSS Classes

### Container & Header

```css
.leaderboard-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-background);
  z-index: 20;
  overflow-y: auto;
  padding: var(--space-xl);
}

.leaderboard-overlay::before {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0) 0px,
    rgba(0, 0, 0, 0) 2px,
    rgba(0, 0, 0, 0.12) 2px,
    rgba(0, 0, 0, 0.12) 4px
  );
  pointer-events: none;
  z-index: 21;
}

.lb-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  z-index: 22;
}

.lb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-md);
  border-bottom: 2px solid var(--neon-primary);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
}

.lb-title {
  font-family: 'Press Start 2P', cursive;
  font-size: 32px;
  color: var(--color-text);
  text-shadow:
    0 0 8px var(--neon-primary),
    0 0 16px var(--neon-primary);
}

.lb-back-btn {
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  transition: all 200ms ease;
}

.lb-back-btn:hover {
  color: var(--color-text);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
  transform: translateX(-2px);
}
```

### Filter Bar

```css
.lb-filter-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.lb-period-tabs {
  display: flex;
  gap: var(--space-xs);
  background: var(--color-surface);
  border-radius: 6px;
  padding: 4px;
  border: 1px solid rgba(124, 58, 237, 0.2);
}

.lb-tab {
  font-family: 'Press Start 2P', cursive;
  font-size: 11px;
  padding: 8px 16px;
  background: transparent;
  color: var(--color-text-muted);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
}

.lb-tab:hover {
  color: var(--color-text);
  background: rgba(124, 58, 237, 0.1);
}

.lb-tab--active {
  background: var(--neon-primary);
  color: white;
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.4);
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
}

.lb-tab--active:hover {
  background: #8b5cf6;
}

.lb-difficulty-select {
  font-family: 'VT323', monospace;
  font-size: 18px;
  padding: 8px 16px;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 200ms ease;
}

.lb-difficulty-select:hover,
.lb-difficulty-select:focus {
  border-color: var(--neon-primary);
  box-shadow: 0 0 10px rgba(124, 58, 237, 0.2);
  outline: none;
}

.lb-difficulty-select option {
  background: var(--color-background);
  color: var(--color-text);
}
```

### Data Table

```css
.lb-table-container {
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.1);
}

.lb-table {
  width: 100%;
  border-collapse: collapse;
}

.lb-thead {
  position: sticky;
  top: 0;
  z-index: 23;
}

.lb-thead tr {
  background: var(--color-background);
  border-bottom: 2px solid var(--neon-primary);
}

.lb-th {
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  color: var(--neon-secondary);
  text-align: left;
  padding: var(--space-md);
  text-shadow: 0 0 4px rgba(167, 139, 250, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lb-th--rank { width: 80px; text-align: center; }
.lb-th--score { text-align: right; }
.lb-th--sets { text-align: center; width: 100px; }
.lb-th--date { text-align: right; width: 140px; }

.lb-tbody {
  max-height: 60vh;
  overflow-y: auto;
}

.lb-row {
  border-bottom: 1px solid rgba(124, 58, 237, 0.1);
  transition: all 150ms ease;
}

.lb-row:last-child {
  border-bottom: none;
}

.lb-row:hover {
  background: var(--color-surface-raised);
}

.lb-cell {
  font-family: 'VT323', monospace;
  padding: var(--space-md);
  color: var(--color-text);
  vertical-align: middle;
}

.lb-cell--rank {
  font-size: 28px;
  text-align: center;
  font-weight: normal;
}

.lb-cell--player {
  font-size: 24px;
}

.lb-cell--score {
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  text-align: right;
  color: var(--neon-cta);
  text-shadow: 0 0 6px rgba(244, 63, 94, 0.3);
}

.lb-cell--sets {
  text-align: center;
  font-size: 20px;
  color: var(--color-text-muted);
}

.lb-cell--date {
  text-align: right;
  font-size: 18px;
  color: var(--color-text-muted);
}
```

### Row Variants

```css
.lb-row--top1 {
  background: linear-gradient(90deg, rgba(124, 58, 237, 0.15), transparent);
}

.lb-row--top1 .lb-cell--rank {
  color: var(--neon-primary);
  text-shadow: 0 0 10px var(--neon-primary), 0 0 20px var(--neon-primary);
}

.lb-row--top2 {
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.1), transparent);
}

.lb-row--top2 .lb-cell--rank {
  color: var(--neon-cyan);
  text-shadow: 0 0 8px var(--neon-cyan);
}

.lb-row--top3 {
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.1), transparent);
}

.lb-row--top3 .lb-cell--rank {
  color: var(--neon-amber);
  text-shadow: 0 0 8px var(--neon-amber);
}

.lb-row--highlight {
  background: rgba(244, 63, 94, 0.1);
  border-left: 3px solid var(--neon-cta);
  animation: highlight-pulse 3s infinite;
}

.lb-row--highlight .lb-cell--player {
  color: var(--neon-cta);
  text-shadow: 0 0 6px rgba(244, 63, 94, 0.4);
}
```

### Loading Skeleton

```css
.lb-loading-state {
  padding: var(--space-lg);
}

.lb-skeleton-row {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  border-bottom: 1px solid rgba(124, 58, 237, 0.1);
  align-items: center;
}

.lb-skeleton {
  background: linear-gradient(90deg, var(--color-surface) 25%, #2a2a4a 50%, var(--color-surface) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

.lb-skeleton--rank { width: 40px; height: 24px; }
.lb-skeleton--name { flex: 1; height: 20px; }
.lb-skeleton--score { width: 60px; height: 16px; }
.lb-skeleton--sets { width: 40px; height: 20px; }
.lb-skeleton--date { width: 80px; height: 18px; }
```

### Empty & Error States

```css
.lb-empty-state,
.lb-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl) var(--space-xl);
  text-align: center;
}

.lb-empty-icon,
.lb-error-icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-lg);
  opacity: 0.6;
}

.lb-empty-text,
.lb-error-text {
  font-family: 'VT323', monospace;
  font-size: 22px;
  color: var(--color-text-muted);
}

.lb-error-text {
  color: var(--neon-red);
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

.lb-retry-btn {
  margin-top: var(--space-lg);
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  padding: 10px 24px;
  background: transparent;
  color: var(--neon-primary);
  border: 2px solid var(--neon-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 200ms ease;
}

.lb-retry-btn:hover {
  background: rgba(124, 58, 237, 0.15);
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.3);
}
```

### Footer

```css
.lb-footer {
  display: flex;
  justify-content: center;
  margin-top: var(--space-xl);
  padding-top: var(--space-md);
}

.lb-refresh-btn {
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  padding: 8px 20px;
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  transition: all 200ms ease;
}

.lb-refresh-btn:hover {
  color: var(--color-text);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
}

.lb-refresh-btn--spinning .refresh-icon {
  animation: spin 1s linear infinite;
}
```

---

## Animations & Keyframes

```css
/* Highlight pulse for player row */
@keyframes highlight-pulse {
  0%, 100% {
    background: rgba(244, 63, 94, 0.08);
    box-shadow: inset 3px 0 0 var(--neon-cta);
  }
  50% {
    background: rgba(244, 63, 94, 0.15);
    box-shadow: inset 3px 0 0 var(--neon-cta), 0 0 10px rgba(244, 63, 94, 0.1);
  }
}

/* Skeleton shimmer */
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Row entrance stagger */
@keyframes row-enter {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.lb-row {
  animation: row-enter 300ms ease-out both;
}

.lb-row:nth-child(1) { animation-delay: 0.05s; }
.lb-row:nth-child(2) { animation-delay: 0.1s; }
.lb-row:nth-child(3) { animation-delay: 0.15s; }
.lb-row:nth-child(4) { animation-delay: 0.2s; }
.lb-row:nth-child(5) { animation-delay: 0.25s; }
/* Continue pattern or use JS for dynamic rows */

/* Refresh spin */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Title neon flicker */
@keyframes lb-title-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow:
      0 0 8px var(--neon-primary),
      0 0 16px var(--neon-primary);
    opacity: 1;
  }
  20%, 24%, 55% {
    text-shadow: none;
    opacity: 0.9;
  }
}

.lb-title {
  animation: lb-title-flicker 4s infinite;
}
```

---

## Interaction States

| Element | State | Visual Treatment |
|---------|-------|------------------|
| `.lb-tab` | Default | Muted text, transparent bg |
| | Hover | Lighter text, subtle tint bg |
| | Active | Purple bg, white text, glow shadow |
| `.lb-row` | Default | Subtle bottom border |
| | Hover | Raised surface bg |
| | Top 1 | Purple gradient + glowing rank |
| | Top 2 | Cyan gradient + glowing rank |
| | Top 3 | Amber gradient + glowing rank |
| | Highlight | Rose tint + left border + pulse |
| `.lb-back-btn` | Default | Muted border and text |
| | Hover | Cyan border, glow, translateX(-2px) |
| `.lb-refresh-btn` | Default | Muted border |
| | Hover | Cyan border, glow |
| | Spinning | Icon rotates |
| `.lb-difficulty-select` | Default | Subtle border |
| | Focus/Hover | Purple border, glow |

---

## Responsive Breakpoints

```css
/* Mobile: 375px */
@media (max-width: 767px) {
  .leaderboard-overlay { padding: var(--space-md); }
  .lb-title { font-size: 20px; }
  .lb-back-btn { font-size: 8px; padding: 6px 10px; }
  .lb-tab { font-size: 8px; padding: 6px 10px; }
  .lb-filter-bar { flex-direction: column; }
  .lb-th { font-size: 8px; padding: var(--space-sm); }
  .lb-cell--rank { font-size: 20px; }
  .lb-cell--player { font-size: 18px; }
  .lb-cell--score { font-size: 10px; }
  .lb-cell--sets { font-size: 16px; }
  .lb-cell--date { display: none; } /* Hide date on mobile */
  .lb-th--date { display: none; }
  .lb-footer { margin-top: var(--space-md); }
}

/* Tablet: 768px */
@media (min-width: 768px) and (max-width: 1023px) {
  .lb-title { font-size: 26px; }
  .lb-cell--rank { font-size: 24px; }
  .lb-cell--player { font-size: 20px; }
}

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) {
  .lb-container { max-width: 1100px; }
  .lb-title { font-size: 40px; }
  .lb-cell--rank { font-size: 32px; }
  .lb-cell--player { font-size: 28px; }
  .lb-cell--score { font-size: 16px; }
}
```

---

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .lb-title,
  .lb-row--highlight,
  .lb-skeleton,
  .refresh-icon {
    animation: none;
  }
  .lb-row {
    animation: none;
  }
  * { transition-duration: 0.01ms !important; }
}

/* Focus states */
*:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
}

/* High contrast table rows */
@media (prefers-contrast: more) {
  .lb-row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  }
  .lb-row--highlight {
    background: rgba(244, 63, 94, 0.2);
  }
}
```

---

## State Transitions

| Transition | Duration | Easing | Effect |
|------------|----------|--------|--------|
| Overlay enter | 400ms | ease | Fade in |
| Row enter | 300ms | ease-out | Staggered slide from left |
| Tab switch | 200ms | ease | Color/bg transition |
| Filter change | 300ms | ease | Table fade + reload |
| Loading | indefinite | linear | Skeleton shimmer |
| Refresh | 500ms | ease | Button spin, table reload |

---

## Slots & Overrides

| Slot | Selector | Purpose |
|------|----------|---------|
| `header` | `.lb-header` | Title + back navigation |
| `filter_bar` | `.lb-filter-bar` | Period + difficulty filters |
| `table_body` | `.lb-tbody` | Scrollable score rows |
| `pagination` | `.lb-footer` | Refresh + page controls |
| `back_button` | `.lb-back-btn` | Return to previous screen |

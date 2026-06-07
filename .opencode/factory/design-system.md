# Rally Pro 3D — Design System

**Version**: 2.0.0  
**Theme Name**: *Pro Tournament*  
**Vibe**: Dark, elegant, premium sports broadcast. Think ESPN meets Apple TV+ sports. Clean, confident, athletic.

---

## 1. Theme Concept & Narrative

### 1.1 Creative Direction

The game is set in a **professional table tennis arena**: darkened venue, a single spotlight on the table, crowd visible as soft silhouettes. The aesthetic borrows from:

- **Broadcast sports graphics**: Clean typography, data overlays, instant replay transitions.
- **Premium mobile sports games**: Crisp edges, subtle depth, restrained color.
- **Night tournament atmosphere**: Deep blacks, cool blue rim lighting, warm spotlights.

### 1.2 Mood Keywords

`Focused` `Competitive` `Premium` `Atmospheric` `Cinematic` `Fluid`

---

## 2. Color Palette

### 2.1 Primary Colors

| Token | Hex | RGBA | Usage |
|-------|-----|------|-------|
| `--bg-primary` | `#050508` | `rgb(5, 5, 8)` | World background, arena void |
| `--bg-secondary` | `#0d0d14` | `rgb(13, 13, 20)` | UI panels, modal backgrounds |
| `--bg-overlay` | `rgba(5, 5, 8, 0.92)` | — | Pause overlays, menus |
| `--surface-elevated` | `#14141e` | `rgb(20, 20, 30)` | Cards, settings rows |

### 2.2 Accent Colors

| Token | Hex | RGBA | Usage |
|-------|-----|------|-------|
| `--accent-cyan` | `#00d4ff` | `rgb(0, 212, 255)` | Primary accent, player highlights, active states |
| `--accent-magenta` | `#ff2d78` | `rgb(255, 45, 120)` | Opponent accent, danger, negative values |
| `--accent-gold` | `#ffc800` | `rgb(255, 200, 0)` | Victory, trophies, premium elements |
| `--accent-lime` | `#32d74b` | `rgb(50, 215, 75)` | Success, confirmation, positive indicators |
| `--accent-orange` | `#ff9500` | `rgb(255, 149, 0)` | Warnings, tips, attention |

### 2.3 Neutral Colors

| Token | Hex | RGBA | Usage |
|-------|-----|------|-------|
| `--text-primary` | `#ffffff` | `rgb(255, 255, 255)` | Headings, primary labels |
| `--text-secondary` | `#a1a1b8` | `rgb(161, 161, 184)` | Body text, descriptions |
| `--text-muted` | `#5c5c75` | `rgb(92, 92, 117)` | Placeholders, disabled, meta |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | — | Card borders, dividers |
| `--border-medium` | `rgba(255, 255, 255, 0.15)` | — | Focused inputs, hover states |
| `--border-glow` | `rgba(0, 212, 255, 0.4)` | — | Active/focused neon borders |

### 2.4 3D Scene Colors

| Element | Color | Material Properties |
|---------|-------|---------------------|
| **Table surface** | `#1a5c3a` (dark tournament green) | Roughness 0.6, Metalness 0.0, Clearcoat 0.3 |
| **Table lines** | `#ffffff` | Emissive `#ffffff` at 0.3, Roughness 0.2 |
| **Table legs/frame** | `#1a1a24` | Roughness 0.4, Metalness 0.7 |
| **Net** | `#e8e8e8` (mesh texture) | Double-sided, alpha map, Roughness 0.8 |
| **Net posts** | `#2a2a35` | Metalness 0.9, Roughness 0.2 |
| **Ball** | `#ffffff` | Roughness 0.1, Metalness 0.0, Emissive `#ffffff` at 0.1 (glow) |
| **Player paddle face** | `#00d4ff` | Roughness 0.3, Emissive `#00d4ff` at 0.2 |
| **Player paddle handle** | `#14141e` | Roughness 0.7, Metalness 0.1 |
| **AI paddle face** | `#ff2d78` | Roughness 0.3, Emissive `#ff2d78` at 0.2 |
| **Floor** | `#050508` (invisible, absorbs light) | Roughness 1.0 |
| **Arena walls** | `#08080c` | Roughness 0.9 |
| **Crowd silhouettes** | `#0a0a12` | Unlit, distant fog |

### 2.5 Lighting Colors

| Light | Type | Color | Intensity | Position |
|-------|------|-------|-----------|----------|
| **Main Spotlight** | Spot | `#fff8e7` (warm white) | 2.0 | Above table center, 4m high, casts shadows |
| **Rim Light (blue)** | Point | `#00d4ff` | 0.8 | Behind player, camera-left |
| **Rim Light (pink)** | Point | `#ff2d78` | 0.8 | Behind AI, camera-right |
| **Ambient** | Hemisphere | `#0d0d14` / `#050508` | 0.4 | Fills dark areas |
| **Ball Glow** | Point (attached) | `#ffffff` | 1.2 | At ball position, radius 0.5m |
| **Score Event** | Spot burst | `#ffc800` | 5.0 (pulsed) | On table center, 0.5s flash |

---

## 3. Typography System

### 3.1 Font Families

| Role | Font | Fallback | Weight |
|------|------|----------|--------|
| Display / Headings | `Inter` | system-ui, sans-serif | 800 (Extra Bold) |
| Body / UI | `Inter` | system-ui, sans-serif | 400, 500, 600 |
| Monospace / Data | `JetBrains Mono` | Menlo, Monaco, monospace | 400, 700 |
| Score / Timer | `Inter` | system-ui, sans-serif | 900 (Black), Condensed if available |

**Load Strategy**: Self-host variable font files (`.woff2`) for Inter and JetBrains Mono. Do NOT use Google Fonts CDN to avoid render-blocking and privacy concerns. Fallback to system fonts if fonts fail to load.

### 3.2 Type Scale

| Token | Size | Weight | Line-Height | Letter-Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `text-hero` | 72px / 4.5rem | 900 | 1.0 | -0.03em | Match win screen, hero titles |
| `text-h1` | 48px / 3rem | 800 | 1.1 | -0.02em | Screen titles, game over |
| `text-h2` | 32px / 2rem | 700 | 1.2 | -0.01em | Section headers, "YOUR SERVE" |
| `text-h3` | 24px / 1.5rem | 600 | 1.3 | 0 | Card titles, settings labels |
| `text-body` | 16px / 1rem | 400 | 1.5 | 0 | Paragraphs, descriptions |
| `text-body-sm` | 14px / 0.875rem | 400 | 1.5 | 0 | Secondary text, hints |
| `text-caption` | 12px / 0.75rem | 500 | 1.4 | 0.02em | Labels, metadata, badges |
| `text-score` | 64px / 4rem | 900 | 1.0 | -0.04em | In-game score display |
| `text-timer` | 120px / 7.5rem | 900 | 1.0 | -0.05em | Countdown timer |

### 3.3 Mobile Type Scale

At `max-width: 640px`, scale all text tokens down by 25%:

| Token | Mobile Size |
|-------|-------------|
| `text-hero` | 54px |
| `text-h1` | 36px |
| `text-h2` | 24px |
| `text-score` | 48px |
| `text-timer` | 90px |

---

## 4. 3D Visual Style

### 4.1 Rendering Approach

- **Engine**: Three.js via ES modules (import map or bundled).
- **Renderer**: WebGLRenderer with `antialias: true`, `toneMapping: THREE.ACESFilmicToneMapping`, `toneMappingExposure: 1.2`.
- **Shadows**: PCFSoftShadowMap. Main spotlight casts shadows. Max 1 shadow-casting light for performance.
- **Post-Processing** (desktop / high-power mode only):
  - UnrealBloomPass (strength 0.4, radius 0.5, threshold 0.85) — for neon accents and ball glow.
  - FXAA or SMAA for anti-aliasing on non-Retina displays.
  - **Disabled on mobile** for performance.

### 4.2 Materials & Textures

| Asset | Type | Specification |
|-------|------|---------------|
| **Table surface** | Procedural | Dark green base with subtle noise (1% brightness variance). White lines painted via UV map or decal geometry. No external texture required. |
| **Table net** | Texture | 256x64 PNG, alpha channel. Mesh pattern with white thread on transparent background. Tiled horizontally. |
| **Ball** | Procedural | White sphere, no texture. Emissive property creates self-glow. Trail is a separate particle system. |
| **Paddle rubber** | Procedural | Slightly rough surface with tiny bump. Color-tinted per player. |
| **Floor reflection** | Procedural | Planar reflection or simple glossy floor. On low-end, omit entirely. |
| **Arena crowd** | Procedural | Simple instanced meshes or point cloud. Dark, out of focus. No individual animation. |

### 4.3 Camera Angles & Framing

| Shot | Description |
|------|-------------|
| **Menu Orbit** | Camera slowly rotates around table at 30° elevation, 5m radius. FOV 50°. Depth of field (bokeh) on background. |
| **Serve POV** | Behind player's shoulder, 1.5m back, 0.8m above table. FOV 55°. Slight Dutch angle (2° tilt) for dynamism. |
| **Rally Dynamic** | Camera tracks ball with 60% weight, table center 40%. Height varies with ball Y. FOV 50°. Smooth lerp (0.04/frame). |
| **Sideline Replay** | Fixed camera at table corner, 45° angle. Used for slow-motion point replays. FOV 40°. |
| **Overhead Tactical** | Directly above table, 3m high. Used for serve preview and power-up alerts. FOV 60°. |
| **Victory Wide** | Pulls back to 8m, 20° elevation. FOV 45°. Confetti particles visible. |

### 4.4 Fog & Atmosphere

```
fog = new THREE.FogExp2(0x050508, 0.03)  // Exponential fog, dark color
```

Fog hides the far edges of the arena and gives depth. Fog density adjusted per device tier (see Tech Spec).

---

## 5. Animation Principles

### 5.1 Core Animation Values

| Property | Value | Description |
|----------|-------|-------------|
| **Primary Easing** | `cubic-bezier(0.16, 1, 0.3, 1)` | Exponential ease-out. Snappy start, smooth deceleration. |
| **Bounce Easing** | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Overshoot bounce. Used for score pop, button press. |
| **Standard Duration** | 300ms | UI transitions, button hovers. |
| **Fast Duration** | 150ms | Micro-interactions, toggles. |
| **Slow Duration** | 600ms | Screen transitions, modal open. |
| **Game Event Duration** | 1000–2000ms | Point scored, match win. |

### 5.2 Gameplay Animations

| Animation | Trigger | Implementation |
|-----------|---------|----------------|
| **Ball Trail** | Continuous during rally | Particle system: 20 segments, each fading over 200ms. Color matches ball glow. Trail curves with ball arc. |
| **Paddle Swing** | On ball strike | Rotate paddle around handle pivot: -30° to +30° over 150ms, then return. Add squash/stretch (scale Y 1.1x, X 0.9x). |
| **Paddle Idle** | Continuous | Subtle bobbing: `sin(time * 2) * 0.01m`. |
| **Ball Bounce Squash** | On table bounce | Scale ball to `0.7y, 1.15x, 1.15z` for 50ms, then spring back. |
| **Screen Shake** | On hard strike | Camera offset: `random() * intensity * decay^t`. Intensity 0.1, decay 0.9/frame, 10 frames. |
| **Slow-Mo Burst** | On point-winning shot | `timeScale` goes to 0.2 for 300ms, then ramp back to 1.0 over 200ms. Ball trail intensifies. |
| **Score Pop** | Point scored | 3D text of score springs from table surface: scale 0→1.5→1.0 over 400ms with bounce easing. Fades out over 1s. |
| **Net Ripple** | Ball hits net | Vertex shader wave displacement propagating from impact point. Fades over 500ms. |
| **Serve Toss** | Player serve | Ball follows parabolic arc: `y(t) = toss_strength * t - 0.5 * gravity * t²`. Hand/paddle tracks ball. |

### 5.3 UI Animations

| Animation | Trigger | Duration | Details |
|-----------|---------|----------|---------|
| Menu Enter | Screen change | 500ms | Overlay fades in + slides up 30px. Stagger buttons 50ms apart. |
| Menu Exit | Screen change | 300ms | Fade out + slide down 20px. |
| Button Hover | mouseenter | 200ms | Border brightens, background opacity 0→8%, scale 1.02. |
| Button Press | mousedown | 100ms | Scale 0.97, border glow intensifies. |
| Button Release | mouseup | 150ms | Scale 1.0 with bounce easing. |
| Score Update | point ends | 400ms | Score text scales 1.5→1.0 with color flash (lime for +1, magenta for AI +1). |
| Slide Panel | Settings open | 400ms | Panel slides from right, `cubic-bezier(0.16, 1, 0.3, 1)`. Backdrop fades to 50%. |
| Toast / Notification | Event | 300ms in, 3000ms hold, 300ms out | Slides from top, fades. |
| Loading Progress | Boot | Continuous | Bar width animates with `ease-out`. Percentage text counts up. |

### 5.4 Reduced Motion Support

When `prefers-reduced-motion: reduce` is detected:
- Disable ball trail particles.
- Disable screen shake.
- Disable slow-motion bursts.
- Reduce UI transition durations to 50ms (instant-ish).
- Omit crowd animation.
- Keep essential gameplay animations (ball physics, paddle swing).

---

## 6. Sound Design Direction

### 6.1 Audio Philosophy

Clean, realistic table tennis sounds with subtle arcade enhancement. The audio should communicate:
- **Ball contact quality** (sweet spot vs. edge hit).
- **Spin intensity** (whoosh during high-spin shots).
- **Game state** (tension during long rallies, release on point score).

### 6.2 Sound Categories

| Category | Sound | Description |
|----------|-------|-------------|
| **UI** | Menu hover | Soft click, 2kHz tick |
| **UI** | Menu select | Confident thud, 200Hz + 800Hz |
| **UI** | Screen transition | Subtle whoosh, low-pass filtered |
| **Gameplay** | Paddle hit (sweet) | Sharp "tok" — modelled on real celluloid ball. Pitch based on impact velocity. |
| **Gameplay** | Paddle hit (edge) | Duller "thud" + slight buzz. Lower pitch. |
| **Gameplay** | Table bounce | Bright "tick" — higher pitch than paddle. Short decay. |
| **Gameplay** | Net hit | Muted "thwop" + net vibration (high-frequency rattle). |
| **Gameplay** | Ball out / floor hit | Distant dull thud, reverb-heavy. |
| **Gameplay** | Serve toss | Soft whoosh as ball rises. |
| **Gameplay** | Spin whoosh | Continuous low rumble during high-spin ball flight (subtle). |
| **Gameplay** | Rally crowd | Ambient murmur that escalates with rally length. 5-second loop, crossfade intensity. |
| **Event** | Point scored | Short brass stab (synthesized), 400ms. Player point = major chord, AI point = dissonant minor. |
| **Event** | Match win | Triumphant 3-second fanfare. Layered brass + strings. |
| **Event** | Match lose | Descending two-note motif. 2 seconds. |
| **Event** | Deuce reached | Tension drone + heartbeat sub-bass. |
| **Event** | Let called | Neutral two-tone chime. |
| **Event** | Power-up spawn | Sci-fi shimmer (arcade mode only). |

### 6.3 Audio Implementation

- **Engine**: Web Audio API (procedural synthesis + loaded buffers).
- **Loaded Assets**: Crowd ambience (OGG, loop), music (optional, OGG), UI sounds (WAV, short).
- **Procedural**: All paddle/table/net impact sounds synthesized via noise + oscillator for zero asset load.
- **Spatial Audio**: Ball sounds are spatialized (pan based on ball X position, volume based on distance). Use `PannerNode`.
- **Master Bus**: Compression + limiter to prevent clipping during intense moments.
- **Volume Groups**: Master (0–1), SFX (0–1), Music (0–1), Ambience (0–1).

---

## 7. Responsive Design

### 7.1 breakpoints

| Name | Width | Target Device |
|------|-------|---------------|
| `mobile` | < 640px | Phones (portrait) |
| `tablet` | 640–1024px | Phones (landscape), tablets |
| `desktop` | 1024–1920px | Laptops, monitors |
| `ultrawide` | > 1920px | Large monitors |

### 7.2 Layout Adjustments

#### Mobile (< 640px)
- **Canvas**: Full viewport, no letterboxing.
- **UI**: Buttons stack vertically full-width. Touch targets ≥ 48px.
- **Controls**: Touch input only. Virtual "spin zone" at screen edges.
- **Camera**: Closer FOV (65°) for better ball visibility.
- **Post-processing**: Disabled entirely.
- **Shadows**: Disabled. Bake ambient occlusion into materials if needed.
- **Particle count**: 50 max (vs. 200 on desktop).
- **HUD**: Score positioned at top corners, smaller font. Server indicator as a small dot.
- **Menu**: Full-screen overlays, no side panels.

#### Tablet (640–1024px)
- **Canvas**: Full viewport.
- **UI**: Two-column layout where appropriate (settings).
- **Controls**: Touch + keyboard if hardware keyboard attached.
- **Camera**: Standard FOV 55°.
- **Post-processing**: Bloom only (no AA).
- **Shadows**: Main spotlight only.

#### Desktop (1024–1920px)
- **Canvas**: Centered, max-width none.
- **UI**: Side panels possible. Hover states active.
- **Controls**: Mouse + keyboard primary.
- **Camera**: Full dynamic camera with all angles.
- **Post-processing**: Full stack (bloom + FXAA).
- **Shadows**: Full PCF soft shadows.

#### Ultrawide (> 1920px)
- **Canvas**: Centered with max-width 2560px. Side gutters use dark background.
- **UI**: Expanded spacing. Score display larger.
- **Camera**: Slightly wider FOV (50°) to utilize space.

### 7.3 Orientation

- **Portrait**: Supported. Camera auto-adjusts to higher angle (top-down-ish). Table is scaled to fit width.
- **Landscape**: Primary orientation. Full experience.
- **Orientation change**: Smooth camera transition over 500ms. No reload.

### 7.4 Device Tiering (Performance)

The renderer detects GPU capability and assigns a tier:

| Tier | Detection | Resolution Scale | Shadows | Post-Proc | Particles | FPS Target |
|------|-----------|------------------|---------|-----------|-----------|------------|
| **Low** | `navigator.hardwareConcurrency <= 4` OR mobile | 0.5x | Off | Off | 50 | 60 |
| **Medium** | Standard GPU | 0.75x | 1 light | Bloom only | 100 | 60 |
| **High** | Dedicated GPU detection | 1.0x | Full | Full | 200 | 60 |
| **Ultra** | `hardwareConcurrency >= 8` + high DPR | 1.0x+ | Full | Full + SMAA | 300 | 60 |

Detection heuristic runs once at boot. User can override in Settings → Graphics Quality.

---

## 8. UI Component Styling

### 8.1 Buttons

**Primary Button**
```css
background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 212, 255, 0.05));
border: 1px solid rgba(0, 212, 255, 0.5);
color: #00d4ff;
border-radius: 8px;
padding: 14px 28px;
font: 600 16px/1.5 Inter;
text-transform: uppercase;
letter-spacing: 0.08em;
transition: all 200ms var(--ease-out);
```
Hover: `border-color: #00d4ff; background-opacity: 0.15; box-shadow: 0 0 20px rgba(0, 212, 255, 0.15);`
Active: `transform: scale(0.97);`

**Secondary Button**
```css
background: transparent;
border: 1px solid var(--border-medium);
color: var(--text-secondary);
```
Hover: `border-color: var(--text-secondary); color: var(--text-primary);`

**Danger Button**
```css
background: linear-gradient(135deg, rgba(255, 45, 120, 0.1), rgba(255, 45, 120, 0.05));
border: 1px solid rgba(255, 45, 120, 0.5);
color: #ff2d78;
```

### 8.2 Cards / Panels

```css
background: var(--bg-secondary);
border: 1px solid var(--border-subtle);
border-radius: 12px;
padding: 24px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
backdrop-filter: blur(12px);  /* Only on overlay panels */
```

### 8.3 Inputs

```css
background: var(--bg-primary);
border: 1px solid var(--border-subtle);
border-radius: 8px;
padding: 12px 16px;
color: var(--text-primary);
font: 400 16px/1.5 Inter;
transition: border-color 200ms;
```
Focus: `border-color: var(--accent-cyan); box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);`

### 8.4 Badges

```css
display: inline-flex;
align-items: center;
padding: 4px 10px;
border-radius: 100px;  /* Pill */
font: 500 12px/1.4 Inter;
letter-spacing: 0.02em;
```
Variants: `badge--cyan` (bg rgba(0,212,255,0.15), text #00d4ff), `badge--magenta`, `badge--gold`.

### 8.5 Score Display (In-Game HUD)

```css
font: 900 64px/1 Inter;
color: #ffffff;
text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
```
Player score uses left glow (`text-shadow: -4px 0 20px rgba(0, 212, 255, 0.3)`). AI score uses right glow (`text-shadow: 4px 0 20px rgba(255, 45, 120, 0.3)`).

---

## 9. Iconography

All icons are **inline SVG**, 24x24 viewbox, stroke-width 2px. No icon font (renders crisper, smaller payload).

| Icon | Usage |
|------|-------|
| Play triangle | Start, resume |
| Pause bars | Pause |
| Gear | Settings |
| Trophy | Leaderboard |
| Arrow-left | Back |
| Volume-2 | Sound on |
| Volume-x | Sound off |
| Rotate-ccw | Restart |
| Home | Main menu |
| Info | How to play |
| Zap | Power-up (arcade) |
| Chevron-right | Next, expand |
| Check | Confirm, enabled |
| X | Close, cancel |

---

## 10. Accessibility

### 10.1 Visual

- All text meets WCAG AA contrast (4.5:1 for body, 3:1 for large text).
- Focus states: 2px solid `--accent-cyan` outline, offset 2px.
- Animations respect `prefers-reduced-motion`.
- Color is not the sole indicator of state (icons + text always paired).

### 10.2 Input

- Full keyboard navigation (Tab, Enter, Escape, Arrow keys).
- Touch targets ≥ 48x48dp on mobile.
- Game is playable with keyboard-only (full feature parity).

### 10.3 Screen Reader

- Canvas has `role="img"` + `aria-label` describing current game state.
- UI overlays use proper heading hierarchy (`h1` → `h2`).
- Live regions for score announcements (`aria-live="polite"`).

---

## 11. Asset Summary

### 11.1 Required Assets

| Asset | Type | Size | Priority |
|-------|------|------|----------|
| Inter Variable Font | Font | ~80KB | Critical |
| JetBrains Mono Font | Font | ~40KB | High |
| Net texture (PNG) | Texture | ~4KB | Critical |
| Crowd ambience (OGG) | Audio | ~200KB | Medium |
| UI sounds (WAV pack) | Audio | ~50KB | High |
| Menu music (OGG loop) | Audio | ~500KB | Low (optional) |

### 11.2 Procedurally Generated

All 3D geometry — table, paddles, ball, arena — is generated via Three.js primitives. No external 3D models required. This ensures:
- Zero asset loading for core gameplay.
- Infinite resolution (no texture stretching).
- Tiny bundle size.
- Easy theming (change material colors in code).

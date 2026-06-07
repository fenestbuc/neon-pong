# Rally Pro 3D — Game Specification

**Version:** 1.0.0  
**Date:** 2026-06-07  
**Author:** System Architect / @architect agent  
**Status:** Specification (Ready for Implementation)

---

## 1. Game Overview

Rally Pro 3D is a client-side, zero-build 3D table tennis game rendered with Three.js via CDN import map. The game reimagines a classic Pong/arcade ping-pong experience with realistic physics, AI opponents, neon-retro aesthetics, and a global leaderboard backend.

### Key Design Pillars
1. **Retro-Futurism Aesthetic** — CRT scanlines, neon glow, glitch effects, pixel typography
2. **Realistic Physics** — Ball spin, air drag, Magnus effect, table restitution
3. **Accessible Controls** — Keyboard, mouse, and touch with auto-detection
4. **Progression** — AI difficulty tiers, player stats, achievements, leaderboard ranking
5. **Performance** — 60 FPS target on mid-tier devices; deterministic physics for replays

---

## 2. Game Mechanics

### 2.1 Scoring Rules (ITTF-Adapted for Arcade)

| Rule | Specification |
|------|---------------|
| **Points per set** | First to 11 points |
| **Win margin** | Minimum 2-point lead required |
| **Serve alternation** | Every 2 points; at deuce (10-10), every 1 point |
| **Sets per match** | Best-of-3 (default) or Best-of-5 (configurable in Settings) |
| **Serve timeout** | 10 seconds to strike ball after toss; auto-fault if exceeded |
| **Rally timeout** | 30 seconds per rally; auto-point to opponent if exceeded |

### 2.2 Serve Rules

1. **Toss Phase** — Server tosses ball vertically (automatic or manual input). Ball must rise at least 16 cm.
2. **Strike Phase** — Server paddle must strike ball before it bounces a second time on server side.
3. **Landing Phase** — Ball must first hit server side, then pass over net, then land in opponent diagonal half.
4. **Let Rule** — If serve hits net but lands correctly on opponent side: re-serve (LET). No limit on lets.
5. **Fault Conditions** — Missed toss, double bounce on server side, ball fails to pass net, ball lands outside receiver's diagonal half.

### 2.3 Rally Rules

1. Ball must bounce exactly once on opponent's side before being returned.
2. Double bounce on one player's side = point to opponent.
3. Ball landing outside table bounds after bouncing = point to opponent.
4. Ball hitting net during rally and crossing = play continues.
5. Ball hitting net during rally and not crossing = point to opponent.

### 2.4 Scoring Events & Reasons

| Event | Reason | Point Awarded To |
|-------|--------|-----------------|
| `POINT_PLAYER_1` | opponent missed return / double bounce / out-of-bounds | Player 1 |
| `POINT_PLAYER_2` | player missed return / double bounce / out-of-bounds | Player 2 |
| `FAULT` | serve violation (net failure, wrong half, double bounce) | Receiver |
| `LET` | serve hits net and lands in | Re-serve; no point |

---

## 3. Physics Parameters

### 3.1 Ball Physics

| Parameter | Value | Unit | Notes |
|-----------|-------|------|-------|
| Mass | 0.0027 | kg | Standard ITTF ball mass |
| Radius | 0.020 | m | Collision detection sphere |
| Gravity | -9.81 | m/s² | Vertical acceleration |
| Air density | 1.225 | kg/m³ | Sea-level standard |
| Drag coefficient | 0.47 | — | Sphere in air |
| Magnus coefficient | 0.00012 | — | Empirical spin force scalar |
| Max linear speed | 28.0 | m/s | Hard cap to prevent tunnelling |
| Serve initial speed | 5.0 – 15.0 | m/s | Depends on serve type and input duration |
| Rally typical speed | 8.0 – 25.0 | m/s | Professional rally speeds |

### 3.2 Table Physics

| Parameter | Value | Unit | Notes |
|-----------|-------|------|-------|
| Width | 1.525 | m | ITTF regulation |
| Length | 2.74 | m | ITTF regulation |
| Height | 0.76 | m | Playing surface above floor |
| Net height | 0.1525 | m | Center height |
| Net overhang | 0.1525 | m | Posts beyond table edge |
| Restitution (bounce) | 0.75 | — | Energy retained |
| Surface friction | 0.40 | — | Tangential velocity damping |
| Line width | 0.020 | m | Visual only; physics boundary is table edge |

### 3.3 Paddle Physics

| Parameter | Value | Unit | Notes |
|-----------|-------|------|-------|
| Effective radius | 0.08 | m | Hit detection disc |
| Restitution | 0.92 | — | Energy added to ball on strike |
| Friction | 0.60 | — | Transfers swing velocity to spin |
| Sweet spot radius | 0.024 | m | 30% of paddle radius |
| Sweet spot multiplier | 1.15 | — | Velocity bonus for center hits |
| Max paddle speed | 10.0 | m/s | Anti-cheat / stability clamp |

### 3.4 Net Physics

| Parameter | Value | Notes |
|-----------|-------|-------|
| Restitution | 0.05 | Ball nearly dies on net hit |
| Friction | 0.90 | High friction prevents sliding along net |
| Top band restitution | 0.15 | Slightly bouncier on top edge |

### 3.5 Serve Physics

- **Toss:** Vertical impulse of 2.5 – 4.0 m/s upward depending on serve power meter.
- **Spin transfer:** 40% of paddle's tangential velocity at contact converts to ball spin.
- **Ball release:** Ball is kinematically parented to paddle center during `PHYSICS_SERVING`; released on toss start.

---

## 4. AI Difficulty Levels

### 4.1 Novice

| Attribute | Value |
|-----------|-------|
| Reaction delay | 250 – 350 ms |
| Positioning accuracy | ±0.30 m from optimal |
| Shot prediction | None; reacts to current ball position only |
| Spin usage | Never |
| Shot variety | 100% flat returns to center |
| Targeting | Random wide shots, low accuracy |
| Movement speed cap | 3.0 m/s |
| Error rate | 30% mis-hits or late swings |

### 4.2 Intermediate

| Attribute | Value |
|-----------|-------|
| Reaction delay | 120 – 180 ms |
| Positioning accuracy | ±0.15 m from optimal |
| Shot prediction | Linear extrapolation (1 ball travel time) |
| Spin usage | 20% chance of basic topspin |
| Shot variety | 70% returns to corners, 30% center |
| Targeting | Weak corners, occasional body shot |
| Movement speed cap | 5.0 m/s |
| Error rate | 15% mis-hits |

### 4.3 Expert

| Attribute | Value |
|-----------|-------|
| Reaction delay | 50 – 80 ms |
| Positioning accuracy | ±0.06 m from optimal |
| Shot prediction | Full ballistic trajectory prediction including spin |
| Spin usage | 60% chance; mixes topspin, backspin, sidespin |
| Shot variety | Deliberate corner targeting, pace changes |
| Targeting | Aggressive wide angles; exploits player positioning |
| Movement speed cap | 7.5 m/s |
| Error rate | 8% mis-hits |

### 4.4 Pro

| Attribute | Value |
|-----------|-------|
| Reaction delay | 10 – 30 ms |
| Positioning accuracy | ±0.02 m from optimal |
| Shot prediction | Full prediction with frame-lookahead (3 frames) |
| Spin usage | 85% chance; advanced combinations (side-top, chop) |
| Shot variety | Tactical: long rallies to exhaust player, sudden smashes |
| Targeting | Extreme angles, net skimmers, edge hits |
| Movement speed cap | 9.0 m/s |
| Error rate | 4% mis-hits; errors are "believable" (edge of paddle) |
| Intentional error | 1% chance to overshoot on easy shot (humanization) |

---

## 5. Camera System

### 5.1 Camera Modes

| Mode | Description | Default For |
|------|-------------|-------------|
| `PLAYER_VIEW` | Behind player's paddle, 15° downward tilt, slight FOV (60°) | Gameplay (Player 1) |
| `SPECTATOR_VIEW` | Elevated side view (2.5m height, 45° angle), full table visible | Replay, AI vs AI demo |
| `REPLAY_VIEW` | Follows ball trajectory with 0.3x time scale; cinematic dolly | Point replays |
| `SERVE_VIEW` | Close-up on server paddle and ball, 0.8m distance | Serve toss phase |
| `CELEBRATION_VIEW` | Slow orbit around scoring player | Point win / Match win |

### 5.2 Camera Transitions

- **Interpolation:** Smooth spherical linear interpolation (slerp) for rotation; ease-in-out cubic for position.
- **Duration:** 0.8 seconds between mode switches.
- **FOV animation:** Animate field-of-view by ±5° during transitions for cinematic feel.
- **Shake:** Brief position jitter on hard paddle hits (configurable in Settings).

### 5.3 Camera Constraints

- Near clipping plane: 0.1 m
- Far clipping plane: 50 m
- Aspect ratio adapts to viewport; UI letterboxing for ultra-wide.
- `prefers-reduced-motion`: Disable shake and smooth transitions; instant cuts.

---

## 6. Particle Effects

### 6.1 Effect Catalog

| Effect | Trigger | Visual Description | Performance Budget |
|--------|---------|-------------------|-------------------|
| **Hit Sparks** | Paddle contact | Burst of 12-20 neon particles (color = spin type: cyan=topspin, magenta=backspin, yellow=sidespin) | 200 particles max on screen |
| **Table Bounce Dust** | Table contact | Subtle 4-6 particle puff near bounce point; white/gray | 100 particles max |
| **Ball Trail** | Ball speed > 12 m/s | Fading ribbon mesh following ball path; opacity 0.3 | Max 30 trail segments |
| **Net Ripple** | Net contact | 1D wave displacement on net mesh; subsides over 0.5s | GPU vertex shader |
| **Score Celebration** | Point awarded | Large text "+1" or "SET POINT!" with upward float and fade | 1 active at a time |
| **Match Win Fireworks** | Match victory | Burst emitters from table corners; neon colored (purple/rose) | 500 particles, 3 seconds |
| **Serve Toss Arc** | Toss phase | Dotted predicted trajectory line (Player 1 only, or in tutorial) | 20 billboarded dots |
| **CRT Scanlines** | Always-on screen effect | Horizontal line overlay at 60% opacity; slight flicker | Single fullscreen quad |

### 6.2 Particle Tiers

| Quality | Hit Sparks | Trail Segments | Fireworks | Notes |
|---------|-----------|----------------|-----------|-------|
| Low | 6 particles | 10 segments | Disabled | Mobile / low-power mode |
| Medium | 15 particles | 25 segments | Reduced burst | Default |
| High | 25 particles | 40 segments | Full burst | Desktop/high-end devices |

---

## 7. Sound Design

### 7.1 Audio Catalog

| Sound | Trigger | Properties |
|-------|---------|-----------|
| `hit_paddle` | Ball-paddle collision | Short wooden/rubber click; pitch scales +3 semitones per 2 m/s ball speed; stereo pan by contact X |
| `hit_table` | Ball-table collision | Dull thud; low-pass filtered; volume scales with impact force |
| `hit_net` | Ball-net collision | Metallic ping; short decay |
| `score_point` | Point awarded | Retro 8-bit ascending chime; higher pitch for deuce/match point |
| `serve_toss` | Toss phase start | Soft air whoosh; stereo by server position |
| `countdown_beep` | Each countdown tick | 440 Hz square wave; final "GO!" is 880 Hz with reverb |
| `match_win` | Player wins match | Synth fanfare arpeggio (C-E-G-C); 3 seconds |
| `match_loss` | Player loses match | Descending minor triad; shorter (1.5s) |
| `ui_hover` | Menu item focus | Subtle 200 Hz blip |
| `ui_select` | Menu item activation | Confirmed 600 Hz chime |
| `ambient_arcade` | Menu / background | Low-volume synth pad drone; 70 BPM; loops seamlessly |
| `ui_back` | Navigate back | 300 Hz descending blip |

### 7.2 Audio Mixing

| Bus | Volume | Ducking Behavior |
|-----|--------|------------------|
| SFX (gameplay) | 0 dB | Always active |
| Music | -8 dB | Ducks -12 dB during gameplay; full during menus |
| UI | -4 dB | Always active |
| Ambient | -14 dB | Fades out 0.5s after gameplay starts |

### 7.3 Accessibility

- Master volume: 0-100% per Settings.
- Separate toggles: SFX, Music, UI sounds.
- Visual indicators: Subtle screen flash on score events for deaf/hard-of-hearing players.

---

## 8. Input Mapping

### 8.1 Keyboard (Default)

| Action | Primary | Alternative |
|--------|---------|-------------|
| Move paddle left | Arrow Left | A |
| Move paddle right | Arrow Right | D |
| Move paddle forward | Arrow Up | W |
| Move paddle back | Arrow Down | S |
| Serve / Toss | Space | Enter |
| Pause | Escape | P |
| Quick restart | R | — |

### 8.2 Mouse

| Action | Mapping |
|--------|---------|
| Paddle X position | Mouse X mapped to table width (-0.7625m to +0.7625m) |
| Paddle Z position | Mouse Y mapped to table half-length (0m to 1.37m) |
| Serve / Swing | Left click (hold for power, release to strike) |
| Add topspin | Scroll up during swing |
| Add backspin | Scroll down during swing |

### 8.3 Touch

| Action | Mapping |
|--------|---------|
| Paddle position | Single finger drag; direct 1:1 mapping to table coordinates |
| Serve / Swing | Tap and hold (charge), release (strike) |
| Serve toss | Swipe upward to toss height |
| Pause | Two-finger tap |
| Resume | Single tap on resume button |

### 8.4 Input Priority & Auto-Detection

- **Detection order:** On first input event, detect device type and lock primary input.
- **Hybrid mode:** Mouse/touch always available for UI; game input locked to last-active device.
- **Touch damping:** Apply 50ms moving average to touch position to reduce jitter.
- **Deadzone:** 2% of screen edge ignored to prevent edge-of-screen UI conflicts.

---

## 9. Game Flow & State Machine

### 9.1 High-Level Flow

```
BOOT ──→ LOADING ──→ TITLE_SCREEN
                              │
                              ▼
                    DIFFICULTY_SELECT
                              │
                              ▼
                    COUNTDOWN (3, 2, 1, GO)
                              │
                              ▼
                    SERVING (Toss → Strike)
                              │
              ┌───────────────┼───────────────┐
              │ (valid serve) │ (fault)       │ (let)
              ▼               ▼               ▼
          PLAYING        POINT_END         SERVING
              │          (point to          (re-serve)
              │          receiver)
              │               ▲
              │ (point scored)│
              └───────────────┘
                              │
                              ▼
                    NEXT_POINT ──→ [check set win]
                              │
                    [set not won] ──→ SERVING
                              │
                    [set won, match not won] ──→ COUNTDOWN
                              │
                              ▼
                    GAME_OVER (Win / Loss)
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
          LEADERBOARD    MAIN_MENU       PLAY_AGAIN
```

### 9.2 State Definitions

| State | Description | Allowed Transitions |
|-------|-------------|---------------------|
| `BOOT` | App initialization, feature detection, import map loading | `LOADING` |
| `LOADING` | Asset loading (3D models, textures, audio); progress 0-100% | `TITLE_SCREEN` |
| `TITLE_SCREEN` | Main menu with neon animation; background AI demo match | `DIFFICULTY_SELECT`, `LEADERBOARD_SCREEN`, `SETTINGS_PANEL`, `TUTORIAL_OVERLAY` |
| `DIFFICULTY_SELECT` | Player chooses AI opponent tier | `COUNTDOWN` (or `TITLE_SCREEN` via Back) |
| `COUNTDOWN` | Full-screen 3-2-1-GO animation; physics frozen | `SERVING` |
| `SERVING` | Toss and strike phase; server determined by rules | `PLAYING` (valid serve), `POINT_END` (fault), `SERVING` (let) |
| `PLAYING` | Active rally; physics running; input active | `POINT_END` |
| `POINT_END` | Ball out of play; scoring evaluated; short delay (1.5s) | `NEXT_POINT` |
| `NEXT_POINT` | Transition state: checks set/match completion | `SERVING` (next point), `COUNTDOWN` (next set), `GAME_OVER` |
| `GAME_OVER` | Match result screen with stats and options | `LEADERBOARD`, `TITLE_SCREEN`, `DIFFICULTY_SELECT` (Play Again) |
| `PAUSED` | Physics frozen; PauseMenu overlay | `PLAYING` (resume), `TITLE_SCREEN` (quit), `SETTINGS_PANEL` |
| `REPLAY` | Slow-motion ball trajectory replay after spectacular rallies | `PLAYING` (skip) |

### 9.3 State Data (Context)

Each state transition carries immutable context:

```yaml
GameContext:
  match_id: uuid           # Generated at match start
  player_id: uuid          # From auth/guest session
  difficulty: string       # novice | intermediate | expert | pro
  sets_to_win: integer     # 2 (best-of-3) or 3 (best-of-5)
  player_score: integer
  opponent_score: integer
  player_sets: integer
  opponent_sets: integer
  server: string           # player_1 | player_2
  rally_count: integer
  longest_rally: integer
  match_start_time: ISO8601
  point_start_time: ISO8601
  is_replay_available: boolean   # True if rally > 5 hits
```

---

## 10. Rendering Architecture

### 10.1 Scene Graph

```
Scene
├── TableGroup
│   ├── TableMesh (playing surface)
│   ├── NetMesh
│   ├── LineMeshes (white boundary lines)
│   └── PostMeshes (net posts)
├── BallGroup
│   └── BallMesh
├── PaddleGroup
│   ├── PlayerPaddleMesh
│   └── OpponentPaddleMesh
├── ParticleGroup
│   ├── HitSparksEmitter
│   ├── TrailRibbonMesh
│   └── NetRippleMesh
├── Environment
│   ├── FloorPlane
│   ├── BackWallPlane
│   └── NeonLightStrips (emissive meshes for atmosphere)
└── CameraRig
    ├── MainCamera (PerspectiveCamera)
    └── PostProcessQuad (CRT scanlines, vignette)
```

### 10.2 Lighting

| Light | Type | Parameters |
|-------|------|-----------|
| Key light | Directional | Color #E2E8F0, intensity 1.2, position (5, 10, 5), casts shadow |
| Fill light | Hemisphere | Color #7C3AED (sky), #0F0F23 (ground), intensity 0.4 |
| Neon accent | Point (×4) | Color #A78BFA, intensity 0.8, positioned at table corners |
| CTA glow | Spot | Color #F43F5E, targets score board area, intensity 0.6 |

### 10.3 Performance Budget

| Metric | Target | Max |
|--------|--------|-----|
| Draw calls | < 30 | 50 |
| Triangle count | < 15,000 | 25,000 |
| Texture memory | < 32 MB | 64 MB |
| Frame time | 16.6 ms | 20 ms |
| Physics step cost | < 2 ms | 4 ms |

---

## 11. Asset Requirements

### 11.1 3D Models

| Asset | Format | Description |
|-------|--------|-------------|
| `table.glb` | glTF | Regulation table with UV-mapped surface |
| `paddle.glb` | glTF | Paddle with rubber face material |
| `ball.glb` | glTF | Sphere with seam detail |
| `environment.glb` | glTF | Floor, back wall, neon light fixtures |

### 11.2 Textures

| Texture | Size | Type | Usage |
|---------|------|------|-------|
| `table_surface.png` | 1024×2048 | diffuse + roughness | Table top |
| `net_alpha.png` | 256×256 | alpha | Net mesh transparency |
| `scanline_overlay.png` | 128×128 | repeating alpha | CRT effect |
| `particle_spark.png` | 64×64 | additive alpha | Hit sparks |

### 11.3 Audio

| Asset | Format | Notes |
|-------|--------|-------|
| `hit_paddle/*.wav` | WAV 44.1kHz | 5 variants for speed layers |
| `hit_table.wav` | WAV 44.1kHz | Single, pitch-shifted in code |
| `hit_net.wav` | WAV 44.1kHz | Short metallic ping |
| `score_*.wav` | WAV 44.1kHz | Normal, set point, match point, deuce |
| `match_win.ogg` | Ogg Vorbis | 3-second fanfare |
| `match_loss.ogg` | Ogg Vorbis | 1.5-second descending |
| `ambient_arcade.ogg` | Ogg Vorbis | 60-second loop |
| `ui_*.wav` | WAV 44.1kHz | Hover, select, back, countdown |

---

## 12. Anti-Cheat & Validation

### 12.1 Client-Side

- Input velocity capped at 10 m/s to prevent impossible paddle speeds.
- Ball speed hard-capped at 28 m/s.
- Paddle position constrained to reachable zone (cannot clip through table).
- Match checksum: HMAC-SHA256 of concatenated rally signatures.

### 12.2 Server-Side

- Rate limit: 10 leaderboard submissions per minute per IP.
- Checksum verification: Server recomputes checksum using shared secret.
- Score plausibility: Reject scores that exceed theoretical maximum for difficulty and duration.
- Guest entries accepted but flagged; not eligible for permanent top-10 rankings.

---

## 13. Accessibility

| Feature | Implementation |
|---------|---------------|
| Reduced motion | Disable camera shake, particle bursts, and glitch animations |
| Color blind safe | All game-critical info conveyed by position, not color alone |
| Screen reader | ARIA labels on all UI buttons; focus trap in modals |
| High contrast | Optional high-contrast UI mode with #FFFFFF on #000000 |
| Keyboard nav | Full menu navigation via Tab, Enter, Escape, Arrow keys |
| Touch target size | Minimum 44 × 44 CSS pixels for all interactive elements |
| Subtitles | Visual text cues for all gameplay sound events |

---

## 14. Build & Deployment

### 14.1 Zero-Build Setup

- **No bundler** (Vite/Webpack) for game code.
- Three.js loaded via CDN import map in `index.html`.
- ES modules served natively by static host.
- Backend API is separate FastAPI service (not bundled).

### 14.2 File Structure

```
/
├── index.html                 # Entry point, import map, UI overlays
├── src/
│   ├── css/
│   │   ├── variables.css      # Design system tokens
│   │   ├── base.css           # Reset, fonts, global styles
│   │   ├── components.css     # Button, card, modal styles
│   │   └── effects.css        # CRT, neon glow, glitch keyframes
│   ├── js/
│   │   ├── core/
│   │   │   ├── Game.js        # Main game controller
│   │   │   ├── GameStateMachine.js  # State management
│   │   │   └── Settings.js    # LocalStorage-backed config
│   │   ├── renderer/
│   │   │   ├── SceneManager.js
│   │   │   ├── GameRenderer.js
│   │   │   ├── CameraManager.js
│   │   │   └── PostProcess.js
│   │   ├── physics/
│   │   │   └── PhysicsEngine.js
│   │   ├── input/
│   │   │   └── InputManager.js
│   │   ├── ai/
│   │   │   └── AIController.js
│   │   ├── ui/
│   │   │   ├── UIManager.js
│   │   │   ├── TitleScreen.js
│   │   │   ├── HUD.js
│   │   │   ├── PauseMenu.js
│   │   │   ├── GameOverScreen.js
│   │   │   ├── LeaderboardScreen.js
│   │   │   ├── SettingsPanel.js
│   │   │   ├── CountdownOverlay.js
│   │   │   ├── LoadingScreen.js
│   │   │   ├── TutorialOverlay.js
│   │   │   └── NotificationToast.js
│   │   ├── audio/
│   │   │   └── AudioManager.js
│   │   ├── particles/
│   │   │   └── ParticleSystem.js
│   │   └── api/
│   │       └── GameAPI.js     # Fetch wrapper for backend
│   └── assets/
│       ├── models/
│       ├── textures/
│       └── audio/
├── api/                       # FastAPI backend (separate deploy)
│   └── main.py
└── vercel.json                # Static routes, SPA fallback
```

### 14.3 CDN Import Map

```html
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
  }
}
</script>
```

---

## 15. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-07 | Initial specification |

---

*This specification is a read-only contract. Implementation deviations require version bump and explicit approval.*

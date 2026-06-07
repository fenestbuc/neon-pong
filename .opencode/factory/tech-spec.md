# Rally Pro 3D — Technical Architecture

**Version**: 2.0.0  
**Rendering Engine**: Three.js (r165+)  
**Language**: Vanilla ES6+ JavaScript (no framework)  
**Build Tool**: Zero-build for development; esbuild for production bundling

---

## 1. Rendering Architecture

### 1.1 Engine Selection: Three.js

**Decision**: Use **Three.js** imported via CDN ES modules (import map) for development, bundled via esbuild for production.

**Rationale**:

| Factor | Three.js | Raw WebGL | Babylon.js | PlayCanvas |
|--------|----------|-----------|------------|------------|
| Bundle size (min) | ~150 KB (tree-shaken: ~80 KB) | 0 KB | ~220 KB | ~210 KB |
| Learning curve | Moderate | Steep | Moderate | Moderate |
| Scene graph | Excellent built-in | Manual | Excellent | Good |
| Shadow mapping | Built-in (PCFSoft) | Manual shaders | Built-in | Built-in |
| Post-processing | EffectComposer built-in | Manual FBO chain | Built-in | Built-in |
| Mobile support | Excellent | Variable | Good | Good |
| Community / docs | Massive | Sparse | Large | Small |
| Tree-shaking | Yes (ES modules) | N/A | Partial | No |

Three.js provides the best balance of capability, documentation, and ecosystem for a small team. Raw WebGL would require writing ~2,000 lines of shader and matrix math boilerplate. The v1.0 decision to avoid frameworks for UI still holds, but Three.js is a rendering engine, not a UI framework — it does not interfere with the game's imperative game loop.

### 1.2 Three.js Import Strategy

**Development (zero-build)**:
```html
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.165.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.165.0/examples/jsm/"
  }
}</script>
```

**Production (bundled)**:
- Run `npm run build` (esbuild) to tree-shake and bundle into `dist/game.js`.
- The bundled file replaces the import map with inlined modules.
- This is optional: the CDN import map works fine for Cloudflare Pages deployment.

### 1.3 Renderer Configuration

```javascript
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
```

---

## 2. Scene Graph Structure

### 2.1 Scene Hierarchy

```
Scene (THREE.Scene)
├── World
│   ├── Arena
│   │   ├── Floor (PlaneGeometry, invisible shadow catcher)
│   │   ├── Walls (4x PlaneGeometry, far distance)
│   │   └── Crowd (InstancedMesh, low poly)
│   ├── Lighting
│   │   ├── ambientLight (HemisphereLight)
│   │   ├── mainSpot (SpotLight + ShadowCamera)
│   │   ├── rimLightPlayer (PointLight, cyan)
│   │   ├── rimLightAI (PointLight, magenta)
│   │   └── ballGlow (PointLight, white, attached to ball)
│   └── Fog (FogExp2)
├── Table
│   ├── surface (BoxGeometry, green material)
│   ├── lines (4x thin BoxGeometry, white emissive)
│   ├── legs (4x CylinderGeometry)
│   └── net
│       ├── mesh (PlaneGeometry, net texture, alpha map)
│       ├── postLeft (CylinderGeometry)
│       └── postRight (CylinderGeometry)
├── Paddles
│   ├── playerPaddle
│   │   ├── face (BoxGeometry, cyan emissive)
│   │   ├── handle (BoxGeometry, dark)
│   │   └── swingPivot (Object3D, rotation origin)
│   └── aiPaddle
│       ├── face (BoxGeometry, magenta emissive)
│       ├── handle (BoxGeometry, dark)
│       └── swingPivot (Object3D)
├── Ball
│   ├── mesh (SphereGeometry, white)
│   ├── glowLight (PointLight)
│   └── trail ( THREE.BufferGeometry + custom shader OR Points )
├── Effects
│   ├── particles (Points, hit sparks)
│   └── screenShake (Camera offset wrapper)
└── CameraRig
    ├── yawNode (Object3D)
    │   └── pitchNode (Object3D)
    │       └── camera (PerspectiveCamera)
    └── lookAtTarget (Object3D, invisible, camera looks here)
```

### 2.2 Object Pooling

Frequently created/destroyed objects use object pools to eliminate GC pauses:

| Object Type | Pool Size | Notes |
|-------------|-----------|-------|
| Ball trail segments | 40 | Reused every frame |
| Hit particles | 100 | Spawned on paddle strike, returned to pool after fade |
| Score text meshes | 4 | Reused for score pop animations |
| Let text meshes | 2 | Reused for "LET" display |

Pool implementation: simple array of pre-allocated `THREE.Object3D` instances with `visible = false` when inactive.

---

## 3. Game Loop Architecture

### 3.1 Fixed-Timestep Physics + Variable Render

```javascript
const PHYSICS_STEP = 1 / 120;  // 120 Hz physics
let accumulator = 0;

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);  // Cap at 100ms
  lastTime = timestamp;

  accumulator += dt;

  // Fixed-step physics
  while (accumulator >= PHYSICS_STEP) {
    updatePhysics(PHYSICS_STEP);
    accumulator -= PHYSICS_STEP;
  }

  // Variable-step render + camera interpolation
  const alpha = accumulator / PHYSICS_STEP;  // For visual interpolation if needed
  updateCamera(dt);
  updateAnimations(dt);
  updateParticles(dt);

  // Render
  renderer.render(scene, camera);

  requestAnimationFrame(gameLoop);
}
```

**Rationale**: Fixed-step physics prevents tunneling (ball passing through paddle between frames at high speed) and ensures deterministic simulation across frame rates. Rendering remains at display refresh rate (60–120 Hz).

### 3.2 Module Dependencies

```
main.js
├── Game.js (orchestrator: owns gameLoop, state machine, scene)
│   ├── Physics.js (ball physics, collisions, spin)
│   ├── AI.js (opponent behavior)
│   ├── Input.js (keyboard, mouse, touch → paddle target)
│   ├── Camera.js (camera modes + transitions)
│   ├── Audio.js (Web Audio API synthesis + buffers)
│   └── StateMachine.js (game state transitions)
├── Renderer3D.js (Three.js setup, scene graph, materials)
│   ├── SceneBuilder.js (procedural geometry creation)
│   ├── EffectsComposer.js (post-processing stack)
│   └── ParticleSystem.js (trails, sparks, dust)
├── UI.js (DOM overlay management)
│   ├── ScreenManager.js (show/hide overlays)
│   └── HUD.js (score, timer, spin meter)
├── LeaderboardClient.js (unchanged API contract)
└── Settings.js (localStorage persistence)
```

### 3.3 State Machine Implementation

```javascript
const STATES = {
  BOOT: 'boot',
  LOADING: 'loading',
  MENU: 'menu',
  MATCH_SETUP: 'match_setup',
  COIN_TOSS: 'coin_toss',
  SERVE_PREP: 'serve_prep',
  SERVING: 'serving',
  RALLY: 'rally',
  POINT_END: 'point_end',
  MATCH_END: 'match_end',
  PAUSED: 'paused',
  LEADERBOARD: 'leaderboard',
  SETTINGS: 'settings',
  TUTORIAL: 'tutorial',
};

class StateMachine {
  constructor() {
    this.state = STATES.BOOT;
    this.stateTime = 0;
    this.transitions = {
      [STATES.BOOT]: [STATES.LOADING],
      [STATES.LOADING]: [STATES.MENU],
      [STATES.MENU]: [STATES.MATCH_SETUP, STATES.LEADERBOARD, STATES.SETTINGS, STATES.TUTORIAL],
      [STATES.MATCH_SETUP]: [STATES.COIN_TOSS],
      [STATES.COIN_TOSS]: [STATES.SERVE_PREP],
      [STATES.SERVE_PREP]: [STATES.SERVING],
      [STATES.SERVING]: [STATES.RALLY, STATES.POINT_END],
      [STATES.RALLY]: [STATES.POINT_END],
      [STATES.POINT_END]: [STATES.MATCH_END, STATES.SERVE_PREP],
      [STATES.MATCH_END]: [STATES.MENU, STATES.MATCH_SETUP],
      // ... etc
    };
  }

  transition(toState, data = {}) {
    if (!this.transitions[this.state]?.includes(toState)) {
      console.warn(`Invalid transition: ${this.state} → ${toState}`);
      return false;
    }
    this.exitState(this.state);
    this.state = toState;
    this.stateTime = 0;
    this.enterState(toState, data);
    return true;
  }

  update(dt) {
    this.stateTime += dt;
    this.updateState(this.state, dt);
  }
}
```

---

## 4. Physics Engine

### 4.1 Custom Lightweight Physics

No external physics engine (Cannon.js, Ammo.js). Table tennis physics are simple enough to implement directly and avoids:
- Additional bundle size (~100 KB for Cannon.js).
- Complexity of full rigid-body simulation.
- Performance overhead of broad-phase/narrow-phase when we have only 3 dynamic objects (ball, 2 paddles).

### 4.2 Collision Detection

```javascript
class PhysicsEngine {
  constructor() {
    this.gravity = 9.81 * GAME_SCALE;
    this.ball = new Ball();
    this.playerPaddle = new Paddle();
    this.aiPaddle = new Paddle();
    this.tableBounds = new TableBounds();
    this.net = new Net();
  }

  step(dt) {
    // 1. Integrate ball motion
    this.ball.velocity.y -= this.gravity * dt;
    this.ball.velocity.multiplyScalar(1 - AIR_DRAG * dt);
    this.ball.position.add(this.ball.velocity.clone().multiplyScalar(dt));

    // 2. Spin-induced curve (Magnus effect)
    this.applyMagnusEffect(dt);

    // 3. Table bounce
    if (this.ball.position.y <= this.ball.radius && this.isOverTable(this.ball.position)) {
      this.resolveTableBounce();
    }

    // 4. Net collision
    if (this.net.intersects(this.ball)) {
      this.resolveNetCollision();
    }

    // 5. Paddle collisions
    if (this.playerPaddle.intersects(this.ball)) {
      this.resolvePaddleCollision(this.playerPaddle);
    }
    if (this.aiPaddle.intersects(this.ball)) {
      this.resolvePaddleCollision(this.aiPaddle);
    }

    // 6. Out-of-bounds / floor
    if (this.ball.position.y < -0.5 || this.isOutOfBounds(this.ball.position)) {
      this.emitEvent('ball_dead', { position: this.ball.position.clone() });
    }
  }

  // AABBox + sphere intersection for paddles
  intersectsPaddle(ball, paddle) {
    const box = paddle.getBoundingBox();
    const closest = box.clampPoint(ball.position);
    return closest.distanceToSquared(ball.position) < ball.radius ** 2;
  }
}
```

### 4.3 Determinism

Physics uses only `dt` (no `Date.now()` or RNG during simulation). Randomness (AI error, serve angle) is seeded at state transition time and stored. This enables:
- Replay recording (for instant replay feature).
- Consistent behavior across devices.

---

## 5. Input System

### 5.1 Input Abstraction Layer

```javascript
class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keyboard = new KeyboardInput();
    this.mouse = new MouseInput(canvas);
    this.touch = new TouchInput(canvas);
    this.gesture = new GestureRecognizer();

    this.paddleTarget = { z: 0 };      // Normalized -1 to 1
    this.spinInput = { topspin: 0, sidespin: 0 };
    this.serveCharge = 0;              // 0 to 1
  }

  update() {
    // Merge all input sources
    this.paddleTarget.z = this.mergeSources('z');
    this.spinInput = this.gesture.currentSpin;
    this.serveCharge = this.gesture.serveCharge;
  }
}
```

### 5.2 Input Mappings

| Action | Keyboard | Mouse | Touch |
|--------|----------|-------|-------|
| Move paddle left | Arrow Left / A | Move mouse left | Drag finger left |
| Move paddle right | Arrow Right / D | Move mouse right | Drag finger right |
| Topspin | Arrow Up / W | Swipe up | Quick upward flick |
| Backspin | Arrow Down / S | Swipe down | Quick downward flick |
| Serve toss | Space / Enter | Click | Tap |
| Serve strike | Space / Enter | Click | Tap (while ball in air) |
| Pause | Escape / P | — | Top-right pause button |

### 5.3 Touch Gesture Recognition

```javascript
class GestureRecognizer {
  onTouchMove(e) {
    const dt = now - this.lastTouchTime;
    const dx = touch.x - this.lastTouch.x;
    const dy = touch.y - this.lastTouch.y;
    const speedY = dy / dt;
    const speedX = dx / dt;

    // Detect spin gesture if speed exceeds threshold
    if (Math.abs(speedY) > SPIN_THRESHOLD) {
      this.currentSpin.topspin = clamp(speedY / MAX_SWIPE_SPEED, -1, 1);
    }
    if (Math.abs(speedX) > SPIN_THRESHOLD) {
      this.currentSpin.sidespin = clamp(speedX / MAX_SWIPE_SPEED, -1, 1);
    }
  }
}
```

---

## 6. Asset Requirements

### 6.1 Bundled Assets (in `public/assets/`)

| File | Type | Size | Purpose |
|------|------|------|---------|
| `fonts/Inter-Variable.woff2` | Font | ~80 KB | UI + display text |
| `fonts/JetBrainsMono-Variable.woff2` | Font | ~40 KB | Monospace data |
| `textures/net.png` | PNG | ~4 KB | Net mesh pattern |
| `audio/crowd.ogg` | OGG | ~200 KB | Crowd ambience loop |
| `audio/ui-hover.wav` | WAV | ~2 KB | UI hover |
| `audio/ui-select.wav` | WAV | ~3 KB | UI select |
| `audio/hit-sweet.wav` | WAV | ~5 KB | Paddle hit (loaded, not procedural) |
| `audio/bounce-table.wav` | WAV | ~3 KB | Table bounce |
| `music/menu.ogg` | OGG | ~500 KB | Menu music (optional) |

**Total asset payload**: ~837 KB (optional music excluded: ~337 KB).

### 6.2 Procedurally Generated Assets

All 3D geometry, materials, particle effects, and synthesized sounds are generated in code. No `.gltf`, `.obj`, or `.fbx` files.

### 6.3 Asset Loading Pipeline

```javascript
class AssetLoader {
  async load() {
    const promises = [
      this.loadFont('Inter'),
      this.loadFont('JetBrainsMono'),
      this.loadTexture('net'),
      this.loadAudio('crowd'),
      this.loadAudio('ui-hover'),
      this.loadAudio('ui-select'),
      this.loadAudio('hit-sweet'),
      this.loadAudio('bounce-table'),
    ];

    const results = await Promise.all(promises);
    this.emit('loaded', results);
  }
}
```

---

## 7. Performance Budget

### 7.1 Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Frame time | ≤ 16.67ms (60 FPS) | `performance.now()` delta |
| Draw calls | ≤ 50 per frame | Three.js renderer.info.render.calls |
| Triangles | ≤ 50,000 per frame | renderer.info.render.triangles |
| Texture memory | ≤ 32 MB | Estimated from loaded textures |
| JS heap | ≤ 64 MB | Chrome DevTools Memory tab |
| First render | ≤ 1.5s | From navigation start to first frame |
| Time to interactive | ≤ 3s | From navigation to responsive input |

### 7.2 Optimization Strategies

#### Geometry
- Table: `BoxGeometry(2.74, 0.02, 1.525)` — 12 triangles.
- Lines: 4x `BoxGeometry(thin, thin, length)` — negligible.
- Paddles: `BoxGeometry` — 12 triangles each.
- Ball: `SphereGeometry(16, 16)` — 512 triangles.
- Crowd: `InstancedMesh` with `BoxGeometry` — 1 draw call for 100 instances.
- **Total static geometry**: < 2,000 triangles.

#### Materials
- Reuse materials: `tableMaterial`, `paddlePlayerMaterial`, `paddleAIMaterial`, `ballMaterial`.
- Use `MeshBasicMaterial` for unlit elements (crowd, distant walls).
- Use `MeshStandardMaterial` only for lit elements (table, paddles, ball).

#### Shadows
- Only the main spotlight casts shadows.
- Shadow map size: 1024x1024 on mobile, 2048x2048 on desktop.
- Shadow camera bounds tightly fitted to table area.

#### Post-Processing
- **Mobile**: Disabled entirely. `renderer.render(scene, camera)` directly.
- **Desktop**: `EffectComposer` with `RenderPass` + `UnrealBloomPass` + `OutputPass`.
- **Ultrawide**: Add `SMAAPass` for anti-aliasing.

#### LOD (Level of Detail)
- Crowd instanced mesh: 100 instances at < 5m distance, 20 instances beyond.
- Ball trail: 40 segments on desktop, 15 on mobile.
- Particle counts: 200 on desktop, 50 on mobile.

#### Memory
- Object pools for particles and text meshes (no `new`/`dispose` during gameplay).
- Reuse geometries and materials; clone only when necessary.
- Call `renderer.dispose()` only on app unload, not during state transitions.

### 7.3 Performance Monitoring

```javascript
class PerformanceMonitor {
  constructor() {
    this.frames = [];
    this.lastLog = 0;
  }

  record(frameTime) {
    this.frames.push(frameTime);
    if (this.frames.length > 60) this.frames.shift();

    if (performance.now() - this.lastLog > 5000) {
      const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
      const fps = 1000 / avg;
      console.log(`Avg FPS: ${fps.toFixed(1)} | Draw calls: ${renderer.info.render.calls}`);
      this.lastLog = performance.now();
    }
  }
}
```

In development builds, display a small FPS counter in the corner (toggle via Settings → Debug).

---

## 8. Build Tooling

### 8.1 Development: Zero Build

The game runs directly in the browser using native ES modules + import map. No `npm run dev` server required (though `npx serve` is recommended).

**Why zero-build for development**:
- Instant reload (no bundler step).
- Native source maps (files map 1:1).
- No Node.js dependency for frontend development.
- Matches v1.0 design decision for minimal tooling.

### 8.2 Production: esbuild

For optimized production builds (optional but recommended):

```json
// package.json (devDependencies only)
{
  "devDependencies": {
    "esbuild": "^0.21.0"
  },
  "scripts": {
    "build": "esbuild src/js/main.js --bundle --minify --outfile=dist/game.js --format=esm",
    "serve": "npx serve ."
  }
}
```

Build step:
1. Tree-shakes unused Three.js modules.
2. Minifies and bundles to a single `.js` file.
3. Copies `index.html`, `assets/`, and `styles.css` to `dist/`.
4. Replaces import map with inlined bundle reference.

### 8.3 File Structure

```
neon-pong-factory/
├── index.html                    # Entry point (updated for 3D)
├── src/
│   ├── js/
│   │   ├── main.js               # Entry module: initializes game
│   │   ├── Game.js               # Game orchestrator, main loop
│   │   ├── StateMachine.js       # Game state definitions + transitions
│   │   ├── Physics.js            # Ball physics, collisions, spin
│   │   ├── AI.js                 # Opponent behavior
│   │   ├── Input.js              # Keyboard, mouse, touch handlers
│   │   ├── Camera.js             # Camera modes + smooth transitions
│   │   ├── Audio.js              # Web Audio API synthesis + spatial audio
│   │   ├── Renderer3D.js         # Three.js setup, scene graph management
│   │   ├── SceneBuilder.js       # Procedural geometry creation
│   │   ├── ParticleSystem.js     # Trails, sparks, dust
│   │   ├── EffectsComposer.js    # Post-processing (desktop only)
│   │   ├── UI.js                 # DOM overlay management
│   │   ├── HUD.js                # In-game HUD elements
│   │   ├── ScreenManager.js      # Menu / overlay show-hide logic
│   │   ├── LeaderboardClient.js  # API client (unchanged contract)
│   │   ├── Settings.js           # localStorage persistence
│   │   ├── AssetLoader.js        # Font, texture, audio loading
│   │   ├── PerformanceMonitor.js # FPS, draw call tracking
│   │   └── constants.js          # Game constants, colors, config
│   ├── css/
│   │   ├── style.css             # Main stylesheet (evolved from v1)
│   │   └── animations.css        # Keyframe animations
│   └── assets/
│       ├── fonts/
│       ├── textures/
│       └── audio/
├── backend/
│   └── worker.js                 # UNCHANGED from v1.0.0
├── public/                       # Production build output (gitignored)
└── package.json                  # Optional esbuild dependency
```

---

## 9. Migration Path: 2D Canvas → 3D Three.js

### 9.1 Phase 1: Scaffold (Day 1–2)

1. Replace `<canvas id="gameCanvas">` with Three.js renderer canvas.
2. Remove all Canvas 2D `ctx.fillRect`, `ctx.arc`, `ctx.stroke` calls.
3. Implement `SceneBuilder` to create the table, paddles, and ball in 3D.
4. Wire `Renderer3D.render()` into the existing `requestAnimationFrame` loop.
5. **Goal**: See a green table, two paddles, and a white ball in 3D.

### 9.2 Phase 2: Physics (Day 2–3)

1. Replace 2D ball physics (`x, y, vx, vy`) with 3D physics (`x, y, z, vx, vy, vz + spin`).
2. Implement table bounce with gravity.
3. Implement net collision.
4. Implement paddle collisions with 3D AABB.
5. **Goal**: Ball bounces on table, hits net, paddles can return it.

### 9.3 Phase 3: Game Rules (Day 3–4)

1. Implement serve mechanics (toss + strike).
2. Implement scoring rules (two-bounce, out of bounds, let).
3. Adapt state machine for new states (SERVE_PREP, SERVING, RALLY, POINT_END).
4. Implement win condition (11 points, win by 2, deuce).
5. **Goal**: Complete playable match with correct rules.

### 9.4 Phase 4: AI (Day 4)

1. Port existing predictive AI to 3D coordinates.
2. Add spin estimation and counter-spin.
3. Implement weakness tracking.
4. **Goal**: AI opponent at all difficulty levels.

### 9.5 Phase 5: Polish (Day 5–7)

1. Camera system (all modes).
2. Particles (trails, hit sparks).
3. Sound design (spatial audio, synthesized hits).
4. UI overhaul (update CSS to new design system).
5. Animations (score pop, screen shake, slow-mo).
6. Post-processing (bloom on desktop).
7. **Goal**: 60 FPS, visually polished, audio complete.

### 9.6 Phase 6: Testing & Optimization (Day 8–10)

1. Test on mobile devices (iOS Safari, Android Chrome).
2. Profile and optimize draw calls, overdraw.
3. Implement device tiering.
4. Add reduced motion support.
5. Verify leaderboard API still works (unchanged contract).
6. **Goal**: Shippable v2.0.

### 9.7 Backward Compatibility

| v1.0 Element | v2.0 Status |
|--------------|-------------|
| `game.js` (monolithic) | Replaced by modular architecture |
| `renderer.js` (Canvas 2D) | Replaced by `Renderer3D.js` + `SceneBuilder.js` |
| `input.js` | Upgraded to 3D input with spin gestures |
| `leaderboard.js` | **Unchanged** — API contract identical |
| `backend/worker.js` | **Unchanged** — deploy as-is |
| `style.css` | Evolved — new tokens, same structure |
| `index.html` | Updated — new title, Three.js import map |
| `localStorage` keys | Migrated — `pingpong_*` → `tt3d_*` with migration on first boot |

---

## 10. Backend Integration (Unchanged)

The Cloudflare Worker API (`backend/worker.js`) requires **zero changes**. The frontend continues to use:

```javascript
// LeaderboardClient.js — v1.0 code, unchanged
const API_BASE = '/api/v1';

async submitScore(playerName, score) {
  const res = await fetch(`${API_BASE}/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Version': '2.0.0',  // Updated version header
    },
    body: JSON.stringify({ player_name: playerName, score }),
  });
  return res.json();
}
```

The only change is the `X-Client-Version` header, which the Worker already validates with `CLIENT_VERSION_MIN = '1.0.0'`. v2.0.0 satisfies this.

| Endpoint | Method | Change | Notes |
|----------|--------|--------|-------|
| `/api/v1/leaderboard` | GET | None | Same query params, same response |
| `/api/v1/scores` | POST | Version header only | Score interpretation changes (see Game Spec §8) |
| `/api/v1/player/:name` | GET | None | Same response |
| `/api/v1/health` | GET | None | Returns `version: "1.0.0"` (Worker version) |

---

## 11. Error Handling & Resilience

### 11.1 WebGL Fallback

```javascript
function initRenderer() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) throw new Error('WebGL not supported');

    return new THREE.WebGLRenderer({ canvas, antialias: true });
  } catch (err) {
    // Fallback: show static HTML message
    document.body.innerHTML = `
      <div class="error-fallback">
        <h1>Sorry, your browser doesn't support WebGL.</h1>
        <p>Please use a modern browser like Chrome, Firefox, or Safari.</p>
      </div>
    `;
    throw err;
  }
}
```

### 11.2 Three.js Load Failure

If the CDN fails, retry once with `jsdelivr` fallback:
```javascript
const CDN_PRIMARY = 'https://unpkg.com/three@0.165.0/build/three.module.js';
const CDN_FALLBACK = 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';
```

### 11.3 Audio Context Block

If `AudioContext` fails to initialize (user hasn't interacted):
- Defer audio initialization until first user click.
- Show a subtle "Click to enable sound" hint on the title screen.

### 11.4 Leaderboard Offline

Same offline queue strategy as v1.0:
```javascript
if (!navigator.onLine) {
  this.offlineQueue.push(entry);
  this.showToast('Score saved. Will submit when online.');
}
```

---

## 12. Security Considerations

| Concern | Mitigation |
|---------|------------|
| XSS via player name | Sanitize with `validateName()` (same regex as Worker). |
| Score spoofing | IP rate limiting + score sanity checks on Worker. Client version header enforced. |
| CDN integrity | Use `integrity` attribute on import map script (SRI hash). |
| localStorage tampering | Settings validated on load; invalid values reset to defaults. |
| WebGL shader injection | All shaders are hardcoded strings in source; no user input reaches shader code. |

---

## 13. Browser Support Matrix

| Browser | Min Version | Notes |
|---------|-------------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support (WebGL 2.0 since Safari 15) |
| Edge | 90+ | Full support |
| Safari iOS | 14+ | Touch optimized, reduced effects |
| Chrome Android | 90+ | Touch optimized |
| Samsung Internet | 15+ | Full support |

**Unsupported**: Internet Explorer, Safari < 14, Chrome < 90. Show friendly fallback message.

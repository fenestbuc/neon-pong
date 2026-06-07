# Table Tennis 3D — Game Design Document

**Version**: 2.0.0  
**Game Title**: *Rally Pro 3D*  
**Genre**: Arcade Sports / Table Tennis  
**Players**: 1 (vs. AI)  
**Platform**: Browser (Desktop + Mobile)  
**Target Frame Rate**: 60 FPS

---

## 1. Design Pillars

1. **Authentic Table Tennis Feel**: Spin, arc, and table boundaries must feel like real table tennis, not Pong in 3D.
2. **Accessible Depth**: Easy to pick up (one-button serve, intuitive paddle follow), rewarding to master (spin control, placement).
3. **Spectacle**: Dramatic camera angles, slow-motion moments, particle effects, and polished UI transitions make every point feel like a tournament final.
4. **Performance First**: 60 FPS on mid-tier mobile devices; degrade visuals gracefully, never gameplay.

---

## 2. Rules: Table Tennis vs. Current Pong

### 2.1 Current Pong Rules (Legacy Baseline)

| Rule | Current Implementation |
|------|------------------------|
| Playfield | 800 x 600 px rectangle, flat 2D |
| Ball | Circle, bounces off top/bottom walls indefinitely |
| Paddle | Vertical bar, moves up/down only |
| Scoring | Ball passes opponent's edge → point |
| Serve | Ball launches from center at random angle |
| Win condition | First to 10 points |
| Bounce rule | None (ball never needs to hit paddle side first) |

### 2.2 New Table Tennis Rules

| Rule | Specification |
|------|---------------|
| **Playfield** | ITTF-standard proportions: table is 2.74m (length) x 1.525m (width), scaled to fit viewport. Net divides the table at the midpoint. |
| **Ball Physics** | Spherical ball with 3D position `(x, y, z)` where `y` is height above table. Ball is affected by gravity (`9.81 m/s²` scaled to game units). Ball must bounce on the table once before a player can return it (the "two-bounce" rule is simplified: each side must let it bounce once on their half). |
| **Scoring** | A point is scored when: (a) ball bounces twice on one side, (b) ball hits the net and fails to cross, (c) ball goes out of bounds (off the table sides or long), (d) ball is missed by the paddle. |
| **Serve Mechanics** | Player must toss the ball (tap/click → ball rises → tap/click again to strike). Serve must bounce on the server's side first, then the opponent's side. If the serve hits the net ("let"), it is replayed — no point scored. Two consecutive lets switch serve automatically. |
| **Net** | A physical barrier at the table center. Ball can hit the net cord and roll over (let) or fall back (fault → opponent point). Net has collision geometry. |
| **Table Boundaries** | Ball must land within the white sideline and endline boundaries. Landing on the line counts as "in." |
| **Win Condition** | First to 11 points, win by 2. If 10-10, game continues until one player leads by 2 (e.g., 12-10, 13-11). |
| **Match Structure** | Best-of-3 or best-of-5 games (configurable in Settings). The default is best-of-3. |
| **Serve Rotation** | Alternate serve every 2 points. At deuce (10-10), alternate every point. |

### 2.3 Scoring Decision Matrix

```
Ball lands in opponent's court → valid rally continues
Ball lands out (sideline/endline) → opponent scores a point
Ball hits net and drops on server's side → opponent scores (fault)
Ball hits net and drops on receiver's side → LET, replay serve
Ball double-bounces on one side → opponent scores
Ball missed by paddle → opponent scores
Ball struck before it bounces on striker's side → opponent scores (volley fault)
```

---

## 3. 3D Game Mechanics

### 3.1 Coordinate System

- **Origin**: Center of the table surface, at the net line.
- **+X**: Toward the AI opponent (far end of table).
- **-X**: Toward the player (near end of table).
- **+Y**: Up (height above table).
- **+Z**: Right (from player's perspective looking down the table).
- **Units**: Meters, scaled by `GAME_SCALE` (default: 50 pixels per meter on a 1920x1080 reference; renderer auto-scales).

### 3.2 Ball Physics

#### 3.2.1 Position & Velocity

```
ball.position = { x, y, z }       // y=0 is table surface
ball.velocity = { vx, vy, vz }
ball.spin = { sx, sy, sz }        // angular velocity in rad/s
ball.radius = 0.02                // 40mm ITTF ball = 0.02m radius
```

#### 3.2.2 Gravity & Air Resistance

```
// Per update tick (dt in seconds)
ball.vy -= GRAVITY * dt           // GRAVITY = 9.81 * SCALE
ball.velocity *= (1 - AIR_DRAG * dt)  // AIR_DRAG = 0.3 (tuned for gameplay feel)
ball.position += ball.velocity * dt
```

#### 3.2.3 Table Bounce Physics

When `ball.y <= ball.radius` and ball is within table bounds:

```
// Normal bounce (vertical)
ball.vy = -ball.vy * RESTITUTION_TABLE   // RESTITUTION_TABLE = 0.75
ball.y = ball.radius

// Friction / spin coupling
// Tangential velocity at contact point
contact_vx = ball.vx - ball.radius * ball.spin.sz
contact_vz = ball.vz + ball.radius * ball.spin.sx

// Apply tangential friction
ball.vx -= contact_vx * FRICTION_TABLE * dt
ball.vz -= contact_vz * FRICTION_TABLE * dt

// Spin affects trajectory after bounce (Magnus effect simplified)
ball.vx += ball.spin.sz * SPIN_INFLUENCE * dt
ball.vz -= ball.spin.sx * SPIN_INFLUENCE * dt

// Dampen spin on bounce
ball.spin *= SPIN_DAMPING          // SPIN_DAMPING = 0.7
```

#### 3.2.4 Net Collision

Net is at `x = 0`, height `0.1525m` (15.25cm), spanning full table width.

```
if |ball.x| < net_thickness/2 AND ball.y < net_height:
    // Check if ball is within net width bounds (-Z to +Z)
    if |ball.z| <= TABLE_WIDTH / 2:
        if ball.vx * ball.x < 0: // Moving toward net
            if ball.y > net_height * 0.7:
                // High enough to potentially roll over
                ball.vx *= 0.3     // Severely dampen
                ball.vy = abs(ball.vy) * 0.2  // Drop
            else:
                // Hit net, dead bounce
                ball.vx = -ball.vx * 0.1
                ball.vy = abs(ball.vy) * 0.3
```

#### 3.2.5 Floor Bounce (Below Table Level)

If `ball.y < -0.5` (clearly below table), point ends. The ball is not physically simulated below the table; animation transitions to "ball dropped" state.

#### 3.2.6 Speed Limits

- **Max Ball Speed**: 25 m/s (tuned down from real ~45 m/s for playability).
- **Min Ball Speed**: 2 m/s (ball is dead if slower; opponent wins point).
- **Serve Speed**: 5–12 m/s (enforced during serve state).

### 3.3 Paddle Mechanics

#### 3.3.1 Paddle Representation

Paddles are 3D boxes (rackets) with dimensions:
- Width: `0.158m` (15.8cm, ITTF max)
- Height: `0.152m` (15.2cm)
- Thickness: `0.02m`
- Handle: visual only, extends `0.10m` below paddle face

#### 3.3.2 Paddle Control Model

The player does NOT control paddle position directly. Instead, they control a **target cursor** on the table, and the paddle interpolates toward it with a slight delay (human reaction + arm movement).

```
input_cursor = { x, z }  // Projected onto the player's end of the table
player_paddle.target = { x: PLAYER_END_X, z: input_cursor.z * TABLE_HALF_WIDTH }
player_paddle.y = PADDLE_REST_HEIGHT + sin(time * IDLE_BOB_FREQ) * IDLE_BOB_AMP
```

| Input Method | Control Mapping |
|--------------|-----------------|
| **Keyboard** (Arrow Up/Down or W/S) | Moves the Z cursor; paddle follows |
| **Mouse** | Mouse X → paddle Z position (clamped to table width). Mouse Y is ignored for position. |
| **Touch** | Finger X → paddle Z. Finger Y swipe velocity determines spin (see 3.3.4). |

#### 3.3.3 Paddle Swing / Strike

The paddle automatically swings when the ball enters the "strike zone" (within 0.3m of paddle face, approaching).

```
if ball is approaching paddle AND within strike_zone:
    trigger_strike_animation()
    // Strike vector is determined by paddle angle + input spin
    ball.velocity = compute_return_velocity(impact_point, paddle_angle, spin_input)
```

#### 3.3.4 Spin Input System

Spin is the primary skill differentiator. The player applies spin via **input gesture** at moment of strike:

| Spin Type | Input Gesture | Effect on Ball |
|-----------|-------------|----------------|
| **Topspin** | Swipe upward (mouse/touch) or press Up key during strike | Ball dips faster after bounce, accelerates forward |
| **Backspin** | Swipe downward or press Down key during strike | Ball floats, slows down after bounce, may even bounce backward |
| **Sidespin (Left)** | Swipe left | Ball curves left (from hitter's perspective) |
| **Sidespin (Right)** | Swipe right | Ball curves right |
| **No Spin** | Neutral input / no gesture | Standard flat trajectory |

Spin magnitude is determined by gesture velocity: `spin_magnitude = clamp(gesture_speed / MAX_GESTURE_SPEED, 0, 1)`.

#### 3.3.5 Ball-Paddle Collision

```
if ball intersects paddle bounding box AND moving toward paddle:
    // Compute impact point relative to paddle center
    offset_z = (ball.z - paddle.z) / (paddle.width / 2)   // -1 to 1
    offset_y = (ball.y - paddle.y) / (paddle.height / 2)  // -1 to 1

    // Base return speed (direction inverted X, same Z)
    ball.vx = -ball.vx * PADDLE_RESTITUTION  // 1.05 (slight acceleration)
    ball.vy = SERVE_HEIGHT + offset_y * 3     // Aim high or low based on impact
    ball.vz = ball.vz + offset_z * 2          // Angular return based on where ball hit paddle

    // Apply spin from input
    ball.spin.sz += spin_input.topspin * MAX_SPIN
    ball.spin.sx += spin_input.sidespin * MAX_SPIN

    // Trigger effects
    play_hit_sound(impact_force)
    spawn_hit_particles(impact_point)
    trigger_screen_shake(impact_force * 0.5)
    slow_mo_burst(100ms)  // See 5.2
```

### 3.4 Camera System

| Camera Mode | Description |
|-------------|-------------|
| **MENU** | Cinematic orbit: camera slowly orbits the table at 45° elevation, 5m radius, 4 RPM. Shows off the 3D environment. |
| **SERVE** | Player POV: camera behind player's shoulder, slightly elevated (eye level + 0.5m), looking toward opponent end. FOV 60°. |
| **RALLY** | Dynamic follow: camera tracks ball at 60% weight, table center at 40% weight. Smooth interpolation (lerp factor 0.05/frame). Height adjusts with ball arc. FOV 55°. |
| **POINT SCORED** | Replay zoom: camera locks on ball landing point, slow-motion zoom-in. Duration: 1.5s. |
| **MATCH WIN** | Victory pan: camera pulls back to wide angle, victory particles. |

Camera position is computed each frame and smoothly interpolated. Never snap — always lerp.

---

## 4. Game States & Flow

### 4.1 State Machine

```
[BOOT] ──→ [LOADING]
              │
              ▼
[MENU] ◄────┘
  │
  ├─ "Start Game" ──→ [MATCH_SETUP]
  ├─ "Leaderboard" ──→ [LEADERBOARD]
  ├─ "Settings" ──→ [SETTINGS]
  └─ "How to Play" ──→ [TUTORIAL]

[MATCH_SETUP]
  │
  ▼
[COIN_TOSS] ──→ randomly assign first server
  │
  ▼
[SERVE_PREP] ──→ show "Your Serve" / "Opponent Serve"
  │
  ▼
[SERVING] ──→ player tosses ball, strikes
  │ (valid serve)
  ▼
[RALLY] ──→ ball in play
  │
  ├─ [point scored] ──→ [POINT_END]
  └─ [let] ──→ [SERVE_PREP] (same server)

[POINT_END]
  │
  ├─ [match won] ──→ [MATCH_END]
  └─ [match continues] ──→ [SERVE_PREP] (next server)

[MATCH_END]
  │
  ├─ "Play Again" ──→ [MATCH_SETUP]
  ├─ "Submit Score" ──→ [LEADERBOARD_SUBMIT] ──→ [LEADERBOARD]
  └─ "Main Menu" ──→ [MENU]

[Any state] ──→ [PAUSED] (ESC / Pause button)
[PAUSED] ──→ [RESUME] / [RESTART] / [MENU]
```

### 4.2 State Specifications

#### LOADING (max 3s timeout)
- Display: Game logo, progress bar (procedural), "Loading 3D Engine..."
- Actions: Preload Three.js from CDN, create renderer, compile shaders.
- Transition: On `assetsReady` event or 3s timeout (whichever first) → MENU.

#### MENU
- Display: Full 3D background with cinematic camera orbit. Menu UI overlaid in 2D DOM.
- Buttons: START GAME, LEADERBOARD, SETTINGS, HOW TO PLAY.
- Ambient: Quiet arena ambience, distant crowd murmur.

#### COIN_TOSS
- Display: UI overlay "Coin Toss" — animated coin spin (CSS 3D transform).
- Logic: Random assignment. Player is always "near side" (camera behind). Server is chosen randomly.
- Duration: 2s, then auto-transition.

#### SERVE_PREP
- Display: Server indicator ("YOUR SERVE" or "OPPONENT SERVING"), serve counter ("Serve 1 of 2").
- Camera: Settles into SERVE position over 0.5s.
- Input: Player may position paddle (Z-axis only).

#### SERVING
- Display: Ball rests on player's table half. "Tap to toss, tap to strike" hint (first 3 serves only).
- Player serve: First tap → ball arcs upward (toss animation). Second tap while ball is rising/falling → paddle strikes. Timing determines serve quality.
- AI serve: Ball auto-tosses and strikes after 1.5s delay.
- Let detection: If ball hits net and falls on correct side → "LET" text, auto-retry.
- Fault detection: If ball hits net and falls on wrong side, or goes out → point to opponent.

#### RALLY
- Display: HUD visible (score, current server indicator, spin meter if enabled).
- Input: Active paddle control + spin gestures.
- Valid rally: Ball must bounce on each side exactly once before being returned.
- Rally timer: After 10 seconds of continuous rally, "RALLY!" text appears, crowd noise intensifies.

#### POINT_END
- Display: Score update animation (3D text pop), slow-motion ball bounce if it was a winning shot.
- Duration: 2s.
- Events: Check match win condition. If not, compute next server, transition to SERVE_PREP.

#### MATCH_END
- Display: "YOU WIN" / "YOU LOSE" in large 3D text. Final score. Match stats (rally count, longest rally, spin shots).
- Camera: Pulls back to wide arena view.
- Buttons: PLAY AGAIN, SUBMIT SCORE, MAIN MENU.

#### PAUSED
- Display: "PAUSED" overlay. Background is blurred (DOM `backdrop-filter: blur(8px)`) over frozen 3D scene.
- Three.js: `renderer.setAnimationLoop(null)` or set a flag; do NOT dispose scene.

---

## 5. Difficulty Levels & AI Behavior

### 5.1 Difficulty Parameters

| Parameter | Easy | Medium | Hard | Expert |
|-----------|------|--------|------|--------|
| AI Paddle Speed (Z) | 1.5 m/s | 2.5 m/s | 3.5 m/s | 4.5 m/s |
| Prediction Accuracy | 40% | 70% | 90% | 98% |
| Reaction Delay | 0.4s | 0.2s | 0.08s | 0.02s |
| Spin Return Capability | None | 30% | 70% | 95% |
| Serve Quality | Poor (slow, no spin) | Average | Accurate | Pro-level spin |
| Error Rate (per point) | 25% | 10% | 3% | 0.5% |
| Target Selection | Random corners | Weak corners | Strong corners | Exploits player weakness |

### 5.2 AI Algorithm

#### Perception Phase
Every frame, the AI evaluates:
1. **Ball position & velocity** (from physics simulation — AI is not omniscient, it reads the same state the renderer does).
2. **Estimates landing point** on AI's side by raycasting the trajectory (accounting for gravity, not spin).
3. **Spin estimation**: At Easy, spin is ignored. At Medium+, AI estimates spin magnitude from ball's visible arc deviation and applies a correction factor.

#### Decision Phase
```
// Predict where ball will be at AI's paddle X position
predicted_z = estimate_landing_z(ball, ai_paddle.x)
predicted_y = estimate_landing_y(ball, ai_paddle.x)

// Add human-like error based on difficulty
if difficulty !== 'expert':
    predicted_z += random_gaussian() * errorMargin
    predicted_y += random_gaussian() * errorMargin * 0.5

// Move paddle toward predicted position
ai_paddle.target_z = predicted_z
ai_paddle.target_y = predicted_y + 0.05  // Slight bias upward for aggressive returns

// Reaction delay: AI only updates target every reactionDelay seconds
if now - ai.last_reaction < reactionDelay:
    return  // Hold current target
```

#### Strike Phase
When ball is within `STRIKE_DISTANCE` (0.3m):
```
// Choose return strategy
if difficulty >= 'medium' and random() < spin_capability:
    // Intentionally apply spin
    target_spin = choose_spin_to_counter(player_last_spin)
else:
    target_spin = { topspin: 0, sidespin: 0 }

// Aim for weak zones
if difficulty >= 'hard':
    target_z = player_weak_zone  // Tracked over match (where player misses most)
    target_x = PLAYER_END_X
else:
    target_z = random_in_range(-TABLE_HALF_WIDTH * 0.8, TABLE_HALF_WIDTH * 0.8)

// Execute strike (same physics as player)
compute_return_velocity(target_x, target_z, target_spin)
```

### 5.3 Player Weakness Tracking

The AI tracks player miss locations over the last 20 points:
```
player_weakness[z] = frequency of misses at that Z position (binned into 5 zones)
```
Hard and Expert difficulties target the highest-frequency miss zone 60% of the time.

---

## 6. Power-Ups & Special Mechanics (Optional — Post-1.0)

> These are **stretch goals** for version 2.0. They must be implemented as a toggle-able "Arcade Mode" so the standard game remains authentic.

### 6.1 Arcade Mode Power-Ups

Power-ups spawn as glowing 3D orbs that float above the table for 3 seconds at random intervals (every 5–10 points).

| Power-Up | Effect | Duration |
|----------|--------|----------|
| **Fire Shot** | Ball leaves a fiery trail, moves 50% faster, harder to return | 1 shot |
| **Mega Paddle** | Paddle width doubles | 10s |
| **Time Warp** | Everything slows to 30% speed except player input | 5s |
| **Ghost Ball** | Ball becomes semi-transparent, AI prediction accuracy halved | 1 shot |
| **Curve Boost** | Spin effects magnified 3x | 1 shot |
| **Magnet Serve** | Next serve automatically targets opponent's weakest zone | 1 serve |

### 6.2 Tournament Mode (Arcade)

- Progressive AI opponents with increasing difficulty.
- Best-of-5 matches.
- Unlockable paddle skins (cosmetic only).
- Bracket visualization.

---

## 7. Settings & Configuration

### 7.1 Player-Configurable Options

| Setting | Options | Default |
|---------|---------|---------|
| Difficulty | Easy, Medium, Hard, Expert | Medium |
| Match Length | Best of 1, 3, 5, 7 | Best of 3 |
| Game Mode | Classic (authentic) / Arcade (power-ups) | Classic |
| Camera Style | Dynamic / Fixed / Broadcast | Dynamic |
| Sound | On / Off | On |
| Music | On / Off | On |
| Vibration | On / Off (mobile only) | On |
| Reduced Motion | On / Off | Off |
| Touch Sensitivity | 0.5x, 0.75x, 1.0x, 1.5x, 2.0x | 1.0x |
| Paddle Color | Cyan, Red, Green, Blue, Gold | Cyan |
| Ball Trail | None / Short / Long | Short |

### 7.2 Persisted Settings

Stored in `localStorage` under key `tt3d_settings_v2` as JSON.

---

## 8. Leaderboard Integration (Unchanged Contract)

The Cloudflare Worker API remains unchanged from v1.0.0:

- `GET /api/v1/leaderboard?period=all|daily&limit=N`
- `POST /api/v1/scores` (`player_name`, `score`) — `score` is now **games won** (not points).
- `GET /api/v1/player/:name`

**Scoring change for v2.0**: The `score` field submitted to the leaderboard represents **match wins** (e.g., winning a best-of-3 match = 1 to 3 points based on game differential), NOT individual rally points. This preserves the leaderboard's semantic meaning while acknowledging the longer match format.

| Match Result | Score Submitted |
|--------------|----------------|
| 2-0 (games) | 3 points |
| 2-1 | 2 points |
| 1-2 (loss) | 0 points (do not submit) |
| 0-2 (loss) | 0 points (do not submit) |

This keeps the leaderboard competitive and prevents score inflation from losing matches.

---

## 9. Glossary

| Term | Definition |
|------|------------|
| **Let** | A serve that hits the net but lands legally. Replay; no point scored. |
| **Fault** | An illegal serve (net hit + wrong side, or out of bounds). Point to receiver. |
| **Rally** | Continuous exchange of shots after a valid serve. |
| **Topspin** | Forward rotation causing the ball to dip and accelerate after bounce. |
| **Backspin** | Backward rotation causing the ball to float and slow after bounce. |
| **Sidespin** | Lateral rotation causing the ball to curve in flight. |
| **Deuce** | Score tied at 10-10; win by 2 required. |
| **Spin meter** | UI indicator showing current spin input from the player. |

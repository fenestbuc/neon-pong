# Design Decisions — Ping Pong Game

**Run ID**: feat-ping-pong-game-20260605  
**Date**: 2026-06-05  
**Status**: Approved for implementation

---

## 1. Vanilla JavaScript vs. Framework (React/Vue/Svelte)

### Decision
Use **vanilla ES6 JavaScript** with HTML5 Canvas. No frontend framework.

### Rationale

| Factor | Vanilla JS | React / Vue |
|--------|-----------|-------------|
| Bundle size | ~0 KB overhead | +40–120 KB |
| Build step | None required (native ES modules) | Bundler mandatory |
| Canvas integration | Direct imperative API calls | Reconciliation overhead / refs |
| Game loop | `requestAnimationFrame` owns the frame | Component lifecycle mismatch |
| Deploy to Cloudflare Pages | Drop static files | Build pipeline + node_modules |
| Learning curve for future maintainers | One language, no framework churn | Framework-specific knowledge |

This is a real-time 2D game where the render path is 100% imperative Canvas 2D. A virtual DOM framework adds no value here — there are no reactive UI trees to reconcile during gameplay. Frameworks are better suited for the surrounding chrome (menus, leaderboards), but even those are simple enough to manage with plain DOM APIs and small state objects.

### Trade-offs Accepted
- No built-in component reusability → Mitigated by ES module boundaries (`ui.js`, `renderer.js`, etc.).
- No declarative templating → Mitigated by small, hand-written DOM structures for menus.

---

## 2. Cloudflare Pages + Workers vs. Vercel / GCP / Traditional Hosting

### Decision
Deploy static assets to **Cloudflare Pages** and the leaderboard API to a **Cloudflare Worker** with **KV** storage.

### Rationale

| Factor | Cloudflare Pages + Workers | Vercel + Serverless Function | GCP / AWS |
|--------|---------------------------|------------------------------|-----------|
| Edge network | 300+ PoPs globally | Good (but fewer PoPs than CF) | Single-region by default |
| Cold start | Near-zero (Worker isolate) | ~50–200 ms (Node.js boot) | Container cold start |
| KV / leaderboard latency | < 50 ms globally | Requires external DB ( Planetscale, Upstash) | Cloud SQL / DynamoDB latency varies |
| Pricing at MVP scale | Generous free tier | Generous free tier | Free tier limited |
| Static hosting + Functions in one bill | Yes | Yes | Multiple services |
| Same ecosystem | Pages + Workers unified | Vercel ecosystem | Requires service wiring |

For a casual browser game, latency is king. Players will abandon if the leaderboard takes > 1 second to load. Cloudflare Workers run at the edge, and KV is eventually-consistent but write-latency is acceptable for asynchronous score submissions.

### Trade-offs Accepted
- KV is eventually consistent (global replication can take ~60 s) → Mitigated by showing the player's own rank immediately after submission (optimistic UI)
- KV has no secondary indexes → Mitigated by denormalized key patterns (`lb:daily:...`, `player:...`)
- No relational joins or transactions → Mitigated by simple data model and read-modify-write with version checking

---

## 3. Canvas 2D Rendering vs. DOM / SVG / WebGL

### Decision
Render all gameplay visuals with the **HTML5 Canvas 2D API**.

### Rationale

| Factor | Canvas 2D | DOM (divs) | SVG | WebGL |
|--------|-----------|------------|-----|-------|
| Particle count (60fps) | 500+ | < 100 | < 200 | 10000+ |
| Ball trails / glow | Easy (shadowBlur, history buffer) | Hard / janky | Possible but CPU-heavy | Overkill for 2D |
| Imperative animation | Native | Requires CSS animations | Attribute manipulation | Shaders required |
| Mobile GPU support | Universal | Always works | Good | Variable |
| Code complexity | Medium | Low | Medium | High |
| Bundle size | 0 | 0 | 0 | +Library (Three.js ~150 KB) |

The game requires fast-moving particles, ball trails, per-frame glow effects, and screen-shake — all of which are trivial in Canvas 2D and painful in the DOM. SVG is vector-oriented and not optimized for per-frame pixel manipulation. WebGL would unlock more effects but requires shader code and a much larger engineering investment for a Pong clone.

### Trade-offs Accepted
- Accessibility: canvas is a black box to screen readers → Mitigated by DOM overlays for menus and ARIA labels on the canvas element.
- Text rendering less crisp than DOM at small sizes → Mitigated by large HUD fonts and devicePixelRatio scaling.

---

## 4. Authentication & Identity (MVP)

### Decision
**No server-side authentication** for MVP. Identity is a self-asserted `player_name` stored in `localStorage`.

### Rationale

| Approach | Complexity | Security | UX Friction | Fit for MVP |
|----------|-----------|----------|-------------|-------------|
| None / Anonymous | Zero | Low | Zero | ★★★★★ |
| localStorage nickname | Zero | Low | Near-zero | ★★★★★ |
| OAuth (Google/GitHub) | High | High | Medium | ★★☆☆☆ |
| Email + Password | Medium | Medium | High | ★☆☆☆☆ |
| JWT + sessions | Medium | Medium | Low (after first login) | ★★★☆☆ |

This is a casual, free, no-PII game. The worst-case abuse scenario is a spammed leaderboard. Mitigations:
1. **IP-based rate limiting** (Cloudflare native + Worker enforcement)
2. **Player name validation** (alphanumeric, 1–24 chars)
3. **Score sanity checks** (non-negative, within plausible bounds)
4. **Client version header** (reject unknown/old versions that might exploit loopholes)

### Future Path
If abuse becomes a problem, the next step is **Cloudflare Turnstile** (invisible CAPTCHA) on score submission. Only after that would we consider OAuth or API keys.

### Trade-offs Accepted
- Leaderboard trust: scores are not cryptographically signed → Mitigated by rate limits and anomaly detection (e.g., reject impossibly high scores).
- No account recovery: if a user clears localStorage, they lose their local history → Accepted; global leaderboard retains their name.

---

## 5. Single HTML File vs. Modular File Structure

### Decision
**Modular ES modules** (`src/*.js`) loaded from a minimal `index.html`. Not a true single-file deployment.

### Rationale

The requirement stated "Single HTML file preferred for simplicity (or minimal files)." We evaluated both:

| Approach | Developer Experience | Cache Efficiency | Debuggability | Deploy Simplicity |
|----------|---------------------|------------------|---------------|-------------------|
| Single HTML + inline JS/CSS | Poor (no syntax highlighting, tooling) | None (all-or-nothing) | Hard | Excellent |
| Modular JS + small HTML | Excellent | Good (modules cache independently) | Excellent | Very Good |

Native ES modules require zero build tooling. The MVP ships ~10 small JS files; the total transfer size is well under 50 KB gzipped. During development, source maps are unnecessary because the code maps 1:1 to files.

If size becomes critical later, a build step (e.g., esbuild or Rollup) can collapse modules into a single `bundle.js` without changing any source code.

### Trade-offs Accepted
- Slightly more HTTP requests on first load (10 modules + HTML + CSS) → Mitigated by HTTP/2 multiplexing on Cloudflare Pages and small file sizes. HTTP request count is not a bottleneck in 2026.

---

## 6. Web Audio API vs. HTML5 `<audio>` Tags

### Decision
Use the **Web Audio API** with procedural sound synthesis.

### Rationale

| Factor | Web Audio API | `<audio>` Elements |
|--------|---------------|-------------------|
| Latency | < 20 ms | ~100–300 ms |
| File size | 0 KB (procedural) | +SFX assets (~50–200 KB) |
| Dynamic pitch / volume | Real-time | Pre-bake per variant |
| Browser support | Excellent (evergreen) | Excellent |
| Complexity | Medium (node graphs) | Low |

For a game where the ball might bounce 10+ times per second, audio latency matters. `<audio>` tags also require managing a pool of elements to overlap sounds. Web Audio API lets us fire-and-forget oscillator nodes with per-hit velocity-based pitch shifting.

### Trade-offs Accepted
- No background music in MVP (procedural music is complex) → Accepted. SFX-only is fine for MVP; music can be added later with a looping `<audio>` tag or a sequencer library.
- `AudioContext` requires user gesture to start → Mitigated by initializing audio inside the first "Start Game" click handler.

---

## 7. Input: Absolute Touch Tracking vs. Relative Swipe Gestures

### Decision
**Absolute touch tracking**: the paddle center snaps to the finger's Y coordinate.

### Rationale

| Approach | Precision | Learning Curve | Clash with UI |
|----------|-----------|----------------|---------------|
| Absolute (paddle = finger Y) | High | Low | Possible |
| Relative (swipe delta moves paddle) | Medium | High | Low |

In a fast Pong game, players expect direct 1:1 control. Relative swipe gestures introduce inertia and precision loss. The absolute model feels like a "virtual paddle" under the finger.

### Trade-offs Accepted
- Finger can obscure the ball → Mitigated by drawing the paddle with a semi-transparent glow so the player can see through it, and by keeping the paddle visually offset slightly from the finger (optional `TOUCH_OFFSET_Y` constant).

---

## 8. AI: Predictive vs. Reactive

### Decision
**Predictive AI** for medium/hard difficulty; **reactive** for easy.

### Rationale
A purely reactive AI (moves when ball crosses midline) feels robotic and easily exploited. A predictive AI calculates the ball's intersection Y at the paddle's X position and moves there, creating a more human-like opponent.

Easy difficulty adds "mistakes": wrong-direction movement chance, speed limit, and reaction delay. Hard difficulty uses near-perfect prediction.

### Trade-offs Accepted
- Prediction assumes no wall bounces after the last calculation → Recalculated every frame while the ball is on the AI side, so it adapts to mid-flight bounces.

---

## Summary Table

| # | Decision | Confidence | Reversibility |
|---|----------|------------|---------------|
| 1 | Vanilla JS (no framework) | High | Medium (can introduce bundler later) |
| 2 | Cloudflare Pages + Workers | High | Low (would require infrastructure migration) |
| 3 | Canvas 2D rendering | High | Medium (SVG/DOM possible but painful) |
| 4 | Client-side auth only (MVP) | High | High (can add Turnstile/OAuth later) |
| 5 | Modular ES modules | High | High (bundlable to single file) |
| 6 | Web Audio API (procedural) | High | Medium (can swap in loaded buffers) |
| 7 | Absolute touch tracking | High | High (configurable to relative) |
| 8 | Predictive AI | High | High (difficulty is parameterized) |

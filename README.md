# Neon Pong 🏓

A retro arcade-style ping pong game built with HTML5 Canvas and vanilla JavaScript.

**Built with the [Kubar Labs Software Factory](https://github.com/Kubar-Labs/software-factory)** — a contract-first, multi-agent development pipeline.

## Play Now

**[Play Neon Pong](https://neon-pong-c76.pages.dev)** ← Click to play!

*(Temporary deployment URL: https://5636348d.neon-pong-c76.pages.dev)*

*(Also mirrored on [GitHub Pages](https://fenestbuc.github.io/neon-pong/))*

## Features

- 🎮 **3 Difficulty Levels** — Easy, Medium, Hard AI
- 🖱️ **Multiple Input Methods** — Keyboard, mouse, touch
- ✨ **Neon Visual Effects** — Retro arcade glow with Canvas 2D
- 🏆 **Global Leaderboard** — Compete with players worldwide (via Cloudflare Workers + KV)
- 📱 **Mobile Friendly** — Touch controls and responsive design
- 🔊 **Procedural Audio** — Web Audio API sound effects
- ⚡ **Fast & Lightweight** — Zero dependencies, pure vanilla JS

## How to Play

1. Click **START GAME** on the title screen
2. Control your paddle (left side):
   - **Keyboard**: W/S or Arrow Up/Down
   - **Mouse**: Move cursor up/down
   - **Touch**: Drag finger on the screen
3. First to 10 points wins!
4. Submit your score to the global leaderboard

## Tech Stack

- **Frontend**: HTML5 Canvas 2D, Vanilla ES6 JavaScript (ES Modules)
- **Styling**: CSS3 with custom properties, neon glow effects
- **Backend**: Cloudflare Worker + KV storage
- **Hosting**: Cloudflare Pages (static) + Cloudflare Workers (API)
- **No Build Step**: Native ES modules, zero bundler

## Architecture

```
index.html          → Single HTML entry point
src/css/style.css   → Retro arcade neon theme
src/js/game.js      → Main game loop & orchestration
src/js/physics.js   → Ball & paddle physics
src/js/renderer.js  → Canvas 2D drawing with glow
src/js/input.js     → Keyboard, mouse, touch
src/js/ai.js        → 3-level AI opponent
src/js/audio.js     → Web Audio API SFX
src/js/ui.js        → Screen & overlay management
src/js/storage.js   → localStorage persistence
src/js/leaderboard.js → API client for scores
backend/worker.js   → Cloudflare Worker API
backend/wrangler.toml → Deployment config
```

## Development

```bash
# Clone the repo
git clone https://github.com/fenestbuc/neon-pong.git
cd neon-pong

# Serve locally
python3 -m http.server 8080
# Open http://localhost:8080

# Deploy to Cloudflare Pages
wrangler pages deploy .

# Deploy Worker only
wrangler deploy backend/worker.js
```

## Local Leaderboard (Offline)

The game works offline — scores are saved locally and sync when you reconnect.

## Factory Run Record

This game was built as factory run `feat-ping-pong-game-20260605` through the 6-stage pipeline:
1. Specification (Architect)
2. Parallel Design (Test Engineer + UI Designer)
3. Parallel Implementation (Frontend + Backend)
4. Integration (Merge & Deploy)
5. Quality Gates (Security, QA, Reviewer)
6. E2E Verification (Visual Testing)

See the [run manifest](manifest.md) for full details.

## License

MIT © Kubar Labs

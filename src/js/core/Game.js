import * as THREE from 'three';
import { PHYSICS, GAME_RULES, AI_CONFIG, COLORS } from './Constants.js';
import { GameStateMachine, STATES } from './GameStateMachine.js';
import { Table } from '../physics/Table.js';
import { Ball } from '../physics/Ball.js';
import { Paddle } from '../physics/Paddle.js';
import { PhysicsEngine } from '../physics/PhysicsEngine.js';
import { InputManager } from '../input/InputManager.js';
import { AIController } from '../ai/AIController.js';
import { SceneManager } from '../renderer/SceneManager.js';
import { GameRenderer } from '../renderer/GameRenderer.js';
import { CameraManager } from '../renderer/CameraManager.js';
import { UIManager } from '../ui/UIManager.js';
import { AudioManager } from '../effects/AudioManager.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.stateMachine = new GameStateMachine();
    this.ui = new UIManager(this.stateMachine);
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();
    this.input = new InputManager(this.canvas);

    this.table = new Table();
    this.ball = new Ball();
    this.playerPaddle = new Paddle('player_1');
    this.aiPaddle = new Paddle('player_2');
    this.ai = new AIController('intermediate');

    this.physics = new PhysicsEngine(this.table, this.ball, this.playerPaddle, this.aiPaddle);

    this.sceneManager = new SceneManager(this.canvas);
    this.gameRenderer = new GameRenderer(this.sceneManager.scene);
    this.cameraManager = new CameraManager(this.sceneManager.camera);

    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedDt = PHYSICS.FIXED_DT;

    this.bindEvents();
    this.stateMachine.onTransition((s, old, ctx) => this.onStateChange(s, old, ctx));
    this.stateMachine.transition(STATES.TITLE_SCREEN);
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  bindEvents() {
    this.input.onPause = () => {
      if (this.stateMachine.getState() === STATES.PLAYING) {
        this.stateMachine.transition(STATES.PAUSED);
      } else if (this.stateMachine.getState() === STATES.PAUSED) {
        this.stateMachine.transition(STATES.PLAYING);
      }
    };

    document.getElementById('btn-start').addEventListener('click', () => {
      this.audio.init();
      this.stateMachine.transition(STATES.DIFFICULTY_SELECT);
    });

    document.querySelectorAll('.difficulty-card').forEach(card => {
      card.addEventListener('click', () => {
        const diff = card.dataset.diff;
        this.ai.setDifficulty(diff);
        this.ui.difficulty = diff;
        this.stateMachine.startMatch(diff);
      });
    });

    document.getElementById('btn-diff-back').addEventListener('click', () => {
      this.stateMachine.transition(STATES.TITLE_SCREEN);
    });

    document.getElementById('btn-resume').addEventListener('click', () => {
      this.stateMachine.transition(STATES.PLAYING);
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      this.stateMachine.startMatch(this.stateMachine.context.difficulty);
    });

    document.getElementById('btn-quit').addEventListener('click', () => {
      this.stateMachine.transition(STATES.TITLE_SCREEN);
    });

    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.stateMachine.startMatch(this.stateMachine.context.difficulty);
    });

    document.getElementById('btn-menu').addEventListener('click', () => {
      this.stateMachine.transition(STATES.TITLE_SCREEN);
    });

    document.getElementById('btn-leaderboard').addEventListener('click', () => {
      this.ui.showLeaderboard([]);
    });

    document.getElementById('btn-leaderboard-back').addEventListener('click', () => {
      this.stateMachine.transition(STATES.TITLE_SCREEN);
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
      this.ui.showSettings();
    });

    document.getElementById('btn-settings-save').addEventListener('click', () => {
      this.ui.saveSettings();
      this.stateMachine.transition(STATES.TITLE_SCREEN);
    });

    document.getElementById('btn-settings-back').addEventListener('click', () => {
      this.stateMachine.transition(STATES.TITLE_SCREEN);
    });

    // Debug helper for E2E and troubleshooting
    window.__gameDebug = {
      version: '2.0.0',
      game: this,
      state: () => this.stateMachine?.state,
      scores: () => this.stateMachine?.context?.scores,
      webgl: () => this.sceneManager?.webglAvailable,
    };

    // Warn if WebGL is unavailable (headless/testing environments)
    if (!this.sceneManager.webglAvailable) {
      console.warn('[Game] WebGL unavailable — 3D rendering disabled. UI still functional.');
    }
  }

  onStateChange(state, oldState, ctx) {
    this.ui.onStateChange(state, oldState, ctx);

    switch (state) {
      case STATES.COUNTDOWN:
        this.resetPositions();
        this.ui.showCountdown(3, () => this.stateMachine.transition(STATES.SERVING));
        break;
      case STATES.SERVING:
        this.resetPositions();
        this.ball.serveTo(ctx.server);
        this.stateMachine.transition(STATES.PLAYING);
        break;
      case STATES.PLAYING:
        this.ui.hideAllScreens();
        break;
      case STATES.POINT_END:
        setTimeout(() => {
          if (this.stateMachine.getState() === STATES.POINT_END) {
            this.stateMachine.transition(STATES.NEXT_POINT);
          }
        }, 1500);
        break;
      case STATES.GAME_OVER:
        this.ui.showGameOver(ctx);
        break;
    }
  }

  resetPositions() {
    this.playerPaddle.position.set(0, PHYSICS.TABLE_HEIGHT + 0.1, PHYSICS.TABLE_LENGTH * 0.45);
    this.aiPaddle.position.set(0, PHYSICS.TABLE_HEIGHT + 0.1, -PHYSICS.TABLE_LENGTH * 0.45);
    this.ball.reset();
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (this.stateMachine.getState() === STATES.PLAYING) {
      this.update(dt);
    }

    this.gameRenderer.update(this.ball, this.playerPaddle, this.aiPaddle);
    this.cameraManager.update(dt, this.ball.position, this.playerPaddle.position);
    this.sceneManager.render();
    requestAnimationFrame(this.loop);
  }

  update(dt) {
    this.input.update();
    const target = this.input.getPaddleTarget();
    this.playerPaddle.moveToward(target.dx * 2, target.dz * 2, dt);

    const aiTarget = this.ai.update(dt, this.ball, this.aiPaddle);
    this.aiPaddle.moveToward(aiTarget.x, aiTarget.z, dt);

    this.physics.step(dt);
    this.particles.update(dt);

    const events = this.physics.scoringEvents;
    if (events.length > 0) {
      const ev = events[events.length - 1];
      if (ev.type === 'POINT_PLAYER_1' || ev.type === 'POINT_PLAYER_2') {
        const winner = ev.type === 'POINT_PLAYER_1' ? 'player_1' : 'player_2';
        this.audio.playScore();
        this.particles.emitCelebration(winner);
        this.stateMachine.awardPoint(winner);
      }
    }

    const collisions = this.physics.collisionsThisFrame;
    for (const c of collisions) {
      if (c.type === 'PADDLE_HIT') this.audio.playHitPaddle(c.relativeVelocity?.length() || 1);
      if (c.type === 'TABLE_BOUNCE') this.audio.playHitTable();
      this.particles.emitCollision(c);
    }
  }
}

const game = new Game();
export default game;

import { SceneManager } from '../renderer/SceneManager.js';
import { GameRenderer } from '../renderer/GameRenderer.js';
import { CameraManager } from '../renderer/CameraManager.js';
import { PhysicsEngine } from '../physics/PhysicsEngine.js';
import { GameStateMachine } from '../state/GameStateMachine.js';
import { InputManager } from '../input/InputManager.js';
import { AIController } from '../ai/AIController.js';
import { UIManager } from '../ui/UIManager.js';
import { HUD } from '../ui/HUD.js';
import { AudioManager } from '../audio/AudioManager.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { Ball } from '../entities/Ball.js';
import { Paddle } from '../entities/Paddle.js';
import { Table } from '../entities/Table.js';
import { PHYSICS_STEP, DIFFICULTY } from './Constants.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.lastTime = 0;
    this.accumulator = 0;
    this.running = false;

    this.table = new Table();
    this.ball = new Ball();
    this.playerPaddle = new Paddle();
    this.aiPaddle = new Paddle();
    this.aiPaddle.position.x = 1.2;

    this.sceneManager = new SceneManager(canvas);
    this.gameRenderer = new GameRenderer(this.sceneManager);
    this.cameraManager = new CameraManager(this.sceneManager.camera);
    this.physics = new PhysicsEngine({ table: this.table });
    this.stateMachine = new GameStateMachine();
    this.input = new InputManager();
    this.ai = new AIController({ difficulty: 'medium' });
    this.ui = new UIManager(this);
    this.hud = new HUD();
    this.audio = new AudioManager();
    this.particles = new ParticleSystem(this.sceneManager.scene);

    this.input.bind(canvas);
    this.input.onPause = () => this.togglePause();

    this.settings = this.loadSettings();
    this.applySettings();
  }

  loadSettings() {
    try {
      return JSON.parse(localStorage.getItem('tt3d_settings_v2')) || {};
    } catch {
      return {};
    }
  }

  applySettings() {
    const diff = this.settings.difficulty || 'medium';
    this.ai = new AIController({ difficulty: diff });
    this.hud.setDifficulty(diff);
    this.hud.setFormat(this.settings.format || 'best-of-3');
  }

  start() {
    this.running = true;
    this.ui.show('title-screen');
    requestAnimationFrame(this.loop.bind(this));
  }

  startMatch(difficulty = 'medium') {
    this.settings.difficulty = difficulty;
    this.applySettings();
    this.stateMachine.resetGame();
    this.stateMachine.transition('START');
    this.ui.show('countdown-overlay');
    this.cameraManager.setMode('player');
    setTimeout(() => {
      this.stateMachine.transition('COUNTDOWN_COMPLETE');
      this.ui.show('hud');
      this.ball.reset();
    }, 3000);
  }

  restart() {
    this.stateMachine.resetGame();
    this.startMatch(this.settings.difficulty || 'medium');
  }

  resume() {
    if (this.stateMachine.state === 'PAUSED') {
      this.stateMachine.transition('RESUME');
      this.ui.show('hud');
    }
  }

  togglePause() {
    if (this.stateMachine.state === 'PLAYING') {
      this.stateMachine.transition('PAUSE');
      this.ui.show('pause-menu');
    } else if (this.stateMachine.state === 'PAUSED') {
      this.resume();
    }
  }

  quitToMenu() {
    this.stateMachine.state = 'MENU';
    this.ui.show('title-screen');
  }

  loop(timestamp) {
    if (!this.running) return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    if (this.stateMachine.state === 'PLAYING' || this.stateMachine.state === 'SERVING') {
      this.accumulator += dt;
      while (this.accumulator >= PHYSICS_STEP) {
        this.updatePhysics(PHYSICS_STEP);
        this.accumulator -= PHYSICS_STEP;
      }
    }

    this.cameraManager.update(this.ball, dt);
    this.particles.update(dt);
    this.gameRenderer.update(this.ball, this.playerPaddle, this.aiPaddle);
    this.hud.update(this.stateMachine);
    this.gameRenderer.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  updatePhysics(dt) {
    this.physics.update(this.ball, dt);

    // AI movement
    const aiMove = this.ai.getMove(this.ball, this.aiPaddle, dt);
    this.aiPaddle.position.z += aiMove;
    this.aiPaddle.position.z = Math.max(-0.7, Math.min(0.7, this.aiPaddle.position.z));

    // Player movement from input
    const axis = this.input.getVerticalAxis();
    this.playerPaddle.position.z += axis * 2.5 * dt;
    this.playerPaddle.position.z = Math.max(-0.7, Math.min(0.7, this.playerPaddle.position.z));

    // Check double bounce
    if (this.physics.isDoubleBounce(this.ball)) {
      const scorer = this.ball.position.x > 0 ? 'player' : 'ai';
      this.stateMachine.scorePoint(scorer);
      this.onPointEnd();
    }

    // Out of bounds / floor
    if (this.ball.position.y < -0.5) {
      const scorer = this.ball.position.x > 0 ? 'player' : 'ai';
      this.stateMachine.scorePoint(scorer);
      this.onPointEnd();
    }
  }

  onPointEnd() {
    if (this.stateMachine.isGameOver()) {
      if (this.stateMachine.isMatchOver()) {
        this.stateMachine.transition('MATCH_WON');
        this.ui.show('game-over');
      } else {
        this.stateMachine.sets.player += this.stateMachine.winner === 'player' ? 1 : 0;
        this.stateMachine.sets.ai += this.stateMachine.winner === 'ai' ? 1 : 0;
        this.stateMachine.scores = { player: 0, ai: 0 };
        this.stateMachine.winner = null;
        this.stateMachine.transition('NEXT_POINT');
      }
    } else {
      this.stateMachine.transition('POINT_SCORED');
      setTimeout(() => {
        this.stateMachine.transition('NEXT_POINT');
        this.ball.reset();
      }, 1500);
    }
  }
}
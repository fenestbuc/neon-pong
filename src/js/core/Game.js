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
import { PHYSICS_STEP, DIFFICULTY, TABLE_LENGTH, TABLE_WIDTH, TABLE_HEIGHT, MAX_BALL_SPEED } from './Constants.js';
import * as THREE from 'three';

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
    this.playerPaddle.position.x = -(TABLE_LENGTH / 2 + 0.15);
    this.aiPaddle.position.x = TABLE_LENGTH / 2 + 0.15;
    this.playerPaddle.position.y = TABLE_HEIGHT + 0.12;
    this.aiPaddle.position.y = TABLE_HEIGHT + 0.12;

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

    // Raycaster for true 3D mouse-to-world paddle control
    this.raycaster = new THREE.Raycaster();

    this.input.bind(canvas);
    this.input.onPause = () => this.togglePause();

    this.settings = this.loadSettings();
    this.applySettings();

    // Safety: loading screen fallback after 3 seconds
    this._loadingTimeout = setTimeout(() => {
      console.warn('[Game] Loading fallback triggered — forcing title screen');
      if (this.ui && this.ui.show) {
        this.ui.show('title-screen');
      }
    }, 3000);

    // Debug helper for remote troubleshooting
    window.__gameDebug = {
      version: '2.0.0',
      game: this,
      state: () => this.stateMachine?.state,
      scores: () => this.stateMachine?.scores,
      ballPos: () => ({ x: this.ball?.position.x, y: this.ball?.position.y, z: this.ball?.position.z }),
      paddlePos: () => ({ player: this.playerPaddle?.position, ai: this.aiPaddle?.position }),
      webgl: () => this.sceneManager?.webglAvailable,
    };
  }

  log(...args) {
    console.log('[Game]', ...args);
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
    const format = this.settings.format || 'best-of-3';
    this.ai = new AIController({ difficulty: diff });
    this.stateMachine.config.matchLength = format;
    this.hud.setDifficulty(diff);
    this.hud.setFormat(format);
  }

  start() {
    this.running = true;
    clearTimeout(this._loadingTimeout);
    this.log('start() — showing title screen');
    this.ui.show('title-screen');
    requestAnimationFrame(this.loop.bind(this));
  }

  startMatch(difficulty = 'medium') {
    this.log('startMatch() — difficulty:', difficulty);
    this.settings.difficulty = difficulty;
    this.applySettings();
    this.stateMachine.resetGame();
    this.stateMachine.transition('START');
    this.ui.show('countdown-overlay');
    this.cameraManager.setMode('player');

    // Countdown: 3 → 2 → 1 → Go!
    const display = document.getElementById('countdown-display');
    if (!display) {
      console.error('[Game] Countdown display element not found');
      return;
    }
    let count = 3;
    display.textContent = count;
    display.className = 'countdown-number';
    this.log('countdown starting:', count);

    const step = () => {
      count--;
      if (count > 0) {
        display.textContent = count;
        // Re-trigger animation by removing and re-adding class
        display.className = '';
        void display.offsetWidth; // force reflow
        display.className = 'countdown-number';
        setTimeout(step, 1000);
      } else {
        // Show "GO!"
        display.textContent = 'GO!';
        display.className = '';
        void display.offsetWidth;
        display.className = 'countdown-go';
        setTimeout(() => {
          this.log('countdown complete — starting rally');
          this.stateMachine.transition('COUNTDOWN_COMPLETE');
          this.ui.show('hud');
          this.ball.reset();
          this.serveBall();
        }, 800);
      }
    };
    setTimeout(step, 1000);
  }

  serveBall() {
    // Serve from server's side with slight randomness
    const isPlayerServe = this.stateMachine.server === 'player';
    const sideX = isPlayerServe ? -1.2 : 1.2;
    this.ball.position.set(sideX * 0.6, 1.2, (Math.random() - 0.5) * 0.4);
    const speedX = isPlayerServe ? 6 : -6;
    this.ball.velocity.set(speedX, -2, (Math.random() - 0.5) * 2);
    this.ball.bounceCount = 0;

    // If we were in SERVING state (e.g. from POINT_END transition), move to PLAYING
    if (this.stateMachine.state === 'SERVING') {
      this.stateMachine.transition('SERVE_COMPLETE');
    }
  }

  restart() {
    this.stateMachine.resetGame();
    this.stateMachine.state = 'MENU';
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
      while (
        this.accumulator >= PHYSICS_STEP &&
        (this.stateMachine.state === 'PLAYING' || this.stateMachine.state === 'SERVING')
      ) {
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

    // Clamp ball speed
    const speed = Math.sqrt(
      this.ball.velocity.x ** 2 +
      this.ball.velocity.y ** 2 +
      this.ball.velocity.z ** 2
    );
    if (speed > MAX_BALL_SPEED) {
      const scale = MAX_BALL_SPEED / speed;
      this.ball.velocity.x *= scale;
      this.ball.velocity.y *= scale;
      this.ball.velocity.z *= scale;
    }

    // Player movement — true 2D mouse tracking via raycasting
    const axis = this.input.getVerticalAxis();
    if (axis !== 0) {
      // Keyboard fallback: only Z axis
      this.playerPaddle.position.z += axis * 2.5 * dt;
      this.playerPaddle.position.z = Math.max(-0.7, Math.min(0.7, this.playerPaddle.position.z));
    // Player movement — true 3D paddle control
    const axis = this.input.getVerticalAxis();
    if (axis !== 0) {
      // Keyboard fallback: only Z axis
      this.playerPaddle.position.z += axis * 2.5 * dt;
      this.playerPaddle.position.z = Math.max(-0.7, Math.min(0.7, this.playerPaddle.position.z));
    } else {
      // Mouse/touch: Full 3D raycast control
      const mouse = this.input.getMouseNormalized();
      if (mouse) {
        this.raycaster.setFromCamera(
          new THREE.Vector2(mouse.x * 2 - 1, -(mouse.y * 2 - 1)),
          this.sceneManager.camera
        );
        
        // Position paddle along ray at varying distance based on screen Y
        // Top of screen (mouse.y=0) → paddle closer to player (further back)
        // Bottom of screen (mouse.y=1) → paddle closer to table (further forward)
        const distance = 2.0 + (1.0 - mouse.y) * 2.0; // 2.0 to 4.0 units from camera
        const target = new THREE.Vector3().copy(this.raycaster.ray.origin)
          .add(this.raycaster.ray.direction.clone().multiplyScalar(distance));
        
        if (target) {
          // Smooth lerp for natural feel
          const lerpFactor = 0.3;
          this.playerPaddle.position.x += (target.x - this.playerPaddle.position.x) * lerpFactor;
          this.playerPaddle.position.y += (target.y - this.playerPaddle.position.y) * lerpFactor;
          this.playerPaddle.position.z += (target.z - this.playerPaddle.position.z) * lerpFactor;
          
          // Soft bounds (allow some freedom beyond table)
          this.playerPaddle.position.x = Math.max(-4.0, Math.min(-0.1, this.playerPaddle.position.x));
          this.playerPaddle.position.y = Math.max(0.5, Math.min(2.5, this.playerPaddle.position.y));
          this.playerPaddle.position.z = Math.max(-2.0, Math.min(2.0, this.playerPaddle.position.z));
        }
      }
    }

    // AI movement (still 1D for now)
    const aiMove = this.ai.getMove(this.ball, this.aiPaddle, dt);
    this.aiPaddle.position.z += aiMove;
    this.aiPaddle.position.z = Math.max(-0.7, Math.min(0.7, this.aiPaddle.position.z));

    // Paddle collisions
    if (this.checkPaddleHit(this.ball, this.playerPaddle)) {
      this.handlePaddleHit(this.ball, this.playerPaddle);
    }
    if (this.checkPaddleHit(this.ball, this.aiPaddle)) {
      this.handlePaddleHit(this.ball, this.aiPaddle);
    }

    // Check double bounce
    if (this.physics.isDoubleBounce(this.ball)) {
      const scorer = this.ball.position.x > 0 ? 'player' : 'ai';
      this.stateMachine.scorePoint(scorer);
      this.onPointEnd();
      return;
    }

    // Ball went far off table (side or past end)
    if (
      Math.abs(this.ball.position.z) > TABLE_WIDTH / 2 + 1.0 ||
      Math.abs(this.ball.position.x) > TABLE_LENGTH / 2 + 2.0
    ) {
      const scorer = this.ball.position.x > 0 ? 'player' : 'ai';
      this.stateMachine.scorePoint(scorer);
      this.onPointEnd();
      return;
    }

    // Out of bounds / floor (below table)
    if (this.ball.position.y < 0.2) {
      const scorer = this.ball.position.x > 0 ? 'player' : 'ai';
      this.stateMachine.scorePoint(scorer);
      this.onPointEnd();
    }
  }

  checkPaddleHit(ball, paddle) {
    const dx = Math.abs(ball.position.x - paddle.position.x);
    const dy = Math.abs(ball.position.y - paddle.position.y);
    const dz = Math.abs(ball.position.z - paddle.position.z);

    // Must be moving toward paddle
    const movingToward =
      (paddle.position.x < 0 && ball.velocity.x < 0) ||
      (paddle.position.x > 0 && ball.velocity.x > 0);
    if (!movingToward) return false;

    return (
      dx < ball.radius + 0.06 &&
      dy < ball.radius + 0.25 &&
      dz < ball.radius + 0.10
    );
  }

  handlePaddleHit(ball, paddle) {
    const hitZ = ball.position.z - paddle.position.z;

    // Push ball slightly past paddle so it doesn't stick
    if (paddle.position.x < 0) {
      ball.position.x = paddle.position.x + ball.radius + 0.06;
    } else {
      ball.position.x = paddle.position.x - ball.radius - 0.06;
    }

    // Reverse toward opponent with speed increase
    const currentVx = Math.abs(ball.velocity.x);
    let newVx = Math.max(currentVx * 1.02, 5.0) + 1.0;
    newVx = Math.min(newVx, MAX_BALL_SPEED);

    if (paddle.position.x < 0) {
      ball.velocity.x = newVx;
    } else {
      ball.velocity.x = -newVx;
    }

    // Ensure upward trajectory to clear net
    ball.velocity.y = Math.max(ball.velocity.y * 0.3, 0) + 3.5;

    // English: hitting edges adds z velocity
    ball.velocity.z += hitZ * 4.0;
    ball.velocity.z = Math.max(-6, Math.min(6, ball.velocity.z));

    ball.bounceCount = 0;

    // Effects
    this.audio.playHit();
    this.particles.spawnHitSparks(ball.position.x, ball.position.y, ball.position.z, 15);
  }

  onPointEnd() {
    this.log('onPointEnd() — scores:', this.stateMachine.scores.player, '-', this.stateMachine.scores.ai);
    if (this.stateMachine.isGameOver()) {
      this.log('game over — winner:', this.stateMachine.winner);
      if (this.stateMachine.isMatchOver()) {
        this.log('match over — sets:', this.stateMachine.sets);
        this.stateMachine.transition('MATCH_WON');
        this.ui.show('game-over');
      } else {
        // Game over but not match over — reset scores, keep sets, serve again
        this.stateMachine.scores = { player: 0, ai: 0 };
        this.stateMachine.winner = null;
        this.stateMachine.state = 'PLAYING';
        this.ui.show('hud');
        this.ball.reset();
        this.serveBall();
      }
    } else {
      this.stateMachine.transition('POINT_SCORED');
      setTimeout(() => {
        this.stateMachine.transition('NEXT_POINT');
        this.ball.reset();
        this.serveBall();
      }, 1500);
    }
  }
}
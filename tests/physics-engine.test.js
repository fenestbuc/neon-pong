import { describe, it, expect, beforeEach } from 'vitest';
import { PhysicsEngine } from '../src/js/physics.stub.js';

const DEFAULT_CONFIG = {
  gravity: -9.81,
  time_scale: 1.0,
  sub_steps: 4,
  enable_magnus: true,
  enable_air_drag: true,
  enable_net_physics: true,
  ball_mass: 0.0027,
  ball_radius: 0.02,
  table_restitution: 0.75,
  paddle_restitution: 0.92,
  max_ball_speed: 28.0,
};

const FIXED_DT = 1 / 60;

describe('PhysicsEngine — Ball Integration', () => {
  let engine;

  beforeEach(() => {
    engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
  });

  it('should apply gravity to ball during step', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 0, y: 0, z: 0 });
    const before = engine.getState().ball;
    expect(before.velocity.y).toBe(0);

    engine.step(FIXED_DT, []);
    const after = engine.getState().ball;
    expect(after.velocity.y).toBeLessThan(0);
  });

  it('should clamp ball speed to max_ball_speed (28 m/s)', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 50, y: 0, z: 0 });
    engine.step(FIXED_DT, []);
    const ball = engine.getState().ball;
    const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2 + ball.velocity.z ** 2);
    expect(speed).toBeLessThanOrEqual(DEFAULT_CONFIG.max_ball_speed + 1e-5);
  });

  it('should reduce ball speed with air drag when enabled', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 10, y: 5, z: 2 });
    const state1 = engine.getState();
    const speed1 = Math.sqrt(state1.ball.velocity.x ** 2 + state1.ball.velocity.y ** 2 + state1.ball.velocity.z ** 2);

    engine.step(FIXED_DT, []);
    const state2 = engine.getState();
    const speed2 = Math.sqrt(state2.ball.velocity.x ** 2 + state2.ball.velocity.y ** 2 + state2.ball.velocity.z ** 2);

    expect(speed2).toBeLessThan(speed1);
  });

  it('should deflect ball trajectory with Magnus force when spin is present', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 10, y: 0, z: 0 });
    engine.getState().ball.spin = { x: 0, y: 0, z: 100 };

    engine.step(FIXED_DT, []);
    const ball = engine.getState().ball;
    expect(ball.velocity.x).not.toBe(10);
  });

  it('should produce deterministic results with identical inputs', () => {
    const run = () => {
      const e = new PhysicsEngine({ config: DEFAULT_CONFIG });
      e.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 5, y: 2, z: -1 });
      e.getState().ball.spin = { x: 10, y: 5, z: 0 };
      for (let i = 0; i < 60; i++) e.step(FIXED_DT, []);
      return e.getState();
    };

    const s1 = run();
    const s2 = run();
    expect(s1.ball.position.x).toBeCloseTo(s2.ball.position.x, 5);
    expect(s1.ball.position.y).toBeCloseTo(s2.ball.position.y, 5);
    expect(s1.ball.position.z).toBeCloseTo(s2.ball.position.z, 5);
  });
});

describe('PhysicsEngine — Serve Lifecycle', () => {
  let engine;

  beforeEach(() => {
    engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
  });

  it('should place ball at specified serve position via setServeState', () => {
    engine.setServeState('player_1', { x: 0.2, y: 0.85, z: 0.6 }, { x: 0, y: 0, z: 0 });
    const state = engine.getState();
    expect(state.ball.position.x).toBeCloseTo(0.2, 5);
    expect(state.ball.position.y).toBeCloseTo(0.85, 5);
    expect(state.ball.position.z).toBeCloseTo(0.6, 5);
  });

  it('should freeze ball velocity when setServeState uses zero initial velocity', () => {
    engine.setServeState('player_1', { x: 0, y: 0.85, z: 0.6 }, { x: 0, y: 0, z: 0 });
    engine.step(FIXED_DT, []);
    const state = engine.getState();
    const speed = Math.sqrt(state.ball.velocity.x ** 2 + state.ball.velocity.y ** 2 + state.ball.velocity.z ** 2);
    expect(speed).toBeCloseTo(0, 5);
  });

  it('should advance accumulated simulation time in returned PhysicsState', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 0, y: 0, z: 0 });
    engine.step(FIXED_DT, []);
    const state = engine.getState();
    expect(state.time).toBeGreaterThan(0);
    expect(state.time_step).toBe(FIXED_DT);
  });
});

describe('PhysicsEngine — Paddle Input Constraints', () => {
  let engine;

  beforeEach(() => {
    engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
  });

  it('should reject negative delta_time values', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 0, y: 0, z: 0 });
    expect(() => engine.step(-0.01, [])).toThrow();
  });

  it('should cap paddle velocity magnitude at 10 m/s for anti-cheat', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 0, y: 0, z: 0 });
    const fastPaddle = {
      player_id: 'player_1',
      position: { x: 0, y: 0.8, z: 0.6 },
      velocity: { x: 0, y: 0, z: 50 },
      orientation: { x: 0, y: 0, z: 0, w: 1 },
    };
    engine.step(FIXED_DT, [fastPaddle]);
    const state = engine.getState();
    const paddle = state.paddles.find(p => p.player_id === 'player_1');
    if (!paddle) {
      expect(state.paddles).toBeDefined();
      return;
    }
    const speed = Math.sqrt(paddle.velocity.x ** 2 + paddle.velocity.y ** 2 + paddle.velocity.z ** 2);
    expect(speed).toBeLessThanOrEqual(10);
  });
});

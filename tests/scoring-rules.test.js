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

describe('Scoring Rules — Serve Evaluation', () => {
  let engine;

  beforeEach(() => {
    engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
  });

  it('returns FAULT when ball double-bounces on server side during TOSS phase', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.6 }, { x: 0, y: -1, z: 1 });
    engine.step(1 / 60, []);
    // simulate a second bounce on server side before strike
    engine.getState().ball.bounce_count_player_1 = 2;
    engine.getState().ball.last_bounced_side = 'player_1';
    const scoring = engine.evaluateServe('player_1', 'TOSS');
    expect(scoring).not.toBeNull();
    expect(scoring.type).toBe('FAULT');
    expect(scoring.reason).toBe('SERVE_FAULT');
  });

  it('returns LET when serve hits net top and lands in opponent diagonal half', () => {
    engine.setServeState('player_1', { x: 0.3, y: 1.0, z: 0.6 }, { x: 0, y: 0.5, z: -3 });
    engine.step(1 / 60, []);
    engine.getState().ball.last_bounced_side = 'player_2';
    const scoring = engine.evaluateServe('player_1', 'IN_FLIGHT');
    expect(scoring).not.toBeNull();
    expect(scoring.type).toBe('LET');
    expect(scoring.reason).toBe('SERVE_LET');
  });

  it('returns FAULT when serve fails to pass net', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.6 }, { x: 0, y: -0.5, z: -0.5 });
    engine.step(1 / 60, []);
    const scoring = engine.evaluateServe('player_1', 'IN_FLIGHT');
    expect(scoring).not.toBeNull();
    expect(scoring.type).toBe('FAULT');
  });

  it('returns FAULT when serve lands outside receiver diagonal half', () => {
    engine.setServeState('player_1', { x: 0.8, y: 1.0, z: 0.6 }, { x: 0, y: -0.5, z: -3 });
    engine.step(1 / 60, []);
    engine.getState().ball.last_bounced_side = 'player_2';
    const scoring = engine.evaluateServe('player_1', 'IN_FLIGHT');
    expect(scoring).not.toBeNull();
    expect(scoring.type).toBe('FAULT');
  });

  it('returns null for valid serve strike transitioning to rally', () => {
    engine.setServeState('player_1', { x: 0.3, y: 1.0, z: 0.6 }, { x: 0, y: -0.5, z: -3 });
    engine.step(1 / 60, []);
    engine.getState().ball.last_bounced_side = 'player_1';
    const scoring = engine.evaluateServe('player_1', 'STRUCK');
    expect(scoring).toBeNull();
  });
});

describe('Scoring Rules — Rally Evaluation', () => {
  let engine;

  beforeEach(() => {
    engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
  });

  it('returns POINT to opponent on double bounce on same side', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: -0.5 }, { x: 0, y: -2, z: -1 });
    engine.step(1 / 60, []);
    engine.getState().ball.bounce_count_player_2 = 2;
    const scoring = engine.evaluateRally('player_1', []);
    expect(scoring).not.toBeNull();
    expect(scoring.type).toBe('POINT_PLAYER_1');
    expect(scoring.reason).toBe('DOUBLE_BOUNCE');
  });

  it('returns POINT to opponent when ball lands out of bounds after table bounce', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: -0.5 }, { x: 0, y: -1, z: -2 });
    engine.step(1 / 60, []);
    engine.getState().ball.position.x = 2.0;
    engine.getState().ball.last_bounced_side = 'player_2';
    const scoring = engine.evaluateRally('player_1', []);
    expect(scoring).not.toBeNull();
    expect(scoring.type).toBe('POINT_PLAYER_1');
    expect(scoring.reason).toBe('OUT_OF_BOUNDS');
  });

  it('returns POINT to server when ball goes out without bouncing on receiver side', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: -0.5 }, { x: 0, y: 0, z: -5 });
    engine.step(1 / 60, []);
    engine.getState().ball.last_bounced_side = 'player_1';
    const scoring = engine.evaluateRally('player_1', []);
    expect(scoring).not.toBeNull();
    expect(scoring.type).toBe('POINT_PLAYER_2');
    expect(scoring.reason).toBe('OUT_OF_BOUNDS');
  });

  it('returns null while rally is still in play', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: -0.5 }, { x: 0, y: 0, z: -5 });
    engine.step(1 / 60, []);
    engine.getState().ball.bounce_count_player_2 = 1;
    engine.getState().ball.last_bounced_side = 'player_2';
    const scoring = engine.evaluateRally('player_1', []);
    expect(scoring).toBeNull();
  });
});

describe('Scoring Rules — Bounce Counter Management', () => {
  let engine;

  beforeEach(() => {
    engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
  });

  it('should reset bounce counters for a new rally', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 0, y: 0, z: 0 });
    engine.getState().ball.bounce_count_player_1 = 3;
    engine.getState().ball.bounce_count_player_2 = 2;
    engine.resetBounceCounters();
    const ball = engine.getState().ball;
    expect(ball.bounce_count_player_1).toBe(0);
    expect(ball.bounce_count_player_2).toBe(0);
    expect(ball.last_bounced_side).toBe('none');
  });

  it('should increment server bounce count on table collision during serve', () => {
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.6 }, { x: 0, y: -2, z: 1 });
    engine.step(1 / 60, []);
    const ball = engine.getState().ball;
    expect(ball.bounce_count_player_1).toBeGreaterThanOrEqual(1);
    expect(ball.last_bounced_side).toBe('player_1');
  });
});

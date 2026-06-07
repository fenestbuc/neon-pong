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

const TABLE_BOUNDS = {
  minX: -0.7625,
  maxX: 0.7625,
  minZ: -1.37,
  maxZ: 1.37,
  height: 0.76,
  netHeight: 0.1525,
  netOverhang: 0.1525,
};

const COURT_BOUNDS = {
  minX: -2.0,
  maxX: 2.0,
  minZ: -3.0,
  maxZ: 3.0,
  maxY: 5.0,
};

describe('Collision Detection — Table Bounce', () => {
  it('should generate TABLE_BOUNCE when ball crosses table surface downward', () => {
    const engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 0, y: -2, z: 5 });
    const state = engine.step(1 / 60, []);
    const tableHit = state.collisions_this_frame.find(c => c.type === 'TABLE_BOUNCE');
    expect(tableHit).toBeDefined();
    expect(tableHit.player_id).toBe('player_1');
  });

  it('should reflect velocity with table restitution ~0.75', () => {
    const engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 0, y: -5, z: 0 });
    const beforeVy = engine.getState().ball.velocity.y;
    engine.step(1 / 60, []);
    const after = engine.getState().ball;
    expect(after.velocity.y).toBeGreaterThan(0);
    expect(Math.abs(after.velocity.y)).toBeCloseTo(Math.abs(beforeVy) * DEFAULT_CONFIG.table_restitution, 1);
  });

  it('should apply surface friction damping to tangential velocity on bounce', () => {
    const engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 3, y: -5, z: 2 });
    const beforeVx = engine.getState().ball.velocity.x;
    engine.step(1 / 60, []);
    const after = engine.getState().ball;
    expect(Math.abs(after.velocity.x)).toBeLessThan(Math.abs(beforeVx));
  });
});

describe('Collision Detection — Net', () => {
  it('should generate NET_HIT when ball strikes net face during rally', () => {
    const engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 0, y: -1, z: -3 });
    const state = engine.step(1 / 60, []);
    const netHit = state.collisions_this_frame.find(c => c.type === 'NET_HIT');
    expect(netHit).toBeDefined();
  });

  it('should generate NET_TOP_HIT when ball clips top band', () => {
    const engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
    engine.setServeState('player_1', { x: 0, y: 0.92, z: 0.5 }, { x: 0, y: -0.5, z: -3 });
    const state = engine.step(1 / 60, []);
    const topHit = state.collisions_this_frame.find(c => c.type === 'NET_TOP_HIT');
    expect(topHit).toBeDefined();
  });

  it('should nearly kill ball velocity on NET_HIT (restitution 0.05)', () => {
    const engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 0, y: -1, z: -5 });
    engine.step(1 / 60, []);
    const ball = engine.getState().ball;
    const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2 + ball.velocity.z ** 2);
    expect(speed).toBeLessThan(2);
  });
});

describe('Collision Detection — Paddle CCD', () => {
  const paddleState = {
    player_id: 'player_1',
    position: { x: 0, y: 0.85, z: 0.7 },
    velocity: { x: 0, y: 0, z: 0 },
    orientation: { x: 0, y: 0, z: 0, w: 1 },
    radius: 0.08,
    sweet_spot: { x: 0, y: 0, z: 0 },
    is_active: true,
  };

  it('should generate PADDLE_HIT when ball approaches paddle within a frame', () => {
    const engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
    engine.setServeState('player_1', { x: 0, y: 0.85, z: 0.5 }, { x: 0, y: 0, z: 10 });
    const state = engine.step(1 / 60, [paddleState]);
    const paddleHit = state.collisions_this_frame.find(c => c.type === 'PADDLE_HIT');
    expect(paddleHit).toBeDefined();
    expect(paddleHit.player_id).toBe('player_1');
  });

  it('should only register one PADDLE_HIT per frame (ghost hit protection)', () => {
    const engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
    engine.setServeState('player_1', { x: 0, y: 0.85, z: 0.6 }, { x: 0, y: 0, z: 20 });
    const state = engine.step(1 / 60, [paddleState]);
    const hits = state.collisions_this_frame.filter(c => c.type === 'PADDLE_HIT');
    expect(hits.length).toBeLessThanOrEqual(1);
  });

  it('should reject paddle hit when ball is moving away from paddle', () => {
    const engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
    engine.setServeState('player_1', { x: 0, y: 0.85, z: 0.9 }, { x: 0, y: 0, z: 5 });
    const state = engine.step(1 / 60, [paddleState]);
    const paddleHit = state.collisions_this_frame.find(c => c.type === 'PADDLE_HIT');
    expect(paddleHit).toBeUndefined();
  });
});

describe('Collision Detection — Out of Bounds', () => {
  it('should generate POINT to opponent when ball exits court laterally', () => {
    const engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 15, y: 0, z: 5 });
    const state = engine.step(1 / 60, []);
    const scoring = state.scoring_events_this_frame.find(e => e.type === 'POINT_PLAYER_2');
    expect(scoring).toBeDefined();
    expect(scoring.reason).toBe('OUT_OF_BOUNDS');
  });

  it('should generate POINT to opponent when ball hits floor beyond table', () => {
    const engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
    engine.setServeState('player_1', { x: 0, y: 1.0, z: 0.5 }, { x: 0, y: -10, z: 5 });
    const state = engine.step(1 / 60, []);
    const scoring = state.scoring_events_this_frame.find(e => e.type === 'POINT_PLAYER_2');
    expect(scoring).toBeDefined();
  });
});

describe('Collision Response — Sweet Spot & Penetration', () => {
  const paddleState = {
    player_id: 'player_1',
    position: { x: 0, y: 0.85, z: 0.7 },
    velocity: { x: 0, y: 0, z: 2 },
    orientation: { x: 0, y: 0, z: 0, w: 1 },
    radius: 0.08,
    sweet_spot: { x: 0, y: 0, z: 0 },
    is_active: true,
  };

  it('should multiply outgoing velocity by sweet_spot_multiplier for center hits', () => {
    const engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
    engine.setServeState('player_1', { x: 0, y: 0.85, z: 0.6 }, { x: 0, y: 0, z: 5 });
    const beforeSpeed = 5;
    engine.step(1 / 60, [paddleState]);
    const after = engine.getState().ball;
    const afterSpeed = Math.sqrt(after.velocity.x ** 2 + after.velocity.y ** 2 + after.velocity.z ** 2);
    expect(afterSpeed).toBeGreaterThan(beforeSpeed * 1.1);
  });

  it('should separate ball from surface by penetration depth plus epsilon', () => {
    const engine = new PhysicsEngine({ config: DEFAULT_CONFIG });
    engine.setServeState('player_1', { x: 0, y: 0.78, z: 0.5 }, { x: 0, y: -1, z: 0 });
    engine.step(1 / 60, []);
    const ball = engine.getState().ball;
    expect(ball.position.y).toBeGreaterThanOrEqual(TABLE_BOUNDS.height + DEFAULT_CONFIG.ball_radius + 0.001);
  });
});

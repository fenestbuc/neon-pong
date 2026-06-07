import { describe, it, expect, beforeEach } from 'vitest';
import { AIController } from '../src/js/ai.stub.js';

const COURT_HEIGHT = 600;

describe('AI Opponent — Novice Difficulty', () => {
  let ai;

  beforeEach(() => {
    ai = new AIController('novice');
  });

  it('should have reaction delay between 250ms and 350ms', () => {
    expect(ai.reactionDelay).toBeGreaterThanOrEqual(0.25);
    expect(ai.reactionDelay).toBeLessThanOrEqual(0.35);
  });

  it('should never apply spin', () => {
    expect(ai.spinUsage).toBe(0);
  });

  it('should have 30% error rate on returns', () => {
    expect(ai.errorRate).toBe(0.30);
  });

  it('should cap movement speed at 3.0 m/s', () => {
    expect(ai.movementSpeedCap).toBe(3.0);
  });

  it('should return flat shots to center with low accuracy', () => {
    const ball = { x: 400, y: 200, vx: -100, vy: 50 };
    const paddle = { x: 780, y: 250, width: 12, height: 80 };
    const target = ai.update(1 / 60, ball, paddle, COURT_HEIGHT);
    expect(target).toBeDefined();
  });
});

describe('AI Opponent — Intermediate Difficulty', () => {
  let ai;

  beforeEach(() => {
    ai = new AIController('intermediate');
  });

  it('should have reaction delay between 120ms and 180ms', () => {
    expect(ai.reactionDelay).toBeGreaterThanOrEqual(0.12);
    expect(ai.reactionDelay).toBeLessThanOrEqual(0.18);
  });

  it('should have 20% chance of basic topspin', () => {
    expect(ai.spinUsage).toBe(0.20);
  });

  it('should have 15% error rate', () => {
    expect(ai.errorRate).toBe(0.15);
  });

  it('should cap movement speed at 5.0 m/s', () => {
    expect(ai.movementSpeedCap).toBe(5.0);
  });

  it('should use linear extrapolation for shot prediction', () => {
    const ball = { x: 400, y: 200, vx: -150, vy: 30 };
    const paddle = { x: 780, y: 250, width: 12, height: 80 };
    ai.update(1 / 60, ball, paddle, COURT_HEIGHT);
    expect(ai.predictionMethod).toBe('linear');
  });
});

describe('AI Opponent — Expert Difficulty', () => {
  let ai;

  beforeEach(() => {
    ai = new AIController('expert');
  });

  it('should have reaction delay between 50ms and 80ms', () => {
    expect(ai.reactionDelay).toBeGreaterThanOrEqual(0.05);
    expect(ai.reactionDelay).toBeLessThanOrEqual(0.08);
  });

  it('should have 60% chance of spin usage with mixed types', () => {
    expect(ai.spinUsage).toBe(0.60);
  });

  it('should have 8% error rate', () => {
    expect(ai.errorRate).toBe(0.08);
  });

  it('should cap movement speed at 7.5 m/s', () => {
    expect(ai.movementSpeedCap).toBe(7.5);
  });

  it('should use full ballistic trajectory prediction including spin', () => {
    const ball = { x: 400, y: 200, vx: -200, vy: 40, spin: { x: 0, y: 0, z: 50 } };
    const paddle = { x: 780, y: 250, width: 12, height: 80 };
    ai.update(1 / 60, ball, paddle, COURT_HEIGHT);
    expect(ai.predictionMethod).toBe('ballistic');
  });
});

describe('AI Opponent — Pro Difficulty', () => {
  let ai;

  beforeEach(() => {
    ai = new AIController('pro');
  });

  it('should have reaction delay between 10ms and 30ms', () => {
    expect(ai.reactionDelay).toBeGreaterThanOrEqual(0.01);
    expect(ai.reactionDelay).toBeLessThanOrEqual(0.03);
  });

  it('should have 85% chance of advanced spin combinations', () => {
    expect(ai.spinUsage).toBe(0.85);
  });

  it('should have 4% error rate', () => {
    expect(ai.errorRate).toBe(0.04);
  });

  it('should cap movement speed at 9.0 m/s', () => {
    expect(ai.movementSpeedCap).toBe(9.0);
  });

  it('should use frame-lookahead prediction (3 frames)', () => {
    const ball = { x: 400, y: 200, vx: -250, vy: 60 };
    const paddle = { x: 780, y: 250, width: 12, height: 80 };
    ai.update(1 / 60, ball, paddle, COURT_HEIGHT);
    expect(ai.lookaheadFrames).toBe(3);
  });

  it('should have 1% chance of intentional error for humanization', () => {
    expect(ai.intentionalErrorRate).toBe(0.01);
  });

  it('should target extreme angles and net skimmers', () => {
    const ball = { x: 400, y: 200, vx: -300, vy: 0 };
    const paddle = { x: 780, y: 300, width: 12, height: 80 };
    ai.update(1 / 60, ball, paddle, COURT_HEIGHT);
    expect(ai.targetingStrategy).toBe('extreme_angles');
  });
});

describe('AI Opponent — Positioning Accuracy', () => {
  it('novice positioning error within ±0.30 m', () => {
    const ai = new AIController('novice');
    expect(ai.positioningAccuracy).toBeLessThanOrEqual(0.30);
  });

  it('intermediate positioning error within ±0.15 m', () => {
    const ai = new AIController('intermediate');
    expect(ai.positioningAccuracy).toBeLessThanOrEqual(0.15);
  });

  it('expert positioning error within ±0.06 m', () => {
    const ai = new AIController('expert');
    expect(ai.positioningAccuracy).toBeLessThanOrEqual(0.06);
  });

  it('pro positioning error within ±0.02 m', () => {
    const ai = new AIController('pro');
    expect(ai.positioningAccuracy).toBeLessThanOrEqual(0.02);
  });
});

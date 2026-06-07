import { describe, it, expect, beforeEach } from 'vitest';
import { Ball } from '../src/js/entities/Ball.js';
import { Table } from '../src/js/entities/Table.js';
import { PhysicsEngine } from '../src/js/physics/PhysicsEngine.js';

describe('Ball Physics', () => {
  let ball, table, physics;

  beforeEach(() => {
    table = new Table();
    ball = new Ball();
    physics = new PhysicsEngine({ table });
  });

  it('should apply gravity over time', () => {
    ball.position.set(0, 1.5, 0);
    ball.velocity.set(0, 0, 0);
    physics.update(ball, 0.016);
    expect(ball.position.y).toBeLessThan(1.5);
    expect(ball.velocity.y).toBeLessThan(0);
  });

  it('should bounce on table surface', () => {
    ball.position.set(0, 0.01, 0);
    ball.velocity.set(0, -2, 0);
    physics.update(ball, 0.016);
    expect(ball.velocity.y).toBeGreaterThan(0);
    expect(ball.position.y).toBeGreaterThanOrEqual(0);
  });

  it('should detect out-of-bounds (sideline)', () => {
    ball.position.set(0, 0.1, Table.WIDTH / 2 + 0.1);
    expect(physics.isInBounds(ball)).toBe(false);
  });

  it('should detect out-of-bounds (endline)', () => {
    ball.position.set(Table.LENGTH / 2 + 0.1, 0.1, 0);
    expect(physics.isInBounds(ball)).toBe(false);
  });

  it('should detect ball landing in-bounds', () => {
    ball.position.set(0.5, 0.01, 0.3);
    expect(physics.isInBounds(ball)).toBe(true);
  });

  it('should apply spin (Magnus effect)', () => {
    ball.position.set(0, 0.5, 0);
    ball.velocity.set(5, 0, 0);
    ball.spin.set(0, 10, 0); // sidespin — curves in z
    const vzBefore = ball.velocity.z;
    physics.applyMagnusEffect(ball, 0.016);
    expect(ball.velocity.z).not.toBe(vzBefore);
  });

  it('should collide with net when height < net height', () => {
    ball.position.set(0, 0.5, 0); // at net, below net top (0.91)
    ball.velocity.set(0, 0, 2);
    const collision = physics.checkNetCollision(ball);
    expect(collision).toBe(true);
  });

  it('should not collide with net when ball is above net', () => {
    ball.position.set(0, 1.0, 0); // above net height (0.76+0.15=0.91)
    ball.velocity.set(0, 0, 2);
    const collision = physics.checkNetCollision(ball);
    expect(collision).toBe(false);
  });

  it('should detect double bounce', () => {
    ball.bounceCount = 2;
    expect(physics.isDoubleBounce(ball)).toBe(true);
  });

  it('should reset bounce count on paddle hit', () => {
    ball.bounceCount = 1;
    physics.onPaddleHit(ball);
    expect(ball.bounceCount).toBe(0);
  });
});

describe('Table Dimensions', () => {
  it('should use ITTF standard table length', () => {
    expect(Table.LENGTH).toBe(2.74);
  });

  it('should use ITTF standard table width', () => {
    expect(Table.WIDTH).toBe(1.525);
  });

  it('should use ITTF standard net height', () => {
    expect(Table.NET_HEIGHT).toBe(0.1525);
  });
});

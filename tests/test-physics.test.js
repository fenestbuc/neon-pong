import { describe, it, expect } from 'vitest';
import { Ball } from '../src/js/physics/Ball.js';
import { Table } from '../src/js/physics/Table.js';
import { Paddle } from '../src/js/physics/Paddle.js';
import { CollisionDetector } from '../src/js/physics/CollisionDetector.js';

describe('Ball physics', () => {
  it('applies gravity when in play', () => {
    const ball = new Ball();
    ball.position.set(0, 2.0, 0);
    ball.velocity.set(0, 0, 0);
    ball.isInPlay = true;
    ball.update(1 / 60);
    expect(ball.velocity.y).toBeLessThan(0);
  });

  it('respects max speed cap', () => {
    const ball = new Ball();
    ball.velocity.set(100, 0, 0);
    ball.isInPlay = true;
    ball.update(1 / 60);
    const speed = ball.velocity.length();
    expect(speed).toBeLessThanOrEqual(28);
  });
});

describe('Table bounds', () => {
  it('detects ball inside table', () => {
    const table = new Table();
    const ball = new Ball();
    ball.position.set(0, 0.77, 0);
    const detector = new CollisionDetector(table);
    const collision = detector.detectBallTableCollision(ball);
    expect(collision).toBeNull();
  });
});

describe('Paddle collision', () => {
  it('detects ball hitting paddle face', () => {
    const paddle = new Paddle('player_1');
    paddle.position.set(0, 0.8, 1.0);
    const ball = new Ball();
    ball.position.set(0, 0.8, 1.05);
    ball.velocity.set(0, 0, -5);
    const detector = new CollisionDetector(new Table());
    const collision = detector.detectBallPaddleCollision(ball, paddle);
    expect(collision).not.toBeNull();
    expect(collision.type).toBe('PADDLE_HIT');
  });
});

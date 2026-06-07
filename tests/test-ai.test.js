import { describe, it, expect } from 'vitest';
import { AIController } from '../src/js/ai/AIController.js';
import { Ball } from '../src/js/physics/Ball.js';
import { Paddle } from '../src/js/physics/Paddle.js';

describe('AI', () => {
  it('easy AI misses some shots', () => {
    const ai = new AIController('novice');
    const ball = new Ball();
    ball.position.set(0.2, 0.8, -0.5);
    ball.velocity.set(0, 0, 5);
    const paddle = new Paddle('player_2');
    let misses = 0;
    for (let i = 0; i < 100; i++) {
      const target = ai.update(1 / 60, ball, paddle);
      if (Math.abs(target.x - ball.position.x) > 0.15) misses++;
    }
    expect(misses).toBeGreaterThan(0);
  });

  it('medium AI tracks ball', () => {
    const ai = new AIController('intermediate');
    const ball = new Ball();
    ball.position.set(0.3, 0.8, -0.8);
    ball.velocity.set(0, 0, 5);
    const paddle = new Paddle('player_2');
    for (let i = 0; i < 30; i++) ai.update(1 / 60, ball, paddle);
    const target = ai.update(1 / 60, ball, paddle);
    expect(Math.abs(target.x - ball.position.x)).toBeLessThan(0.5);
  });
});

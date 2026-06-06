import { describe, it, expect, beforeEach } from 'vitest';
import { AIController } from '../src/js/ai/AIController.js';

describe('AI Controller', () => {
  let ai, ball, paddle;

  beforeEach(() => {
    ball = {
      position: { x: 1.0, y: 0.3, z: 0.2 },
      velocity: { x: 4.0, y: -1.0, z: 0.5 },
    };
    paddle = {
      position: { x: -1.2, y: 0.76, z: 0 },
      width: 0.15,
      height: 0.15,
    };
    ai = new AIController({ difficulty: 'medium' });
  });

  it('should track ball position at Easy difficulty', () => {
    ai = new AIController({ difficulty: 'easy' });
    const move = ai.getMove(ball, paddle, 0.016);
    expect(move).toBeDefined();
  });

  it('should predict ball trajectory at Medium difficulty', () => {
    ai = new AIController({ difficulty: 'medium' });
    const targetZ = ai.predictBallZAtPaddle(ball, paddle.position.x);
    expect(typeof targetZ).toBe('number');
  });

  it('should be more aggressive at Hard difficulty', () => {
    ai = new AIController({ difficulty: 'hard' });
    const speed = ai.getSpeed();
    expect(speed).toBeGreaterThan(2.0);
  });

  it('should make prediction errors at Easy difficulty', () => {
    ai = new AIController({ difficulty: 'easy' });
    const errors = [];
    for (let i = 0; i < 20; i++) {
      const target = ai.predictBallZAtPaddle(ball, paddle.position.x);
      const actual = ball.position.z;
      errors.push(Math.abs(target - actual));
    }
    const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
    expect(avgError).toBeGreaterThan(0.05);
  });

  it('should handle spin at Expert difficulty', () => {
    ai = new AIController({ difficulty: 'expert' });
    ball.spin = { x: 0, y: 0, z: 15 };
    const target = ai.predictBallZAtPaddle(ball, paddle.position.x);
    // Expert AI should account for spin in prediction
    expect(ai.usesSpinPrediction).toBe(true);
  });

  it('should have reaction delay based on difficulty', () => {
    const easyAI = new AIController({ difficulty: 'easy' });
    const hardAI = new AIController({ difficulty: 'hard' });
    expect(easyAI.reactionDelay).toBeGreaterThan(hardAI.reactionDelay);
  });

  it('should not move paddle beyond table width', () => {
    const move = ai.getMove(ball, paddle, 0.016);
    const newZ = paddle.position.z + move;
    expect(Math.abs(newZ)).toBeLessThanOrEqual(0.76); // half table width
  });

  it('should track player weaknesses over time', () => {
    ai = new AIController({ difficulty: 'hard' });
    ai.recordShot('backhand');
    ai.recordShot('backhand');
    ai.recordShot('backhand');
    expect(ai.getTargetZone()).toBe('backhand');
  });
});

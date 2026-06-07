import { AI_CONFIG } from '../core/Constants.js';

export class AIController {
  constructor(difficulty = 'intermediate') {
    this.difficulty = difficulty;
    this.config = AI_CONFIG[difficulty];
    this.ballPredictions = [];
    this.isMoving = false;
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.config = AI_CONFIG[difficulty];
    this.ballPredictions = [];
  }

  update(dt, ball, paddle) {
    const c = this.config;
    if (ball.velocity.z >= 0) {
      const targetZ = c.targetCenter;
      return { x: 0, z: targetZ };
    }
    let targetX = ball.position.x;
    let targetZ = ball.position.z;
    if (c.predict) {
      const frames = c.predictFrames;
      const timeToPaddle = (paddle.position.z - ball.position.z) / ball.velocity.z;
      targetX = ball.position.x + ball.velocity.x * timeToPaddle;
      targetZ = paddle.position.z;
    }
    if (Math.random() < c.errorRate) {
      targetX += (Math.random() - 0.5) * c.positionError * 2;
    }
    if (c.intentionalError && Math.random() < c.intentionalError) {
      targetX += (Math.random() - 0.5) * 0.3;
    }
    return { x: targetX, z: targetZ };
  }
}

import { DIFFICULTY, TABLE_WIDTH } from '../core/Constants.js';

export class AIController {
  constructor({ difficulty = 'medium' }) {
    this.difficulty = difficulty;
    const cfg = DIFFICULTY[difficulty] || DIFFICULTY.medium;
    this.speed = cfg.speed;
    this.accuracy = cfg.accuracy;
    this.reactionDelay = cfg.reactionDelay;
    this.spinCap = cfg.spinCap;
    this.errorRate = cfg.errorRate;
    this.usesSpinPrediction = difficulty === 'expert' || difficulty === 'hard';
    this.weaknessMap = {};
    this.lastReaction = 0;
  }

  getMove(ball, paddle, dt) {
    // Only react when ball is coming toward this paddle
    const dx = paddle.position.x - ball.position.x;
    if (dx * ball.velocity.x <= 0) {
      return 0; // Ball moving away or already past
    }

    // Random whiff based on error rate
    if (Math.random() < this.errorRate) {
      return 0;
    }

    const targetZ = this.predictBallZAtPaddle(ball, paddle.position.x);
    const diff = targetZ - paddle.position.z;
    const maxStep = this.speed * dt;

    if (Math.abs(diff) <= maxStep) return diff;
    return diff > 0 ? maxStep : -maxStep;
  }

  predictBallZAtPaddle(ball, paddleX) {
    const dx = paddleX - ball.position.x;
    if (Math.abs(ball.velocity.x) < 0.001) return ball.position.z;

    const t = dx / ball.velocity.x;
    let predictedZ = ball.position.z + ball.velocity.z * t;

    // Add error based on difficulty
    if (this.difficulty !== 'expert') {
      const errorMargin = (1 - this.accuracy) * 0.3;
      predictedZ += (Math.random() - 0.5) * 2 * errorMargin;
    }

    // Spin correction for expert/hard
    if (this.usesSpinPrediction && ball.spin) {
      predictedZ += ball.spin.z * 0.02;
    }

    return predictedZ;
  }

  getSpeed() {
    return this.speed;
  }

  getTargetZone() {
    const entries = Object.entries(this.weaknessMap);
    if (entries.length === 0) return 'center';
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }

  recordShot(zone) {
    this.weaknessMap[zone] = (this.weaknessMap[zone] || 0) + 1;
  }
}
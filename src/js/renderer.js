/**
 * Canvas 2D renderer with neon glow effects.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  clear() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawPaddle(paddle) {
    // TODO: draw paddle with neon glow
  }

  drawBall(ball) {
    // TODO: draw ball with trail
  }

  drawNet() {
    // TODO: draw center net
  }

  drawScore(playerScore, aiScore) {
    // TODO: draw score display
  }
}

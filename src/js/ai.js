/**
 * AI opponent — Easy, Medium, Hard difficulty.
 */

import { CANVAS_HEIGHT, PADDLE, AI } from './constants.js';

export class AI {
  constructor(difficulty = 'medium') {
    this.config = AI[difficulty] || AI.medium;
    this.paddleY = CANVAS_HEIGHT / 2 - PADDLE.height / 2;
  }

  update(ball, dt) {
    // TODO: move AI paddle based on difficulty
  }
}

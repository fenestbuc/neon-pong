/**
 * Physics engine — ball and paddle movement, collisions.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE, BALL } from './constants.js';

export class Physics {
  constructor() {
    this.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: 0, vy: 0 };
    this.player = { x: PADDLE.offset, y: CANVAS_HEIGHT / 2 - PADDLE.height / 2 };
    this.ai = { x: CANVAS_WIDTH - PADDLE.offset - PADDLE.width, y: CANVAS_HEIGHT / 2 - PADDLE.height / 2 };
  }

  update(dt) {
    // TODO: move ball, check wall/paddle collisions
  }

  serve(direction) {
    // TODO: serve ball
  }
}

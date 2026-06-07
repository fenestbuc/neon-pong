import { PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_THICKNESS } from '../core/Constants.js';

export class Paddle {
  constructor() {
    this.position = { x: 0, y: 0.8, z: 0 };
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.thickness = PADDLE_THICKNESS;
  }
}
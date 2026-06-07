import { TABLE_HEIGHT, BALL_RADIUS } from '../core/Constants.js';

// Simple Vector3-like to avoid Three.js dependency in unit tests
class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
  }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
  clone() { return new Vec3(this.x, this.y, this.z); }
  add(v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
  multiplyScalar(s) { return new Vec3(this.x * s, this.y * s, this.z * s); }
}

export class Ball {
  constructor() {
    this.position = new Vec3(0, TABLE_HEIGHT + 0.5, 0);
    this.velocity = new Vec3(0, 0, 0);
    this.spin = new Vec3(0, 0, 0);
    this.bounceCount = 0;
    this.radius = BALL_RADIUS;
  }

  reset() {
    this.position.set(0, TABLE_HEIGHT + 0.5, 0);
    this.velocity.set(0, 0, 0);
    this.spin.set(0, 0, 0);
    this.bounceCount = 0;
  }
}
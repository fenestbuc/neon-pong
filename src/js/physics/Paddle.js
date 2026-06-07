import * as THREE from 'three';
import { PHYSICS } from '../core/Constants.js';

export class Paddle {
  constructor(playerId) {
    this.playerId = playerId;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.radius = PHYSICS.PADDLE_RADIUS;
    this.height = 0.02;
    this.width = PHYSICS.PADDLE_RADIUS * 2;
    this.depth = 0.02;
    this.sweetSpot = new THREE.Vector3(0, 0, 0);
    this.maxSpeed = 10.0;
  }

  moveToward(tx, tz, dt) {
    const halfTableW = PHYSICS.TABLE_WIDTH / 2 - this.radius;
    const halfTableL = PHYSICS.TABLE_LENGTH / 2 - this.radius;
    const targetX = Math.max(-halfTableW, Math.min(halfTableW, tx));
    const targetZ = Math.max(-halfTableL, Math.min(halfTableL, tz));
    const dx = targetX - this.position.x;
    const dz = targetZ - this.position.z;
    const speed = Math.hypot(dx, dz) / Math.max(dt, 0.001);
    const clampedSpeed = Math.min(speed, this.maxSpeed);
    const dist = clampedSpeed * dt;
    const angle = Math.atan2(dz, dx);
    this.velocity.set(Math.cos(angle) * clampedSpeed, 0, Math.sin(angle) * clampedSpeed);
    const stepX = Math.cos(angle) * dist;
    const stepZ = Math.sin(angle) * dist;
    if (Math.abs(dx) < Math.abs(stepX)) this.position.x = targetX;
    else this.position.x += stepX;
    if (Math.abs(dz) < Math.abs(stepZ)) this.position.z = targetZ;
    else this.position.z += stepZ;
    this.position.y = PHYSICS.TABLE_HEIGHT + 0.08;
  }
}

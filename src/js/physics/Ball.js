import * as THREE from 'three';
import { PHYSICS } from '../core/Constants.js';

export class Ball {
  constructor() {
    this.position = new THREE.Vector3(0, PHYSICS.TABLE_HEIGHT + 0.5, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.spin = new THREE.Vector3(0, 0, 0);
    this.radius = PHYSICS.BALL_RADIUS;
    this.mass = PHYSICS.BALL_MASS;
    this.isInPlay = false;
    this.lastBouncedSide = 'none';
    this.bounceCountP1 = 0;
    this.bounceCountP2 = 0;
  }

  reset() {
    this.position.set(0, PHYSICS.TABLE_HEIGHT + 0.3, 0);
    this.velocity.set(0, 0, 0);
    this.spin.set(0, 0, 0);
    this.isInPlay = false;
    this.lastBouncedSide = 'none';
    this.bounceCountP1 = 0;
    this.bounceCountP2 = 0;
  }

  serveTo(server) {
    this.reset();
    const dir = server === 'player_1' ? -1 : 1;
    this.position.z = dir * PHYSICS.TABLE_LENGTH * 0.25;
    this.position.y = PHYSICS.TABLE_HEIGHT + 0.3;
    const angle = (Math.random() - 0.5) * 0.3;
    this.velocity.set(
      Math.sin(angle) * PHYSICS.SERVE_SPEED, 2.0,
      dir * PHYSICS.SERVE_SPEED * Math.cos(angle)
    );
    this.isInPlay = true;
  }

  update(dt) {
    if (!this.isInPlay && this.velocity.lengthSq() === 0) return;
    const gravity = new THREE.Vector3(0, PHYSICS.GRAVITY, 0);
    const drag = this.computeDrag();
    const magnus = this.computeMagnus();
    const accel = new THREE.Vector3().add(gravity).add(drag).add(magnus);
    this.velocity.addScaledVector(accel, dt);
    const speed = this.velocity.length();
    if (speed > PHYSICS.MAX_BALL_SPEED) {
      this.velocity.multiplyScalar(PHYSICS.MAX_BALL_SPEED / speed);
    }
    this.position.addScaledVector(this.velocity, dt);
  }

  computeDrag() {
    const speed = this.velocity.length();
    if (speed === 0) return new THREE.Vector3(0, 0, 0);
    const area = Math.PI * this.radius * this.radius;
    const magnitude = 0.5 * PHYSICS.BALL_DRAG * PHYSICS.AIR_DENSITY * area * speed * speed;
    return this.velocity.clone().normalize().multiplyScalar(-magnitude / this.mass);
  }

  computeMagnus() {
    const cross = new THREE.Vector3().crossVectors(this.velocity, this.spin);
    return cross.multiplyScalar(PHYSICS.MAGNUS_COEFF * PHYSICS.AIR_DENSITY / this.mass);
  }
}

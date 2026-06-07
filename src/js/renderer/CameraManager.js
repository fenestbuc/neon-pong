import * as THREE from 'three';
import { TABLE_LENGTH } from '../core/Constants.js';

export class CameraManager {
  constructor(camera) {
    this.camera = camera;
    this.mode = 'dynamic';
    this.target = new THREE.Vector3();
    this.currentPos = new THREE.Vector3().copy(camera.position);
  }

  setMode(mode) {
    this.mode = mode;
  }

  update(ball, dt) {
    const targetPos = new THREE.Vector3();
    const lookAt = new THREE.Vector3();

    switch (this.mode) {
      case 'player': {
        targetPos.set(-2, 1.5, 0);
        lookAt.set(2, 0.76, 0);
        break;
      }
      case 'broadcast': {
        targetPos.set(0, 4, 4);
        lookAt.set(0, 0.76, 0);
        break;
      }
      case 'dynamic':
      default: {
        // Follow ball at 60%, table center at 40%
        const ballWeight = 0.6;
        const tableWeight = 0.4;
        lookAt.set(
          ball.position.x * ballWeight,
          ball.position.y * ballWeight + 0.76 * tableWeight,
          ball.position.z * ballWeight
        );
        targetPos.set(
          -1.5 + ball.position.x * 0.3,
          1.2 + ball.position.y * 0.5,
          ball.position.z * 0.4
        );
        break;
      }
    }

    const lerpFactor = Math.min(3.0 * dt, 1.0);
    this.currentPos.lerp(targetPos, lerpFactor);
    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(lookAt);
  }
}
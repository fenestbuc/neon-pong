import * as THREE from 'three';
import { TABLE_HEIGHT } from '../core/Constants.js';

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
        targetPos.set(-2.5, 1.8, 0);
        lookAt.set(0, TABLE_HEIGHT + 0.05, 0);
        break;
      }
      case 'broadcast': {
        targetPos.set(0, 4.5, 4.5);
        lookAt.set(0, TABLE_HEIGHT + 0.05, 0);
        break;
      }
      case 'serve': {
        targetPos.set(-2.2, 1.4, ball.position.z * 0.3);
        lookAt.set(0, TABLE_HEIGHT + 0.05, ball.position.z * 0.5);
        break;
      }
      case 'dynamic':
      default: {
        const ballWeight = 0.6;
        const tableWeight = 0.4;
        lookAt.set(
          ball.position.x * ballWeight * 0.5,
          ball.position.y * ballWeight + TABLE_HEIGHT * tableWeight,
          ball.position.z * ballWeight
        );
        targetPos.set(
          -2.0 + ball.position.x * 0.3,
          1.6 + ball.position.y * 0.4,
          ball.position.z * 0.5
        );
        break;
      }
    }

    const lerpFactor = Math.min(3.0 * dt, 1.0);
    this.camera.position.lerp(targetPos, lerpFactor);
    this.camera.lookAt(lookAt);
  }
}

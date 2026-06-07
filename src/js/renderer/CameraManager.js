export class CameraManager {
  constructor(camera) {
    this.camera = camera;
    this.mode = 'PLAYER_VIEW';
  }

  setMode(mode) { this.mode = mode; }

  update(dt, ballPos, paddlePos) {
    const targetY = 2.0 + ballPos.y * 0.3;
    const targetZ = 3.0 + ballPos.z * 0.2;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.05;
    this.camera.position.z += (targetZ - this.camera.position.z) * 0.05;
    this.camera.lookAt(ballPos.x, ballPos.y, ballPos.z);
  }
}

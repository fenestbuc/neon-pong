import * as THREE from 'three';

export class CollisionDetector {
  constructor(table) { this.table = table; }

  detectBallTableCollision(ball, prevPos) {
    if (ball.position.y - ball.radius > this.table.height + 0.01) return null;
    if (ball.position.y + ball.radius < this.table.height) return null;
    if (!this.table.isAboveTable(ball.position.x, ball.position.z)) return null;
    if (ball.velocity.y > 0) return null;
    if (prevPos && prevPos.y >= this.table.height) {
      return {
        type: 'TABLE_BOUNCE',
        player_id: this.table.sideForZ(ball.position.z),
        contact_point: new THREE.Vector3(ball.position.x, this.table.height, ball.position.z),
        normal: new THREE.Vector3(0, 1, 0),
        penetration: this.table.height - (ball.position.y - ball.radius),
        relative_velocity: ball.velocity.clone(),
        impulse: new THREE.Vector3(),
        timestamp: performance.now(),
      };
    }
    return null;
  }

  detectBallPaddleCollision(ball, paddle) {
    const diff = new THREE.Vector3().subVectors(ball.position, paddle.position);
    diff.y = 0;
    const dist = diff.length();
    if (dist > paddle.radius + ball.radius) return null;
    const relVel = new THREE.Vector3().subVectors(ball.velocity, paddle.velocity);
    const normal = diff.normalize();
    if (relVel.dot(normal) > 0) return null;
    return {
      type: 'PADDLE_HIT',
      player_id: paddle.playerId,
      contact_point: paddle.position.clone().add(normal.clone().multiplyScalar(paddle.radius)),
      normal, penetration: (paddle.radius + ball.radius) - dist,
      relative_velocity: relVel, impulse: new THREE.Vector3(),
      timestamp: performance.now(),
    };
  }
}

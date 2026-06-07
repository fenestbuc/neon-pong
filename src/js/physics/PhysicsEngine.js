import {
  GRAVITY, AIR_DRAG, RESTITUTION_TABLE,
  FRICTION_TABLE, SPIN_DAMPING, SPIN_INFLUENCE,
  TABLE_LENGTH, TABLE_WIDTH, NET_HEIGHT,
  BALL_RADIUS, TABLE_HEIGHT,
} from '../core/Constants.js';

export class PhysicsEngine {
  constructor({ table }) {
    this.table = table;
    this.halfLength = TABLE_LENGTH / 2;
    this.halfWidth = TABLE_WIDTH / 2;
  }

  update(ball, dt) {
    // Gravity
    ball.velocity.y -= GRAVITY * dt;

    // Air drag
    const drag = 1 - AIR_DRAG * dt;
    ball.velocity.x *= drag;
    ball.velocity.y *= drag;
    ball.velocity.z *= drag;

    // Magnus effect
    this.applyMagnusEffect(ball, dt);

    // Integrate position
    ball.position.x += ball.velocity.x * dt;
    ball.position.y += ball.velocity.y * dt;
    ball.position.z += ball.velocity.z * dt;

    // Table bounce (table surface is at TABLE_HEIGHT)
    const tableSurface = TABLE_HEIGHT + ball.radius;
    if (ball.position.y <= tableSurface) {
      const inBounds = this.isInBounds(ball);
      if (inBounds) {
        ball.position.y = tableSurface;
        ball.velocity.y = -ball.velocity.y * RESTITUTION_TABLE;

        // Tangential friction / spin coupling at bounce
        const contactVx = ball.velocity.x - ball.radius * ball.spin.z;
        const contactVz = ball.velocity.z + ball.radius * ball.spin.x;

        ball.velocity.x -= contactVx * FRICTION_TABLE * dt;
        ball.velocity.z -= contactVz * FRICTION_TABLE * dt;

        // Spin influence on trajectory after bounce
        ball.velocity.x += ball.spin.z * SPIN_INFLUENCE * dt;
        ball.velocity.z -= ball.spin.x * SPIN_INFLUENCE * dt;

        // Dampen spin
        ball.spin.x *= SPIN_DAMPING;
        ball.spin.y *= SPIN_DAMPING;
        ball.spin.z *= SPIN_DAMPING;

        ball.bounceCount++;
      }
    }

    // Net collision
    this.checkNetCollision(ball);
  }

  isInBounds(ball) {
    const x = ball.position.x;
    const z = ball.position.z;
    return (
      Math.abs(x) <= this.halfLength + 0.001 &&
      Math.abs(z) <= this.halfWidth + 0.001
    );
  }

  checkNetCollision(ball) {
    const netXMin = -0.015;
    const netXMax = 0.015;
    const netTop = TABLE_HEIGHT + NET_HEIGHT;

    if (
      ball.position.x >= netXMin &&
      ball.position.x <= netXMax &&
      ball.position.y < netTop &&
      Math.abs(ball.position.z) <= this.halfWidth
    ) {
      // Any ball intersecting the net zone below net top collides
      if (ball.position.y > netTop * 0.7) {
        // Potentially roll over
        ball.velocity.x *= 0.3;
        ball.velocity.y = Math.abs(ball.velocity.y) * 0.2;
      } else {
        // Hit net, dead bounce
        ball.velocity.x = -ball.velocity.x * 0.1;
        ball.velocity.y = Math.abs(ball.velocity.y) * 0.3;
      }
      return true;
    }
    return false;
  }

  isDoubleBounce(ball) {
    return ball.bounceCount >= 2;
  }

  onPaddleHit(ball) {
    ball.bounceCount = 0;
    // Slight acceleration on paddle hit
    ball.velocity.x *= -1.05;
  }

  applyMagnusEffect(ball, dt) {
    // Lift force perpendicular to spin axis and velocity
    const spin = ball.spin;
    const vel = ball.velocity;

    // Simplified Magnus: spin.z (topspin/backspin) curves y
    // spin.x (sidespin) curves z
    const magnusX = spin.z * vel.y - spin.y * vel.z;
    const magnusY = spin.x * vel.z - spin.z * vel.x;
    const magnusZ = spin.y * vel.x - spin.x * vel.y;

    const factor = 0.0002 * dt;
    ball.velocity.x += magnusX * factor;
    ball.velocity.y += magnusY * factor;
    ball.velocity.z += magnusZ * factor;
  }
}
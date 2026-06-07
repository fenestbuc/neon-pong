import { PHYSICS } from '../core/Constants.js';
import { CollisionDetector } from './CollisionDetector.js';

export class PhysicsEngine {
  constructor(table, ball, playerPaddle, aiPaddle) {
    this.table = table;
    this.ball = ball;
    this.playerPaddle = playerPaddle;
    this.aiPaddle = aiPaddle;
    this.detector = new CollisionDetector(table);
    this.collisionsThisFrame = [];
    this.scoringEvents = [];
    this.subSteps = PHYSICS.SUB_STEPS;
    this.lastHitBy = 'none';
    this.bounceHistory = [];
  }

  step(dt) {
    this.collisionsThisFrame = [];
    this.scoringEvents = [];
    const stepDt = dt / this.subSteps;
    for (let i = 0; i < this.subSteps; i++) {
      const prevPos = this.ball.position.clone();
      this.ball.update(stepDt);
      const tableHit = this.detector.detectBallTableCollision(this.ball, prevPos);
      if (tableHit) {
        this.resolveBounce(tableHit, PHYSICS.BOUNCE_RESTITUTION, PHYSICS.SURFACE_FRICTION);
        this.collisionsThisFrame.push(tableHit);
        const side = this.table.sideForZ(this.ball.position.z);
        this.ball.lastBouncedSide = side;
        if (side === 'player_1') this.ball.bounceCountP1++;
        else if (side === 'player_2') this.ball.bounceCountP2++;
        this.bounceHistory.push({ player_id: side, position: this.ball.position.clone() });
      }
      for (const paddle of [this.playerPaddle, this.aiPaddle]) {
        const paddleHit = this.detector.detectBallPaddleCollision(this.ball, paddle);
        if (paddleHit) {
          this.resolvePaddleHit(paddleHit, paddle);
          this.collisionsThisFrame.push(paddleHit);
          this.lastHitBy = paddle.playerId;
          this.ball.bounceCountP1 = 0;
          this.ball.bounceCountP2 = 0;
          this.bounceHistory = [];
        }
      }
      this.evaluateRules();
    }
  }

  resolveBounce(event, restitution, friction) {
    const v = this.ball.velocity;
    const n = event.normal;
    const vRel = v.dot(n);
    v.sub(n.clone().multiplyScalar((1 + restitution) * vRel));
    const tangent = v.clone().sub(n.clone().multiplyScalar(v.dot(n))).normalize();
    if (tangent.lengthSq() > 0) {
      v.sub(tangent.multiplyScalar(friction * v.length() * 0.1));
    }
    const correction = n.clone().multiplyScalar(event.penetration + 0.001);
    this.ball.position.add(correction);
  }

  resolvePaddleHit(event, paddle) {
    const v = this.ball.velocity;
    const n = event.normal.clone().normalize();
    const relVel = event.relative_velocity;
    const speed = Math.max(relVel.length(), 2.0);
    let outgoing = n.multiplyScalar(speed * PHYSICS.PADDLE_REST);
    const tangent = new THREE.Vector3(-n.z, 0, n.x).normalize();
    outgoing.add(tangent.multiplyScalar(paddle.velocity.x * PHYSICS.PADDLE_FRICTION));
    const sideSpin = paddle.velocity.z * PHYSICS.PADDLE_FRICTION * 0.4;
    this.ball.spin.set(0, sideSpin * 10, 0);
    const toSweet = new THREE.Vector3().subVectors(event.contact_point, paddle.position);
    const sweetDist = toSweet.length();
    if (sweetDist < paddle.radius * 0.3) {
      outgoing.multiplyScalar(PHYSICS.SWEET_SPOT_MULT);
    }
    this.ball.velocity.copy(outgoing);
    const correction = n.multiplyScalar(event.penetration + 0.001);
    this.ball.position.add(correction);
  }

  evaluateRules() {
    const b = this.ball;
    const bounds = this.table.getBounds();
    if (b.position.y < 0.1 && !this.table.isAboveTable(b.position.x, b.position.z)) {
      const winner = b.position.z > 0 ? 'player_2' : 'player_1';
      this.scoringEvents.push({
        type: winner === 'player_1' ? 'POINT_PLAYER_1' : 'POINT_PLAYER_2',
        reason: 'OUT_OF_BOUNDS', rally_length: this.bounceHistory.length,
        ball_position_at_end: b.position.clone(),
      });
      b.isInPlay = false;
      return;
    }
    if (Math.abs(b.position.x) > bounds.maxX + 0.3) {
      const winner = b.position.z > 0 ? 'player_2' : 'player_1';
      this.scoringEvents.push({
        type: winner === 'player_1' ? 'POINT_PLAYER_1' : 'POINT_PLAYER_2',
        reason: 'OUT_OF_BOUNDS', rally_length: this.bounceHistory.length,
        ball_position_at_end: b.position.clone(),
      });
      b.isInPlay = false;
      return;
    }
    if (b.bounceCountP1 >= 2) {
      this.scoringEvents.push({
        type: 'POINT_PLAYER_2', reason: 'DOUBLE_BOUNCE',
        rally_length: this.bounceHistory.length, ball_position_at_end: b.position.clone(),
      });
      b.isInPlay = false;
      return;
    }
    if (b.bounceCountP2 >= 2) {
      this.scoringEvents.push({
        type: 'POINT_PLAYER_1', reason: 'DOUBLE_BOUNCE',
        rally_length: this.bounceHistory.length, ball_position_at_end: b.position.clone(),
      });
      b.isInPlay = false;
      return;
    }
    if (Math.abs(b.position.z) > bounds.maxZ + 1.0 && b.velocity.lengthSq() > 0.01) {
      const side = b.position.z > 0 ? 'player_1' : 'player_2';
      const winner = side === 'player_1' ? 'player_2' : 'player_1';
      this.scoringEvents.push({
        type: winner === 'player_1' ? 'POINT_PLAYER_1' : 'POINT_PLAYER_2',
        reason: 'PAST_END', rally_length: this.bounceHistory.length,
        ball_position_at_end: b.position.clone(),
      });
      b.isInPlay = false;
    }
  }
}

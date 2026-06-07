export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  update(dt) {
    this.particles = this.particles.filter(p => {
      p.life -= dt;
      p.position.addScaledVector(p.velocity, dt);
      return p.life > 0;
    });
  }

  emitCollision(event) {
    // Placeholder - would create Three.js particles
  }

  emitCelebration(winner) {
    // Placeholder
  }
}

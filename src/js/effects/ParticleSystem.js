import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.maxParticles = 200;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.maxParticles * 3);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.material = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.03,
      transparent: true,
      opacity: 0.8,
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        active: false,
        life: 0,
        vx: 0, vy: 0, vz: 0,
        x: 0, y: 0, z: 0,
      });
    }
  }

  spawnHitSparks(x, y, z, count = 20) {
    for (let i = 0; i < count; i++) {
      const p = this.particles.find((p) => !p.active);
      if (!p) break;
      p.active = true;
      p.life = 1.0;
      p.x = x; p.y = y; p.z = z;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.random() * 2 + 1;
      p.vz = Math.sin(angle) * speed;
    }
  }

  update(dt) {
    const arr = this.geometry.attributes.position.array;
    let idx = 0;
    for (const p of this.particles) {
      if (p.active) {
        p.life -= dt * 2;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        p.vy -= 2.0 * dt; // gravity
        if (p.life <= 0) p.active = false;
      }
      arr[idx++] = p.active ? p.x : 1e9;
      arr[idx++] = p.active ? p.y : 1e9;
      arr[idx++] = p.active ? p.z : 1e9;
    }
    this.geometry.attributes.position.needsUpdate = true;
  }
}
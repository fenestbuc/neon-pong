import * as THREE from 'three';
import { TABLE_LENGTH, TABLE_WIDTH, NET_HEIGHT, TABLE_HEIGHT } from '../core/Constants.js';

export class GameRenderer {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.scene;
    this.meshes = {};
    this.trail = [];
    this.createTable();
    this.createNet();
    this.createPaddles();
    this.createBall();
    this.createEnvironment();
  }

  createTable() {
    const geo = new THREE.BoxGeometry(TABLE_LENGTH, 0.05, TABLE_WIDTH);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1a5c1a,
      roughness: 0.5,
      metalness: 0.1,
    });
    const table = new THREE.Mesh(geo, mat);
    table.position.y = TABLE_HEIGHT;
    table.receiveShadow = true;
    this.scene.add(table);
    this.meshes.table = table;

    // White lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ly = TABLE_HEIGHT + 0.026;
    [
      [TABLE_LENGTH, 0.008, 0.03, 0, ly, TABLE_WIDTH / 2],
      [TABLE_LENGTH, 0.008, 0.03, 0, ly, -TABLE_WIDTH / 2],
      [0.03, 0.008, TABLE_WIDTH, TABLE_LENGTH / 2, ly, 0],
      [0.03, 0.008, TABLE_WIDTH, -TABLE_LENGTH / 2, ly, 0],
      [0.03, 0.008, TABLE_WIDTH, 0, ly, 0], // center line
    ].forEach(([w, h, d, x, y, z]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lineMat);
      m.position.set(x, y, z);
      this.scene.add(m);
    });
  }

  createNet() {
    const geo = new THREE.BoxGeometry(0.02, NET_HEIGHT, TABLE_WIDTH + 0.05);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      transparent: true,
      opacity: 0.85,
    });
    const net = new THREE.Mesh(geo, mat);
    net.position.set(0, TABLE_HEIGHT + NET_HEIGHT / 2, 0);
    this.scene.add(net);
    this.meshes.net = net;
  }

  createPaddles() {
    const createPaddle = (color, x) => {
      const group = new THREE.Group();

      // Paddle face (thicker, more visible)
      const faceGeo = new THREE.BoxGeometry(0.05, 0.17, 0.17);
      const faceMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.2,
      });
      const face = new THREE.Mesh(faceGeo, faceMat);
      face.castShadow = true;
      group.add(face);

      // Blue rubber face (visible front)
      const rubberGeo = new THREE.BoxGeometry(0.003, 0.158, 0.158);
      const rubberMat = new THREE.MeshStandardMaterial({
        color: 0x0066cc,
        emissive: 0x0066cc,
        emissiveIntensity: 0.2,
        roughness: 0.8,
      });
      const rubber = new THREE.Mesh(rubberGeo, rubberMat);
      rubber.position.x = x > 0 ? 0.026 : -0.026;
      group.add(rubber);

      // Handle
      const handleGeo = new THREE.CylinderGeometry(0.012, 0.015, 0.2, 8);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.y = -0.18;
      group.add(handle);

      group.position.set(x, TABLE_HEIGHT + 0.12, 0);
      this.scene.add(group);
      return group;
    };

    this.meshes.playerPaddle = createPaddle(0x00eeff, -TABLE_LENGTH / 2 - 0.15);
    this.meshes.aiPaddle = createPaddle(0xff00aa, TABLE_LENGTH / 2 + 0.15);
  }

  createBall() {
    // Main ball (much larger)
    const geo = new THREE.SphereGeometry(0.04, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffeeaa,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.0,
    });
    const ball = new THREE.Mesh(geo, mat);
    ball.castShadow = true;
    this.scene.add(ball);
    this.meshes.ball = ball;

    // Ball glowing aura
    const auraGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xffeeaa,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    this.scene.add(aura);
    this.meshes.ballAura = aura;

    // Ball point light
    const light = new THREE.PointLight(0xffeeaa, 1.0, 3.0);
    this.scene.add(light);
    this.meshes.ballLight = light;

    // Trail line
    const trailGeo = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({
      color: 0xffeeaa,
      transparent: true,
      opacity: 0.4,
      linewidth: 3,
    });
    trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(60 * 3), 3));
    const trailLine = new THREE.Line(trailGeo, trailMat);
    trailLine.frustumCulled = false;
    this.scene.add(trailLine);
    this.meshes.trail = trailLine;
    this.trailHistory = new Array(60).fill(null);
    this.trailIdx = 0;
  }

  createEnvironment() {
    // Floor beneath table
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111118,
      roughness: 0.8,
      metalness: 0.3,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Subtle grid on floor
    const gridHelper = new THREE.GridHelper(20, 40, 0x222233, 0x1a1a22);
    gridHelper.position.y = 0.001;
    this.scene.add(gridHelper);

    // Table legs (for visual completeness)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.8 });
    const legPositions = [
      [-TABLE_LENGTH / 2 + 0.2, TABLE_HEIGHT / 2, -TABLE_WIDTH / 2 + 0.2],
      [-TABLE_LENGTH / 2 + 0.2, TABLE_HEIGHT / 2, TABLE_WIDTH / 2 - 0.2],
      [TABLE_LENGTH / 2 - 0.2, TABLE_HEIGHT / 2, -TABLE_WIDTH / 2 + 0.2],
      [TABLE_LENGTH / 2 - 0.2, TABLE_HEIGHT / 2, TABLE_WIDTH / 2 - 0.2],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, TABLE_HEIGHT, 8), legMat);
      leg.position.set(x, y, z);
      this.scene.add(leg);
    });
  }

  update(ball, playerPaddle, aiPaddle) {
    // Update ball mesh + aura + light
    this.meshes.ball.position.set(ball.position.x, ball.position.y, ball.position.z);
    this.meshes.ballAura.position.set(ball.position.x, ball.position.y, ball.position.z);
    this.meshes.ballLight.position.set(ball.position.x, ball.position.y, ball.position.z);

    // Update trail
    this.trailHistory[this.trailIdx] = {
      x: ball.position.x,
      y: ball.position.y,
      z: ball.position.z,
    };
    this.trailIdx = (this.trailIdx + 1) % 60;

    const positions = this.meshes.trail.geometry.attributes.position.array;
    for (let i = 0; i < 60; i++) {
      const idx = (this.trailIdx + i) % 60;
      const point = this.trailHistory[idx];
      if (point) {
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
      }
    }
    this.meshes.trail.geometry.attributes.position.needsUpdate = true;

    // Update paddles
    this.meshes.playerPaddle.position.z = playerPaddle.position.z;
    this.meshes.aiPaddle.position.z = aiPaddle.position.z;

    // Subtle floating animation for paddles
    this.meshes.playerPaddle.position.y = TABLE_HEIGHT + 0.12 + Math.sin(Date.now() * 0.002) * 0.005;
    this.meshes.aiPaddle.position.y = TABLE_HEIGHT + 0.12 + Math.sin(Date.now() * 0.002 + 1) * 0.005;
  }

  render() {
    this.sceneManager.render();
  }
}

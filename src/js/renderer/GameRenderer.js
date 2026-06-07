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
    this.createTableLegs();
  }

  createTable() {
    // Table top - brighter green for visibility
    const geo = new THREE.BoxGeometry(TABLE_LENGTH, 0.06, TABLE_WIDTH);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x2d8a4e,
      roughness: 0.4,
      metalness: 0.05,
    });
    const table = new THREE.Mesh(geo, mat);
    table.position.y = TABLE_HEIGHT;
    table.receiveShadow = true;
    this.scene.add(table);
    this.meshes.table = table;

    // White lines - thicker for visibility
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ly = TABLE_HEIGHT + 0.031;
    [
      [TABLE_LENGTH, 0.012, 0.04, 0, ly, TABLE_WIDTH / 2],
      [TABLE_LENGTH, 0.012, 0.04, 0, ly, -TABLE_WIDTH / 2],
      [0.04, 0.012, TABLE_WIDTH, TABLE_LENGTH / 2, ly, 0],
      [0.04, 0.012, TABLE_WIDTH, -TABLE_LENGTH / 2, ly, 0],
      [0.04, 0.012, TABLE_WIDTH, 0, ly, 0], // center line
    ].forEach(([w, h, d, x, y, z]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lineMat);
      m.position.set(x, y, z);
      this.scene.add(m);
    });
  }

  createNet() {
    // Net posts
    const postGeo = new THREE.CylinderGeometry(0.015, 0.015, NET_HEIGHT + 0.02, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
    
    [-TABLE_WIDTH/2 - 0.02, TABLE_WIDTH/2 + 0.02].forEach(z => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(0, TABLE_HEIGHT + NET_HEIGHT/2, z);
      this.scene.add(post);
    });

    // Net mesh (slightly wider than table)
    const netGeo = new THREE.BoxGeometry(0.01, NET_HEIGHT, TABLE_WIDTH + 0.04);
    const netMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      transparent: true,
      opacity: 0.6,
    });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0, TABLE_HEIGHT + NET_HEIGHT / 2, 0);
    this.scene.add(net);
    this.meshes.net = net;
  }

  createPaddles() {
    const createPaddle = (color, x) => {
      const group = new THREE.Group();

      // Main paddle blade - larger and more visible
      const bladeGeo = new THREE.BoxGeometry(0.04, 0.20, 0.18);
      const bladeMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.3,
      });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.castShadow = true;
      group.add(blade);

      // Rubber face - brighter
      const rubberGeo = new THREE.BoxGeometry(0.005, 0.19, 0.17);
      const rubberMat = new THREE.MeshStandardMaterial({
        color: 0x0088ff,
        emissive: 0x0088ff,
        emissiveIntensity: 0.3,
        roughness: 0.7,
      });
      const rubber = new THREE.Mesh(rubberGeo, rubberMat);
      rubber.position.x = x > 0 ? 0.022 : -0.022;
      group.add(rubber);

      // Handle
      const handleGeo = new THREE.CylinderGeometry(0.015, 0.018, 0.22, 8);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.y = -0.20;
      group.add(handle);

      group.position.set(x, TABLE_HEIGHT + 0.14, 0);
      this.scene.add(group);
      return group;
    };

    this.meshes.playerPaddle = createPaddle(0x00ddff, -TABLE_LENGTH / 2 - 0.18);
    this.meshes.aiPaddle = createPaddle(0xff0088, TABLE_LENGTH / 2 + 0.18);
  }

  createBall() {
    // Main ball - bright white with strong emissive
    const geo = new THREE.SphereGeometry(0.035, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff0cc,
      emissiveIntensity: 2.0,
      roughness: 0.05,
      metalness: 0.0,
    });
    const ball = new THREE.Mesh(geo, mat);
    ball.castShadow = true;
    this.scene.add(ball);
    this.meshes.ball = ball;

    // Ball glow aura
    const auraGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xffee88,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    this.scene.add(aura);
    this.meshes.ballAura = aura;

    // Strong point light attached to ball
    const light = new THREE.PointLight(0xffee88, 2.0, 4.0);
    this.scene.add(light);
    this.meshes.ballLight = light;

    // Trail
    const trailGeo = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({
      color: 0xffdd66,
      transparent: true,
      opacity: 0.5,
      linewidth: 4,
    });
    trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(60 * 3), 3));
    const trailLine = new THREE.Line(trailGeo, trailMat);
    trailLine.frustumCulled = false;
    this.scene.add(trailLine);
    this.meshes.trail = trailLine;
    this.trailHistory = new Array(60).fill(null);
    this.trailIdx = 0;
  }

  createTableLegs() {
    const legMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.3, metalness: 0.7 });
    const legPositions = [
      [-TABLE_LENGTH / 2 + 0.25, TABLE_HEIGHT / 2, -TABLE_WIDTH / 2 + 0.25],
      [-TABLE_LENGTH / 2 + 0.25, TABLE_HEIGHT / 2, TABLE_WIDTH / 2 - 0.25],
      [TABLE_LENGTH / 2 - 0.25, TABLE_HEIGHT / 2, -TABLE_WIDTH / 2 + 0.25],
      [TABLE_LENGTH / 2 - 0.25, TABLE_HEIGHT / 2, TABLE_WIDTH / 2 - 0.25],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, TABLE_HEIGHT, 8), legMat);
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

    // Update paddles — copy all 3 position axes from game state
    this.meshes.playerPaddle.position.set(
      playerPaddle.position.x,
      playerPaddle.position.y,
      playerPaddle.position.z
    );
    this.meshes.aiPaddle.position.set(
      aiPaddle.position.x,
      aiPaddle.position.y,
      aiPaddle.position.z
    );
  }

  render() {
    this.sceneManager.render();
  }
}

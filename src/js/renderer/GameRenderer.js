import * as THREE from 'three';
import { PHYSICS, COLORS } from '../core/Constants.js';

export class GameRenderer {
  constructor(scene) {
    this.scene = scene;
    this.meshes = {};
    this.trailHistory = new Array(60).fill(null);
    this.trailIdx = 0;
    this.createTable();
    this.createNet();
    this.createPaddles();
    this.createBall();
    this.createTableLegs();
  }

  createTable() {
    const geo = new THREE.BoxGeometry(PHYSICS.TABLE_LENGTH, 0.06, PHYSICS.TABLE_WIDTH);
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.table, roughness: 0.4, metalness: 0.05 });
    const table = new THREE.Mesh(geo, mat);
    table.position.y = PHYSICS.TABLE_HEIGHT;
    table.receiveShadow = true;
    this.scene.add(table);
    this.meshes.table = table;
    const lineMat = new THREE.MeshBasicMaterial({ color: COLORS.tableLines });
    const ly = PHYSICS.TABLE_HEIGHT + 0.031;
    [
      [PHYSICS.TABLE_LENGTH, 0.012, 0.04, 0, ly, PHYSICS.TABLE_WIDTH / 2],
      [PHYSICS.TABLE_LENGTH, 0.012, 0.04, 0, ly, -PHYSICS.TABLE_WIDTH / 2],
      [0.04, 0.012, PHYSICS.TABLE_WIDTH, PHYSICS.TABLE_LENGTH / 2, ly, 0],
      [0.04, 0.012, PHYSICS.TABLE_WIDTH, -PHYSICS.TABLE_LENGTH / 2, ly, 0],
      [0.04, 0.012, PHYSICS.TABLE_WIDTH, 0, ly, 0],
    ].forEach(([w, h, d, x, y, z]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lineMat);
      m.position.set(x, y, z);
      this.scene.add(m);
    });
  }

  createNet() {
    const postGeo = new THREE.CylinderGeometry(0.015, 0.015, PHYSICS.NET_HEIGHT + 0.02, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
    [-PHYSICS.TABLE_WIDTH/2 - 0.02, PHYSICS.TABLE_WIDTH/2 + 0.02].forEach(z => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(0, PHYSICS.TABLE_HEIGHT + PHYSICS.NET_HEIGHT/2, z);
      this.scene.add(post);
    });
    const netGeo = new THREE.BoxGeometry(0.01, PHYSICS.NET_HEIGHT, PHYSICS.TABLE_WIDTH + 0.04);
    const netMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.6 });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0, PHYSICS.TABLE_HEIGHT + PHYSICS.NET_HEIGHT / 2, 0);
    this.scene.add(net);
    this.meshes.net = net;
  }

  createPaddles() {
    const createPaddle = (color, x) => {
      const group = new THREE.Group();
      const bladeGeo = new THREE.BoxGeometry(0.04, 0.20, 0.18);
      const bladeMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.castShadow = true;
      group.add(blade);
      const handleGeo = new THREE.CylinderGeometry(0.015, 0.018, 0.22, 8);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.y = -0.20;
      group.add(handle);
      group.position.set(x, PHYSICS.TABLE_HEIGHT + 0.14, 0);
      this.scene.add(group);
      return group;
    };
    this.meshes.playerPaddle = createPaddle(COLORS.paddlePlayer, -PHYSICS.TABLE_LENGTH / 2 - 0.18);
    this.meshes.aiPaddle = createPaddle(COLORS.paddleAI, PHYSICS.TABLE_LENGTH / 2 + 0.18);
  }

  createBall() {
    const geo = new THREE.SphereGeometry(0.035, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: COLORS.ball, emissive: 0xfff0cc, emissiveIntensity: 2.0,
      roughness: 0.05, metalness: 0.0,
    });
    const ball = new THREE.Mesh(geo, mat);
    ball.castShadow = true;
    this.scene.add(ball);
    this.meshes.ball = ball;
    const auraGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.2, side: THREE.BackSide });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    this.scene.add(aura);
    this.meshes.ballAura = aura;
    const light = new THREE.PointLight(0xffee88, 2.0, 4.0);
    this.scene.add(light);
    this.meshes.ballLight = light;
  }

  createTableLegs() {
    const legMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.3, metalness: 0.7 });
    const legPositions = [
      [-PHYSICS.TABLE_LENGTH / 2 + 0.25, PHYSICS.TABLE_HEIGHT / 2, -PHYSICS.TABLE_WIDTH / 2 + 0.25],
      [-PHYSICS.TABLE_LENGTH / 2 + 0.25, PHYSICS.TABLE_HEIGHT / 2, PHYSICS.TABLE_WIDTH / 2 - 0.25],
      [PHYSICS.TABLE_LENGTH / 2 - 0.25, PHYSICS.TABLE_HEIGHT / 2, -PHYSICS.TABLE_WIDTH / 2 + 0.25],
      [PHYSICS.TABLE_LENGTH / 2 - 0.25, PHYSICS.TABLE_HEIGHT / 2, PHYSICS.TABLE_WIDTH / 2 - 0.25],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, PHYSICS.TABLE_HEIGHT, 8), legMat);
      leg.position.set(x, y, z);
      this.scene.add(leg);
    });
  }

  update(ball, playerPaddle, aiPaddle) {
    this.meshes.ball.position.set(ball.position.x, ball.position.y, ball.position.z);
    this.meshes.ballAura.position.set(ball.position.x, ball.position.y, ball.position.z);
    this.meshes.ballLight.position.set(ball.position.x, ball.position.y, ball.position.z);
    this.meshes.playerPaddle.position.set(playerPaddle.position.x, playerPaddle.position.y, playerPaddle.position.z);
    this.meshes.aiPaddle.position.set(aiPaddle.position.x, aiPaddle.position.y, aiPaddle.position.z);
  }

  render(camera) { this.scene.userData.renderer?.render(this.scene, camera); }
}

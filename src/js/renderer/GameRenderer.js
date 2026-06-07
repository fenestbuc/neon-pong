import * as THREE from 'three';
import { TABLE_LENGTH, TABLE_WIDTH, NET_HEIGHT } from '../core/Constants.js';

export class GameRenderer {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.scene;
    this.meshes = {};
    this.createTable();
    this.createNet();
    this.createPaddles();
    this.createBall();
  }

  createTable() {
    const geometry = new THREE.BoxGeometry(TABLE_LENGTH, 0.02, TABLE_WIDTH);
    const material = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });
    const table = new THREE.Mesh(geometry, material);
    table.position.y = 0.76;
    table.receiveShadow = true;
    this.scene.add(table);
    this.meshes.table = table;

    // White lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const createLine = (w, h, d, x, y, z) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lineMat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);
    };
    const ly = 0.771;
    createLine(TABLE_LENGTH, 0.005, 0.02, 0, ly, TABLE_WIDTH / 2); // side
    createLine(TABLE_LENGTH, 0.005, 0.02, 0, ly, -TABLE_WIDTH / 2); // side
    createLine(0.02, 0.005, TABLE_WIDTH, TABLE_LENGTH / 2, ly, 0); // end
    createLine(0.02, 0.005, TABLE_WIDTH, -TABLE_LENGTH / 2, ly, 0); // end
  }

  createNet() {
    const geometry = new THREE.BoxGeometry(0.015, NET_HEIGHT, TABLE_WIDTH + 0.03);
    const material = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.9,
    });
    const net = new THREE.Mesh(geometry, material);
    net.position.set(0, 0.76 + NET_HEIGHT / 2, 0);
    this.scene.add(net);
    this.meshes.net = net;
  }

  createPaddles() {
    const createPaddle = (color, x) => {
      const geo = new THREE.BoxGeometry(0.02, 0.152, 0.158);
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 0.9, 0);
      mesh.castShadow = true;
      this.scene.add(mesh);
      return mesh;
    };
    this.meshes.playerPaddle = createPaddle(0x00ffff, -TABLE_LENGTH / 2 - 0.1);
    this.meshes.aiPaddle = createPaddle(0xff00ff, TABLE_LENGTH / 2 + 0.1);
  }

  createBall() {
    const geometry = new THREE.SphereGeometry(0.02, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.2 });
    const ball = new THREE.Mesh(geometry, material);
    ball.position.set(0, 0.8, 0);
    ball.castShadow = true;
    this.scene.add(ball);
    this.meshes.ball = ball;
  }

  update(ball, playerPaddle, aiPaddle) {
    this.meshes.ball.position.set(ball.position.x, ball.position.y, ball.position.z);
    this.meshes.playerPaddle.position.z = playerPaddle.position.z;
    this.meshes.aiPaddle.position.z = aiPaddle.position.z;
  }

  render() {
    this.sceneManager.render();
  }
}
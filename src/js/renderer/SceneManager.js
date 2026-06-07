import * as THREE from 'three';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a12);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(-2, 1.5, 0);
    this.camera.lookAt(0, 0.76, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.setupLighting();
    this.setupFog();

    window.addEventListener('resize', this.onResize.bind(this));
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);

    const spot = new THREE.SpotLight(0xffffff, 1.5);
    spot.position.set(0, 5, 2);
    spot.angle = Math.PI / 4;
    spot.penumbra = 0.3;
    spot.castShadow = true;
    spot.shadow.mapSize.width = 1024;
    spot.shadow.mapSize.height = 1024;
    this.scene.add(spot);

    const rimPlayer = new THREE.PointLight(0x00ffff, 0.8);
    rimPlayer.position.set(-2, 1, 0);
    this.scene.add(rimPlayer);

    const rimAI = new THREE.PointLight(0xff00ff, 0.8);
    rimAI.position.set(2, 1, 0);
    this.scene.add(rimAI);
  }

  setupFog() {
    this.scene.fog = new THREE.FogExp2(0x0a0a12, 0.02);
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
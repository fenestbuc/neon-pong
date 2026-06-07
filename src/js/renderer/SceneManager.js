import * as THREE from 'three';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a14);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.set(-2.5, 1.8, 0.5);
    this.camera.lookAt(0, 0.85, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.setupLighting();
    this.setupFog();

    window.addEventListener('resize', this.onResize.bind(this));
  }

  setupLighting() {
    // Bright ambient
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    // Main overhead spot
    const spot = new THREE.SpotLight(0xffffff, 2.0);
    spot.position.set(0, 6, 0);
    spot.angle = Math.PI / 3;
    spot.penumbra = 0.4;
    spot.castShadow = true;
    spot.shadow.mapSize.width = 2048;
    spot.shadow.mapSize.height = 2048;
    this.scene.add(spot);

    // Player side rim light (cyan)
    const rimPlayer = new THREE.PointLight(0x00eeff, 1.5, 5.0);
    rimPlayer.position.set(-3, 1.5, 0);
    this.scene.add(rimPlayer);

    // AI side rim light (magenta)
    const rimAI = new THREE.PointLight(0xff00aa, 1.5, 5.0);
    rimAI.position.set(3, 1.5, 0);
    this.scene.add(rimAI);

    // Subtle bounce light from floor
    const bounce = new THREE.PointLight(0x3344aa, 0.5, 8.0);
    bounce.position.set(0, 0.2, 0);
    this.scene.add(bounce);
  }

  setupFog() {
    this.scene.fog = new THREE.FogExp2(0x0a0a14, 0.015);
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

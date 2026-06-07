import * as THREE from 'three';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.set(-3.2, 2.2, 1.0);
    this.camera.lookAt(0, 0.9, 0);

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 2.2;
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.webglAvailable = true;
    } catch (e) {
      console.error('WebGL not available:', e);
      this.webglAvailable = false;
      this.renderer = {
        setSize: () => {},
        setPixelRatio: () => {},
        render: () => {},
        shadowMap: { enabled: false },
        toneMapping: 0,
        toneMappingExposure: 1,
        outputColorSpace: 'srgb',
      };
    }

    this.setupLighting();
    this.setupArena();

    window.addEventListener('resize', this.onResize.bind(this));
  }

  setupLighting() {
    // Strong ambient - scene base brightness
    const ambient = new THREE.AmbientLight(0x8899ff, 0.8);
    this.scene.add(ambient);

    // Main overhead spot - warm white, bright
    const spot = new THREE.SpotLight(0xffffee, 3.0);
    spot.position.set(0, 8, 0);
    spot.angle = Math.PI / 2.5;
    spot.penumbra = 0.6;
    spot.decay = 1.0;
    spot.distance = 30;
    spot.castShadow = true;
    spot.shadow.mapSize.width = 1024;
    spot.shadow.mapSize.height = 1024;
    this.scene.add(spot);

    // Fill light from front (above camera)
    const fill = new THREE.DirectionalLight(0xaaccff, 1.0);
    fill.position.set(-2, 4, 2);
    this.scene.add(fill);

    // Player side rim (cyan glow)
    const rimPlayer = new THREE.PointLight(0x00eeff, 2.0, 6.0);
    rimPlayer.position.set(-3.5, 1.5, 0);
    this.scene.add(rimPlayer);

    // AI side rim (magenta glow)
    const rimAI = new THREE.PointLight(0xff00aa, 2.0, 6.0);
    rimAI.position.set(3.5, 1.5, 0);
    this.scene.add(rimAI);
  }

  setupArena() {
    // Floor - dark reflective surface
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111122,
      roughness: 0.4,
      metalness: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Back wall
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d1a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), wallMat);
    backWall.position.set(0, 10, -15);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Side walls
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-20, 10, 0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(20, 10, 0);
    rightWall.receiveShadow = true;
    this.scene.add(rightWall);

    // Decorative grid on floor
    const gridHelper = new THREE.GridHelper(40, 40, 0x333355, 0x222233);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
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

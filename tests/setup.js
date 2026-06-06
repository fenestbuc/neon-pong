// Test setup — jsdom + global mocks
import { vi } from 'vitest';

// Mock Three.js modules
vi.mock('three', () => {
  class MockVector3 {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    add(v) { return new MockVector3(this.x + v.x, this.y + v.y, this.z + v.z); }
    sub(v) { return new MockVector3(this.x - v.x, this.y - v.y, this.z - v.z); }
    multiplyScalar(s) { return new MockVector3(this.x * s, this.y * s, this.z * s); }
    length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
    normalize() { const l = this.length() || 1; return new MockVector3(this.x / l, this.y / l, this.z / l); }
    clone() { return new MockVector3(this.x, this.y, this.z); }
    applyEuler() { return this; }
  }

  class MockEuler {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  }

  class MockObject3D {
    constructor() {
      this.position = new MockVector3();
      this.rotation = new MockEuler();
      this.scale = new MockVector3(1, 1, 1);
      this.children = [];
      this.parent = null;
      this.visible = true;
    }
    add(child) { this.children.push(child); child.parent = this; }
    remove(child) { const i = this.children.indexOf(child); if (i >= 0) this.children.splice(i, 1); }
  }

  return {
    Vector3: MockVector3,
    Euler: MockEuler,
    Object3D: MockObject3D,
    Scene: class extends MockObject3D {},
    PerspectiveCamera: class extends MockObject3D {
      constructor(fov, aspect, near, far) { super(); this.fov = fov; this.aspect = aspect; this.near = near; this.far = far; }
    },
    WebGLRenderer: class {
      constructor() {}
      setSize() {}
      setPixelRatio() {}
      shadowMap: { enabled: false }
      toneMapping: 0
      render() {}
      domElement: document.createElement('canvas')
    },
    BoxGeometry: class {},
    SphereGeometry: class {},
    PlaneGeometry: class {},
    MeshStandardMaterial: class {
      constructor(opts = {}) { Object.assign(this, opts); }
    },
    Mesh: class extends MockObject3D {
      constructor(geo, mat) { super(); this.geometry = geo; this.material = mat; }
    },
    AmbientLight: class extends MockObject3D { constructor(color, intensity) { super(); this.color = color; this.intensity = intensity; } },
    SpotLight: class extends MockObject3D { constructor(color, intensity) { super(); this.color = color; this.intensity = intensity; } },
    PointLight: class extends MockObject3D { constructor(color, intensity) { super(); this.color = color; this.intensity = intensity; } },
    HemisphereLight: class extends MockObject3D { constructor(sky, ground, intensity) { super(); } },
    PCFSoftShadowMap: 2,
    ACESFilmicToneMapping: 4,
    SRGBColorSpace: 'srgb',
    Clock: class {
      constructor() { this.startTime = performance.now(); }
      getElapsedTime() { return (performance.now() - this.startTime) / 1000; }
      getDelta() { return 0.016; }
    },
    MathUtils: { clamp: (v, min, max) => Math.max(min, Math.min(max, v)), lerp: (a, b, t) => a + (b - a) * t },
  };
});

// Mock canvas
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
}));

// Mock localStorage
const store = {};
global.localStorage = {
  getItem: vi.fn((k) => store[k] || null),
  setItem: vi.fn((k, v) => { store[k] = String(v); }),
  removeItem: vi.fn((k) => { delete store[k]; }),
  clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
};

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

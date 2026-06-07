export class Vector3 {
  constructor(x=0, y=0, z=0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  addScaledVector(v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
  multiplyScalar(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
  clone() { return new Vector3(this.x, this.y, this.z); }
  copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
  length() { return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z); }
  lengthSq() { return this.x*this.x + this.y*this.y + this.z*this.z; }
  normalize() { const len = this.length(); if (len > 0) { this.x/=len; this.y/=len; this.z/=len; } return this; }
  dot(v) { return this.x*v.x + this.y*v.y + this.z*v.z; }
  crossVectors(a, b) { this.x = a.y*b.z - a.z*b.y; this.y = a.z*b.x - a.x*b.z; this.z = a.x*b.y - a.y*b.x; return this; }
  subVectors(a, b) { this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z; return this; }
}

export class Scene {
  constructor() { this.children = []; }
  add(obj) { this.children.push(obj); }
}

export class PerspectiveCamera {
  constructor() { this.position = new Vector3(); }
  lookAt() {}
  updateProjectionMatrix() {}
}

export class WebGLRenderer {
  constructor() {}
  setSize() {}
  setPixelRatio() {}
  render() {}
}

export class Mesh {
  constructor() { this.position = new Vector3(); }
}

export class Group {
  constructor() { this.position = new Vector3(); }
  add() {}
}

export class BoxGeometry {}
export class SphereGeometry {}
export class CylinderGeometry {}
export class PlaneGeometry {}
export class BufferGeometry {}
export class MeshStandardMaterial {}
export class MeshBasicMaterial {}
export class AmbientLight {}
export class DirectionalLight {}
export class SpotLight {}
export class PointLight {}
export class FogExp2 {}
export class Color {}
export const BackSide = 1;

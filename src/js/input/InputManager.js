export class InputManager {
  constructor() {
    this.keys = new Set();
    this.mouseY = 0;
    this.mouseX = 0;
    this.touchY = 0;
    this.touchX = 0;
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.lastTouchY = 0;
    this.lastTouchX = 0;
    this.lastGesture = null;
    this.spinGesture = null;
    this.onPause = null;
    this.canvas = null;
    this.canvasRect = null;
  }

  bind(canvas) {
    this.canvas = canvas;
    this.canvasRect = canvas.getBoundingClientRect();

    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    document.addEventListener('touchend', this.onTouchEnd.bind(this));
    document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });

    window.addEventListener('resize', () => {
      if (this.canvas) this.canvasRect = this.canvas.getBoundingClientRect();
    });
  }

  onKeyDown(e) {
    this.keys.add(e.key.toLowerCase());
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      if (this.onPause) this.onPause();
    }
  }

  onKeyUp(e) {
    this.keys.delete(e.key.toLowerCase());
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  getPaddleZ() {
    // Map mouse/touch X (left/right) to table Z range [-0.7, 0.7]
    // From behind the table: mouse left → paddle left (negative Z)
    //                       mouse right → paddle right (positive Z)
    const rect = this.canvasRect || { left: 0, width: window.innerWidth };
    const x = this.mouseX || (rect.left + rect.width / 2);
    const normalized = (x - rect.left) / rect.width;
    // Invert: left side of screen = left side of table (negative Z)
    // But actually from behind: screen left = table left? No.
    // From behind player looking toward opponent:
    // screen left = table right (positive Z)? No.
    // Let me think: if I'm behind the table facing forward,
    // my left is the table's left side (negative Z if Z is across the table)
    // Actually in Three.js: +Z is toward camera (bottom), -Z is away (top)
    // So screen left = -Z, screen right = +Z
    return Math.max(-0.7, Math.min(0.7, (normalized * 1.4) - 0.7));
  }

  onTouchStart(e) {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      this.touchStartY = t.clientY;
      this.touchStartX = t.clientX;
      this.lastTouchY = t.clientY;
      this.lastTouchX = t.clientX;
      this.touchY = t.clientY;
      this.touchX = t.clientX;
      this.mouseX = t.clientX; // mirror for paddle control (X-axis)
      this.mouseY = t.clientY;
    }
  }

  onTouchMove(e) {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      this.touchY = t.clientY;
      this.touchX = t.clientX;
      this.lastTouchY = t.clientY;
      this.lastTouchX = t.clientX;
      this.mouseX = t.clientX; // mirror for paddle control (X-axis)
      this.mouseY = t.clientY;
    }
  }

  onTouchEnd(e) {
    const dy = this.lastTouchY - this.touchStartY;
    const dx = this.lastTouchX - this.touchStartX;
    const threshold = 30;

    if (Math.abs(dy) > threshold && Math.abs(dy) > Math.abs(dx)) {
      this.lastGesture = dy < 0 ? 'swipe-up' : 'swipe-down';
    } else if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) {
      this.lastGesture = dx < 0 ? 'swipe-left' : 'swipe-right';
    } else {
      this.lastGesture = null;
    }

    if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) {
      this.spinGesture = dx < 0 ? 'backspin' : 'topspin';
    } else {
      this.spinGesture = null;
    }
  }

  isPressed(key) {
    return this.keys.has(key.toLowerCase());
  }

  getVerticalAxis() {
    let axis = 0;
    if (this.isPressed('w') || this.isPressed('arrowup')) axis -= 1;
    if (this.isPressed('s') || this.isPressed('arrowdown')) axis += 1;
    return axis;
  }

  getLastGesture() {
    const g = this.lastGesture;
    this.lastGesture = null;
    return g;
  }

  getSpinGesture() {
    const g = this.spinGesture;
    this.spinGesture = null;
    return g;
  }
}

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
    // DEPRECATED: kept for compatibility, but Game.js now uses getMouseNormalized() directly
    return 0;
  }

  getMouseNormalized() {
    const rect = this.canvasRect || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    return {
      x: (this.mouseX - rect.left) / rect.width,
      y: (this.mouseY - rect.top) / rect.height,
    };
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

export class InputManager {
  constructor() {
    this.keys = new Set();
    this.mouseY = 0;
    this.touchY = 0;
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.lastTouchY = 0;
    this.lastTouchX = 0;
    this.lastGesture = null;
    this.spinGesture = null;
    this.onPause = null;
    this.canvas = null;
  }

  bind(canvas) {
    this.canvas = canvas;
    canvas.addEventListener('keydown', this.onKeyDown.bind(this));
    canvas.addEventListener('keyup', this.onKeyUp.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    canvas.setAttribute('tabindex', '0');
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
    this.mouseY = e.clientY;
  }

  onTouchStart(e) {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      this.touchStartY = t.clientY;
      this.touchStartX = t.clientX;
      this.lastTouchY = t.clientY;
      this.lastTouchX = t.clientX;
      this.touchY = t.clientY;
    }
  }

  onTouchMove(e) {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      this.touchY = t.clientY;
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

    // Map horizontal swipes to spin gestures for tests
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
    this.lastGesture = null; // consume
    return g;
  }

  getSpinGesture() {
    const g = this.spinGesture;
    this.spinGesture = null; // consume
    return g;
  }
}
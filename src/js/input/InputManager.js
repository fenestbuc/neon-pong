export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, down: false };
    this.touch = { x: 0, y: 0, active: false };
    this.onPause = null;
    this.device = 'keyboard';
    this._hadInput = false;
    this._bindEvents();
  }

  _bindEvents() {
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      this._detectDevice('keyboard');
      if ((e.key === 'p' || e.key === 'Escape') && this.onPause) this.onPause();
    });
    document.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    this.canvas.addEventListener('mousemove', (e) => {
      this._detectDevice('mouse');
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) / rect.width;
      this.mouse.y = (e.clientY - rect.top) / rect.height;
    });
    this.canvas.addEventListener('mousedown', () => { this.mouse.down = true; });
    this.canvas.addEventListener('mouseup', () => { this.mouse.down = false; });
    this.canvas.addEventListener('touchstart', (e) => {
      this._detectDevice('touch');
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      this.touch.x = (e.touches[0].clientX - rect.left) / rect.width;
      this.touch.y = (e.touches[0].clientY - rect.top) / rect.height;
      this.touch.active = true;
    }, { passive: false });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      this.touch.x = (e.touches[0].clientX - rect.left) / rect.width;
      this.touch.y = (e.touches[0].clientY - rect.top) / rect.height;
    }, { passive: false });
    this.canvas.addEventListener('touchend', () => { this.touch.active = false; });
  }

  _detectDevice(device) {
    if (!this._hadInput) { this._hadInput = true; this.device = device; }
  }

  update() {}

  getPaddleTarget() {
    const speed = 6.0;
    let dx = 0, dz = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) dx -= speed;
    if (this.keys.has('d') || this.keys.has('arrowright')) dx += speed;
    if (this.keys.has('w') || this.keys.has('arrowup')) dz -= speed;
    if (this.keys.has('s') || this.keys.has('arrowdown')) dz += speed;
    if (this.device === 'mouse' || this.device === 'touch') {
      const input = this.device === 'mouse' ? this.mouse : this.touch;
      dx = (input.x - 0.5) * 2.0;
      dz = (input.y - 0.5) * 2.0;
    }
    return { dx, dz };
  }

  isPausePressed() { return this.keys.has('escape') || this.keys.has('p'); }
}

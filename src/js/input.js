/**
 * Input handling — keyboard, mouse, touch.
 */

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouseY = null;
    this.touchY = null;
    this.onPause = null;

    this._bindEvents();
  }

  _bindEvents() {
    document.addEventListener('keydown', e => {
      this.keys.add(e.key);
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (this.onPause) this.onPause();
      }
    });

    document.addEventListener('keyup', e => this.keys.delete(e.key));

    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseY = e.clientY - rect.top;
    });

    this.canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      this.touchY = e.touches[0].clientY - rect.top;
    }, { passive: false });
  }

  getPaddleTarget() {
    // TODO: return target Y based on active input
    return 0;
  }
}

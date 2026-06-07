export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTone(freq, type = 'sine', duration = 0.1, volume = 0.3) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playHit() {
    this.playTone(800, 'square', 0.08, 0.2);
  }

  playBounce() {
    this.playTone(300, 'sine', 0.06, 0.15);
  }

  playScore() {
    this.playTone(600, 'sine', 0.15, 0.25);
    setTimeout(() => this.playTone(900, 'sine', 0.2, 0.25), 120);
  }

  playUIClick() {
    this.playTone(1200, 'sine', 0.05, 0.1);
  }
}
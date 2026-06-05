/**
 * Web Audio API procedural sound effects.
 */

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

  playBounce(velocity) {
    // TODO: play bounce sound
  }

  playScore() {
    // TODO: play score sound
  }

  playWin() {
    // TODO: play win fanfare
  }

  playLose() {
    // TODO: play lose sound
  }
}

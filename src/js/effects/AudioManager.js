export class AudioManager {
  constructor() { this.initialized = false; }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    // Web Audio API initialization would go here
  }

  playHitPaddle(speed) { if (this.initialized) console.log('hit paddle', speed); }
  playHitTable() { if (this.initialized) console.log('hit table'); }
  playHitNet() { if (this.initialized) console.log('hit net'); }
  playScore() { if (this.initialized) console.log('score!'); }
}

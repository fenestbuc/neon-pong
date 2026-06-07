export class HUD {
  constructor() {
    this.els = {
      scorePlayer: document.getElementById('score-player'),
      scoreAI: document.getElementById('score-ai'),
      setsPlayer: document.getElementById('sets-player'),
      setsAI: document.getElementById('sets-ai'),
      servePlayer: document.getElementById('serve-player'),
      serveAI: document.getElementById('serve-ai'),
      difficulty: document.getElementById('difficulty-badge'),
      format: document.getElementById('match-format'),
    };
  }

  update(stateMachine) {
    if (!stateMachine) return;
    this.els.scorePlayer.textContent = stateMachine.scores.player;
    this.els.scoreAI.textContent = stateMachine.scores.ai;
    this.els.setsPlayer.textContent = stateMachine.sets.player;
    this.els.setsAI.textContent = stateMachine.sets.ai;

    const server = stateMachine.server;
    this.els.servePlayer.classList.toggle('hidden', server !== 'player');
    this.els.serveAI.classList.toggle('hidden', server !== 'ai');
  }

  setDifficulty(difficulty) {
    if (this.els.difficulty) this.els.difficulty.textContent = difficulty.toUpperCase();
  }

  setFormat(format) {
    if (this.els.format) this.els.format.textContent = format.replace(/-/g, ' ').toUpperCase();
  }
}
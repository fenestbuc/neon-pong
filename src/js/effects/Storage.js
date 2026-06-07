export class Storage {
  getPlayerName() { return localStorage.getItem('rp3d_name') || 'PLAYER'; }
  setPlayerName(name) { localStorage.setItem('rp3d_name', name); }

  getLocalScores() {
    try { return JSON.parse(localStorage.getItem('rp3d_scores') || '[]'); }
    catch { return []; }
  }

  addLocalScore(score) {
    const scores = this.getLocalScores();
    scores.push({ ...score, date: Date.now() });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('rp3d_scores', JSON.stringify(scores.slice(0, 100)));
  }
}

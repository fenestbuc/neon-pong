export class UIManager {
  constructor(stateMachine) {
    this.stateMachine = stateMachine;
    this.difficulty = 'novice';
    this.screens = {
      title: document.getElementById('title-screen'),
      difficulty: document.getElementById('difficulty-screen'),
      hud: document.getElementById('hud'),
      pause: document.getElementById('pause-menu'),
      gameOver: document.getElementById('game-over'),
      leaderboard: document.getElementById('leaderboard-screen'),
      settings: document.getElementById('settings-screen'),
      countdown: document.getElementById('countdown-screen'),
    };
  }

  onStateChange(state, oldState, ctx) {
    this.hideAllScreens();
    switch (state) {
      case 'TITLE_SCREEN': this.screens.title.classList.add('active'); break;
      case 'DIFFICULTY_SELECT': this.screens.difficulty.classList.add('active'); break;
      case 'PLAYING': this.screens.hud.classList.add('active'); break;
      case 'PAUSED': this.screens.hud.classList.add('active'); this.screens.pause.classList.add('active'); break;
      case 'GAME_OVER': this.screens.gameOver.classList.add('active'); break;
    }
    this.updateHUD(ctx);
  }

  hideAllScreens() {
    Object.values(this.screens).forEach(s => s.classList.remove('active'));
  }

  updateHUD(ctx) {
    document.getElementById('score-player').textContent = ctx.playerScore;
    document.getElementById('score-ai').textContent = ctx.opponentScore;
    document.getElementById('sets-player').textContent = 'Sets: ' + ctx.playerSets;
    document.getElementById('sets-ai').textContent = 'Sets: ' + ctx.opponentSets;
    document.getElementById('hud-difficulty').textContent = this.difficulty.toUpperCase();
  }

  showCountdown(seconds, onComplete) {
    this.hideAllScreens();
    this.screens.countdown.classList.add('active');
    const display = document.getElementById('countdown-number');
    let count = seconds;
    display.textContent = count;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        display.textContent = count;
        display.className = 'countdown-number';
      } else {
        display.textContent = 'GO!';
        display.className = '';
        clearInterval(interval);
        setTimeout(() => { onComplete(); }, 800);
      }
    }, 1000);
  }

  showGameOver(ctx) {
    document.getElementById('final-score-player').textContent = ctx.playerScore;
    document.getElementById('final-score-ai').textContent = ctx.opponentScore;
    const won = ctx.playerSets > ctx.opponentSets;
    document.getElementById('result-text').textContent = won ? 'YOU WIN!' : 'GAME OVER';
    document.getElementById('result-text').style.color = won ? '#39ff14' : '#ff00aa';
  }

  showLeaderboard(entries) {
    this.hideAllScreens();
    this.screens.leaderboard.classList.add('active');
    const table = document.getElementById('leaderboard-table');
    table.innerHTML = '<div class="leaderboard-row leaderboard-header"><div>Rank</div><div>Player</div><div>Score</div></div>';
    entries.forEach((e, i) => {
      const row = document.createElement('div');
      row.className = 'leaderboard-row';
      row.innerHTML = `<div>${i + 1}</div><div>${e.player_name}</div><div>${e.score}</div>`;
      table.appendChild(row);
    });
  }

  showSettings() {
    this.hideAllScreens();
    this.screens.settings.classList.add('active');
  }

  saveSettings() {
    const name = document.getElementById('setting-name').value || 'PLAYER';
    const sets = document.getElementById('setting-sets').value;
    const sound = document.getElementById('setting-sound').checked;
    const music = document.getElementById('setting-music').checked;
    const crt = document.getElementById('setting-crt').checked;
    localStorage.setItem('rp3d_settings', JSON.stringify({ name, sets: parseInt(sets), sound, music, crt }));
    document.getElementById('crt-overlay').style.display = crt ? 'block' : 'none';
  }
}

const SCREENS = [
  'loading-screen',
  'title-screen',
  'hud',
  'pause-menu',
  'game-over',
  'leaderboard',
  'settings',
  'tutorial',
  'match-setup',
  'countdown-overlay',
  'serve-prompt',
  'point-notification',
];

export class UIManager {
  constructor(game) {
    this.game = game;
    this.screens = {};
    SCREENS.forEach((id) => {
      this.screens[id] = document.getElementById(id);
    });
    this.bindButtons();
    this.show('loading-screen');
  }

  bindButtons() {
    const map = {
      'btn-start': () => this.show('match-setup'),
      'btn-career': () => this.showCareerMode(),
      'btn-resume': () => this.game.resume(),
      'btn-restart': () => this.game.restart(),
      'btn-quit': () => this.game.quitToMenu(),
      'btn-play-again': () => this.game.restart(),
      'btn-menu': () => this.game.quitToMenu(),
      'btn-settings': () => this.show('settings'),
      'btn-settings-back': () => this.show('title-screen'),
      'btn-settings-save': () => this.saveSettings(),
      'btn-settings-pause': () => this.show('settings'),
      'btn-leaderboard': () => this.show('leaderboard'),
      'btn-leaderboard-back': () => this.show('title-screen'),
      'btn-tutorial': () => this.show('tutorial'),
      'btn-tutorial-close': () => this.show('title-screen'),
      'btn-setup-back': () => this.show('title-screen'),
      'btn-opponent-easy': () => this.startMatch('easy'),
      'btn-opponent-medium': () => this.startMatch('medium'),
      'btn-opponent-hard': () => this.startMatch('hard'),
      'btn-opponent-expert': () => this.startMatch('expert'),
    };

    Object.entries(map).forEach(([id, fn]) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    });
  }

  startMatch(difficulty) {
    this.game.startMatch(difficulty);
  }

  showCareerMode() {
    // Career mode is not yet implemented; show a placeholder message
    alert('Career Mode coming soon!\n\nProgression through amateur, club, national, and world championships with skills upgrades and equipment unlocks.');
  }

  show(id) {
    Object.values(this.screens).forEach((el) => {
      if (el) el.classList.remove('active');
    });
    if (this.screens[id]) this.screens[id].classList.add('active');
  }

  saveSettings() {
    // Persist to localStorage
    const name = document.getElementById('player-name')?.value || 'Player';
    const difficulty = document.getElementById('difficulty-select')?.value || 'medium';
    const format = document.getElementById('match-format-select')?.value || 'best-of-3';
    const settings = { name, difficulty, format };
    localStorage.setItem('tt3d_settings_v2', JSON.stringify(settings));
    this.show('title-screen');
  }
}
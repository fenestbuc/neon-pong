/**
 * UI overlay controller — menus, HUD, screens.
 */

export class UI {
  constructor() {
    this.screens = {
      title: document.getElementById('title-screen'),
      hud: document.getElementById('hud'),
      pause: document.getElementById('pause-menu'),
      gameOver: document.getElementById('game-over'),
      leaderboard: document.getElementById('leaderboard'),
      settings: document.getElementById('settings'),
    };
  }

  show(screenName) {
    Object.values(this.screens).forEach(el => el.classList.remove('active'));
    this.screens[screenName]?.classList.add('active');
  }

  updateScore(player, ai) {
    // TODO: update score display
  }

  setResultText(text) {
    // TODO: set game over text
  }
}

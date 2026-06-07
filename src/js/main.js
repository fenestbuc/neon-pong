import { Game } from './core/Game.js';

const canvas = document.getElementById('gameCanvas');
if (!canvas) {
  console.error('Game canvas not found');
}

const game = new Game(canvas);
game.start();
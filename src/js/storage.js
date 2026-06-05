/**
 * localStorage wrapper for player data and settings.
 */

const STORAGE_KEY = 'neon_pong_v1';

export class Storage {
  static load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : this.getDefaults();
    } catch {
      return this.getDefaults();
    }
  }

  static save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static getDefaults() {
    return {
      playerName: '',
      difficulty: 'medium',
      sound: true,
      bestScore: 0,
      gamesPlayed: 0,
    };
  }
}

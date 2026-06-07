import { describe, it, expect, beforeEach } from 'vitest';
import { Storage } from '../src/js/effects/Storage.js';

describe('Storage', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') window.localStorage.clear();
  });

  it('username saves to localStorage', () => {
    const storage = new Storage();
    storage.setPlayerName('NEON_KING');
    expect(storage.getPlayerName()).toBe('NEON_KING');
  });

  it('high score persists', () => {
    const storage = new Storage();
    storage.addLocalScore({ name: 'A', score: 11, opponentScore: 5 });
    const scores = storage.getLocalScores();
    expect(scores.length).toBeGreaterThan(0);
    expect(scores[0].score).toBe(11);
  });
});

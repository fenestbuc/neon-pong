import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateMachine } from '../src/js/state/GameStateMachine.js';

describe('Game State Machine', () => {
  let sm;

  beforeEach(() => {
    sm = new GameStateMachine();
  });

  it('should start in MENU state', () => {
    expect(sm.state).toBe('MENU');
  });

  it('should transition from MENU to COUNTDOWN on start', () => {
    sm.transition('START');
    expect(sm.state).toBe('COUNTDOWN');
  });

  it('should transition from COUNTDOWN to PLAYING after countdown', () => {
    sm.transition('START');
    sm.transition('COUNTDOWN_COMPLETE');
    expect(sm.state).toBe('PLAYING');
  });

  it('should transition from PLAYING to PAUSED on pause', () => {
    sm.transition('START');
    sm.transition('COUNTDOWN_COMPLETE');
    sm.transition('PAUSE');
    expect(sm.state).toBe('PAUSED');
  });

  it('should transition from PAUSED back to PLAYING on resume', () => {
    sm.transition('START');
    sm.transition('COUNTDOWN_COMPLETE');
    sm.transition('PAUSE');
    sm.transition('RESUME');
    expect(sm.state).toBe('PLAYING');
  });

  it('should transition to POINT_END on point scored', () => {
    sm.transition('START');
    sm.transition('COUNTDOWN_COMPLETE');
    sm.transition('POINT_SCORED');
    expect(sm.state).toBe('POINT_END');
  });

  it('should transition back to SERVING after point end', () => {
    sm.transition('START');
    sm.transition('COUNTDOWN_COMPLETE');
    sm.transition('POINT_SCORED');
    sm.transition('NEXT_POINT');
    expect(sm.state).toBe('SERVING');
  });

  it('should transition to MATCH_END when match is won', () => {
    sm.transition('START');
    sm.transition('COUNTDOWN_COMPLETE');
    sm.transition('MATCH_WON');
    expect(sm.state).toBe('MATCH_END');
  });

  it('should transition to MENU from GAME_OVER on quit', () => {
    sm.transition('START');
    sm.transition('COUNTDOWN_COMPLETE');
    sm.transition('MATCH_WON');
    sm.transition('QUIT');
    expect(sm.state).toBe('MENU');
  });

  it('should reject invalid transitions', () => {
    expect(() => sm.transition('INVALID')).toThrow();
  });
});

describe('Scoring Logic', () => {
  let sm;

  beforeEach(() => {
    sm = new GameStateMachine();
    sm.transition('START');
    sm.transition('COUNTDOWN_COMPLETE');
  });

  it('should award point to player on opponent fault', () => {
    sm.scorePoint('player');
    expect(sm.scores.player).toBe(1);
    expect(sm.scores.ai).toBe(0);
  });

  it('should win game at 11 points with 2-point lead', () => {
    sm.scores = { player: 10, ai: 8 };
    sm.scorePoint('player');
    expect(sm.isGameOver()).toBe(true);
    expect(sm.winner).toBe('player');
  });

  it('should NOT win at 10-10', () => {
    sm.scores = { player: 10, ai: 10 };
    expect(sm.isGameOver()).toBe(false);
  });

  it('should require win-by-2 at deuce', () => {
    sm.scores = { player: 12, ai: 11 };
    expect(sm.isGameOver()).toBe(false);
    sm.scorePoint('player');
    expect(sm.isGameOver()).toBe(true);
  });

  it('should alternate serve every 2 points', () => {
    sm.scorePoint('player');
    expect(sm.server).toBe('player');
    sm.scorePoint('ai');
    expect(sm.server).toBe('ai'); // switch after 2 serves
    sm.scorePoint('player');
    expect(sm.server).toBe('ai'); // ai serves 2nd point
  });

  it('should alternate serve every point at deuce', () => {
    sm.scores = { player: 10, ai: 10 };
    sm.scorePoint('player');
    expect(sm.server).toBe('ai');
    sm.scorePoint('ai');
    expect(sm.server).toBe('player');
  });

  it('should track set wins in best-of-3', () => {
    sm.config.matchLength = 'best-of-3';
    sm.sets = { player: 1, ai: 0 };
    sm.scores = { player: 11, ai: 5 };
    sm.checkGameWin();
    expect(sm.sets.player).toBe(2);
    expect(sm.isMatchOver()).toBe(true);
  });
});

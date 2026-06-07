import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStateMachine } from '../src/js/state-machine.stub.js';

describe('Game State Machine — Valid Transitions', () => {
  let sm;

  beforeEach(() => {
    sm = createStateMachine('BOOT');
  });

  function setupTo(state) {
    const path = ['LOADING', 'TITLE_SCREEN', 'DIFFICULTY_SELECT', 'COUNTDOWN', 'SERVING', 'PLAYING', 'POINT_END', 'NEXT_POINT'];
    for (const s of path) {
      sm.transition(s);
      if (s === state) break;
    }
  }

  it('BOOT -> LOADING', () => {
    expect(sm.transition('LOADING')).toBe(true);
    expect(sm.getState()).toBe('LOADING');
  });

  it('LOADING -> TITLE_SCREEN', () => {
    sm.transition('LOADING');
    expect(sm.transition('TITLE_SCREEN')).toBe(true);
    expect(sm.getState()).toBe('TITLE_SCREEN');
  });

  it('TITLE_SCREEN -> DIFFICULTY_SELECT', () => {
    sm.transition('LOADING');
    sm.transition('TITLE_SCREEN');
    expect(sm.transition('DIFFICULTY_SELECT')).toBe(true);
  });

  it('DIFFICULTY_SELECT -> COUNTDOWN', () => {
    sm.transition('LOADING');
    sm.transition('TITLE_SCREEN');
    sm.transition('DIFFICULTY_SELECT');
    expect(sm.transition('COUNTDOWN')).toBe(true);
  });

  it('COUNTDOWN -> SERVING', () => {
    setupTo('COUNTDOWN');
    expect(sm.transition('SERVING')).toBe(true);
  });

  it('SERVING -> PLAYING on valid serve', () => {
    setupTo('SERVING');
    expect(sm.transition('PLAYING')).toBe(true);
  });

  it('SERVING -> POINT_END on fault', () => {
    setupTo('SERVING');
    expect(sm.transition('POINT_END')).toBe(true);
  });

  it('SERVING -> SERVING on let (re-serve)', () => {
    setupTo('SERVING');
    expect(sm.transition('SERVING')).toBe(true);
  });

  it('PLAYING -> POINT_END on point scored', () => {
    setupTo('PLAYING');
    expect(sm.transition('POINT_END')).toBe(true);
  });

  it('POINT_END -> NEXT_POINT', () => {
    setupTo('POINT_END');
    expect(sm.transition('NEXT_POINT')).toBe(true);
  });

  it('NEXT_POINT -> SERVING when set not won', () => {
    setupTo('NEXT_POINT');
    expect(sm.transition('SERVING')).toBe(true);
  });

  it('NEXT_POINT -> COUNTDOWN when set won but match not won', () => {
    setupTo('NEXT_POINT');
    expect(sm.transition('COUNTDOWN')).toBe(true);
  });

  it('NEXT_POINT -> GAME_OVER when match won', () => {
    setupTo('NEXT_POINT');
    expect(sm.transition('GAME_OVER')).toBe(true);
  });

  it('PLAYING -> PAUSED', () => {
    setupTo('PLAYING');
    expect(sm.transition('PAUSED')).toBe(true);
  });

  it('PAUSED -> PLAYING (resume)', () => {
    setupTo('PLAYING');
    sm.transition('PAUSED');
    expect(sm.transition('PLAYING')).toBe(true);
  });

  it('PAUSED -> TITLE_SCREEN (quit)', () => {
    setupTo('PLAYING');
    sm.transition('PAUSED');
    expect(sm.transition('TITLE_SCREEN')).toBe(true);
  });

  it('GAME_OVER -> TITLE_SCREEN', () => {
    setupTo('NEXT_POINT');
    sm.transition('GAME_OVER');
    expect(sm.transition('TITLE_SCREEN')).toBe(true);
  });

  it('GAME_OVER -> DIFFICULTY_SELECT (play again)', () => {
    setupTo('NEXT_POINT');
    sm.transition('GAME_OVER');
    expect(sm.transition('DIFFICULTY_SELECT')).toBe(true);
  });
});

describe('Game State Machine — Invalid Transitions', () => {
  let sm;

  beforeEach(() => {
    sm = createStateMachine('BOOT');
  });

  it('rejects BOOT -> PLAYING', () => {
    expect(sm.transition('PLAYING')).toBe(false);
  });

  it('rejects PLAYING -> BOOT', () => {
    sm.transition('LOADING');
    sm.transition('TITLE_SCREEN');
    sm.transition('DIFFICULTY_SELECT');
    sm.transition('COUNTDOWN');
    sm.transition('SERVING');
    sm.transition('PLAYING');
    expect(sm.transition('BOOT')).toBe(false);
  });

  it('rejects GAME_OVER -> PLAYING directly', () => {
    sm.transition('LOADING');
    sm.transition('TITLE_SCREEN');
    sm.transition('DIFFICULTY_SELECT');
    sm.transition('COUNTDOWN');
    sm.transition('SERVING');
    sm.transition('PLAYING');
    sm.transition('POINT_END');
    sm.transition('NEXT_POINT');
    sm.transition('GAME_OVER');
    expect(sm.transition('PLAYING')).toBe(false);
  });

  it('rejects COUNTDOWN -> POINT_END', () => {
    sm.transition('LOADING');
    sm.transition('TITLE_SCREEN');
    sm.transition('DIFFICULTY_SELECT');
    sm.transition('COUNTDOWN');
    expect(sm.transition('POINT_END')).toBe(false);
  });
});

describe('Game State Machine — Context & Listeners', () => {
  let sm;

  beforeEach(() => {
    sm = createStateMachine('BOOT');
  });

  it('should preserve game context across transitions', () => {
    sm.setContext({ player_score: 5, opponent_score: 3, server: 'player_1' });
    sm.transition('LOADING');
    sm.transition('TITLE_SCREEN');
    expect(sm.getContext().player_score).toBe(5);
    expect(sm.getContext().server).toBe('player_1');
  });

  it('should notify listeners on state change', () => {
    const listener = vi.fn();
    sm.onTransition(listener);
    sm.transition('LOADING');
    expect(listener).toHaveBeenCalledWith('LOADING', 'BOOT');
  });

  it('should track longest_rally in context', () => {
    sm.setContext({ longest_rally: 0, rally_count: 0 });
    sm.updateLongestRally(12);
    expect(sm.getContext().longest_rally).toBe(12);
    sm.updateLongestRally(8);
    expect(sm.getContext().longest_rally).toBe(12);
  });

  it('should update score context on point end', () => {
    sm.setContext({ player_score: 10, opponent_score: 9, player_sets: 1, opponent_sets: 0 });
    sm.transition('LOADING');
    sm.transition('TITLE_SCREEN');
    sm.recordPoint('player_1');
    expect(sm.getContext().player_score).toBe(11);
  });
});

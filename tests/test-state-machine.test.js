import { describe, it, expect } from 'vitest';
import { GameStateMachine, STATES } from '../src/js/core/GameStateMachine.js';

describe('GameStateMachine', () => {
  it('starts in BOOT', () => {
    const sm = new GameStateMachine();
    expect(sm.getState()).toBe('BOOT');
  });

  it('transitions BOOT -> LOADING -> TITLE_SCREEN', () => {
    const sm = new GameStateMachine();
    expect(sm.transition('LOADING')).toBe(true);
    expect(sm.getState()).toBe('LOADING');
    expect(sm.transition('TITLE_SCREEN')).toBe(true);
    expect(sm.getState()).toBe('TITLE_SCREEN');
  });

  it('rejects invalid transition', () => {
    const sm = new GameStateMachine();
    expect(sm.transition('PLAYING')).toBe(false);
    expect(sm.getState()).toBe('BOOT');
  });

  it('resets match context', () => {
    const sm = new GameStateMachine();
    sm.transition('LOADING');
    sm.transition('TITLE_SCREEN');
    sm.transition('DIFFICULTY_SELECT');
    sm.startMatch('expert', 3);
    expect(sm.getState()).toBe('COUNTDOWN');
    expect(sm.context.difficulty).toBe('expert');
    expect(sm.context.setsToWin).toBe(3);
    expect(sm.context.playerScore).toBe(0);
  });
});

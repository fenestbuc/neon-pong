import { describe, it, expect } from 'vitest';
import { GameStateMachine } from '../src/js/core/GameStateMachine.js';

describe('Scoring', () => {
  it('increments player score', () => {
    const sm = new GameStateMachine();
    sm.transition('LOADING');
    sm.transition('TITLE_SCREEN');
    sm.transition('DIFFICULTY_SELECT');
    sm.startMatch('intermediate');
    sm.state = 'PLAYING';
    sm.context.playerScore = 5;
    sm.context.opponentScore = 0;
    sm.awardPoint('player_1');
    expect(sm.context.playerScore).toBe(6);
  });

  it('game over at target score with margin', () => {
    const sm = new GameStateMachine();
    sm.transition('LOADING');
    sm.transition('TITLE_SCREEN');
    sm.transition('DIFFICULTY_SELECT');
    sm.startMatch('intermediate');
    sm.state = 'PLAYING';
    sm.context.playerSets = 1;
    sm.context.playerScore = 10;
    sm.context.opponentScore = 8;
    sm.awardPoint('player_1');
    expect(sm.getState()).toBe('GAME_OVER');
  });

  it('requires win by 2 at deuce', () => {
    const sm = new GameStateMachine();
    sm.transition('LOADING');
    sm.transition('TITLE_SCREEN');
    sm.transition('DIFFICULTY_SELECT');
    sm.startMatch('intermediate');
    sm.state = 'PLAYING';
    sm.context.playerScore = 10;
    sm.context.opponentScore = 10;
    sm.awardPoint('player_1');
    expect(sm.getState()).not.toBe('GAME_OVER');
    expect(sm.context.playerScore).toBe(11);
  });
});

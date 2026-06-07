import { GAME_RULES } from './Constants.js';

export const STATES = {
  BOOT: 'BOOT',
  LOADING: 'LOADING',
  TITLE_SCREEN: 'TITLE_SCREEN',
  DIFFICULTY_SELECT: 'DIFFICULTY_SELECT',
  COUNTDOWN: 'COUNTDOWN',
  SERVING: 'SERVING',
  PLAYING: 'PLAYING',
  POINT_END: 'POINT_END',
  NEXT_POINT: 'NEXT_POINT',
  GAME_OVER: 'GAME_OVER',
  PAUSED: 'PAUSED',
  REPLAY: 'REPLAY',
};

const VALID_TRANSITIONS = {
  [STATES.BOOT]: [STATES.LOADING],
  [STATES.LOADING]: [STATES.TITLE_SCREEN],
  [STATES.TITLE_SCREEN]: [STATES.DIFFICULTY_SELECT, STATES.PAUSED],
  [STATES.DIFFICULTY_SELECT]: [STATES.COUNTDOWN, STATES.TITLE_SCREEN],
  [STATES.COUNTDOWN]: [STATES.SERVING],
  [STATES.SERVING]: [STATES.PLAYING, STATES.POINT_END],
  [STATES.PLAYING]: [STATES.POINT_END, STATES.PAUSED, STATES.GAME_OVER],
  [STATES.POINT_END]: [STATES.NEXT_POINT],
  [STATES.NEXT_POINT]: [STATES.SERVING, STATES.COUNTDOWN, STATES.GAME_OVER],
  [STATES.GAME_OVER]: [STATES.TITLE_SCREEN, STATES.DIFFICULTY_SELECT],
  [STATES.PAUSED]: [STATES.PLAYING, STATES.SERVING, STATES.TITLE_SCREEN],
  [STATES.REPLAY]: [STATES.PLAYING],
};

export class GameStateMachine {
  constructor() {
    this.state = STATES.BOOT;
    this.listeners = [];
    this.context = {
      matchId: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
      playerId: 'guest',
      difficulty: 'intermediate',
      setsToWin: GAME_RULES.SETS_TO_WIN_MATCH_DEFAULT,
      playerScore: 0,
      opponentScore: 0,
      playerSets: 0,
      opponentSets: 0,
      server: 'player_1',
      rallyCount: 0,
      longestRally: 0,
      matchStartTime: null,
      pointStartTime: null,
      isReplayAvailable: false,
      serveCount: 0,
    };
  }

  getState() { return this.state; }

  transition(newState, payload = {}) {
    const allowed = VALID_TRANSITIONS[this.state];
    if (!allowed?.includes(newState)) {
      console.warn(`Invalid transition: ${this.state} -> ${newState}`);
      return false;
    }
    const oldState = this.state;
    this.state = newState;
    Object.assign(this.context, payload);
    this.listeners.forEach(cb => cb(newState, oldState, this.context));
    return true;
  }

  onTransition(callback) { this.listeners.push(callback); }

  awardPoint(winner) {
    if (winner === 'player_1') this.context.playerScore++;
    else this.context.opponentScore++;

    const ps = this.context.playerScore;
    const os = this.context.opponentScore;
    const target = GAME_RULES.POINTS_TO_WIN_SET;
    const margin = GAME_RULES.WIN_MARGIN;
    const setWon = (ps >= target || os >= target) && Math.abs(ps - os) >= margin;

    if (setWon) {
      if (winner === 'player_1') this.context.playerSets++;
      else this.context.opponentSets++;

      const stw = this.context.setsToWin;
      if (this.context.playerSets >= stw || this.context.opponentSets >= stw) {
        this.transition(STATES.GAME_OVER);
      } else {
        this.context.playerScore = 0;
        this.context.opponentScore = 0;
        this.context.serveCount = 0;
        this.transition(STATES.COUNTDOWN);
      }
    } else {
      this.context.serveCount++;
      this.alternateServerIfNeeded();
      this.transition(STATES.NEXT_POINT);
    }
  }

  alternateServerIfNeeded() {
    const total = this.context.playerScore + this.context.opponentScore;
    const atDeuce = this.context.playerScore >= 10 && this.context.opponentScore >= 10;
    const interval = atDeuce ? 1 : GAME_RULES.SERVE_ALTERNATE_EVERY;
    if (this.context.serveCount >= interval) {
      this.context.server = this.context.server === 'player_1' ? 'player_2' : 'player_1';
      this.context.serveCount = 0;
    }
  }

  resetMatch() {
    this.context.playerScore = 0;
    this.context.opponentScore = 0;
    this.context.playerSets = 0;
    this.context.opponentSets = 0;
    this.context.rallyCount = 0;
    this.context.longestRally = 0;
    this.context.server = 'player_1';
    this.context.serveCount = 0;
  }

  startMatch(difficulty, setsToWin = GAME_RULES.SETS_TO_WIN_MATCH_DEFAULT) {
    this.resetMatch();
    this.context.difficulty = difficulty;
    this.context.setsToWin = setsToWin;
    this.context.matchStartTime = Date.now();
    this.transition(STATES.COUNTDOWN);
  }
}

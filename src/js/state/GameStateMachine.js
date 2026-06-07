const STATES = {
  MENU: 'MENU',
  COUNTDOWN: 'COUNTDOWN',
  SERVING: 'SERVING',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  POINT_END: 'POINT_END',
  MATCH_END: 'MATCH_END',
};

const TRANSITIONS = {
  [STATES.MENU]: {
    START: STATES.COUNTDOWN,
  },
  [STATES.COUNTDOWN]: {
    COUNTDOWN_COMPLETE: STATES.PLAYING,
  },
  [STATES.SERVING]: {
    SERVE_COMPLETE: STATES.PLAYING,
    PAUSE: STATES.PAUSED,
  },
  [STATES.PLAYING]: {
    PAUSE: STATES.PAUSED,
    POINT_SCORED: STATES.POINT_END,
    MATCH_WON: STATES.MATCH_END,
  },
  [STATES.PAUSED]: {
    RESUME: STATES.PLAYING,
    START: STATES.COUNTDOWN,
  },
  [STATES.POINT_END]: {
    NEXT_POINT: STATES.PLAYING,
    MATCH_WON: STATES.MATCH_END,
    START: STATES.COUNTDOWN,
  },
  [STATES.MATCH_END]: {
    QUIT: STATES.MENU,
    PLAY_AGAIN: STATES.COUNTDOWN,
    START: STATES.COUNTDOWN,
  },
};

export class GameStateMachine {
  constructor() {
    this.state = STATES.MENU;
    this.scores = { player: 0, ai: 0 };
    this.sets = { player: 0, ai: 0 };
    this.server = 'player';
    this.winner = null;
    this.config = {
      matchLength: 'best-of-3',
      winBy: 2,
      pointsToWin: 11,
    };
    this.history = [];
  }

  transition(action) {
    const next = TRANSITIONS[this.state]?.[action];
    if (!next) {
      throw new Error(`Invalid transition: ${this.state} → ${action}`);
    }
    this.state = next;
    return true;
  }

  scorePoint(who) {
    this.scores[who]++;
    this.checkGameWin();
    this.updateServer();
  }

  checkGameWin() {
    const { player, ai } = this.scores;
    const minWin = this.config.pointsToWin;
    const winBy = this.config.winBy;

    if (player >= minWin && player - ai >= winBy) {
      this.sets.player++;
      this.winner = 'player';
      return true;
    }
    if (ai >= minWin && ai - player >= winBy) {
      this.sets.ai++;
      this.winner = 'ai';
      return true;
    }
    return false;
  }

  isGameOver() {
    const { player, ai } = this.scores;
    const minWin = this.config.pointsToWin;
    const winBy = this.config.winBy;

    if (player >= minWin && player - ai >= winBy) {
      this.winner = 'player';
      return true;
    }
    if (ai >= minWin && ai - player >= winBy) {
      this.winner = 'ai';
      return true;
    }
    return false;
  }

  isMatchOver() {
    const totalSets = this.sets.player + this.sets.ai;
    const needed = this.config.matchLength === 'best-of-3' ? 2 : 3;
    return this.sets.player >= needed || this.sets.ai >= needed;
  }

  updateServer() {
    const totalPoints = this.scores.player + this.scores.ai;
    const isDeuce = this.scores.player >= 10 && this.scores.ai >= 10;

    if (isDeuce) {
      // Alternate every point at deuce
      this.server = totalPoints % 2 === 0 ? 'player' : 'ai';
    } else {
      // Alternate every 2 points
      const servesPerPlayer = 2;
      const cycle = Math.floor(totalPoints / servesPerPlayer) % 2;
      this.server = cycle === 0 ? 'player' : 'ai';
    }
  }

  resetGame() {
    this.scores = { player: 0, ai: 0 };
    this.sets = { player: 0, ai: 0 };
    this.winner = null;
    this.server = 'player';
  }
}
/**
 * State machine for game states.
 */

export const STATES = {
  MENU: 'MENU',
  COUNTDOWN: 'COUNTDOWN',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
};

export class StateMachine {
  constructor() {
    this.state = STATES.MENU;
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  transition(newState) {
    const validTransitions = {
      [STATES.MENU]: [STATES.COUNTDOWN],
      [STATES.COUNTDOWN]: [STATES.PLAYING],
      [STATES.PLAYING]: [STATES.PAUSED, STATES.GAME_OVER],
      [STATES.PAUSED]: [STATES.PLAYING, STATES.MENU],
      [STATES.GAME_OVER]: [STATES.MENU, STATES.COUNTDOWN],
    };

    if (!validTransitions[this.state]?.includes(newState)) {
      console.warn(`Invalid transition: ${this.state} -> ${newState}`);
      return false;
    }

    const oldState = this.state;
    this.state = newState;
    this.listeners.forEach(cb => cb(newState, oldState));
    return true;
  }

  onTransition(callback) {
    this.listeners.push(callback);
  }
}

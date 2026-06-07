export const PHYSICS = {
  GRAVITY: -9.81,
  BALL_MASS: 0.0027,
  BALL_RADIUS: 0.02,
  BALL_DRAG: 0.47,
  AIR_DENSITY: 1.225,
  MAGNUS_COEFF: 0.00012,
  MAX_BALL_SPEED: 28.0,
  SERVE_SPEED: 8.0,
  TABLE_WIDTH: 1.525,
  TABLE_LENGTH: 2.74,
  TABLE_HEIGHT: 0.76,
  NET_HEIGHT: 0.1525,
  NET_OVERHANG: 0.1525,
  BOUNCE_RESTITUTION: 0.75,
  SURFACE_FRICTION: 0.4,
  PADDLE_RADIUS: 0.08,
  PADDLE_REST: 0.92,
  PADDLE_FRICTION: 0.6,
  SWEET_SPOT_MULT: 1.15,
  NET_REST: 0.05,
  NET_FRICTION: 0.9,
  FIXED_DT: 1 / 60,
  SUB_STEPS: 4,
};

export const GAME_RULES = {
  POINTS_TO_WIN_SET: 11,
  WIN_MARGIN: 2,
  SERVE_ALTERNATE_EVERY: 2,
  SETS_TO_WIN_MATCH_DEFAULT: 2,
  RALLY_TIMEOUT: 30,
};

export const AI_CONFIG = {
  novice: {
    reactionDelay: 0.3,
    positionError: 0.30,
    predict: false,
    useSpin: false,
    targetCenter: 1.0,
    speedCap: 3.0,
    errorRate: 0.30,
  },
  intermediate: {
    reactionDelay: 0.15,
    positionError: 0.15,
    predict: true,
    predictFrames: 1,
    useSpin: 0.2,
    targetCenter: 0.3,
    speedCap: 5.0,
    errorRate: 0.15,
  },
  expert: {
    reactionDelay: 0.065,
    positionError: 0.06,
    predict: true,
    predictFrames: 3,
    useSpin: 0.6,
    targetCenter: 0.0,
    speedCap: 7.5,
    errorRate: 0.08,
  },
  pro: {
    reactionDelay: 0.02,
    positionError: 0.02,
    predict: true,
    predictFrames: 5,
    useSpin: 0.85,
    targetCenter: 0.0,
    speedCap: 9.0,
    errorRate: 0.04,
    intentionalError: 0.01,
  },
};

export const CAMERA = {
  PLAYER_VIEW: 'PLAYER_VIEW',
  SPECTATOR_VIEW: 'SPECTATOR_VIEW',
  REPLAY_VIEW: 'REPLAY_VIEW',
  SERVE_VIEW: 'SERVE_VIEW',
};

export const COLORS = {
  table: 0x1a1a2e,
  tableLines: 0xffffff,
  net: 0x888888,
  ball: 0xffee00,
  paddlePlayer: 0x00f0ff,
  paddleAI: 0xff00aa,
  floor: 0x0a0a12,
  ambient: 0x7c3aed,
};

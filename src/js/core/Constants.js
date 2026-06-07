// Rally Pro 3D — Game Constants

export const TABLE_LENGTH = 2.74;        // meters
export const TABLE_WIDTH = 1.525;        // meters
export const TABLE_HEIGHT = 0.76;        // meters (standard table height)
export const NET_HEIGHT = 0.1525;        // 15.25cm
export const BALL_RADIUS = 0.02;         // 40mm diameter = 0.02m radius

export const GAME_SCALE = 50;

export const GRAVITY = 9.81;
export const AIR_DRAG = 0.3;
export const RESTITUTION_TABLE = 0.75;
export const RESTITUTION_PADDLE = 1.05;
export const FRICTION_TABLE = 0.5;
export const SPIN_DAMPING = 0.7;
export const SPIN_INFLUENCE = 0.2;
export const MAX_SPIN = 30;

export const MAX_BALL_SPEED = 25;
export const MIN_BALL_SPEED = 2;
export const SERVE_SPEED_MIN = 5;
export const SERVE_SPEED_MAX = 12;

export const PADDLE_WIDTH = 0.158;
export const PADDLE_HEIGHT = 0.152;
export const PADDLE_THICKNESS = 0.02;
export const PADDLE_REST_HEIGHT = 0.8;

export const PHYSICS_STEP = 1 / 120;

export const POINTS_TO_WIN = 11;
export const WIN_BY = 2;

export const DIFFICULTY = {
  easy:   { speed: 1.5, accuracy: 0.40, reactionDelay: 0.40, spinCap: 0.00, errorRate: 0.25 },
  medium: { speed: 2.5, accuracy: 0.70, reactionDelay: 0.20, spinCap: 0.30, errorRate: 0.10 },
  hard:   { speed: 3.5, accuracy: 0.90, reactionDelay: 0.08, spinCap: 0.70, errorRate: 0.03 },
  expert: { speed: 4.5, accuracy: 0.98, reactionDelay: 0.02, spinCap: 0.95, errorRate: 0.005 },
};

export const SERVE_ALTERNATE_POINTS = 2;
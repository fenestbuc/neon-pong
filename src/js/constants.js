/**
 * Game constants and configuration.
 */

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const COLORS = {
  background: '#0a0a0f',
  paddle: '#00ffff',
  ball: '#ff00ff',
  net: '#1a1a2e',
  text: '#ffffff',
  neonBlue: '#00ffff',
  neonPink: '#ff00ff',
  neonGreen: '#39ff14',
};

export const PADDLE = {
  width: 12,
  height: 80,
  speed: 400, // pixels per second
  offset: 20, // distance from edge
};

export const BALL = {
  radius: 8,
  initialSpeed: 300,
  speedIncrement: 20,
  maxSpeed: 800,
};

export const AI = {
  easy: { speed: 200, errorMargin: 60, reactionDelay: 0.3 },
  medium: { speed: 350, errorMargin: 25, reactionDelay: 0.15 },
  hard: { speed: 500, errorMargin: 5, reactionDelay: 0.05 },
};

export const WIN_SCORE = 10;
export const COUNTDOWN_SECONDS = 3;

export const API_BASE = '/api/v1';
export const API_VERSION = '1.0.0';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputHandler } from '../src/js/input.stub.js';

describe('Input Handling — Keyboard Mapping', () => {
  let input;
  let canvas;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    input = new InputHandler(canvas);
    input.init();
  });

  it('should register ArrowLeft and A as move-left inputs', () => {
    input.handleKeyDown('ArrowLeft');
    expect(input.isKeyDown('ArrowLeft')).toBe(true);
    input.handleKeyDown('a');
    expect(input.isKeyDown('a')).toBe(true);
  });

  it('should register ArrowRight and D as move-right inputs', () => {
    input.handleKeyDown('ArrowRight');
    expect(input.isKeyDown('ArrowRight')).toBe(true);
    input.handleKeyDown('d');
    expect(input.isKeyDown('d')).toBe(true);
  });

  it('should register ArrowUp and W as move-forward inputs', () => {
    input.handleKeyDown('ArrowUp');
    expect(input.isKeyDown('ArrowUp')).toBe(true);
    input.handleKeyDown('w');
    expect(input.isKeyDown('w')).toBe(true);
  });

  it('should register ArrowDown and S as move-back inputs', () => {
    input.handleKeyDown('ArrowDown');
    expect(input.isKeyDown('ArrowDown')).toBe(true);
    input.handleKeyDown('s');
    expect(input.isKeyDown('s')).toBe(true);
  });

  it('should register Space and Enter for serve / toss', () => {
    input.handleKeyDown(' ');
    expect(input.consumeAction()).toBe(true);
    input.handleKeyDown('Enter');
    expect(input.consumeAction()).toBe(true);
  });

  it('should trigger pause on Escape or P', () => {
    input.handleKeyDown('Escape');
    expect(input.isPausePressed()).toBe(true);
    input.clearPause();
    input.handleKeyDown('p');
    expect(input.isPausePressed()).toBe(true);
  });

  it('should clear released keys', () => {
    input.handleKeyDown('ArrowLeft');
    input.handleKeyUp('ArrowLeft');
    expect(input.isKeyDown('ArrowLeft')).toBe(false);
  });
});

describe('Input Handling — Mouse Mapping', () => {
  let input;
  let canvas;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    input = new InputHandler(canvas);
    input.init();
  });

  it('should map mouse X to table width [-0.7625, +0.7625]', () => {
    input.handleMouseMove(0, 300);
    expect(input.getPaddleTarget().x).toBeCloseTo(-0.7625, 3);
    input.handleMouseMove(800, 300);
    expect(input.getPaddleTarget().x).toBeCloseTo(0.7625, 3);
  });

  it('should map mouse Y to table half-length [0, 1.37]', () => {
    input.handleMouseMove(400, 0);
    expect(input.getPaddleTarget().z).toBeCloseTo(1.37, 3);
    input.handleMouseMove(400, 600);
    expect(input.getPaddleTarget().z).toBeCloseTo(0, 3);
  });

  it('should detect left click hold for serve power charge', () => {
    input.handleMouseDown(0);
    expect(input.isChargingServe()).toBe(true);
    input.handleMouseUp(0);
    expect(input.isChargingServe()).toBe(false);
  });
});

describe('Input Handling — Touch Mapping', () => {
  let input;
  let canvas;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    input = new InputHandler(canvas);
    input.init();
  });

  it('should map single finger drag to table coordinates', () => {
    input.handleTouchMove([{ clientX: 100, clientY: 200 }]);
    const target = input.getPaddleTarget();
    expect(target).toBeDefined();
    expect(target.x).toBeDefined();
    expect(target.z).toBeDefined();
  });

  it('should apply 50ms moving average to touch position', () => {
    input.handleTouchMove([{ clientX: 100, clientY: 200 }]);
    input.handleTouchMove([{ clientX: 110, clientY: 210 }]);
    input.handleTouchMove([{ clientX: 120, clientY: 220 }]);
    expect(input.getTouchJitter()).toBeLessThanOrEqual(50);
  });

  it('should detect tap-and-hold for serve charge', () => {
    input.handleTouchStart([{ clientX: 400, clientY: 300 }]);
    expect(input.isChargingServe()).toBe(true);
    input.handleTouchEnd();
    expect(input.consumeAction()).toBe(true);
  });

  it('should trigger pause on two-finger tap', () => {
    input.handleTouchStart([
      { clientX: 200, clientY: 300 },
      { clientX: 300, clientY: 300 },
    ]);
    input.handleTouchEnd();
    expect(input.isPausePressed()).toBe(true);
  });
});

describe('Input Handling — Auto-Detection & Deadzone', () => {
  let input;
  let canvas;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    input = new InputHandler(canvas);
    input.init();
  });

  it('should detect keyboard on first keydown and lock game input', () => {
    input.handleKeyDown('ArrowUp');
    expect(input.getActiveDevice()).toBe('keyboard');
  });

  it('should detect mouse on first mousemove and lock game input', () => {
    input.handleMouseMove(400, 300);
    expect(input.getActiveDevice()).toBe('mouse');
  });

  it('should detect touch on first touchmove and lock game input', () => {
    input.handleTouchMove([{ clientX: 400, clientY: 300 }]);
    expect(input.getActiveDevice()).toBe('touch');
  });

  it('should ignore 2% screen edge deadzone', () => {
    const deadzoneX = canvas.width * 0.01;
    input.handleMouseMove(deadzoneX, 300);
    const target = input.getPaddleTarget();
    expect(target.x).toBeGreaterThan(-0.7625);
  });
});

describe('Input Handling — Accessibility', () => {
  let input;
  let canvas;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    input = new InputHandler(canvas);
    input.init();
  });

  it('should expose current input state for screen readers', () => {
    input.handleKeyDown('ArrowUp');
    const state = input.getAccessibilityState();
    expect(state.activeKeys).toContain('ArrowUp');
  });
});

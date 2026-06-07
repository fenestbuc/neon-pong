import { describe, it, expect, beforeEach } from 'vitest';
import { InputManager } from '../src/js/input/InputManager.js';

describe('InputManager', () => {
  let input;

  beforeEach(() => {
    input = new InputManager(document.createElement('canvas'));
  });

  it('keyboard W moves paddle up (negative Z)', () => {
    input.keys.add('w');
    input.update();
    const target = input.getPaddleTarget();
    expect(target.dz).toBeLessThan(0);
  });

  it('keyboard S moves paddle down (positive Z)', () => {
    input.keys.add('s');
    input.update();
    const target = input.getPaddleTarget();
    expect(target.dz).toBeGreaterThan(0);
  });

  it('detects pause key', () => {
    input.keys.add('escape');
    input.update();
    expect(input.isPausePressed()).toBe(true);
  });
});

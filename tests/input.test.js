import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputManager } from '../src/js/input/InputManager.js';

describe('Input Manager', () => {
  let input;

  beforeEach(() => {
    input = new InputManager();
    input.bind(document.createElement('canvas'));
  });

  it('should track W key for upward movement', () => {
    input.onKeyDown({ key: 'w' });
    expect(input.isPressed('w')).toBe(true);
    expect(input.getVerticalAxis()).toBeLessThan(0);
  });

  it('should track S key for downward movement', () => {
    input.onKeyDown({ key: 's' });
    expect(input.isPressed('s')).toBe(true);
    expect(input.getVerticalAxis()).toBeGreaterThan(0);
  });

  it('should track ArrowUp key', () => {
    input.onKeyDown({ key: 'ArrowUp' });
    expect(input.isPressed('ArrowUp')).toBe(true);
    expect(input.getVerticalAxis()).toBeLessThan(0);
  });

  it('should track ArrowDown key', () => {
    input.onKeyDown({ key: 'ArrowDown' });
    expect(input.isPressed('ArrowDown')).toBe(true);
    expect(input.getVerticalAxis()).toBeGreaterThan(0);
  });

  it('should release keys on keyup', () => {
    input.onKeyDown({ key: 'w' });
    input.onKeyUp({ key: 'w' });
    expect(input.isPressed('w')).toBe(false);
    expect(input.getVerticalAxis()).toBe(0);
  });

  it('should track mouse Y position', () => {
    input.onMouseMove({ clientY: 200 });
    expect(input.mouseY).toBe(200);
  });

  it('should track touch position', () => {
    input.onTouchMove({ touches: [{ clientY: 300 }] });
    expect(input.touchY).toBe(300);
  });

  it('should toggle pause on P key', () => {
    let paused = false;
    input.onPause = () => { paused = !paused; };
    input.onKeyDown({ key: 'p' });
    expect(paused).toBe(true);
    input.onKeyDown({ key: 'p' });
    expect(paused).toBe(false);
  });

  it('should toggle pause on Escape key', () => {
    let paused = false;
    input.onPause = () => { paused = !paused; };
    input.onKeyDown({ key: 'Escape' });
    expect(paused).toBe(true);
  });

  it('should detect swipe up gesture', () => {
    input.onTouchStart({ touches: [{ clientY: 500, clientX: 200 }] });
    input.onTouchMove({ touches: [{ clientY: 300, clientX: 200 }] });
    input.onTouchEnd({});
    expect(input.getLastGesture()).toBe('swipe-up');
  });

  it('should detect swipe down gesture', () => {
    input.onTouchStart({ touches: [{ clientY: 300, clientX: 200 }] });
    input.onTouchMove({ touches: [{ clientY: 500, clientX: 200 }] });
    input.onTouchEnd({});
    expect(input.getLastGesture()).toBe('swipe-down');
  });

  it('should not detect gesture for small movements', () => {
    input.onTouchStart({ touches: [{ clientY: 300, clientX: 200 }] });
    input.onTouchMove({ touches: [{ clientY: 310, clientX: 200 }] });
    input.onTouchEnd({});
    expect(input.getLastGesture()).toBeNull();
  });

  it('should bind swipe left to backspin', () => {
    input.onTouchStart({ touches: [{ clientY: 300, clientX: 400 }] });
    input.onTouchMove({ touches: [{ clientY: 300, clientX: 200 }] });
    input.onTouchEnd({});
    expect(input.getSpinGesture()).toBe('backspin');
  });

  it('should bind swipe right to topspin', () => {
    input.onTouchStart({ touches: [{ clientY: 300, clientX: 200 }] });
    input.onTouchMove({ touches: [{ clientY: 300, clientX: 400 }] });
    input.onTouchEnd({});
    expect(input.getSpinGesture()).toBe('topspin');
  });
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.js'],
    alias: {
      'three': '/home/yash/neon-pong-factory/tests/mocks/three.js'
    }
  }
});

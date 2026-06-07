import { defineConfig } from "vitest/config";

export default defineConfig({
  root: process.cwd(),
  test: {
    root: process.cwd(),
    include: ["tests/**/*.test.js"],
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.js"],
  },
});

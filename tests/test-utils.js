export function test(name, fn) {
  try { fn(); console.log(`✓ ${name}`); }
  catch (err) { console.error(`✗ ${name}`); console.error(`  ${err.message}`); process.exitCode = 1; }
}
export function assertEqual(actual, expected, msg) {
  if (actual !== expected) throw new Error(msg || `Expected ${expected}, got ${actual}`);
}
export function assertTrue(value, msg) {
  if (!value) throw new Error(msg || `Expected true, got ${value}`);
}
export function assertFalse(value, msg) {
  if (value) throw new Error(msg || `Expected false, got ${value}`);
}

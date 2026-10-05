import test from 'node:test';
import assert from 'node:assert/strict';
import { getStoredElderMode, saveElderMode } from '../src/utils/elderMode.ts';

const createStorage = (initial: Record<string, string> = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
};

test('elder mode is disabled unless its saved preference is true', () => {
  assert.equal(getStoredElderMode(createStorage()), false);
  assert.equal(getStoredElderMode(createStorage({ calvary_elder_mode: 'false' })), false);
  assert.equal(getStoredElderMode(createStorage({ calvary_elder_mode: 'true' })), true);
});

test('saving elder mode preserves the chosen preference for the next visit', () => {
  const storage = createStorage();

  saveElderMode(storage, true);
  assert.equal(getStoredElderMode(storage), true);

  saveElderMode(storage, false);
  assert.equal(getStoredElderMode(storage), false);
});

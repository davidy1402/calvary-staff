import test from 'node:test';
import assert from 'node:assert/strict';
import { getAppHeaderAppearance } from '../src/utils/appHeader.ts';

test('standard header uses the shared compact logo, padding, and type scale', () => {
  assert.deepEqual(getAppHeaderAppearance(false), {
    logoClass: 'w-8 h-8',
    paddingClass: 'px-4 md:px-6 pb-3',
    brandClass: 'text-xs',
    titleClass: 'text-lg',
  });
});

test('senior care header uses the shared large logo, padding, and type scale', () => {
  assert.deepEqual(getAppHeaderAppearance(true), {
    logoClass: 'w-10 h-10',
    paddingClass: 'px-5 pb-4',
    brandClass: 'text-sm',
    titleClass: 'text-2xl',
  });
});

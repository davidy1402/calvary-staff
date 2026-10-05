import test from 'node:test';
import assert from 'node:assert/strict';
import { getUpcomingServiceDates } from '../src/utils/dateUtils.ts';

test('weekly service dates include today when it is the configured weekday', () => {
  const dates = getUpcomingServiceDates(7, 3, new Date(2026, 9, 4)); // Sunday
  assert.deepEqual(dates, ['2026-10-04', '2026-10-11', '2026-10-18']);
});

test('weekly service dates start at the next configured weekday', () => {
  const dates = getUpcomingServiceDates(5, 2, new Date(2026, 9, 4)); // Sunday -> Friday
  assert.deepEqual(dates, ['2026-10-09', '2026-10-16']);
});

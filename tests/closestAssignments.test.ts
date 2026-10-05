import test from 'node:test';
import assert from 'node:assert/strict';
import { getClosestDatedItems } from '../src/utils/closestAssignments.ts';

const assignment = (id: string, date: string) => ({ id, roster: { date } });

test('shows a recently passed duty before a later duty when it is closer to today', () => {
  const duties = [
    assignment('next-week', '2026-10-11'),
    assignment('yesterday', '2026-10-04'),
    assignment('later', '2026-10-18'),
  ];

  assert.deepEqual(
    getClosestDatedItems(duties, '2026-10-05').map((duty) => duty.id),
    ['yesterday', 'next-week'],
  );
});

test('prefers the upcoming duty when two dates are equally close', () => {
  const duties = [
    assignment('yesterday', '2026-10-04'),
    assignment('tomorrow', '2026-10-06'),
  ];

  assert.deepEqual(
    getClosestDatedItems(duties, '2026-10-05').map((duty) => duty.id),
    ['tomorrow', 'yesterday'],
  );
});

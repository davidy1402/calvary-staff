import test from 'node:test';
import assert from 'node:assert/strict';
import { RosterSyncQueue } from '../src/utils/rosterSyncQueue.ts';

const roster = (id: string, theme = '') => ({ id, serviceId: 'mandarin', date: '2026-10-04', assignments: {}, theme });

test('failed writes stay pending and succeed on retry', async () => {
  let succeeds = false;
  const statuses: string[] = [];
  const queue = new RosterSyncQueue({ write: async () => succeeds, onStatus: s => statuses.push(s), onPending: () => {} });
  await queue.enqueue(roster('a'));
  assert.equal(queue.has('a'), true);
  assert.equal(statuses.at(-1), 'error');
  succeeds = true;
  await queue.flush();
  assert.deepEqual(queue.snapshot(), []);
  assert.equal(statuses.at(-1), 'synced');
});

test('a newer edit made during a write is sent after the old one', async () => {
  let finish!: (success: boolean) => void;
  const writes: string[] = [];
  const queue = new RosterSyncQueue({
    write: async r => { writes.push(r.theme || ''); return writes.length === 1 ? new Promise(resolve => { finish = resolve; }) : true; },
    onStatus: () => {}, onPending: () => {},
  });
  const running = queue.enqueue(roster('a', 'old'));
  void queue.enqueue(roster('a', 'intermediate'));
  void queue.enqueue(roster('a', 'latest'));
  finish(true);
  await running;
  assert.deepEqual(writes, ['old', 'latest']);
  assert.deepEqual(queue.snapshot(), []);
});

test('restored pending records are retained when a request throws', async () => {
  const queue = new RosterSyncQueue({ initial: [roster('a'), roster('b')], write: async () => { throw new Error('offline'); }, onStatus: () => {}, onPending: () => {} });
  await queue.flush();
  assert.deepEqual(queue.snapshot().map(r => r.id), ['a', 'b']);
});

test('retry writes all restored records in order', async () => {
  const writes: string[] = [];
  const queue = new RosterSyncQueue({ initial: [roster('a'), roster('b')], write: async r => { writes.push(r.id); return true; }, onStatus: () => {}, onPending: () => {} });
  await queue.flush();
  assert.deepEqual(writes, ['a', 'b']);
  assert.deepEqual(queue.snapshot(), []);
});

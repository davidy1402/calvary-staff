import test from 'node:test';
import assert from 'node:assert/strict';
import { getRosterSyncFeedback } from '../src/utils/rosterSyncFeedback.ts';

test('normal sync states stay quiet instead of announcing local or cloud saves', () => {
  assert.equal(getRosterSyncFeedback('saved', 'offline', 'zh'), null);
  assert.equal(getRosterSyncFeedback('saved', 'connecting', 'zh'), null);
  assert.equal(getRosterSyncFeedback('saved', 'synced', 'zh'), null);
});

test('sync failures remain actionable', () => {
  assert.deepEqual(getRosterSyncFeedback('error', 'synced', 'zh'), {
    message: '未能保存，请重试',
    canRetry: true,
  });
  assert.deepEqual(getRosterSyncFeedback('saved', 'error', 'en'), {
    message: 'Cloud sync failed. Please retry.',
    canRetry: true,
  });
});

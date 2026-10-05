import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canShowSeniorCareRole,
  getSeniorCareDetailRows,
  getSeniorCareNavigation,
  getSeniorCareScheduleRows,
  getSeniorCareThemeSelection,
  isRedundantDutyNote,
  isRedundantServiceTheme,
} from '../src/utils/seniorCare.ts';

test('senior care navigation keeps every destination text-labelled and in a stable order', () => {
  assert.deepEqual(getSeniorCareNavigation('zh'), [
    { id: 'dashboard', label: '首页' },
    { id: 'roster', label: '侍奉表' },
    { id: 'profile', label: '设置' },
  ]);
});

test('senior care schedule rows retain every practical serving detail in a vertical order', () => {
  assert.deepEqual(
    getSeniorCareScheduleRows({
      roles: ['领唱', '钢琴'],
      rehearsalTime: '上午 8:00 集合',
      serviceTime: '上午 9:00',
      venue: '主堂',
      notes: ['请提早到场调音'],
    }, 'zh'),
    [
      { label: '我的岗位', value: '领唱、钢琴' },
      { label: '集合时间', value: '上午 8:00 集合' },
      { label: '聚会时间', value: '上午 9:00' },
      { label: '地点', value: '主堂' },
      { label: '备注', value: '请提早到场调音' },
    ],
  );
});

test('my duties view never includes another volunteer role merely because it has a note', () => {
  assert.equal(canShowSeniorCareRole({ view: 'mine', currentUserId: 'selena', coworkerIds: ['diana'] }), false);
  assert.equal(canShowSeniorCareRole({ view: 'mine', currentUserId: 'selena', coworkerIds: ['selena'] }), true);
  assert.equal(canShowSeniorCareRole({ view: 'all', currentUserId: 'selena', coworkerIds: ['diana'] }), true);
});

test('senior care appearance selection follows the active system appearance', () => {
  assert.equal(getSeniorCareThemeSelection('system', false), 'light');
  assert.equal(getSeniorCareThemeSelection('system', true), 'dark');
  assert.equal(getSeniorCareThemeSelection('light', true), 'light');
  assert.equal(getSeniorCareThemeSelection('dark', false), 'dark');
});

test('senior care detail hides labels that only repeat already-visible service or volunteer information', () => {
  assert.equal(isRedundantServiceTheme('实体祷告会 @hall 2', '实体祷告会 @hall 2'), true);
  assert.equal(isRedundantServiceTheme('敬牧月', '实体祷告会 @hall 2'), false);
  assert.equal(isRedundantDutyNote('凯曰领 / 弹吉他', ['凯曰']), true);
  assert.equal(isRedundantDutyNote('提早 15 分钟配合鼓手对节拍', ['Selena']), false);
});

test('senior care home detail keeps only essential service information in a clear vertical order', () => {
  assert.deepEqual(
    getSeniorCareDetailRows({
      serviceDate: '2026年10月4日（星期日）',
      serviceTime: '10:30 AM',
      rehearsalTime: '9:30 AM 彩排',
      venue: '主堂 Main Sanctuary',
      theme: '敬牧月',
      speaker: '黄牧师',
    }, 'zh'),
    [
      { label: '聚会日期', value: '2026年10月4日（星期日）' },
      { label: '聚会时间', value: '10:30 AM' },
      { label: '彩排时间', value: '9:30 AM 彩排' },
      { label: '地点', value: '主堂 Main Sanctuary' },
      { label: '主题', value: '敬牧月' },
      { label: '讲员', value: '黄牧师' },
    ],
  );
});

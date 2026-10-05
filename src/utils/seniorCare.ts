import type { Language } from './i18n';
import type { ThemeMode } from '../types';

export type SeniorCareDestination = 'dashboard' | 'roster' | 'profile';

export interface SeniorCareScheduleInput {
  roles: string[];
  rehearsalTime: string;
  serviceTime: string;
  venue: string;
  notes?: string[];
}

export interface SeniorCareScheduleRow {
  label: string;
  value: string;
}

export interface SeniorCareDetailInput {
  serviceDate: string;
  serviceTime: string;
  rehearsalTime: string;
  venue: string;
  theme?: string;
  speaker?: string;
}

export const canShowSeniorCareRole = ({
  view,
  currentUserId,
  coworkerIds,
}: {
  view: 'mine' | 'all';
  currentUserId?: string;
  coworkerIds: string[];
}): boolean => view === 'all' || Boolean(currentUserId && coworkerIds.includes(currentUserId));

export const getSeniorCareThemeSelection = (
  themeMode: ThemeMode,
  isDarkMode: boolean,
): 'light' | 'dark' => {
  if (themeMode === 'system') return isDarkMode ? 'dark' : 'light';
  return themeMode;
};

const normalizeComparisonText = (value: string): string => value
  .toLocaleLowerCase()
  .replace(/[\s、,，/\\()（）:：·-]/g, '');

export const isRedundantServiceTheme = (theme: string, serviceName: string): boolean =>
  normalizeComparisonText(theme) === normalizeComparisonText(serviceName);

export const isRedundantDutyNote = (note: string, assigneeNames: string[]): boolean => {
  const normalizedNote = normalizeComparisonText(note);
  return assigneeNames.some((name) => {
    const normalizedName = normalizeComparisonText(name);
    const remainingTextLength = normalizedNote.length - normalizedName.length;
    return normalizedNote.startsWith(normalizedName) && remainingTextLength >= 0 && remainingTextLength <= 8;
  });
};

export const getSeniorCareDetailRows = (
  { serviceDate, serviceTime, rehearsalTime, venue, theme, speaker }: SeniorCareDetailInput,
  language: Language,
): SeniorCareScheduleRow[] => {
  const labels = language === 'zh'
    ? { date: '聚会日期', service: '聚会时间', rehearsal: '彩排时间', venue: '地点', theme: '主题', speaker: '讲员' }
    : { date: 'Service date', service: 'Service time', rehearsal: 'Rehearsal time', venue: 'Venue', theme: 'Theme', speaker: 'Speaker' };
  const rows: SeniorCareScheduleRow[] = [
    { label: labels.date, value: serviceDate },
    { label: labels.service, value: serviceTime },
    { label: labels.rehearsal, value: rehearsalTime },
    { label: labels.venue, value: venue },
  ];

  if (theme) rows.push({ label: labels.theme, value: theme });
  if (speaker) rows.push({ label: labels.speaker, value: speaker });
  return rows;
};

export const getSeniorCareNavigation = (
  language: Language,
): Array<{ id: SeniorCareDestination; label: string }> =>
  language === 'zh'
    ? [
        { id: 'dashboard', label: '首页' },
        { id: 'roster', label: '侍奉表' },
        { id: 'profile', label: '设置' },
      ]
    : [
        { id: 'dashboard', label: 'Home' },
        { id: 'roster', label: 'Roster' },
        { id: 'profile', label: 'Settings' },
      ];

export const getSeniorCareScheduleRows = (
  { roles, rehearsalTime, serviceTime, venue, notes = [] }: SeniorCareScheduleInput,
  language: Language,
): SeniorCareScheduleRow[] => {
  const labels = language === 'zh'
    ? { roles: '我的岗位', rehearsal: '集合时间', service: '聚会时间', venue: '地点', notes: '备注' }
    : { roles: 'My role', rehearsal: 'Arrival time', service: 'Service time', venue: 'Venue', notes: 'Notes' };

  const rows: SeniorCareScheduleRow[] = [
    { label: labels.roles, value: roles.join(language === 'zh' ? '、' : ', ') },
    { label: labels.rehearsal, value: rehearsalTime },
    { label: labels.service, value: serviceTime },
    { label: labels.venue, value: venue },
  ];

  const noteText = notes.filter(Boolean).join('\n');
  if (noteText) rows.push({ label: labels.notes, value: noteText });

  return rows;
};

import type { ServiceDefinition, RoleDefinition, Coworker, ServiceRoster } from '../types';
import { formatDateLabel } from './dateUtils';

export function generateWhatsAppRosterText(
  churchName: string,
  service: ServiceDefinition,
  roster: ServiceRoster | undefined,
  roles: RoleDefinition[],
  coworkers: Coworker[]
): string {
  const coworkerMap = new Map(coworkers.map((cw) => [cw.id, cw]));

  const dateFormatted = roster?.date ? formatDateLabel(roster.date) : '待定日期';

  const lines: string[] = [
    `【${churchName} · 服事表】`,
    `聚会：${service.name}`,
    `日期：${dateFormatted}`,
    `时间：${service.time}`,
    `地点：${service.venue}`,
    `彩排：${service.rehearsalTime}`,
  ];

  if (roster?.theme) {
    lines.push(`主题：${roster.theme}`);
  }

  lines.push('─────────────────');

  const categories: {
    id: 'pulpit' | 'worship' | 'media' | 'hospitality';
    title: string;
    emoji: string;
  }[] = [
    { id: 'pulpit', title: '讲台与主理', emoji: '🎙️' },
    { id: 'worship', title: '敬拜赞美团', emoji: '🎸' },
    { id: 'media', title: '影音多媒体', emoji: '🎛️' },
    { id: 'hospitality', title: '接待与关怀', emoji: '🤝' },
  ];

  for (const cat of categories) {
    if (!service.categoryIds.includes(cat.id)) continue;

    const catRoles = roles.filter((r) => r.category === cat.id);
    const roleLines: string[] = [];

    for (const role of catRoles) {
      const assignedIds = roster?.assignments?.[role.id] || [];
      const assignedNames = assignedIds
        .map((id) => {
          const cw = coworkerMap.get(id);
          return cw ? `${cw.name}${cw.englishName ? ` (${cw.englishName})` : ''}` : null;
        })
        .filter(Boolean);

      if (assignedNames.length > 0) {
        roleLines.push(`• ${role.name}：${assignedNames.join('、')}`);
      } else {
        roleLines.push(`• ${role.name}：[待定]`);
      }
    }

    if (roleLines.length > 0) {
      lines.push(`${cat.emoji} 【${cat.title}】`);
      lines.push(...roleLines);
      lines.push('');
    }
  }

  lines.push('─────────────────');
  lines.push('📌 温馨提醒：');
  lines.push(`1. 请各位服事同工准时于【${service.rehearsalTime}】到场，一同祷告预备心。`);
  lines.push('2. 若临时有突发状况需要调班，请尽早告知各组长或干事，以利协调。');
  lines.push('');
  lines.push('愿神大大恩膏并纪念各位同工忠心的服事与摆上！🙌');

  return lines.join('\n');
}

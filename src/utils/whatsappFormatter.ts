import type { ServiceDefinition, RoleDefinition, Coworker, ServiceRoster, RoleCategoryId } from '../types';
import { formatDateLabel, formatShortDate as formatRosterShortDate } from './dateUtils';

export type WhatsAppTemplateType = 'roster' | 'setlist' | 'rundown' | 'dutyChange';

export function formatShortDate(dateStr?: string): string {
  return dateStr ? formatRosterShortDate(dateStr) : '';
}

export function formatDayMonthWeekday(dateStr?: string): string {
  return dateStr ? formatDateLabel(dateStr) : '';
}

/**
 * 模板 1：侍奉表 (Roster)
 * 完全对齐教会实际发群消息的结构 (含祷告会极简版与崇拜完整版)
 */
export function generateWhatsAppRosterText(
  _churchName: string,
  service: ServiceDefinition,
  roster: ServiceRoster | undefined,
  roles: RoleDefinition[],
  coworkers: Coworker[]
): string {
  const coworkerMap = new Map(coworkers.map((cw) => [cw.id, cw]));
  const isPrayerMeeting = service.id.includes('prayer') || service.name.includes('祷告');

  const getNames = (roleId: string): string => {
    const ids = roster?.assignments?.[roleId] || [];
    return ids
      .map((id) => {
        const cw = coworkerMap.get(id);
        return cw ? cw.name : null;
      })
      .filter(Boolean)
      .join('、');
  };

  // 1. 若为实体祷告会，采用凯曰传道发群的经典极简格式
  if (isPrayerMeeting) {
    const dateLabel = formatDayMonthWeekday(roster?.date);
    const leadVocal = getNames('lead_vocal') || getNames('prayer_leader') || '凯曰传道';
    const keyboard = getNames('keyboard') || '司琴';
    const ppt = getNames('ppt') || '电脑';

    const lines: string[] = [
      `*${service.name}*`,
      `📅日期：${dateLabel}`,
      `⌚️时间：8PM`,
      `📍地点：${service.venue}`,
      '',
      `主领/吉他：${leadVocal}`,
      `司琴：${keyboard}`,
      `电脑：${ppt}`,
      '',
      '愿我们一同来到神的施恩宝座前同心守望祷告！🙏',
    ];
    return lines.join('\n');
  }

  // 2. 主日崇拜 / Fire4J 侍奉表
  const shortDate = formatShortDate(roster?.date);
  const fullDateLabel = roster?.date ? formatDateLabel(roster.date) : '待定日期';

  const lines: string[] = [
    `*${shortDate} ${service.name} 侍奉表*`,
    `📅 日期：${fullDateLabel}`,
    `📍 地点：${service.venue}`,
    `⏰ 时间：${service.time}`,
    `🎹 彩排：${service.rehearsalTime}`,
  ];

  if (roster?.theme) {
    lines.push(`📖 主题：${roster.theme}`);
  }

  if (roster?.specialEvents && roster.specialEvents.length > 0) {
    lines.push(`⚠️ 特别/服装：${roster.specialEvents.join('、')}`);
  }

  lines.push('─────────────────');

  const categories: {
    id: RoleCategoryId;
    title: string;
    emoji: string;
  }[] = [
    { id: 'pulpit', title: '讲台与主理', emoji: '🎙️' },
    { id: 'worship', title: '敬拜赞美团', emoji: '🎸' },
    { id: 'media', title: '影音多媒体', emoji: '🎛️' },
    { id: 'sundayschool', title: '主日学儿童事工', emoji: '🎨' },
    { id: 'prayer', title: '守望代祷事工', emoji: '🙏' },
    { id: 'hospitality', title: '接待与关怀', emoji: '🤝' },
  ];

  for (const cat of categories) {
    if (!service.categoryIds.includes(cat.id)) continue;

    const catRoles = roles.filter((r) => r.category === cat.id);
    const roleLines: string[] = [];

    for (const role of catRoles) {
      const assignedNames = getNames(role.id);
      if (assignedNames) {
        roleLines.push(`• ${role.name}：${assignedNames}`);
      }
    }

    if (roleLines.length > 0) {
      lines.push(`${cat.emoji} 【${cat.title}】`);
      lines.push(...roleLines);
      lines.push('');
    }
  }

  // 若录入了歌单，自动附带歌单速览与 YouTube
  if (roster?.songs && roster.songs.length > 0) {
    lines.push('─────────────────');
    lines.push('🎵 【每周敬拜赞美歌单】');
    roster.songs.forEach((song, idx) => {
      const keyStr = song.key ? ` (${song.key} Key)` : '';
      const catStr = song.category ? ` [${song.category}]` : '';
      lines.push(`${idx + 1}. ${song.title}${keyStr}${catStr}`);
      if (song.youtubeUrl) {
        lines.push(`   ${song.youtubeUrl}`);
      }
    });
    lines.push('');
  }

  lines.push('─────────────────');
  lines.push('📌 温馨提醒：');
  lines.push(`1. 请各位服侍人员准时于【${service.rehearsalTime}】到场，一同祷告预备心。`);
  lines.push('2. 若临时有突发状况需要调班，请尽早告知负责人，以利协调。');
  lines.push('');
  lines.push('愿神大大恩膏并纪念各位服侍人员忠心的摆上！🙌');

  return lines.join('\n');
}

/**
 * 模板 2：每周敬拜赞美歌单 (Setlist)
 * 完全对齐文添、凯曰、苏牧师发群的真实格式：歌名 + Key + YouTube Link
 */
export function generateWhatsAppSetlistText(
  _churchName: string,
  service: ServiceDefinition,
  roster: ServiceRoster | undefined
): string {
  const shortDate = formatShortDate(roster?.date);
  const songs = roster?.songs || [];

  if (songs.length === 0) {
    return `*${shortDate} ${service.shortName} 歌单*\n\n(目前尚未录入本周诗歌，请领诗尽快更新)`;
  }

  const lines: string[] = [
    `*${shortDate} ${service.shortName} 歌单*`,
    '',
  ];

  // 常规赞美与敬拜诗歌
  const regularSongs = songs.filter((s) => s.category !== '回应');
  const responseSongs = songs.filter((s) => s.category === '回应');

  regularSongs.forEach((song) => {
    const keyStr = song.key ? ` ${song.key} Key` : '';
    lines.push(`${song.title}${keyStr}`);
    if (song.youtubeUrl) {
      lines.push(song.youtubeUrl);
    }
    if (song.notes) {
      lines.push(`(${song.notes})`);
    }
    lines.push('');
  });

  if (responseSongs.length > 0) {
    const specialNote = roster?.specialEvents?.length
      ? ` ⚠️${roster.specialEvents.join('、')}`
      : '';
    lines.push(`*回应诗歌*${specialNote}`);
    lines.push('');
    responseSongs.forEach((song) => {
      const keyStr = song.key ? ` ${song.key} Key` : '';
      lines.push(`${song.title}${keyStr}`);
      if (song.youtubeUrl) {
        lines.push(song.youtubeUrl);
      }
      if (song.notes) {
        lines.push(`(${song.notes})`);
      }
      lines.push('');
    });
  }

  lines.push('大家这个是来临聚会的歌单，请服侍人员提前听歌练习，谢谢合作！🙌');

  return lines.join('\n');
}

/**
 * 模板 3：主日崇拜完整流程 (Rundown)
 * 完全对齐 Selena 大姐发群的真实流程与时间节点
 */
export function generateWhatsAppRundownText(
  service: ServiceDefinition,
  roster: ServiceRoster | undefined,
  coworkers: Coworker[]
): string {
  const coworkerMap = new Map(coworkers.map((cw) => [cw.id, cw]));
  const shortDate = formatShortDate(roster?.date);

  const getNames = (roleId: string, fallback = '待定'): string => {
    const ids = roster?.assignments?.[roleId] || [];
    const names = ids
      .map((id) => coworkerMap.get(id)?.name)
      .filter(Boolean)
      .join(' ');
    return names || fallback;
  };

  const leadVocal = getNames('lead_vocal', '秋仪 文添');
  const speaker = roster?.speaker || getNames('speaker', '黄牧师');
  const announcements = getNames('announcements', 'Selena');
  const prayerLeader = getNames('prayer_leader', '凯曰传道');

  const isHolyCommunion = roster?.specialEvents?.some((e) => e.includes('圣餐')) ?? false;

  const lines: string[] = [
    `*${shortDate} ${service.name} 流程*`,
    '',
    '9:15 am 集合祷告 （服侍人员）',
    `领诗：${leadVocal}`,
    `领祷告：${prayerLeader}`,
    '',
    '9:30 am 预备聚会 （各岗位预备）',
    '',
    '10:25 am 彼此祷告',
    '',
    '10:30 am 会前祷告（会众）',
    `领祷告：${prayerLeader}`,
    '',
    '10:40 am 敬拜赞美',
    `领诗：${leadVocal}`,
  ];

  if (isHolyCommunion) {
    lines.push(`圣餐：${speaker}`);
  }
  lines.push(`报告＆奉献：${speaker}`);
  lines.push('');
  lines.push('11:10 am 信息分享');
  lines.push(`讲员：${speaker}`);
  lines.push('');
  lines.push('12:20 pm 报告');
  lines.push(`报告员：${announcements}`);
  lines.push('');
  lines.push('12:30 pm 聚会结束');
  lines.push('主祷文：全体会众');

  return lines.join('\n');
}

export interface DutyChangeInfo {
  date: string;
  serviceName: string;
  roleName: string;
  previousCoworkerName?: string;
  newCoworkerName: string;
  leaderName?: string;
  reason?: string;
}

/**
 * 模板 4：服侍人员异动 / 调班通知（发领诗或群聊）
 */
export function generateWhatsAppDutyChangeText(info: DutyChangeInfo): string {
  const shortDate = formatShortDate(info.date);
  const lines: string[] = [
    `*【CCCJB 服侍人员异动通知】*`,
    info.leaderName ? `平安 ${info.leaderName}，` : '各位服侍人员平安，',
    '',
    `📅 聚会：${shortDate} ${info.serviceName}`,
    `🎸 岗位：*${info.roleName}*`,
  ];

  if (info.previousCoworkerName && info.previousCoworkerName !== info.newCoworkerName) {
    lines.push(`👤 原定：${info.previousCoworkerName}`);
  }
  lines.push(`🔄 现变更为：*${info.newCoworkerName}*`);

  if (info.reason) {
    lines.push(`📝 说明：${info.reason}`);
  }

  lines.push('');
  lines.push('特此通知领诗与团队留意配搭，谢谢！🙌');
  return lines.join('\n');
}

/**
 * 构建 WhatsApp 唤起链接（若有手机号直接指向联系人，无则打开通用分享）
 */
export function getWhatsAppShareUrl(text: string, phone?: string): string {
  const encodedText = encodeURIComponent(text);
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('60')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? `60${cleanPhone.slice(1)}`
      : cleanPhone;
    if (fullPhone.length >= 8) {
      return `https://wa.me/${fullPhone}?text=${encodedText}`;
    }
  }
  return `https://wa.me/?text=${encodedText}`;
}

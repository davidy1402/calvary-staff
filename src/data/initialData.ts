import type { ChurchState, ServiceDefinition, RoleDefinition, Coworker } from '../types';

export const INITIAL_SERVICES: ServiceDefinition[] = [
  {
    id: 'sun_mandarin',
    name: '主日华语崇拜',
    shortName: '主日华语',
    weekday: 7, // Sunday
    time: '8:30 AM / 11:00 AM',
    rehearsalTime: '7:45 AM 彩排调音',
    venue: '主堂 Main Sanctuary',
    categoryIds: ['pulpit', 'worship', 'media', 'hospitality'],
  },
  {
    id: 'sun_english',
    name: '主日英语崇拜 (English Service)',
    shortName: '主日英语',
    weekday: 7, // Sunday
    time: '11:00 AM',
    rehearsalTime: '10:00 AM Rehearsal',
    venue: '副堂 Grace Hall',
    categoryIds: ['pulpit', 'worship', 'media', 'hospitality'],
  },
  {
    id: 'sat_youth',
    name: '青年崇拜 (Ignite Youth)',
    shortName: '青年崇拜',
    weekday: 6, // Saturday
    time: '7:30 PM',
    rehearsalTime: '6:15 PM 彩排调音',
    venue: '青年中心 Youth Center',
    categoryIds: ['pulpit', 'worship', 'media', 'hospitality'],
  },
  {
    id: 'wed_prayer',
    name: '全教会守望祷告会',
    shortName: '守望祷告会',
    weekday: 3, // Wednesday
    time: '8:00 PM',
    rehearsalTime: '7:30 PM 预备',
    venue: '祷告厅 Prayer Hall',
    categoryIds: ['pulpit', 'worship', 'media'],
  },
];

export const INITIAL_ROLES: RoleDefinition[] = [
  // 讲台与主理
  { id: 'presider', name: '主席 / 司会', shortName: '主席', category: 'pulpit', description: '主持聚会流程与家事报告' },
  { id: 'speaker', name: '当周讲员', shortName: '讲员', category: 'pulpit', description: '传讲信息' },
  { id: 'scripture', name: '读经 / 公祷', shortName: '读经公祷', category: 'pulpit', description: '带领读经与代祷' },

  // 敬拜赞美团
  { id: 'worship_leader', name: '敬拜主领', shortName: '主领', category: 'worship', description: '选歌与主导赞美流程' },
  { id: 'keyboard', name: '键盘 / 司琴', shortName: '键盘', category: 'worship', description: '和弦伴奏与过渡' },
  { id: 'acoustic_guitar', name: '木吉他', shortName: '木吉他', category: 'worship', description: '节奏与弹唱' },
  { id: 'bass', name: '贝斯', shortName: '贝斯', category: 'worship', description: '低音铺底与律动' },
  { id: 'drums', name: '爵士鼓', shortName: '爵士鼓', category: 'worship', description: '节奏主干' },
  { id: 'vocals', name: '伴唱同工', shortName: '伴唱', category: 'worship', description: '二部和音与配唱' },

  // 影音多媒体
  { id: 'sound_pa', name: '音响调音 (PA)', shortName: '音响PA', category: 'media', description: '调音台混音与麦克风监听' },
  { id: 'ppt_lyrics', name: '投影 / 歌词 PPT', shortName: '电脑投影', category: 'media', description: '主控诗歌与讲道投影片' },
  { id: 'livestream', name: '现场导播 / 摄像', shortName: '导播摄像', category: 'media', description: '线上直播推流与机位切换' },
  { id: 'lighting', name: '灯光操控', shortName: '灯光', category: 'media', description: '现场气氛与聚会灯光模式' },

  // 接待与关怀
  { id: 'chief_usher', name: '招待队长', shortName: '招待长', category: 'hospitality', description: '统筹招待动线与突发状况' },
  { id: 'greeter', name: '大门迎宾', shortName: '迎宾', category: 'hospitality', description: '派发周报与引导新朋友' },
  { id: 'offering', name: '奉献点数', shortName: '奉献', category: 'hospitality', description: '收取并点收奉献' },
];

export const INITIAL_COWORKERS: Coworker[] = [
  {
    id: 'cw_01',
    name: '杨家维',
    englishName: 'David Yong',
    phone: '012-7654321',
    cellGroup: '青年牧区 Ignite',
    qualifiedRoleIds: ['acoustic_guitar', 'sound_pa', 'worship_leader', 'ppt_lyrics'],
    active: true,
  },
  {
    id: 'cw_02',
    name: '黄志强',
    englishName: 'Pastor Jason Wong',
    phone: '016-8889911',
    cellGroup: '教牧同工团',
    qualifiedRoleIds: ['speaker', 'presider'],
    active: true,
  },
  {
    id: 'cw_03',
    name: '陈美玲',
    englishName: 'Mary Tan',
    phone: '012-3456789',
    cellGroup: '大卫牧区',
    qualifiedRoleIds: ['presider', 'scripture', 'chief_usher'],
    active: true,
  },
  {
    id: 'cw_04',
    name: '林建明',
    englishName: 'Ken Lim',
    phone: '017-2233445',
    cellGroup: '约书亚牧区',
    qualifiedRoleIds: ['worship_leader', 'acoustic_guitar', 'vocals'],
    active: true,
  },
  {
    id: 'cw_05',
    name: '张雅歌',
    englishName: 'Grace Teo',
    phone: '019-3344556',
    cellGroup: '大卫牧区',
    qualifiedRoleIds: ['keyboard', 'vocals'],
    active: true,
  },
  {
    id: 'cw_06',
    name: '李伟杰',
    englishName: 'Victor Lee',
    phone: '018-9988776',
    cellGroup: '青年牧区 Ignite',
    qualifiedRoleIds: ['drums', 'bass', 'sound_pa'],
    active: true,
  },
  {
    id: 'cw_07',
    name: '王恩惠',
    englishName: 'Esther Ong',
    phone: '016-5544332',
    cellGroup: '保罗牧区',
    qualifiedRoleIds: ['ppt_lyrics', 'livestream', 'lighting'],
    active: true,
  },
  {
    id: 'cw_08',
    name: '郭耀辉',
    englishName: 'Dennis Kok',
    phone: '011-22334455',
    cellGroup: '青年牧区 Ignite',
    qualifiedRoleIds: ['bass', 'electric_guitar'],
    active: true,
  },
  {
    id: 'cw_09',
    name: '许欣怡',
    englishName: 'Sherry Koh',
    phone: '014-7766554',
    cellGroup: '约书亚牧区',
    qualifiedRoleIds: ['greeter', 'offering', 'chief_usher'],
    active: true,
  },
  {
    id: 'cw_10',
    name: '曾锦泉',
    englishName: 'Kenneth Chang',
    phone: '012-6655443',
    cellGroup: '约书亚牧区',
    qualifiedRoleIds: ['livestream', 'sound_pa'],
    active: true,
  },
  {
    id: 'cw_11',
    name: '刘秀芬',
    englishName: 'Sister Sharon Low',
    phone: '016-1122334',
    cellGroup: '保罗牧区',
    qualifiedRoleIds: ['greeter', 'offering'],
    active: true,
  },
  {
    id: 'cw_12',
    name: '郑子豪',
    englishName: 'Lucas Tee',
    phone: '017-8899001',
    cellGroup: '青年牧区 Ignite',
    qualifiedRoleIds: ['drums', 'ppt_lyrics'],
    active: true,
  },
];

export const INITIAL_STATE: ChurchState = {
  churchName: '新山加略山社区教会',
  shortName: '加略山同工',
  services: INITIAL_SERVICES,
  roles: INITIAL_ROLES,
  coworkers: INITIAL_COWORKERS,
  rosters: {},
};

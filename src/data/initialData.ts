import type { ChurchState, ServiceDefinition, RoleDefinition, Coworker, ServiceRoster } from '../types';

export const INITIAL_SERVICES: ServiceDefinition[] = [
  {
    id: 'sun_mandarin',
    name: '主日华语崇拜',
    shortName: '主日华语',
    weekday: 7, // Sunday
    time: '8:30 AM / 11:00 AM',
    rehearsalTime: '7:45 AM 彩排调音',
    venue: '主堂 Main Sanctuary',
    categoryIds: ['worship', 'media', 'pulpit', 'sundayschool', 'prayer', 'hospitality'],
  },
  {
    id: 'sat_youth',
    name: 'Fire4J 青年崇拜',
    shortName: 'Fire4J',
    weekday: 6, // Saturday
    time: '7:30 PM',
    rehearsalTime: '6:15 PM 彩排调音',
    venue: '青年中心 Youth Center',
    categoryIds: ['worship', 'media', 'pulpit', 'hospitality'],
  },
  {
    id: 'sun_english',
    name: '主日英语崇拜 (English Service)',
    shortName: '主日英语',
    weekday: 7, // Sunday
    time: '11:00 AM',
    rehearsalTime: '10:00 AM Rehearsal',
    venue: '副堂 Grace Hall',
    categoryIds: ['worship', 'media', 'pulpit', 'hospitality'],
  },
  {
    id: 'wed_prayer',
    name: '全教会守望祷告会',
    shortName: '守望祷告会',
    weekday: 3, // Wednesday
    time: '8:00 PM',
    rehearsalTime: '7:30 PM 预备',
    venue: '祷告厅 Prayer Hall',
    categoryIds: ['prayer', 'worship', 'media'],
  },
];

export const INITIAL_ROLES: RoleDefinition[] = [
  // 敬拜赞美团 (对齐教会真实服事表)
  { id: 'lead_vocal', name: '领唱', shortName: '领唱', category: 'worship', description: '带领会众进入敬拜赞美' },
  { id: 'backing_vocal', name: '伴唱', shortName: '伴唱', category: 'worship', description: '和声与配唱' },
  { id: 'keyboard', name: '琴 (司琴)', shortName: '琴', category: 'worship', description: '和弦伴奏与音乐过渡' },
  { id: 'guitar', name: '吉他', shortName: '吉他', category: 'worship', description: '木吉他 / 电吉他弹奏' },
  { id: 'bass', name: '贝司', shortName: '贝司', category: 'worship', description: '低音节拍与铺底' },
  { id: 'drums', name: '鼓 (爵士鼓)', shortName: '鼓', category: 'worship', description: '律动主干' },
  { id: 'tambourine', name: '铃 (铃鼓)', shortName: '铃', category: 'worship', description: '节奏点缀与节拍辅助' },

  // 影音多媒体 (对齐教会真实影音表)
  { id: 'director', name: 'DIRECTOR 总监', shortName: '总监', category: 'media', description: '影音流程与现场协调' },
  { id: 'sound_pa', name: 'PA 音响', shortName: 'PA', category: 'media', description: '调音台混音与麦克风控制' },
  { id: 'ppt', name: 'PPT 电脑', shortName: 'PPT', category: 'media', description: '放歌词与讲道投影片' },
  { id: 'obs', name: 'OBS 直播', shortName: 'OBS', category: 'media', description: '现场直播推流' },
  { id: 'camera', name: 'CAM 拍摄', shortName: 'CAM', category: 'media', description: '现场摄像机位掌控' },
  { id: 'lighting', name: '灯光', shortName: '灯光', category: 'media', description: '现场聚会灯光模式' },

  // 讲台与报告
  { id: 'speaker', name: '讲员', shortName: '讲员', category: 'pulpit', description: '传讲信息' },
  { id: 'presider', name: '主席 / 司会', shortName: '主席', category: 'pulpit', description: '主持聚会' },
  { id: 'announcements', name: '家事报告', shortName: '家事报告', category: 'pulpit', description: '家事报告与代祷' },
  { id: 'scripture', name: '读经', shortName: '读经', category: 'pulpit', description: '带领读经' },

  // 主日学
  { id: 'sunday_school_leader', name: '主日学主教', shortName: '主教', category: 'sundayschool', description: '儿童崇拜与圣经真理授课' },
  { id: 'sunday_school_helper', name: '主日学助教', shortName: '助教', category: 'sundayschool', description: '协助手作与看护儿童安全' },

  // 守望代祷
  { id: 'prayer_leader', name: '聚会前祷告', shortName: '聚前祷告', category: 'prayer', description: '聚会前同工同心代祷' },
  { id: 'intercessor', name: '守望代祷', shortName: '守望代祷', category: 'prayer', description: '为聚会专注代祷' },

  // 接待与关怀
  { id: 'chief_usher', name: '招待长', shortName: '招待长', category: 'hospitality', description: '动线指引与聚会关怀' },
  { id: 'greeter', name: '大门迎宾', shortName: '迎宾', category: 'hospitality', description: '派发周报与引导会友' },
  { id: 'offering', name: '奉献点数', shortName: '奉献', category: 'hospitality', description: '收取与核点奉献' },
];

export const INITIAL_COWORKERS: Coworker[] = [
  // 教会牧者与长辈同工
  { id: 'cw_kaiyue', name: '凯曰', englishName: 'Pastor Kai Yue', phone: '016-8889911', cellGroup: '教牧同工', qualifiedRoleIds: ['director', 'speaker', 'presider'], active: true },
  { id: 'cw_wensen', name: '文森', englishName: 'Vincent', phone: '016-1122334', cellGroup: '教牧同工', qualifiedRoleIds: ['director', 'sound_pa'], active: true },

  // 核心家庭与服事团队
  { id: 'cw_selena', name: 'Selena', englishName: 'Selena Yong', phone: '012-9988112', cellGroup: '青年社青', qualifiedRoleIds: ['backing_vocal', 'tambourine', 'lead_vocal', 'sunday_school_leader'], active: true },
  { id: 'cw_yongyi', name: '永益', englishName: 'Yong Yi', phone: '016-7788990', cellGroup: '约书亚', qualifiedRoleIds: ['keyboard', 'lead_vocal', 'prayer_leader', 'chief_usher'], active: true },
  { id: 'cw_diana', name: 'Diana', englishName: 'Diana Yong', phone: '017-3322110', cellGroup: 'Fire4J', qualifiedRoleIds: ['ppt', 'sound_pa', 'greeter', 'offering'], active: true },
  { id: 'cw_zongyan', name: '宗晏', englishName: 'Zong Yan', phone: '018-4455667', cellGroup: 'Fire4J', qualifiedRoleIds: ['drums', 'bass', 'camera'], active: true },
  { id: 'cw_david', name: '杨家维', englishName: 'David Yong', phone: '012-7654321', cellGroup: 'Fire4J', qualifiedRoleIds: ['guitar', 'sound_pa', 'presider', 'announcements'], active: true },

  // 敬拜团服事人员 (来自真实服事表)
  { id: 'cw_qiuyi', name: '秋仪', englishName: '', phone: '', cellGroup: '敬拜团', qualifiedRoleIds: ['lead_vocal'], active: true },
  { id: 'cw_wentian', name: '文添', englishName: '', phone: '', cellGroup: '敬拜团', qualifiedRoleIds: ['lead_vocal', 'keyboard'], active: true },
  { id: 'cw_yunqing', name: '云青', englishName: '', phone: '', cellGroup: '敬拜团', qualifiedRoleIds: ['backing_vocal'], active: true },
  { id: 'cw_baozhen', name: '宝贞', englishName: '', phone: '', cellGroup: '敬拜团', qualifiedRoleIds: ['lead_vocal'], active: true },
  { id: 'cw_youxiang', name: '有祥', englishName: '', phone: '', cellGroup: '敬拜团 / AV', qualifiedRoleIds: ['lead_vocal', 'camera'], active: true },
  { id: 'cw_wenhui', name: '雯慧', englishName: '', phone: '', cellGroup: '敬拜团 / AV', qualifiedRoleIds: ['backing_vocal', 'ppt'], active: true },
  { id: 'cw_liping', name: '丽萍', englishName: '', phone: '', cellGroup: '敬拜团', qualifiedRoleIds: ['backing_vocal', 'tambourine'], active: true },
  { id: 'cw_qiaoen', name: '巧恩', englishName: '', phone: '', cellGroup: '敬拜团', qualifiedRoleIds: ['keyboard', 'lead_vocal'], active: true },
  { id: 'cw_boo', name: 'Boo', englishName: '', phone: '', cellGroup: '敬拜团', qualifiedRoleIds: ['bass', 'guitar', 'lead_vocal'], active: true },
  { id: 'cw_jinlai', name: '锦来', englishName: '', phone: '', cellGroup: '敬拜团', qualifiedRoleIds: ['drums', 'bass'], active: true },
  { id: 'cw_yongwei', name: '永伟', englishName: '', phone: '', cellGroup: '敬拜团', qualifiedRoleIds: ['drums'], active: true },
  { id: 'cw_winnie', name: 'Winnie', englishName: '', phone: '', cellGroup: '敬拜团', qualifiedRoleIds: ['backing_vocal', 'tambourine'], active: true },
  { id: 'cw_baohui', name: '保辉', englishName: '', phone: '', cellGroup: '敬拜团', qualifiedRoleIds: ['backing_vocal'], active: true },
  { id: 'cw_meifang', name: '梅芳', englishName: '', phone: '', cellGroup: '敬拜团', qualifiedRoleIds: ['lead_vocal'], active: true },

  // 影音多媒体服事人员 (来自真实影音表)
  { id: 'cw_josh', name: 'Josh', englishName: 'Josh', phone: '', cellGroup: '影音组', qualifiedRoleIds: ['sound_pa'], active: true },
  { id: 'cw_leelian', name: 'LEELIAN', englishName: 'Leelian', phone: '', cellGroup: '影音组', qualifiedRoleIds: ['ppt'], active: true },
  { id: 'cw_elleyna', name: 'ELLEYNA', englishName: 'Elleyna', phone: '', cellGroup: '影音组', qualifiedRoleIds: ['ppt'], active: true },
  { id: 'cw_samuel', name: 'SAMUEL', englishName: 'Samuel', phone: '', cellGroup: '影音组', qualifiedRoleIds: ['obs'], active: true },
  { id: 'cw_qihong', name: '启鸿', englishName: 'Qi Hong', phone: '', cellGroup: '影音组', qualifiedRoleIds: ['obs'], active: true },
  { id: 'cw_jiayi', name: '家毅', englishName: 'Jia Yi', phone: '', cellGroup: '影音组', qualifiedRoleIds: ['camera'], active: true },
];

export const INITIAL_ROSTERS: Record<string, ServiceRoster> = {
  // 2026年 10月4日 (第一周)
  '2026-10-04_sun_mandarin': {
    id: '2026-10-04_sun_mandarin',
    serviceId: 'sun_mandarin',
    date: '2026-10-04',
    theme: '敬牧月',
    specialEvents: ['服装要求: 白黑'],
    speaker: '凯曰',
    songs: [
      { id: 's1', title: '献上感恩', key: 'G', category: '快歌' },
      { id: 's2', title: '十字架的传人', key: 'A', category: '慢歌' },
      { id: 's3', title: '一生一世', key: 'C', category: '回应' },
    ],
    assignments: {
      lead_vocal: ['cw_qiuyi', 'cw_wentian'],
      backing_vocal: ['cw_yunqing', 'cw_selena'],
      keyboard: ['cw_yongyi'],
      bass: ['cw_boo'],
      drums: ['cw_jinlai'],
      tambourine: ['cw_liping'],
      director: ['cw_wensen', 'cw_kaiyue'],
      sound_pa: ['cw_wensen'],
      ppt: ['cw_leelian'],
      obs: ['cw_samuel'],
      camera: ['cw_jiayi'],
      speaker: ['cw_kaiyue'],
      presider: ['cw_david'],
      announcements: ['cw_david'],
      sunday_school_leader: ['cw_selena'], // Selena 撞期: 伴唱 + 主日学
      prayer_leader: ['cw_yongyi'], // 永益 撞期: 琴 + 祷告
      greeter: ['cw_diana'],
      offering: ['cw_diana'],
    },
    dutyNotes: {
      lead_vocal: '领诗注意！提前更新歌单，前一周发群',
      keyboard: '7:45 AM 调音准时就绪',
    },
    updatedAt: '2026-10-03T12:00:00.000Z',
  },

  // 2026年 10月11日 (第二周)
  '2026-10-11_sun_mandarin': {
    id: '2026-10-11_sun_mandarin',
    serviceId: 'sun_mandarin',
    date: '2026-10-11',
    theme: '敬牧月',
    specialEvents: ['服装要求: 黑白'],
    speaker: '讲员',
    songs: [
      { id: 's11', title: '满有能力', key: 'C', category: '快歌' },
      { id: 's12', title: '祢是配得', key: 'G', category: '慢歌' },
      { id: 's13', title: '活出爱', key: 'F', category: '回应' },
    ],
    assignments: {
      lead_vocal: ['cw_baozhen', 'cw_youxiang'],
      backing_vocal: ['cw_wenhui', 'cw_liping'],
      keyboard: ['cw_qiaoen'],
      bass: ['cw_boo'],
      drums: ['cw_yongwei'],
      tambourine: ['cw_selena'],
      director: ['cw_wensen', 'cw_kaiyue'],
      sound_pa: ['cw_josh'],
      ppt: ['cw_elleyna'],
      obs: ['cw_qihong'],
      camera: ['cw_youxiang'], // 有祥 撞期: 领唱 + CAM拍摄
    },
    dutyNotes: {
      tambourine: '提早 15 分钟配合鼓手对节拍',
    },
    updatedAt: '2026-10-03T12:00:00.000Z',
  },

  // 2026年 10月18日 (第三周)
  '2026-10-18_sun_mandarin': {
    id: '2026-10-18_sun_mandarin',
    serviceId: 'sun_mandarin',
    date: '2026-10-18',
    theme: '敬牧月',
    specialEvents: ['服装要求: 全黑'],
    songs: [
      { id: 's21', title: '喜乐泉源', key: 'D', category: '快歌' },
      { id: 's22', title: '恩典之路', key: 'G', category: '慢歌' },
      { id: 's23', title: '因祢爱的大能', key: 'G', category: '回应' },
    ],
    assignments: {
      lead_vocal: ['cw_boo', 'cw_yongyi'],
      backing_vocal: ['cw_winnie', 'cw_baohui'],
      keyboard: ['cw_wentian'],
      guitar: ['cw_boo'],
      bass: ['cw_jinlai'],
      drums: ['cw_zongyan'],
      tambourine: ['cw_liping'],
      director: ['cw_wensen', 'cw_kaiyue'],
      sound_pa: ['cw_wensen'],
      ppt: ['cw_wenhui'],
      obs: ['cw_samuel'],
      camera: ['cw_jiayi'],
    },
    updatedAt: '2026-10-03T12:00:00.000Z',
  },

  // 2026年 10月25日 (第四周)
  '2026-10-25_sun_mandarin': {
    id: '2026-10-25_sun_mandarin',
    serviceId: 'sun_mandarin',
    date: '2026-10-25',
    theme: '敬牧月',
    specialEvents: ['服装要求: 蓝白'],
    songs: [
      { id: 's31', title: '耶和华行了大事', key: 'C', category: '快歌' },
      { id: 's32', title: '这是圣洁之地', key: 'F', category: '慢歌' },
      { id: 's33', title: '主我敬拜祢', key: 'E', category: '回应' },
    ],
    assignments: {
      lead_vocal: ['cw_meifang', 'cw_qiaoen'],
      backing_vocal: ['cw_baohui', 'cw_yunqing'],
      keyboard: ['cw_yongyi'],
      guitar: ['cw_boo'],
      bass: ['cw_jinlai'],
      drums: ['cw_zongyan'],
      tambourine: ['cw_winnie'],
      director: ['cw_wensen', 'cw_kaiyue'],
      sound_pa: ['cw_josh'],
      ppt: ['cw_leelian'],
      obs: ['cw_qihong'],
      camera: ['cw_youxiang'],
    },
    updatedAt: '2026-10-03T12:00:00.000Z',
  },

  // Fire4J 青年崇拜
  '2026-10-03_sat_youth': {
    id: '2026-10-03_sat_youth',
    serviceId: 'sat_youth',
    date: '2026-10-03',
    theme: 'Fire4J: 全心赞美',
    songs: [
      { id: 'sy1', title: '开双眼 (Open Eyes)', key: 'E', category: '快歌' },
      { id: 'sy2', title: '一千个理由 (10,000 Reasons)', key: 'G', category: '慢歌' },
      { id: 'sy3', title: '全心全意', key: 'D', category: '回应' },
    ],
    assignments: {
      lead_vocal: ['cw_david'],
      guitar: ['cw_david'],
      bass: ['cw_zongyan'],
      drums: ['cw_zongyan'],
      sound_pa: ['cw_diana'],
      ppt: ['cw_diana'],
    },
    updatedAt: '2026-10-03T12:00:00.000Z',
  },
};

export const INITIAL_STATE: ChurchState = {
  churchName: '新山加略山社区教会',
  shortName: 'CCCJB',
  services: INITIAL_SERVICES,
  roles: INITIAL_ROLES,
  coworkers: INITIAL_COWORKERS,
  rosters: INITIAL_ROSTERS,
};

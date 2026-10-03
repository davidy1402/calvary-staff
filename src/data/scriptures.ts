export interface ScriptureItem {
  id: string;
  bookZh: string;
  chapterVerseZh: string;
  versionZh: string;
  textZh: string;
  highlightZh: string;
  reflectionZh: string;

  bookEn: string;
  chapterVerseEn: string;
  versionEn: string;
  textEn: string;
  highlightEn: string;
  reflectionEn: string;

  themeKey: 'core' | 'perseverance' | 'stewardship' | 'faithfulness' | 'unity' | 'love' | 'fervor';
  themeZh: string;
  themeEn: string;
}

export const SERVING_SCRIPTURES: ScriptureItem[] = [
  {
    id: 'col-3-23',
    bookZh: '歌罗西书',
    chapterVerseZh: '3:23–24',
    versionZh: '和合本',
    textZh: '无论做什么，都要从心里做，像是给主做的，不是给人做的。',
    highlightZh: '从心里做，像是给主做的',
    reflectionZh: '今天的服事中，我是在完成一项任务，还是在忠心地献上自己所做的事？',

    bookEn: 'Colossians',
    chapterVerseEn: '3:23–24',
    versionEn: 'NIV',
    textEn: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.',
    highlightEn: 'Work with all your heart for the Lord',
    reflectionEn: 'In my service today, am I merely checking off a task, or faithfully dedicating my work to the Lord?',

    themeKey: 'core',
    themeZh: '服事的核心',
    themeEn: 'Heart of Service',
  },
  {
    id: '1cor-15-58',
    bookZh: '哥林多前书',
    chapterVerseZh: '15:58',
    versionZh: '和合本',
    textZh: '你们务要坚固，不可摇动，常常竭力多做主工；因为知道，你们的劳苦，在主里面不是徒然的。',
    highlightZh: '在主里面的劳苦不是徒然的',
    reflectionZh: '服事难免疲倦、遇到挫折甚至不被看见；请记得主知道你的付出，主里的劳苦绝不徒然。',

    bookEn: '1 Corinthians',
    chapterVerseEn: '15:58',
    versionEn: 'NIV',
    textEn: 'Always give yourselves fully to the work of the Lord, because you know that your labor in the Lord is not in vain.',
    highlightEn: 'Labor in the Lord is not in vain',
    reflectionEn: 'Serving can bring fatigue and unseen efforts; remember that the Lord honors every quiet, faithful sacrifice.',

    themeKey: 'perseverance',
    themeZh: '坚持不放弃',
    themeEn: 'Perseverance in Ministry',
  },
  {
    id: '1pet-4-10',
    bookZh: '彼得前书',
    chapterVerseZh: '4:10',
    versionZh: '和合本',
    textZh: '各人要照所得的恩赐彼此服事，作神百般恩赐的好管家。',
    highlightZh: '按恩赐彼此服事，作好管家',
    reflectionZh: '每个人的恩赐与岗位不同，无需攀比；今天我如何用神赐我的一份，成为身边同工的祝福？',

    bookEn: '1 Peter',
    chapterVerseEn: '4:10',
    versionEn: 'NIV',
    textEn: 'Each of you should use whatever gift you have received to serve others, as faithful stewards of God’s grace.',
    highlightEn: 'Faithful stewards of God’s grace',
    reflectionEn: 'Gifts differ without comparison; how can I use what God has entrusted to me to lift and bless others today?',

    themeKey: 'stewardship',
    themeZh: '恩赐与好管家',
    themeEn: 'Stewards of Gifts',
  },
  {
    id: '1cor-4-2',
    bookZh: '哥林多前书',
    chapterVerseZh: '4:2',
    versionZh: '和合本',
    textZh: '所求于管家的，是要他有忠心。',
    highlightZh: '所求于管家的，是要他有忠心',
    reflectionZh: '不论是在前台显眼处，还是在幕后做音响、投影、灯光或接待，神看重的是我们在小事上的忠心。',

    bookEn: '1 Corinthians',
    chapterVerseEn: '4:2',
    versionEn: 'NIV',
    textEn: 'Now it is required that those who have been given a trust must prove faithful.',
    highlightEn: 'Must prove faithful in trust',
    reflectionEn: 'Whether on stage or behind the scenes in PA, slides, or welcoming, what God treasures is quiet faithfulness.',

    themeKey: 'faithfulness',
    themeZh: '忠心与托付',
    themeEn: 'Faithfulness & Trust',
  },
  {
    id: 'eph-4-16',
    bookZh: '以弗所书',
    chapterVerseZh: '4:16',
    versionZh: '和合本',
    textZh: '全身都靠他联络得合式，百节各按各职，照着各体的功用彼此相助，便叫身体渐渐增长，在爱中建立自己。',
    highlightZh: '百节各按各职，在爱中建立自己',
    reflectionZh: '教会的事工不是单打独斗，而是肢体互相扶持；今天我如何主动去配搭和鼓励其他事工部门？',

    bookEn: 'Ephesians',
    chapterVerseEn: '4:16',
    versionEn: 'NIV',
    textEn: 'Joined and held together by every supporting ligament, grows and builds itself up in love, as each part does its work.',
    highlightEn: 'Each part does its work in love',
    reflectionEn: 'Ministry is never a solo endeavor; how can I actively support, communicate, and build up fellow teams today?',

    themeKey: 'unity',
    themeZh: '肢体相助与合一',
    themeEn: 'Unity & Coordination',
  },
  {
    id: 'gal-5-13',
    bookZh: '加拉太书',
    chapterVerseZh: '5:13',
    versionZh: '和合本',
    textZh: '总要用爱心互相服事。',
    highlightZh: '总要用爱心互相服事',
    reflectionZh: '事工办得好很要紧，但爱身旁一起服事的弟兄姐妹更要紧；今天多给同工一句温暖的肯定吧。',

    bookEn: 'Galatians',
    chapterVerseEn: '5:13',
    versionEn: 'NIV',
    textEn: 'Serve one another humbly in love.',
    highlightEn: 'Serve one another in love',
    reflectionEn: 'Carrying out the duty matters, but cherishing the people we serve alongside matters most of all.',

    themeKey: 'love',
    themeZh: '爱心互相服事',
    themeEn: 'Serving in Love',
  },
  {
    id: 'rom-12-11',
    bookZh: '罗马书',
    chapterVerseZh: '12:11',
    versionZh: '和合本',
    textZh: '殷勤不可懒惰。要心里火热，常常服事主。',
    highlightZh: '心里火热，常常服事主',
    reflectionZh: '让火热不依靠一时的热血或情绪，而是每天从主的话语里支取源源不断的新鲜力量。',

    bookEn: 'Romans',
    chapterVerseEn: '12:11',
    versionEn: 'NIV',
    textEn: 'Never be lacking in zeal, but keep your spiritual fervor, serving the Lord.',
    highlightEn: 'Keep your spiritual fervor',
    reflectionEn: 'Let our fervor draw from daily fellowship with Christ rather than human adrenaline.',

    themeKey: 'fervor',
    themeZh: '心里火热服事',
    themeEn: 'Spiritual Fervor',
  },
];

/**
 * Returns today's verse deterministically based on date (day of year)
 */
export function getDailyVerse(date: Date = new Date()): ScriptureItem {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = Math.abs(dayOfYear) % SERVING_SCRIPTURES.length;
  return SERVING_SCRIPTURES[index];
}

/**
 * Returns a specific verse by index or cyclic offset
 */
export function getVerseByIndex(index: number): ScriptureItem {
  const normalizedIndex = ((index % SERVING_SCRIPTURES.length) + SERVING_SCRIPTURES.length) % SERVING_SCRIPTURES.length;
  return SERVING_SCRIPTURES[normalizedIndex];
}

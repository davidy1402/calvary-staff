export interface ScriptureItem {
  id: string;
  bookZh: string;
  chapterVerseZh: string;
  textZh: string;
  bookEn: string;
  chapterVerseEn: string;
  textEn: string;
}

export const SERVING_SCRIPTURES: ScriptureItem[] = [
  {
    id: 'col-3-23',
    bookZh: '歌罗西书',
    chapterVerseZh: '3:23',
    textZh: '无论做什么，都要从心里做，像是给主做的，不是给人做的。',
    bookEn: 'Colossians',
    chapterVerseEn: '3:23',
    textEn: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.',
  },
  {
    id: '1cor-15-58',
    bookZh: '哥林多前书',
    chapterVerseZh: '15:58',
    textZh: '务要坚固，不可摇动，常常竭力多做主工；因为知道，你们的劳苦在主里面不是徒然的。',
    bookEn: '1 Corinthians',
    chapterVerseEn: '15:58',
    textEn: 'Always give yourselves fully to the work of the Lord, because you know that your labor in the Lord is not in vain.',
  },
  {
    id: '1pet-4-10',
    bookZh: '彼得前书',
    chapterVerseZh: '4:10',
    textZh: '各人要照所得的恩赐彼此服事，作神百般恩赐的好管家。',
    bookEn: '1 Peter',
    chapterVerseEn: '4:10',
    textEn: 'Each of you should use whatever gift you have received to serve others, as faithful stewards of God’s grace.',
  },
  {
    id: '1cor-4-2',
    bookZh: '哥林多前书',
    chapterVerseZh: '4:2',
    textZh: '所求于管家的，是要他有忠心。',
    bookEn: '1 Corinthians',
    chapterVerseEn: '4:2',
    textEn: 'Now it is required that those who have been given a trust must prove faithful.',
  },
  {
    id: 'eph-4-16',
    bookZh: '以弗所书',
    chapterVerseZh: '4:16',
    textZh: '全身都靠他联络得合式，百节各按各职，照着各体的功用彼此相助，在爱中建立自己。',
    bookEn: 'Ephesians',
    chapterVerseEn: '4:16',
    textEn: 'Joined and held together by every supporting ligament, grows and builds itself up in love, as each part does its work.',
  },
  {
    id: 'gal-5-13',
    bookZh: '加拉太书',
    chapterVerseZh: '5:13',
    textZh: '总要用爱心互相服事。',
    bookEn: 'Galatians',
    chapterVerseEn: '5:13',
    textEn: 'Serve one another humbly in love.',
  },
  {
    id: 'rom-12-11',
    bookZh: '罗马书',
    chapterVerseZh: '12:11',
    textZh: '殷勤不可懒惰。要心里火热，常常服事主。',
    bookEn: 'Romans',
    chapterVerseEn: '12:11',
    textEn: 'Never be lacking in zeal, but keep your spiritual fervor, serving the Lord.',
  },
];

export function getDailyVerse(date: Date = new Date()): ScriptureItem {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = Math.abs(dayOfYear) % SERVING_SCRIPTURES.length;
  return SERVING_SCRIPTURES[index];
}

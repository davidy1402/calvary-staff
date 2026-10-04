import React from 'react';
import { useChurch } from '../context/ChurchContext';
import { getDailyVerse } from '../data/scriptures';


export const DailyScriptureCard: React.FC = () => {
  const { language } = useChurch();
  const verse = getDailyVerse();
  const text = language === 'zh' ? verse.textZh : verse.textEn;
  const citation =
    language === 'zh'
      ? `${verse.bookZh} ${verse.chapterVerseZh}`
      : `${verse.bookEn} ${verse.chapterVerseEn}`;

  return (
    <div
      className="rounded-xl p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
    >
      {/* Header Badge */}
      <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 mb-2">
        <span className="text-xs font-bold tracking-tight">
          {language === 'zh' ? '今日服事经文' : 'Daily Scripture'}
        </span>
      </div>

      {/* Verse Content */}
      <div>
        <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-100 leading-relaxed tracking-normal">
          {text}
        </p>
        <div className="mt-2 flex items-center justify-end">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 tracking-tight">
            {citation}
          </span>
        </div>
      </div>
    </div>
  );
};

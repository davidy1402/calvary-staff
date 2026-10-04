import React from 'react';
import { useChurch } from '../context/ChurchContext';
import { Sparkles, Quote } from 'lucide-react';
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
      className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-blue-50/80 via-indigo-50/30 to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-blue-200/50 dark:border-zinc-800 shadow-2xs"
    >
      <Quote size={64} strokeWidth={1.5} aria-hidden="true" className="absolute -right-3 -bottom-3 text-blue-500/5 dark:text-blue-400/5 pointer-events-none -rotate-6" />
      {/* Header Badge */}
      <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 mb-2">
        <Sparkles size={13} aria-hidden="true" />
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

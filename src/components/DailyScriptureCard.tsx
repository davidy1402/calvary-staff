import React from 'react';
import { useChurch } from '../context/ChurchContext';
import { getDailyVerse } from '../data/scriptures';
import { Sparkles, Quote } from 'lucide-react';

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
      className="relative overflow-hidden rounded-2xl p-4 select-none bg-gradient-to-br from-blue-50/80 via-indigo-50/30 to-white dark:bg-gradient-to-br dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-950 border border-blue-200/50 dark:border-zinc-800 shadow-2xs"
    >
      {/* Decorative Quote Watermark */}
      <Quote
        size={64}
        strokeWidth={1.5}
        className="absolute -right-3 -bottom-3 text-blue-500/5 dark:text-blue-400/5 pointer-events-none transform -rotate-6"
      />

      {/* Header Badge */}
      <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 mb-2">
        <Sparkles size={13} strokeWidth={2.2} className="animate-pulse" />
        <span className="text-xs font-bold tracking-tight">
          {language === 'zh' ? '今日服事经文' : 'Daily Scripture'}
        </span>
      </div>

      {/* Verse Content */}
      <div>
        <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-100 leading-relaxed tracking-normal">
          {language === 'zh' ? `「${text}」` : `“${text}”`}
        </p>
        <div className="mt-2 flex items-center justify-end">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 tracking-tight">
            — {citation}
          </span>
        </div>
      </div>
    </div>
  );
};

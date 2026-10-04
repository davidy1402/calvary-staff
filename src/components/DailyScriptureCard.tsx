import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { getDailyVerse, SERVING_SCRIPTURES } from '../data/scriptures';
import { Sparkles, Quote, RotateCcw } from 'lucide-react';

export const DailyScriptureCard: React.FC = () => {
  const { language } = useChurch();
  const [verseIndex, setVerseIndex] = useState(() => {
    const today = getDailyVerse();
    const idx = SERVING_SCRIPTURES.findIndex((s) => s.id === today.id);
    return idx >= 0 ? idx : 0;
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const verse = SERVING_SCRIPTURES[verseIndex];
  const text = language === 'zh' ? verse.textZh : verse.textEn;
  const citation =
    language === 'zh'
      ? `${verse.bookZh} ${verse.chapterVerseZh}`
      : `${verse.bookEn} ${verse.chapterVerseEn}`;

  const handleNextVerse = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setVerseIndex((prev) => (prev + 1) % SERVING_SCRIPTURES.length);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div
      onClick={handleNextVerse}
      className="relative overflow-hidden rounded-2xl p-4 select-none cursor-pointer transition-all duration-200 active:scale-[0.985] bg-gradient-to-br from-blue-50/80 via-indigo-50/30 to-white dark:bg-gradient-to-br dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-950 border border-blue-200/50 dark:border-zinc-800 shadow-2xs hover:border-blue-300 dark:hover:border-zinc-700 group"
      title={language === 'zh' ? '点击切换经文' : 'Tap to switch verse'}
    >
      {/* Decorative Quote Watermark */}
      <Quote
        size={64}
        strokeWidth={1.5}
        className="absolute -right-3 -bottom-3 text-blue-500/5 dark:text-blue-400/5 pointer-events-none transform -rotate-6"
      />

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
          <Sparkles size={13} strokeWidth={2.2} className="animate-pulse" />
          <span className="text-xs font-bold tracking-tight">
            {language === 'zh' ? '今日服事经文' : 'Daily Scripture'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <RotateCcw size={10} strokeWidth={2} />
          {language === 'zh' ? '轻触换篇' : 'Shuffle'}
        </span>
      </div>

      {/* Verse Content with Crossfade */}
      <div
        className={`transition-opacity duration-150 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}
      >
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

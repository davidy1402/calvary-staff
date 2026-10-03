import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { getDailyVerse, SERVING_SCRIPTURES } from '../data/scriptures';

export const DailyScriptureCard: React.FC = () => {
  const { language } = useChurch();
  const [verseIndex, setVerseIndex] = useState(() => {
    const today = getDailyVerse();
    const idx = SERVING_SCRIPTURES.findIndex((s) => s.id === today.id);
    return idx >= 0 ? idx : 0;
  });

  const verse = SERVING_SCRIPTURES[verseIndex];
  const text = language === 'zh' ? verse.textZh : verse.textEn;
  const citation =
    language === 'zh'
      ? `${verse.bookZh} ${verse.chapterVerseZh}`
      : `${verse.bookEn} ${verse.chapterVerseEn}`;

  return (
    <div
      onClick={() => setVerseIndex((prev) => (prev + 1) % SERVING_SCRIPTURES.length)}
      className="px-3.5 py-2 rounded-xl bg-slate-100/70 dark:bg-zinc-850/50 border border-slate-200/60 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-center justify-between gap-2 select-none cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
      title={language === 'zh' ? '点击切换' : 'Next verse'}
    >
      <p className="truncate italic">
        「{text}」
      </p>
      <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 shrink-0 not-italic">
        {citation}
      </span>
    </div>
  );
};

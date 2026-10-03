import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { getDailyVerse, SERVING_SCRIPTURES } from '../data/scriptures';
import { t } from '../utils/i18n';
import { Quote, RefreshCw, Copy, Check, Sparkles } from 'lucide-react';

export const DailyScriptureCard: React.FC = () => {
  const { language } = useChurch();
  const [verseIndex, setVerseIndex] = useState(() => {
    const today = getDailyVerse();
    const idx = SERVING_SCRIPTURES.findIndex((s) => s.id === today.id);
    return idx >= 0 ? idx : 0;
  });
  const [copied, setCopied] = useState(false);

  const currentVerse = SERVING_SCRIPTURES[verseIndex];

  const handleNext = () => {
    setVerseIndex((prev) => (prev + 1) % SERVING_SCRIPTURES.length);
  };

  const handleCopy = async () => {
    const textToCopy =
      language === 'zh'
        ? `「${currentVerse.textZh}」\n— ${currentVerse.bookZh} ${currentVerse.chapterVerseZh}（${currentVerse.versionZh}）\n\n今日反思：${currentVerse.reflectionZh}`
        : `"${currentVerse.textEn}"\n— ${currentVerse.bookEn} ${currentVerse.chapterVerseEn} (${currentVerse.versionEn})\n\nReflection: ${currentVerse.reflectionEn}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const highlight = language === 'zh' ? currentVerse.highlightZh : currentVerse.highlightEn;
  const text = language === 'zh' ? currentVerse.textZh : currentVerse.textEn;
  const citation =
    language === 'zh'
      ? `${currentVerse.bookZh} ${currentVerse.chapterVerseZh} · ${currentVerse.versionZh}`
      : `${currentVerse.bookEn} ${currentVerse.chapterVerseEn} · ${currentVerse.versionEn}`;
  const reflection = language === 'zh' ? currentVerse.reflectionZh : currentVerse.reflectionEn;
  const theme = language === 'zh' ? currentVerse.themeZh : currentVerse.themeEn;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-zinc-800 shadow-xs relative overflow-hidden transition-colors duration-200">
      {/* Decorative subtle background quote watermark */}
      <div className="absolute -top-3 -right-2 text-slate-100 dark:text-zinc-800/40 pointer-events-none select-none">
        <Quote size={88} strokeWidth={1} />
      </div>

      {/* Top Header Badge & Actions */}
      <div className="flex items-center justify-between gap-2 relative z-10 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-900/40">
            <Sparkles size={11} strokeWidth={2} />
            <span>{t('todaysScriptureBadge', language)}</span>
          </span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
            · {theme}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors active:scale-95 cursor-pointer"
            aria-label={copied ? t('copiedScripture', language) : t('shareScripture', language)}
            title={copied ? t('copiedScripture', language) : t('shareScripture', language)}
          >
            {copied ? (
              <Check size={14} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy size={14} strokeWidth={1.75} />
            )}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors active:scale-95 cursor-pointer"
            aria-label={t('nextScripture', language)}
            title={t('nextScripture', language)}
          >
            <RefreshCw size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Core Scripture Quote */}
      <div className="pt-3.5 relative z-10 space-y-2">
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight leading-snug [text-wrap:balance]">
          {highlight}
        </h3>

        <blockquote className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-normal italic pl-2.5 border-l-2 border-blue-500/60 dark:border-blue-400/60 [text-wrap:pretty]">
          「{text}」
        </blockquote>

        <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 tracking-wide pt-0.5">
          {citation}
        </p>
      </div>

      {/* Reflection Box (今日反思) */}
      <div className="mt-3.5 relative z-10 bg-slate-50/90 dark:bg-zinc-850/70 rounded-xl p-3 border border-slate-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-900 dark:text-blue-300 mb-1">
          <Quote size={12} strokeWidth={2} />
          <span>{t('dailyReflection', language)}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed [text-wrap:pretty]">
          {reflection}
        </p>
      </div>
    </div>
  );
};

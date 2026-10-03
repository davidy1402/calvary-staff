import React, { useEffect } from 'react';
import { Sparkles, Heart, PartyPopper, X } from 'lucide-react';
import { fireConfetti } from '../utils/confetti';
import { ChurchLogo } from './ChurchLogo';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'zh' | 'en';
}

export const EasterEggModal: React.FC<EasterEggModalProps> = ({ isOpen, onClose, language }) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti immediately upon open
      const cleanup = fireConfetti();
      // Try haptic vibration if supported
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([60, 40, 100]);
        }
      } catch {
        // ignore
      }
      return cleanup;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 text-center border border-slate-200/80 dark:border-zinc-800 shadow-2xl relative overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Background celebration glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/10 dark:bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="关闭"
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* Top Badge Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4 animate-bounce">
          <PartyPopper size={30} strokeWidth={2} />
        </div>

        {/* Badge tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-black tracking-wide mb-2.5">
          <Sparkles size={12} strokeWidth={2.2} />
          <span>{language === 'zh' ? '隐藏彩蛋已解锁' : 'Secret Easter Egg Unlocked'}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight leading-snug">
          {language === 'zh' ? '居然真的一直拉到底了！' : 'You Scrolled All The Way Down!'}
        </h3>

        {/* Humorous and encouraging body message */}
        <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
          <p className="font-semibold text-slate-800 dark:text-zinc-200">
            {language === 'zh'
              ? '「凡事忠心到底的，必得主的赏赐。」'
              : '"Faithful to the very end."'}
          </p>
          <p>
            {language === 'zh'
              ? '致敬每一位在台前敬拜赞美、幕后音响PA、投影电脑、招待与主日学默默摆上的好同工！加略山教会因你的服事而充满爱与温度。'
              : 'Honoring every volunteer in worship, sound, slides, greeting, and Sunday school. CCCJB is blessed by your faithful heart!'}
          </p>
        </div>

        {/* Interactive Action Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              fireConfetti();
              try {
                if ('vibrate' in navigator) navigator.vibrate([40, 30, 80]);
              } catch {
                // ignore
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-98 transition-all cursor-pointer"
          >
            <PartyPopper size={15} strokeWidth={2} />
            <span>{language === 'zh' ? '再放一次彩花 🎊' : 'Burst More Confetti 🎊'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
          >
            <Heart size={14} strokeWidth={2.2} className="text-rose-500 fill-rose-500" />
            <span>{language === 'zh' ? '收下这份祝福' : 'Receive Blessing'}</span>
          </button>
        </div>

        {/* Mini Church Logo watermark */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center gap-1.5 opacity-60">
          <ChurchLogo className="w-4 h-4 object-contain" />
          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 tracking-wider">
            CALVARY COMMUNITY CHURCH JB
          </span>
        </div>
      </div>
    </div>
  );
};

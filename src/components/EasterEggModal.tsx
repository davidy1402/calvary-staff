import React, { useEffect } from 'react';
import { Heart, PartyPopper, X } from 'lucide-react';
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
      // Fire celebratory confetti immediately upon trigger
      const cleanup = fireConfetti();
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([40, 30, 80]);
        }
      } catch {
        // ignore
      }
      return cleanup;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 text-center border border-slate-200/90 dark:border-zinc-800 shadow-xl relative overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="关闭"
        >
          <X size={17} strokeWidth={2} />
        </button>

        {/* Subtle, Tasteful Icon Badge */}
        <div className="mx-auto w-13 h-13 rounded-2xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs mb-3.5">
          <PartyPopper size={24} strokeWidth={2} />
        </div>

        {/* Clean, Human Title */}
        <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight">
          {language === 'zh' ? '被你发现了 🤫' : 'You Found It!'}
        </h3>

        {/* Sincere, Grounded Message */}
        <div className="mt-2.5 space-y-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
          <p className="font-semibold text-slate-800 dark:text-zinc-200">
            {language === 'zh'
              ? '平时在加略山服事辛苦了！'
              : 'Thank you for serving faithfully at CCCJB!'}
          </p>
          <p>
            {language === 'zh'
              ? '不管是台上带领敬拜，还是在幕后看音响PA、按电脑PPT、带主日学或是招待，谢谢你每个礼拜的默默付出。'
              : 'Whether leading on stage or serving quietly behind sound, slides, Sunday school, or ushering, every quiet effort matters.'}
          </p>
        </div>

        {/* Clean Action Buttons */}
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              fireConfetti();
              try {
                if ('vibrate' in navigator) navigator.vibrate([30, 20, 60]);
              } catch {
                // ignore
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 transition-all cursor-pointer"
          >
            <PartyPopper size={14} strokeWidth={2} />
            <span>{language === 'zh' ? '再放一次彩花 🎊' : 'Burst Confetti Again 🎊'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-colors cursor-pointer"
          >
            <Heart size={13} strokeWidth={2} className="text-rose-500 fill-rose-500" />
            <span>{language === 'zh' ? '收下这份心意' : 'Got it'}</span>
          </button>
        </div>

        {/* Small footer brand */}
        <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center gap-1 opacity-50">
          <ChurchLogo className="w-3.5 h-3.5 object-contain" />
          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
            CCCJB
          </span>
        </div>
      </div>
    </div>
  );
};

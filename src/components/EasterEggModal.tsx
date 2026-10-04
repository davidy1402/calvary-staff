import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PartyPopper } from 'lucide-react';
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
      const cleanup = fireConfetti();
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([30, 20, 50]);
        }
      } catch {
        // ignore
      }
      return cleanup;
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      style={{
        minHeight: '100dvh',
      }}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 text-center border border-slate-200/90 dark:border-zinc-800 shadow-2xl relative overflow-hidden animate-pop-in"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Icon Badge */}
        <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs mb-3.5">
          <PartyPopper size={22} strokeWidth={2} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight">
          {language === 'zh' ? '你怎么会发现这里有个彩蛋？' : 'How did you even find this?'}
        </h3>

        {/* Content with natural line breaks */}
        <div className="mt-3.5 space-y-2.5 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed text-center">
          {language === 'zh' ? (
            <>
              <p className="font-semibold text-slate-800 dark:text-zinc-200">
                能一直拉到最底下，证明你真的很有耐心。
              </p>
              <p>
                不管是台上敬拜，还是幕后音响、电脑、招待和主日学，
                <br />
                谢谢你每个礼拜默默为教会的付出。
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-800 dark:text-zinc-200">
                You must be really patient to keep pulling all the way down here.
              </p>
              <p>
                Whether you serve on stage or behind the scenes,
                <br />
                thank you for faithfully giving your time each week.
              </p>
            </>
          )}
        </div>

        {/* Clean Action Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              fireConfetti();
              try {
                if ('vibrate' in navigator) navigator.vibrate([30, 20, 50]);
              } catch {
                // ignore
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 transition-all cursor-pointer"
          >
            <PartyPopper size={14} strokeWidth={2} />
            <span>{language === 'zh' ? '再放一次彩花' : 'Celebrate again'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs active:scale-98 transition-colors cursor-pointer"
          >
            {language === 'zh' ? '一起加油' : 'Keep Serving Together'}
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
    </div>,
    document.body
  );
};

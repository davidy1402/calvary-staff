import React, { useState } from 'react';
import { Sparkles, X, Smartphone, History, ChevronDown } from 'lucide-react';
import { CURRENT_VERSION, PAST_RELEASES, type AppRelease } from '../data/updates';
import { useChurch } from '../context/ChurchContext';

interface LatestUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAutomatic?: boolean;
}

export const LatestUpdateModal: React.FC<LatestUpdateModalProps> = ({
  isOpen,
  onClose,
  isAutomatic = false,
}) => {
  const { language } = useChurch();
  const [showHistory, setShowHistory] = useState(false);

  if (!isOpen) return null;

  const handleDismiss = () => {
    // Record that user has seen this release
    try {
      localStorage.setItem('calvary_seen_version', CURRENT_VERSION.version);
    } catch {}
    onClose();
  };

  const renderReleaseContent = (release: AppRelease, isCurrent: boolean) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-lg bg-blue-100/80 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
            v{release.version}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
            {release.releaseDate}
          </span>
        </div>
        {isCurrent && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {language === 'zh' ? '当前版本' : 'Latest'}
          </span>
        )}
      </div>

      <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
        {release.title}
      </h3>
      <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
        {release.summary}
      </p>

      {/* Highlights List */}
      <div className="space-y-3 pt-2">
        {release.highlights.map((h, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                {h.title}
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed pl-3.5">
              {h.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={handleDismiss}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient & Header */}
        <div className="relative px-5 pt-5 pb-3 border-b border-slate-100 dark:border-zinc-800/80 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                <Sparkles size={18} strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                  <span>{language === 'zh' ? '最新更新' : 'Latest Updates'}</span>
                  {isAutomatic && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      NEW
                    </span>
                  )}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="关闭"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-5 py-4 overflow-y-auto space-y-5 flex-1 overscroll-contain">
          {renderReleaseContent(CURRENT_VERSION, true)}

          {/* Quick Guidance Box */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
              <Smartphone size={14} strokeWidth={2} className="shrink-0 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-bold">
                {language === 'zh' ? '添加至手机主屏幕' : 'Add to Home Screen'}
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed pl-5">
              {language === 'zh'
                ? '在手机浏览器点击分享选择「添加到主屏幕」，即可像 App 一样随时打开查看。'
                : 'Tap Share in your mobile browser and choose "Add to Home Screen" to open anytime.'}
            </p>
          </div>

          {/* Toggle History Releases */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <History size={14} strokeWidth={2} />
              <span>{language === 'zh' ? '查看往期更新历史' : 'View past releases'}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`}
              />
            </button>

            {showHistory && (
              <div className="mt-3.5 space-y-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
                {PAST_RELEASES.map((rel) => (
                  <div key={rel.version} className="pt-2">
                    {renderReleaseContent(rel, false)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-slate-50/80 dark:bg-zinc-900/90 border-t border-slate-100 dark:border-zinc-800/80 shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <span>{language === 'zh' ? '我知道了' : 'Got it'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

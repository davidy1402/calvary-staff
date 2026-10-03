import React, { useState } from 'react';
import { Sparkles, X, CheckCircle2, Smartphone, History, ChevronDown } from 'lucide-react';
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

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'feature':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-900/50';
      case 'fix':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-900/50';
      case 'ui':
      default:
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-900/50';
    }
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
      <div className="space-y-2.5 pt-1">
        {release.highlights.map((h, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/60 space-y-1.5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${getCategoryBadgeClass(
                  h.category
                )}`}
              >
                {h.label}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                {h.title}
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed pl-0.5">
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
                  <span>{language === 'zh' ? '最新更新通知' : 'Latest Updates'}</span>
                  {isAutomatic && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      NEW
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                  {language === 'zh' ? '加略山社区教会 CCCJB 助手' : 'CCCJB Assistant'}
                </p>
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
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-zinc-800/90 border border-indigo-100 dark:border-zinc-700/80 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
              <Smartphone size={16} strokeWidth={2.2} className="shrink-0" />
              <h4 className="text-xs font-bold">
                {language === 'zh' ? '新手使用引导 (Mobile Tips)' : 'Mobile Quick Guidance'}
              </h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
              {language === 'zh'
                ? '在手机 Safari 或 Chrome 点击分享按钮，选择「加入主画面 / 添加到主屏幕」，即可像原生 App 一样秒开查阅，不用每次在 WhatsApp 翻找链接。'
                : 'Tap Share in your mobile browser and choose "Add to Home Screen" to open instantly like a native app.'}
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
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <CheckCircle2 size={15} strokeWidth={2.2} />
            <span>{language === 'zh' ? '我知道了，开始使用' : 'Got it, continue'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

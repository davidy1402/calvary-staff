import React from 'react';
import { Home, CalendarDays, SlidersHorizontal } from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { t, type TranslationKey } from '../utils/i18n';

export type TabType = 'dashboard' | 'roster' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { language } = useChurch();

  const tabs: Array<{ id: TabType; key: TranslationKey; icon: typeof Home }> = [
    { id: 'dashboard', key: 'home', icon: Home },
    { id: 'roster', key: 'roster', icon: CalendarDays },
    { id: 'profile', key: 'settings', icon: SlidersHorizontal },
  ];

  return (
    <nav
      aria-label="主要底部导航"
      className="fixed bottom-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] inset-x-0 z-40 flex justify-center pointer-events-none select-none px-4"
    >
      {/* iOS Liquid Glass Floating Dock Container */}
      <div className="pointer-events-auto inline-flex items-center p-1 rounded-full backdrop-blur-2xl backdrop-saturate-180 bg-white/80 dark:bg-zinc-900/80 border border-slate-200/70 dark:border-white/12 shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.85)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-300">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const IconComponent = tab.icon;
          const label = t(tab.key, language);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[76px] sm:min-w-[84px] h-11 px-3 rounded-full transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-white/95 text-blue-900 dark:bg-zinc-800/90 dark:text-zinc-100 shadow-[0_2px_8px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.04)] border border-slate-200/60 dark:border-zinc-700/60'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100/50 dark:hover:bg-zinc-800/40'
              }`}
            >
              <IconComponent
                size={18}
                strokeWidth={isActive ? 2 : 1.75}
                className="transition-transform duration-200 shrink-0"
              />
              <span
                className={`text-[10px] tracking-tight mt-0.5 leading-none ${
                  isActive
                    ? 'font-bold text-blue-950 dark:text-white'
                    : 'font-medium text-slate-500 dark:text-zinc-400'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

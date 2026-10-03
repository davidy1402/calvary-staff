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
      className="fixed bottom-[max(0.875rem,calc(env(safe-area-inset-bottom,0px)+0.375rem))] left-1/2 -translate-x-1/2 z-40 select-none w-[calc(100%-2rem)] max-w-[390px] sm:max-w-md px-1"
    >
      {/* iOS Liquid Glass Floating Dock Container */}
      <div className="relative backdrop-blur-3xl backdrop-saturate-180 bg-white/70 dark:bg-zinc-950/75 border border-white/80 dark:border-white/15 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.9),inset_0_-1px_1px_0_rgba(0,0,0,0.04)] dark:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8),0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.25),inset_0_-1px_1px_0_rgba(0,0,0,0.5)] rounded-[2rem] p-1.5 flex items-center justify-between gap-1 transition-all duration-300">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const IconComponent = tab.icon;
          const label = t(tab.key, language);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 flex flex-col items-center justify-center h-14 rounded-[1.375rem] transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-[0_4px_14px_-2px_rgba(15,23,42,0.25)] dark:shadow-[0_4px_16px_rgba(255,255,255,0.2)]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-900/5 dark:hover:bg-white/5'
              }`}
            >
              <IconComponent
                size={20}
                strokeWidth={isActive ? 2.25 : 1.75}
                className="transition-transform duration-200 shrink-0"
              />
              <span
                className={`text-[11px] tracking-tight mt-1 leading-none ${
                  isActive
                    ? 'font-extrabold text-white dark:text-zinc-950'
                    : 'font-semibold text-slate-600 dark:text-zinc-400'
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

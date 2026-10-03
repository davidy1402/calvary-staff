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
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 select-none">
      <div className="bg-white/80 dark:bg-black/90 backdrop-blur-2xl border border-white/70 dark:border-zinc-800 shadow-[0_12px_36px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/5 dark:ring-white/10 rounded-3xl p-1.5 flex items-center gap-1 transition-all duration-300">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const IconComponent = tab.icon;
          const label = t(tab.key, language);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center w-18 h-13 rounded-2xl transition-all duration-200 active:scale-90 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <IconComponent size={20} strokeWidth={isActive ? 2.2 : 1.75} />
              <span
                className={`text-[11px] tracking-tight mt-1 leading-none ${
                  isActive ? 'font-bold text-white dark:text-black' : 'font-medium text-slate-500 dark:text-zinc-400'
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

import React from 'react';
import { Home, CalendarDays, User } from 'lucide-react';
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
    { id: 'profile', key: 'profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/70 shadow-[0_12px_32px_rgba(0,0,0,0.09),0_2px_6px_rgba(0,0,0,0.04)] rounded-full p-1.5 flex items-center gap-1.5 transition-all duration-300">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const IconComponent = tab.icon;
          const label = t(tab.key, language);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <IconComponent size={18} strokeWidth={isActive ? 2 : 1.75} />
              <span className="tracking-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

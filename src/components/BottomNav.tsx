import React from 'react';
import { Home, CalendarDays, User } from 'lucide-react';

export type TabType = 'dashboard' | 'roster' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: '首頁', icon: Home },
    { id: 'roster' as TabType, label: '服事表', icon: CalendarDays },
    { id: 'profile' as TabType, label: '我的', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="max-w-md mx-auto px-4 flex items-center justify-around h-15">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-20 py-1 transition-colors select-none ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`w-10 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <IconComponent size={20} strokeWidth={isActive ? 2.2 : 1.75} />
              </div>
              <span className="text-[11px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

import React from 'react';
import { CalendarDays, MessageSquare, Users, Settings } from 'lucide-react';

export type TabType = 'roster' | 'whatsapp' | 'coworkers' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'roster' as TabType, label: '服事排班', icon: CalendarDays },
    { id: 'whatsapp' as TabType, label: 'WhatsApp', icon: MessageSquare },
    { id: 'coworkers' as TabType, label: '同工名录', icon: Users },
    { id: 'settings' as TabType, label: '设置备份', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="max-w-2xl mx-auto px-2 flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`w-9 h-6 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <IconComponent size={20} strokeWidth={1.75} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

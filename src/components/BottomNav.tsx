import React from 'react';
import { Home, CalendarDays, SlidersHorizontal } from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { t, type TranslationKey } from '../utils/i18n';
import { getSeniorCareNavigation } from '../utils/seniorCare';

export type TabType = 'dashboard' | 'roster' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { language, isElderMode } = useChurch();

  const tabs: Array<{ id: TabType; key: TranslationKey; icon: typeof Home }> = [
    { id: 'dashboard', key: 'home', icon: Home },
    { id: 'roster', key: 'roster', icon: CalendarDays },
    { id: 'profile', key: 'settings', icon: SlidersHorizontal },
  ];

  const activeIndex = tabs.findIndex((tab) => tab.id === currentTab);

  if (isElderMode) {
    const seniorTabs = getSeniorCareNavigation(language);
    return (
      <nav aria-label={language === 'zh' ? '长者模式主要导航' : 'Senior Care main navigation'} className="senior-care-nav">
        <div className="senior-care-nav-inner">
          {seniorTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const IconComponent = tabs.find((item) => item.id === tab.id)?.icon ?? Home;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`senior-care-nav-item ${isActive ? 'is-active' : ''}`}
              >
                <IconComponent size={24} strokeWidth={2.25} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label={language === 'zh' ? '主要底部导航' : 'Main navigation'}
      className="bottom-nav"
      style={{ '--active-index': activeIndex } as React.CSSProperties}
    >
      <div className="bottom-nav-glass">
        {/* One persistent indicator keeps rapid tab changes continuous. */}
        <span aria-hidden="true" className="bottom-nav-indicator" />
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const IconComponent = tab.icon;
          return (
            <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`bottom-nav-item ${isActive ? 'is-active' : ''}`}>
              <IconComponent size={21} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
              <span>{t(tab.key, language)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

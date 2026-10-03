import React, { useState } from 'react';
import { ChurchProvider } from './context/ChurchContext';
import { DashboardScreen } from './components/DashboardScreen';
import { RosterScreen } from './components/RosterScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNav, type TabType } from './components/BottomNav';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col selection:bg-blue-100 dark:selection:bg-zinc-800 selection:text-blue-900 dark:selection:text-zinc-100 transition-colors duration-200">
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-28">
        {activeTab === 'dashboard' && (
          <DashboardScreen onNavigateToRoster={() => setActiveTab('roster')} />
        )}
        {activeTab === 'roster' && <RosterScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </main>

      <BottomNav currentTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ChurchProvider>
      <MainContent />
    </ChurchProvider>
  );
};

export default App;

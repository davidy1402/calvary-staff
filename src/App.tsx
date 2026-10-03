import React, { useState } from 'react';
import { ChurchProvider } from './context/ChurchContext';
import { DashboardScreen } from './components/DashboardScreen';
import { RosterScreen } from './components/RosterScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNav, type TabType } from './components/BottomNav';
import { LatestUpdateModal } from './components/LatestUpdateModal';
import { CURRENT_VERSION } from './data/updates';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(() => {
    try {
      return localStorage.getItem('calvary_seen_version') !== CURRENT_VERSION.version;
    } catch {
      return false;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col selection:bg-blue-100 dark:selection:bg-zinc-800 selection:text-blue-900 dark:selection:text-zinc-100 transition-colors duration-200">
      <main className="flex-1 max-w-md w-full mx-auto pb-32">
        {activeTab === 'dashboard' && (
          <DashboardScreen onNavigateToRoster={() => setActiveTab('roster')} />
        )}
        {activeTab === 'roster' && <RosterScreen />}
        {activeTab === 'profile' && <ProfileScreen onOpenUpdates={() => setIsUpdateModalOpen(true)} />}
      </main>

      <BottomNav currentTab={activeTab} onTabChange={setActiveTab} />

      <LatestUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        isAutomatic={true}
      />
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

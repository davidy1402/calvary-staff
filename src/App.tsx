import React, { useState } from 'react';
import { RosterUndoNotice } from './components/RosterSaveStatus';
import { useChurch, ChurchProvider } from './context/ChurchContext';
import { DashboardScreen } from './components/DashboardScreen';
import { RosterScreen } from './components/RosterScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNav, type TabType } from './components/BottomNav';
import { LatestUpdateModal } from './components/LatestUpdateModal';
import { IdentitySelectModal } from './components/IdentitySelectModal';
import { CURRENT_VERSION } from './data/updates';

const MainContent: React.FC = () => {
  const { setActiveServiceId, isIdentityModalOpen, setIsIdentityModalOpen, hasClaimedIdentity } = useChurch();
  const [setlistDate, setSetlistDate] = useState<string | null>(null);
  const openSetlist = (date: string, serviceId: string) => {
    setActiveServiceId(serviceId);
    setSetlistDate(date);
    setActiveTab('roster');
  };
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
        <div key={activeTab} className="animate-fade-in">
          {activeTab === 'dashboard' && (
            <DashboardScreen onNavigateToRoster={() => { setSetlistDate(null); setActiveTab('roster'); }} onOpenSetlist={openSetlist} />
          )}
          {activeTab === 'roster' && <RosterScreen setlistDate={setlistDate} />}
          {activeTab === 'profile' && <ProfileScreen onOpenUpdates={() => setIsUpdateModalOpen(true)} />}
        </div>
      </main>

      <BottomNav currentTab={activeTab} onTabChange={(tab) => { setSetlistDate(null); setActiveTab(tab); }} />

      <RosterUndoNotice />

      <LatestUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        isAutomatic={true}
      />

      <IdentitySelectModal
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
        canDismiss={hasClaimedIdentity}
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

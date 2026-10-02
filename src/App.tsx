import React, { useState } from 'react';
import { ChurchProvider } from './context/ChurchContext';
import { Header } from './components/Header';
import { RosterBoard } from './components/RosterBoard';
import { WhatsAppTab } from './components/WhatsAppTab';
import { CoworkersTab } from './components/CoworkersTab';
import { SettingsTab } from './components/SettingsTab';
import { BottomNav, type TabType } from './components/BottomNav';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('roster');

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-4 pb-24">
        {activeTab === 'roster' && <RosterBoard />}
        {activeTab === 'whatsapp' && <WhatsAppTab />}
        {activeTab === 'coworkers' && <CoworkersTab />}
        {activeTab === 'settings' && <SettingsTab />}
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

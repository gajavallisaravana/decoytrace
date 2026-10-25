/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavTab, TopBar, Sidebar } from './components/Navigation';
import { CyberBackground } from './components/CyberBackground';
import { LandingPage } from './components/LandingPage';
import { DashboardOverview } from './components/DashboardOverview';
import { DecoyAssetManager } from './components/DecoyAssetManager';
import { ThreatSimulation } from './components/ThreatSimulation';
import { SecurityEvents } from './components/SecurityEvents';
import { BlockchainLedger } from './components/BlockchainLedger';
import { IncidentTimeline } from './components/IncidentTimeline';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('landing');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Cross-component drill-down states
  const [selectedEventIdForModal, setSelectedEventIdForModal] = useState<string | null>(null);
  const [isCreateAssetModalOpen, setIsCreateAssetModalOpen] = useState(false);

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventIdForModal(eventId);
    setCurrentTab('events');
  };

  const handleOpenCreateAssetModal = () => {
    setIsCreateAssetModalOpen(true);
    setCurrentTab('assets');
  };

  const isConsole = currentTab !== 'landing';

  return (
    <div className="min-h-screen bg-[#15120F] text-[#FFF8F1] flex flex-col font-sans selection:bg-[#FF873D]/30 selection:text-[#FFB45E] relative overflow-x-hidden">
      {/* Living Cyber Orange Animated Canvas Background */}
      <CyberBackground intensity="high" />

      {/* TopBar */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isConsole={isConsole}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main Body Area */}
      {isConsole ? (
        <div className="flex-1 flex w-full">
          {/* Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
          />

          {/* Console Content Canvas (offset by sidebar width on desktop) */}
          <main className="flex-1 md:pl-64 min-h-[calc(100vh-4rem)] pb-12 overflow-x-hidden">
            {currentTab === 'overview' && (
              <DashboardOverview
                onNavigate={setCurrentTab}
                onOpenCreateAssetModal={handleOpenCreateAssetModal}
                onSelectEvent={handleSelectEvent}
              />
            )}

            {currentTab === 'assets' && (
              <DecoyAssetManager
                isOpenCreateModal={isCreateAssetModalOpen}
                onCloseCreateModal={() => setIsCreateAssetModalOpen(false)}
                onStartSimulationForAsset={() => setCurrentTab('simulation')}
              />
            )}

            {currentTab === 'simulation' && (
              <ThreatSimulation
                onNavigate={setCurrentTab}
                onSelectEvent={handleSelectEvent}
              />
            )}

            {currentTab === 'events' && (
              <SecurityEvents
                initialSelectedEventId={selectedEventIdForModal}
                onClearSelectedEvent={() => setSelectedEventIdForModal(null)}
                onNavigateToLedger={() => setCurrentTab('ledger')}
              />
            )}

            {currentTab === 'timeline' && (
              <IncidentTimeline
                onSelectEvent={handleSelectEvent}
                onNavigateToLedger={() => setCurrentTab('ledger')}
              />
            )}

            {currentTab === 'ledger' && <BlockchainLedger />}

            {currentTab === 'reports' && <Reports />}

            {currentTab === 'settings' && (
              <Settings onNavigateToLedger={() => setCurrentTab('ledger')} />
            )}
          </main>
        </div>
      ) : (
        /* Landing Page Mode */
        <main className="flex-1">
          <LandingPage onLaunchConsole={(tab) => setCurrentTab(tab || 'overview')} />
        </main>
      )}
    </div>
  );
}

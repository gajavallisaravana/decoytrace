import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Target, 
  Zap, 
  AlertCircle, 
  Link as LinkIcon, 
  Clock, 
  FileText, 
  Menu, 
  X,
  ExternalLink,
  Lock,
  Cpu,
  Sparkles
} from 'lucide-react';

export type NavTab = 
  | 'landing'
  | 'overview' 
  | 'assets' 
  | 'simulation' 
  | 'events' 
  | 'timeline' 
  | 'ledger' 
  | 'reports' 
  | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}

export const TopBar: React.FC<{
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isConsole: boolean;
  onToggleMobileSidebar?: () => void;
}> = ({ currentTab, onSelectTab, isConsole, onToggleMobileSidebar }) => {
  if (isConsole) {
    const tabLabels: Record<NavTab, string> = {
      landing: 'Public Portal',
      overview: 'Overview',
      assets: 'Decoy Assets',
      simulation: 'Threat Simulation',
      events: 'Security Events',
      timeline: 'Incident Timeline',
      ledger: 'Integrity Ledger',
      reports: 'Reports & Audits',
      settings: 'Tamper Sandbox & Settings',
    };

    return (
      <header className="sticky top-0 z-30 h-16 w-full bg-[#2B1B13]/60 backdrop-blur-2xl border-b border-[rgba(255,170,100,0.25)] px-6 flex items-center justify-between gap-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-[#D0BFB0] hover:text-white hover:bg-white/5 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => onSelectTab('landing')}
              className="text-[#D0BFB0] hover:text-[#FF873D] transition-colors whitespace-nowrap cursor-pointer"
            >
              DecoyTrace
            </button>
            <span className="text-[#CDD2D8]/30">/</span>
            <span className="font-bold text-white whitespace-nowrap">
              {tabLabels[currentTab]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#FFF8F1] bg-[#2B1B13]/80 px-3.5 py-1.5 rounded-xl border border-[rgba(255,170,100,0.30)] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FF873D] shadow-[0_0_8px_#FF873D] animate-pulse" />
            <span className="font-medium text-[#D0BFB0]">Tripwires: <strong className="text-white">Armed & Active</strong></span>
          </div>

          <button
            onClick={() => onSelectTab('simulation')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl glass-button-primary whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Attack</span>
          </button>
        </div>
      </header>
    );
  }

  // Landing Page Top Bar
  return (
    <header className="sticky top-0 z-40 h-20 w-full bg-[#2B1B13]/55 backdrop-blur-2xl border-b border-[rgba(255,170,100,0.22)] px-6 sm:px-12 flex items-center justify-between gap-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      {/* Zone 1: Brand Wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('landing');
        }}
        className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
      >
        <div className="w-9 h-9 rounded-xl bg-[#2B1B13] border border-[#FF873D]/50 flex items-center justify-center text-[#FF873D] shadow-[0_0_20px_rgba(255,135,61,0.35)]">
          <Shield className="w-5 h-5 fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="tracking-wide text-white font-extrabold">DecoyTrace</span>
          <span className="text-[10px] text-[#FFB45E] font-mono tracking-widest uppercase">Cyber Orange Glass</span>
        </div>
      </a>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#D0BFB0]">
        <button
          onClick={() => onSelectTab('overview')}
          className="hover:text-[#FFB45E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Console
        </button>
        <button
          onClick={() => onSelectTab('simulation')}
          className="hover:text-[#FFB45E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Simulation Lab
        </button>
        <button
          onClick={() => onSelectTab('ledger')}
          className="hover:text-[#FFB45E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Integrity Ledger
        </button>
        <button
          onClick={() => onSelectTab('reports')}
          className="hover:text-[#FFB45E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Forensic Reports
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectTab('overview')}
          className="px-5 py-2.5 text-sm font-bold rounded-xl glass-button-primary whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <span>Launch Console</span>
        </button>
      </div>
    </header>
  );
};

export const Sidebar: React.FC<{
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ currentTab, onSelectTab, isOpen, onClose }) => {
  const navItems: { tab: NavTab; label: string; icon: any }[] = [
    { tab: 'overview', label: 'Overview', icon: LayoutDashboard },
    { tab: 'assets', label: 'Decoy Assets', icon: Target },
    { tab: 'simulation', label: 'Threat Simulation', icon: Zap },
    { tab: 'events', label: 'Security Events', icon: AlertCircle },
    { tab: 'timeline', label: 'Incident Timeline', icon: Clock },
    { tab: 'ledger', label: 'Integrity Ledger', icon: LinkIcon },
    { tab: 'reports', label: 'Reports', icon: FileText },
    { tab: 'settings', label: 'Settings', icon: Cpu },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Panel with Cyber Orange Frosted Glass */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#15120F]/90 backdrop-blur-2xl border-r border-[rgba(255,170,100,0.25)] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-[rgba(255,170,100,0.22)] flex items-center justify-between">
          <div
            onClick={() => {
              onSelectTab('landing');
              onClose();
            }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2B1B13] border border-[#FF873D]/50 flex items-center justify-center text-[#FF873D] shadow-[0_0_15px_rgba(255,135,61,0.3)]">
              <Shield className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">DecoyTrace</span>
              <span className="block text-[10px] text-[#FF873D] uppercase tracking-wider font-bold">Cyber Orange</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-[#D0BFB0] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  onSelectTab(item.tab);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#2B1B13]/90 text-[#FFB45E] border border-[rgba(255,180,94,0.45)] shadow-[0_0_20px_rgba(255,135,61,0.2)] font-bold'
                    : 'text-[#D0BFB0] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#FF873D]' : 'text-[#A3ABB3]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info: Lab Disclaimer */}
        <div className="p-4 border-t border-[rgba(255,170,100,0.22)]">
          <div className="p-3 rounded-xl bg-[#2B1B13]/70 border border-[rgba(255,170,100,0.25)] text-[11px] text-[#D0BFB0] leading-relaxed shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-[#FF873D] mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Cyber Lab Environment</span>
            </div>
            <span>All activity is simulated. Events are cryptographically sealed in local SQLite via SHA-256 blocks.</span>
          </div>

          <button
            onClick={() => {
              onSelectTab('landing');
              onClose();
            }}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-[#D0BFB0] hover:text-[#FFB45E] py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Return to Public Site</span>
          </button>
        </div>
      </aside>
    </>
  );
};

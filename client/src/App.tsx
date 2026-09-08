import React, { useEffect, useState } from 'react';
import { useEventStore } from './store/useEventStore';
import { LandingPage } from './components/Landing/LandingPage';
import { CommandHeader } from './components/Header/CommandHeader';
import { TacticalMap } from './components/Map/TacticalMap';
import { AIBriefingPanel } from './components/Briefing/AIBriefingPanel';
import { ExplainabilityModal } from './components/Explainability/ExplainabilityModal';
import { Activity, Radio, Server } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'command'>('landing');

  const initBackendSync = useEventStore((s) => s.initBackendSync);
  const kinematicTick = useEventStore((s) => s.kinematicTick);
  const sourceHealth = useEventStore((s) => s.sourceHealth);
  const backendMode = useEventStore((s) => s.backendMode);
  const wsStatus = useEventStore((s) => s.wsStatus);

  // Initialize live backend connection & WebSocket stream on mount
  useEffect(() => {
    initBackendSync();
  }, [initBackendSync]);

  // Background Kinematic simulation tick (every 1s)
  useEffect(() => {
    const interval = setInterval(() => {
      kinematicTick();
    }, 1000);
    return () => clearInterval(interval);
  }, [kinematicTick]);

  // If on Landing Page, render Luxury Landing Page
  if (currentView === 'landing') {
    return <LandingPage onEnterCommandRoom={() => setCurrentView('command')} />;
  }

  // Clean, Intuitive 2-Column Situational Awareness Layout:
  // LEFT (60%): Tactical Map with search omnibar, layer filters, and instant contact inspector
  // RIGHT (40%): Intelligence & Action Hub (AI SITREP Briefing, Live 5-Source Feed, Adapter Health)
  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#020408] text-[#c9d8e6] overflow-hidden select-none">
      {/* Top Clean Command Header */}
      <CommandHeader onBackToLanding={() => setCurrentView('landing')} />

      {/* Main Clean 2-Column Grid */}
      <main className="flex-1 p-3 grid grid-cols-12 gap-3 overflow-hidden z-20">
        {/* LEFT COLUMN (7 cols / 58% width): Tactical Geospatial Map */}
        <div className="col-span-12 lg:col-span-7 flex flex-col h-full overflow-hidden">
          <TacticalMap />
        </div>

        {/* RIGHT COLUMN (5 cols / 42% width): Intelligence & Observations Hub */}
        <div className="col-span-12 lg:col-span-5 flex flex-col h-full overflow-hidden">
          <AIBriefingPanel />
        </div>
      </main>

      {/* Bottom Minimal Status Bar */}
      <footer className="relative z-30 bg-[#05080c] border-t border-cyan-500/20 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="text-cyan-400 font-bold flex items-center">
            <Activity className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            5 ADAPTERS ACTIVE:
          </span>
          {sourceHealth.map((sh) => (
            <div key={sh.sourceType} className="flex items-center space-x-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  sh.status === 'live' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="uppercase text-slate-300 font-bold">{sh.sourceType}:</span>
              <span className="text-white">{sh.latencyMs}ms</span>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <Server className="w-3 h-3 text-cyan-400" />
          <span className="text-cyan-300 font-semibold">
            {backendMode === 'live' ? 'BACKEND 3001: SYNCED' : `STREAM: ${wsStatus.toUpperCase()}`}
          </span>
        </div>
      </footer>

      {/* Full Explainability Math Inspector Modal */}
      <ExplainabilityModal />
    </div>
  );
}

export default App;

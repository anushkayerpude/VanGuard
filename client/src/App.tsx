import React, { useEffect, useState } from 'react';
import { useEventStore } from './store/useEventStore';
import { LandingPage } from './components/Landing/LandingPage';
import { CommandHeader } from './components/Header/CommandHeader';
import { TacticalMap } from './components/Map/TacticalMap';
import { AIBriefingPanel } from './components/Briefing/AIBriefingPanel';
import { ExplainabilityModal } from './components/Explainability/ExplainabilityModal';
import { GalaxyBackground } from './components/Galaxy/GalaxyBackground';
import { Server, Activity, Shield } from 'lucide-react';

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

  // Spacious, Modern Defense Situational Awareness Layout (Rounded Containers & Ample Breathing Room):
  // LEFT (58%): Tactical Geospatial Map (rounded-2xl)
  // RIGHT (42%): Intelligence & Action Hub (rounded-2xl)
  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#06090d] text-[#e2e8f0] overflow-hidden select-none font-mono">
      {/* Deep Aerospace Stealth Ambient Background */}
      <GalaxyBackground />

      {/* Top Defense Command Header */}
      <CommandHeader onBackToLanding={() => setCurrentView('landing')} />

      {/* Main Spacious 2-Column Grid */}
      <main className="flex-1 px-4 sm:px-6 py-4 grid grid-cols-12 gap-5 sm:gap-6 overflow-hidden z-20">
        {/* LEFT COLUMN (7 cols / 58% width): Tactical Geospatial Map */}
        <div className="col-span-12 lg:col-span-7 flex flex-col h-full overflow-hidden">
          <TacticalMap />
        </div>

        {/* RIGHT COLUMN (5 cols / 42% width): Intelligence & Observations Hub */}
        <div className="col-span-12 lg:col-span-5 flex flex-col h-full overflow-hidden">
          <AIBriefingPanel />
        </div>
      </main>

      {/* Bottom Minimal Defense Telemetry Status Bar */}
      <footer className="relative z-30 bg-[#0a0f15]/95 border-t border-slate-800/80 px-6 py-2 flex items-center justify-between text-[11px] font-mono text-slate-400 backdrop-blur-xl shadow-lg">
        <div className="flex items-center space-x-6">
          <span className="text-cyan-400 font-bold flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>5 INGESTION ADAPTERS:</span>
          </span>
          {sourceHealth.map((sh) => (
            <div key={sh.sourceType} className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  sh.status === 'live' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'
                }`}
              />
              <span className="uppercase text-slate-300 font-bold">{sh.sourceType}:</span>
              <span className="text-white font-mono">{sh.latencyMs}ms</span>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-3 text-slate-400">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-300 font-semibold font-mono">
            {backendMode === 'live' ? 'C4ISR ENGINE 3001: SYNCED' : `STREAM: ${wsStatus.toUpperCase()}`}
          </span>
        </div>
      </footer>

      {/* Full Explainability Math Inspector Modal */}
      <ExplainabilityModal />
    </div>
  );
}

export default App;

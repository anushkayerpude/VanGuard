import React, { useEffect, useState } from 'react';
import { useEventStore } from './store/useEventStore';
import { LandingPage } from './components/Landing/LandingPage';
import { CommandHeader } from './components/Header/CommandHeader';
import { TacticalMap } from './components/Map/TacticalMap';
import { AIBriefingPanel } from './components/Briefing/AIBriefingPanel';
import { ExplainabilityModal } from './components/Explainability/ExplainabilityModal';
import { GalaxyBackground } from './components/Galaxy/GalaxyBackground';
import { Server, Sparkles } from 'lucide-react';

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

  // Clean Situational Awareness Layout in #806874 Dusty Mauve Twilight Aesthetic:
  // LEFT (58%): Tactical Map with search omnibar, layer filters, and instant contact inspector
  // RIGHT (42%): Intelligence & Action Hub (AI SITREP Briefing, Live 5-Source Feed, Adapter Health)
  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#0c090b] text-[#e5dce1] overflow-hidden select-none">
      {/* Dynamic Cosmic Nebula & Doodles Background */}
      <GalaxyBackground />

      {/* Top Command Header in #806874 Mauve Theme */}
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

      {/* Bottom Minimal Cosmic Status Bar */}
      <footer className="relative z-30 bg-[#140f12]/92 border-t border-[#806874]/40 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-[#cfc0c8] backdrop-blur-md shadow-sm">
        <div className="flex items-center space-x-4">
          <span className="text-[#b39ba8] font-bold flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-[#cfc0c8] animate-pulse" />
            5 ADAPTERS ACTIVE:
          </span>
          {sourceHealth.map((sh) => (
            <div key={sh.sourceType} className="flex items-center space-x-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  sh.status === 'live' ? 'bg-[#6e9b87] shadow-[0_0_6px_#6e9b87]' : 'bg-[#cfa07e]'
                }`}
              />
              <span className="uppercase text-[#cfc0c8] font-bold">{sh.sourceType}:</span>
              <span className="text-white font-mono">{sh.latencyMs}ms</span>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-[#cfc0c8]">
          <Server className="w-3 h-3 text-[#b39ba8]" />
          <span className="text-[#e5dce1] font-semibold font-mono">
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

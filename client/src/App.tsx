import React, { useEffect, useState } from 'react';
import { useEventStore } from './store/useEventStore';
import { LandingPage } from './components/Landing/LandingPage';
import { CommandHeader } from './components/Header/CommandHeader';
import { TacticalMap } from './components/Map/TacticalMap';
import { FeatureRowsPanel } from './components/Briefing/FeatureRowsPanel';
import { ExplainabilityModal } from './components/Explainability/ExplainabilityModal';
import { GalaxyBackground } from './components/Galaxy/GalaxyBackground';
import { Server, Activity } from 'lucide-react';

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

  // If on Landing Page, render Defense Landing Page
  if (currentView === 'landing') {
    return <LandingPage onEnterCommandRoom={() => setCurrentView('command')} />;
  }

  // Wireframe C4ISR Command Room Layout:
  // LEFT: 3 Distinct Feature Rows centered in the middle (Click to expand)
  // RIGHT: Big Square Tactical Geospatial Map
  // BACKGROUND: Military Picture with Tactical Atmospheric Overlays
  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#06090d] text-[#e2e8f0] overflow-hidden select-none font-mono">
      {/* High-Res Military Defense Command Room Background */}
      <GalaxyBackground />

      {/* Top Defense Command Header */}
      <CommandHeader onBackToLanding={() => setCurrentView('landing')} />

      {/* Main 2-Column Wireframe Grid */}
      <main className="flex-1 px-6 sm:px-8 py-4 grid grid-cols-12 gap-8 overflow-hidden z-20">
        {/* LEFT COLUMN (5 cols / 42% width): Centered 3 Feature Rows in the Middle */}
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center h-full overflow-hidden px-3">
          <FeatureRowsPanel />
        </div>

        {/* RIGHT COLUMN (7 cols / 58% width): Tactical Geospatial Map (Size reduced by 20% & Centered) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-center items-center h-full overflow-hidden p-2">
          <div className="w-[86%] h-[80%] my-auto transition-all duration-300">
            <TacticalMap />
          </div>
        </div>
      </main>

      {/* Bottom Clean Minimal Status Bar */}
      <footer className="relative z-30 bg-[#101b2b]/85 border-t border-slate-700/60 px-8 py-2.5 flex items-center justify-between text-xs font-mono text-slate-300 backdrop-blur-xl shadow-lg">
        <div className="flex items-center space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-white font-bold tracking-wide">VANGUARD DEFENSE C4ISR</span>
        </div>

        <div className="flex items-center space-x-2 text-slate-300 font-bold">
          <span className="text-cyan-300 font-mono font-bold">LIVE OPERATIONAL FEED</span>
        </div>
      </footer>

      {/* Full Explainability Math Inspector Modal */}
      <ExplainabilityModal />
    </div>
  );
}

export default App;

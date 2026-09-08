import React, { useState } from 'react';
import {
  Shield,
  Radio,
  Crosshair,
  ArrowRight,
  Activity,
  Zap,
  Globe,
  Compass,
  Cpu,
  Flame,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { soundFx } from '../../services/soundFx';
import { MilitaryRadarDoodlesBg } from './MilitaryRadarDoodlesBg';
import { MilitaryRotatingRadar } from './MilitaryRotatingRadar';

interface LandingPageProps {
  onEnterCommandRoom: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterCommandRoom }) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'intel'>('radar');

  const handleLaunch = () => {
    soundFx.playTargetLock();
    onEnterCommandRoom();
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0f0c] text-[#cfdbcc] font-mono selection:bg-[#4ade80] selection:text-black overflow-x-hidden">
      {/* 1. Dynamic Background with Radar Tracking Doodles, MGRS Grid, Azimuth Ticks & Terrain */}
      <MilitaryRadarDoodlesBg />

      {/* 2. Top Sleek Military Defense Navigation Bar */}
      <header className="relative z-30 px-6 sm:px-12 py-4 flex items-center justify-between border-b border-[#4d5b4a]/30 backdrop-blur-md bg-[#0a0f0c]/80">
        {/* Brand Logo & Military Insignia */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2d3a2e] to-[#4d5b4a] border border-[#6b7c67] flex items-center justify-center shadow-[0_0_12px_rgba(74,222,128,0.25)]">
            <Crosshair className="w-5 h-5 text-[#4ade80] animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-sans font-black tracking-widest text-lg text-white">
                VANGUARD
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#1f2c23] border border-[#4ade80]/40 text-[#4ade80]">
                C4ISR DEFENSE
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav Links (Inspired by AeroForce & SkyShield references) */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-sans tracking-widest text-[#8a9a85] uppercase">
          <a href="#surveillance" className="hover:text-[#4ade80] transition-colors flex items-center space-x-1">
            <span className="w-1 h-1 rounded-full bg-[#4ade80]" />
            <span>Surveillance</span>
          </a>
          <a href="#radar" className="hover:text-[#4ade80] transition-colors">
            AESA Radar
          </a>
          <a href="#fusion" className="hover:text-[#4ade80] transition-colors">
            Fusion Engine
          </a>
          <a href="#ai-sitrep" className="hover:text-[#4ade80] transition-colors">
            AI SITREP
          </a>
          <a href="#defense" className="hover:text-[#4ade80] transition-colors">
            Threat DEFCON
          </a>
        </nav>

        {/* Top Right Launch Action */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleLaunch}
            className="px-4 py-2 bg-gradient-to-r from-[#4ade80] to-[#22c55e] hover:from-[#22c55e] hover:to-[#16a34a] text-black font-sans font-black text-xs tracking-wider rounded-lg shadow-[0_0_16px_rgba(74,222,128,0.4)] transition cursor-pointer flex items-center space-x-2"
          >
            <span>LAUNCH COP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 3. Hero Section (AeroForce & SkyShield Military Architecture) */}
      <main className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 pt-8 pb-16 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* LEFT COLUMN: Imposing Defense Typography & Key Capabilities */}
        <div className="flex-1 max-w-2xl space-y-6">
          {/* Tactical Status Pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#162019] border border-[#4d5b4a] text-xs text-[#8a9a85]">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="text-[#4ade80] font-bold">DEFCON 1-5 REAL-TIME POSTURE</span>
            <span className="text-[#4d5b4a]">|</span>
            <span>5-SOURCE SENSOR FUSION</span>
          </div>

          {/* Main Headline (Inspired by AeroForce & SkyShield) */}
          <div className="space-y-2">
            <h1 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08]">
              Advanced Air Superiority &amp; Situational Awareness
            </h1>
            <p className="text-sm sm:text-base text-[#8a9a85] font-sans font-normal leading-relaxed pt-2">
              Autonomous multi-source sensor fusion engine for territorial defense. Combines live 3D AESA radar sweeps, real-time Open-Meteo meteorological telemetry, perimeter tripwires, and 100% grounded AI sitreps in a unified Common Operating Picture.
            </p>
          </div>

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleLaunch}
              className="px-6 py-3.5 bg-gradient-to-r from-[#4ade80] to-[#22c55e] hover:from-[#22c55e] hover:to-[#16a34a] text-black font-sans font-black text-sm tracking-wide rounded-xl shadow-[0_0_24px_rgba(74,222,128,0.5)] transition transform hover:-translate-y-0.5 cursor-pointer flex items-center space-x-2.5"
            >
              <Crosshair className="w-4 h-4" />
              <span>ENTER COMMAND ROOM</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <a
              href="#radar-section"
              className="px-5 py-3.5 bg-[#141e17]/80 hover:bg-[#1f2c23] border border-[#4d5b4a] text-[#cfdbcc] hover:text-white font-sans font-bold text-sm tracking-wide rounded-xl transition cursor-pointer flex items-center space-x-2"
            >
              <Radio className="w-4 h-4 text-[#4ade80]" />
              <span>LIVE RADAR (15 RPM)</span>
            </a>
          </div>

          {/* Key Metric Telemetry Tags */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#4d5b4a]/40 text-xs">
            <div className="bg-[#121a14]/80 border border-[#4d5b4a]/40 rounded-lg p-2.5">
              <div className="text-[10px] text-[#8a9a85] uppercase">Fusion Speed</div>
              <div className="text-base font-bold text-[#4ade80]">&lt; 4 ms</div>
              <div className="text-[9px] text-[#6b7c67]">Zero-latency correlation</div>
            </div>

            <div className="bg-[#121a14]/80 border border-[#4d5b4a]/40 rounded-lg p-2.5">
              <div className="text-[10px] text-[#8a9a85] uppercase">Ingestion Feeds</div>
              <div className="text-base font-bold text-white">5 Active</div>
              <div className="text-[9px] text-[#6b7c67]">Radar, Wx, Log, Unit, Inc</div>
            </div>

            <div className="bg-[#121a14]/80 border border-[#4d5b4a]/40 rounded-lg p-2.5">
              <div className="text-[10px] text-[#8a9a85] uppercase">AI Grounding</div>
              <div className="text-base font-bold text-[#facc15]">100% Proven</div>
              <div className="text-[9px] text-[#6b7c67]">Zero hallucinated claims</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Rotating Working Radar Scope doing its work */}
        <div id="radar-section" className="flex-1 w-full max-w-lg flex flex-col items-center">
          <MilitaryRotatingRadar />
        </div>
      </main>

      {/* 4. Floating Defense Capabilities Grid (Inspired by Reference 3 Battle Utility Ground System) */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 py-8 border-t border-[#4d5b4a]/30">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold text-[#4ade80] tracking-wider uppercase flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>TACTICAL DEFENSE CAPABILITIES &amp; INTEGRATIONS</span>
          </div>
          <div className="text-[11px] text-[#8a9a85] font-mono">
            MGRS: 43S ED 4821 7291 • SECTOR-7
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-[#111813]/90 border border-[#4d5b4a]/50 rounded-xl p-4 space-y-2 hover:border-[#4ade80]/60 transition">
            <div className="flex items-center justify-between">
              <Radio className="w-5 h-5 text-[#4ade80]" />
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#1e2a20] text-[#4ade80] font-bold">
                ACTIVE
              </span>
            </div>
            <h4 className="font-sans font-bold text-sm text-white">3D AESA Primary Radar</h4>
            <p className="text-xs text-[#8a9a85] font-sans leading-relaxed">
              Real-time kinematic target sweeps tracking altitude, heading, velocity vectors, and IFF mode interrogation.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#111813]/90 border border-[#4d5b4a]/50 rounded-xl p-4 space-y-2 hover:border-[#4ade80]/60 transition">
            <div className="flex items-center justify-between">
              <Globe className="w-5 h-5 text-[#38bdf8]" />
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#132733] text-[#38bdf8] font-bold">
                LIVE API
              </span>
            </div>
            <h4 className="font-sans font-bold text-sm text-white">Open-Meteo Weather</h4>
            <p className="text-xs text-[#8a9a85] font-sans leading-relaxed">
              Global meteorological API pulling measured visibility, surface wind vectors, and severe storm WMO codes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#111813]/90 border border-[#4d5b4a]/50 rounded-xl p-4 space-y-2 hover:border-[#4ade80]/60 transition">
            <div className="flex items-center justify-between">
              <Cpu className="w-5 h-5 text-[#facc15]" />
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#2e2614] text-[#facc15] font-bold">
                GEMINI AI
              </span>
            </div>
            <h4 className="font-sans font-bold text-sm text-white">Grounded SITREP Engine</h4>
            <p className="text-xs text-[#8a9a85] font-sans leading-relaxed">
              Live executive intelligence briefings with verified `#EV-...` citations and prioritized military action directives.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#111813]/90 border border-[#4d5b4a]/50 rounded-xl p-4 space-y-2 hover:border-[#4ade80]/60 transition">
            <div className="flex items-center justify-between">
              <Zap className="w-5 h-5 text-[#f87171]" />
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#2e1717] text-[#f87171] font-bold">
                EXPLAINABLE
              </span>
            </div>
            <h4 className="font-sans font-bold text-sm text-white">Counterfactual Math</h4>
            <p className="text-xs text-[#8a9a85] font-sans leading-relaxed">
              Decomposed confidence proofs showing exact corroboration weights, spatial co-location, and sensor reliability.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Bottom Military Footer Telemetry */}
      <footer className="relative z-30 bg-[#080d0a] border-t border-[#4d5b4a]/40 px-6 sm:px-12 py-3 flex items-center justify-between text-[11px] font-mono text-[#8a9a85]">
        <div className="flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
          <span className="text-white font-bold">VANGUARD DEFENSE PLATFORM v1.1</span>
          <span>•</span>
          <span>THEATER: NORTH FRONTIER COMMAND</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-[#6b7c67]">ENCRYPTION: AES-256 GCM</span>
          <button
            onClick={handleLaunch}
            className="text-[#4ade80] hover:underline font-bold cursor-pointer"
          >
            ENTER COMMAND CENTER &rarr;
          </button>
        </div>
      </footer>
    </div>
  );
};

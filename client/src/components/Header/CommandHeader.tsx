import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  RotateCcw,
  Volume2,
  VolumeX,
  FileDown,
  ArrowLeft,
  Sparkles,
  Compass
} from 'lucide-react';
import { useEventStore } from '../../store/useEventStore';
import { downloadSitrepText } from '../../services/sitrepGenerator';
import { triggerNewBriefing } from '../../services/api';

interface CommandHeaderProps {
  onBackToLanding?: () => void;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({ onBackToLanding }) => {
  const [timeUtc, setTimeUtc] = useState('');

  const threatLevel = useEventStore((s) => s.threatLevel);
  const isAudioMuted = useEventStore((s) => s.isAudioMuted);
  const toggleAudioMute = useEventStore((s) => s.toggleAudioMute);
  const isDegradedMode = useEventStore((s) => s.isDegradedMode);
  const backendMode = useEventStore((s) => s.backendMode);
  const injectScenario = useEventStore((s) => s.injectScenario);
  const aiBriefing = useEventStore((s) => s.aiBriefing);
  const events = useEventStore((s) => s.events);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toISOString().slice(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getThreatBadge = () => {
    switch (threatLevel) {
      case 'red':
        return {
          label: 'DEFCON 1 // RED CRITICAL',
          desc: 'Hostile incursions detected & corroborated across multiple feeds',
          classes: 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
        };
      case 'orange':
        return {
          label: 'DEFCON 3 // ELEVATED POSTURE',
          desc: 'Anomalous tracks active in operational zone',
          classes: 'bg-fuchsia-950/90 border-fuchsia-500 text-fuchsia-200 shadow-[0_0_18px_rgba(217,70,239,0.4)]'
        };
      case 'yellow':
        return {
          label: 'DEFCON 4 // GUARDED POSTURE',
          desc: 'Routine multi-source surveillance active',
          classes: 'bg-purple-950/80 border-purple-500/80 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
        };
      default:
        return {
          label: 'DEFCON 5 // NORMAL OPERATIONS',
          desc: 'All sectors secure',
          classes: 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
        };
    }
  };

  const threat = getThreatBadge();

  const handleSyncAI = async () => {
    try {
      const fresh = await triggerNewBriefing();
      if (fresh) {
        useEventStore.setState({ aiBriefing: fresh });
      }
    } catch (err) {
      console.warn('AI Sync trigger warning:', err);
    }
  };

  return (
    <header className="relative z-40 bg-[#10031c]/90 border-b border-fuchsia-500/30 px-4 py-2 flex items-center justify-between backdrop-blur-xl shadow-[0_4px_24px_rgba(217,70,239,0.12)]">
      {/* Left: Brand & Return Button */}
      <div className="flex items-center space-x-3">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-1 px-2.5 py-1 bg-fuchsia-950/60 hover:bg-fuchsia-900/80 border border-fuchsia-500/40 hover:border-fuchsia-300 rounded text-xs text-fuchsia-200 transition cursor-pointer"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-sans font-medium">Home</span>
          </button>
        )}

        <div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-fuchsia-600 to-pink-500 flex items-center justify-center shadow-[0_0_10px_rgba(232,121,249,0.6)]">
              <Compass className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '24s' }} />
            </div>
            <span className="font-sans font-black tracking-wider text-base text-white galaxy-glow">
              VANGUARD
            </span>
            <span className="text-[11px] text-fuchsia-300 font-mono font-semibold">
              GALAXY C4ISR
            </span>
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                backendMode === 'live'
                  ? 'bg-fuchsia-950 border border-fuchsia-400 text-fuchsia-300 shadow-[0_0_8px_rgba(232,121,249,0.4)]'
                  : 'bg-amber-950 border border-amber-500 text-amber-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendMode === 'live' ? 'bg-fuchsia-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{backendMode === 'live' ? 'LIVE STREAM' : 'STANDALONE'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Center: Threat Posture Banner */}
      <div className={`px-4 py-1 rounded-md border flex items-center space-x-2.5 ${threat.classes}`}>
        <ShieldAlert className="w-4 h-4 shrink-0 text-fuchsia-300" />
        <div className="text-xs font-bold font-mono tracking-wide">
          {threat.label}
        </div>
      </div>

      {/* Right: Simulation Scenarios & Utilities */}
      <div className="flex items-center space-x-2">
        {/* Scenarios */}
        <div className="flex items-center space-x-1 bg-[#180529]/80 border border-fuchsia-500/30 rounded p-1">
          <span className="text-[10px] text-fuchsia-400/80 font-mono px-1">Simulate:</span>
          <button
            onClick={() => injectScenario('incursion')}
            className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 rounded text-[11px] text-rose-200 font-sans font-semibold transition cursor-pointer shadow-[0_0_8px_rgba(244,63,94,0.3)]"
            title="Inject Multi-Source Incursion Spike"
          >
            Incursion
          </button>
          <button
            onClick={() => injectScenario('degraded')}
            className={`px-2.5 py-1 rounded text-[11px] font-sans font-semibold transition border cursor-pointer ${
              isDegradedMode
                ? 'bg-fuchsia-600 text-white border-fuchsia-300 font-bold shadow-[0_0_10px_rgba(217,70,239,0.5)]'
                : 'bg-fuchsia-950/60 hover:bg-fuchsia-900/60 border-fuchsia-500/30 text-fuchsia-300'
            }`}
            title="Simulate Degraded Communications"
          >
            {isDegradedMode ? 'Comms: Degraded' : 'Comms: Normal'}
          </button>
          <button
            onClick={() => injectScenario('reset')}
            className="p-1 hover:bg-fuchsia-900/60 text-fuchsia-300 hover:text-white rounded transition cursor-pointer"
            title="Reset to Normal State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Force Sync */}
        <button
          onClick={handleSyncAI}
          className="flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-fuchsia-700 to-pink-600 hover:from-fuchsia-600 hover:to-pink-500 border border-fuchsia-400/50 rounded text-[11px] text-white font-sans font-semibold transition cursor-pointer shadow-[0_0_12px_rgba(217,70,239,0.35)]"
          title="Regenerate Grounded AI Briefing"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
          <span>AI Sync</span>
        </button>

        {/* SITREP Export */}
        <button
          onClick={() => downloadSitrepText(aiBriefing, events, threatLevel)}
          className="flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-purple-800 to-fuchsia-800 hover:from-purple-700 hover:to-fuchsia-700 border border-fuchsia-400/40 rounded text-[11px] text-fuchsia-100 font-sans font-semibold transition cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.3)]"
          title="Download SITREP Report"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Audio Mute */}
        <button
          onClick={toggleAudioMute}
          className="p-1.5 text-fuchsia-300 hover:text-white rounded transition cursor-pointer"
          title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-fuchsia-400" />}
        </button>

        {/* Clock */}
        <div className="text-right border-l border-fuchsia-500/30 pl-2 text-xs font-mono text-fuchsia-300">
          {timeUtc}
        </div>
      </div>
    </header>
  );
};

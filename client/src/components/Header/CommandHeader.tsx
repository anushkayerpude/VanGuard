import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  RotateCcw,
  Volume2,
  VolumeX,
  FileDown,
  ArrowLeft,
  Sparkles
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
          label: 'DEFCON 1 // CRITICAL THREAT',
          desc: 'Hostile incursions detected & corroborated across multiple feeds',
          classes: 'bg-red-950/90 border-red-500 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
        };
      case 'orange':
        return {
          label: 'DEFCON 3 // ELEVATED POSTURE',
          desc: 'Anomalous tracks active in operational zone',
          classes: 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
        };
      case 'yellow':
        return {
          label: 'DEFCON 4 // GUARDED POSTURE',
          desc: 'Routine multi-source surveillance active',
          classes: 'bg-yellow-950/80 border-yellow-500/80 text-yellow-300'
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
    <header className="relative z-40 bg-[#060a10]/95 border-b border-cyan-500/30 px-4 py-2.5 flex items-center justify-between backdrop-blur-md">
      {/* Left: Brand & Return Button */}
      <div className="flex items-center space-x-3">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 rounded text-xs text-slate-300 hover:text-cyan-300 transition cursor-pointer"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-sans font-medium">Home</span>
          </button>
        )}

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-sans font-black tracking-wider text-base text-white">
              VANGUARD
            </span>
            <span className="text-[11px] text-cyan-400 font-mono font-medium">
              SITUATIONAL AWARENESS COP
            </span>
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                backendMode === 'live'
                  ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                  : 'bg-amber-950 border border-amber-500 text-amber-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{backendMode === 'live' ? 'MAIN BACKEND LIVE' : 'SYNCING'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Center: Threat Posture Banner */}
      <div className={`px-4 py-1.5 rounded-md border flex items-center space-x-3 ${threat.classes}`}>
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <div>
          <div className="text-xs font-bold font-mono tracking-wide flex items-center space-x-2">
            <span>{threat.label}</span>
          </div>
        </div>
      </div>

      {/* Right: Simulation Scenarios & Utilities */}
      <div className="flex items-center space-x-2">
        {/* Scenarios */}
        <div className="flex items-center space-x-1 bg-black/40 border border-slate-800 rounded p-1">
          <span className="text-[10px] text-slate-400 font-mono px-1">Simulate:</span>
          <button
            onClick={() => injectScenario('incursion')}
            className="px-2.5 py-1 bg-red-950/70 hover:bg-red-900 border border-red-500/40 rounded text-[11px] text-red-300 font-sans font-semibold transition cursor-pointer"
            title="Inject Multi-Source Incursion Spike"
          >
            Incursion
          </button>
          <button
            onClick={() => injectScenario('degraded')}
            className={`px-2.5 py-1 rounded text-[11px] font-sans font-semibold transition border cursor-pointer ${
              isDegradedMode
                ? 'bg-amber-600 text-black border-amber-300 font-bold'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Simulate Degraded Communications"
          >
            {isDegradedMode ? 'Comms: Degraded' : 'Comms: Normal'}
          </button>
          <button
            onClick={() => injectScenario('reset')}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition cursor-pointer"
            title="Reset to Normal State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Force Sync */}
        <button
          onClick={handleSyncAI}
          className="flex items-center space-x-1 px-2.5 py-1 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 rounded text-[11px] text-cyan-300 font-sans font-semibold transition cursor-pointer"
          title="Regenerate Grounded AI Briefing"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Sync</span>
        </button>

        {/* SITREP Export */}
        <button
          onClick={() => downloadSitrepText(aiBriefing, events, threatLevel)}
          className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 rounded text-[11px] text-emerald-300 font-sans font-semibold transition cursor-pointer"
          title="Download SITREP Report"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Audio Mute */}
        <button
          onClick={toggleAudioMute}
          className="p-1.5 text-slate-400 hover:text-white rounded transition cursor-pointer"
          title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Clock */}
        <div className="text-right border-l border-slate-800 pl-2 text-xs font-mono text-slate-400">
          {timeUtc}
        </div>
      </div>
    </header>
  );
};

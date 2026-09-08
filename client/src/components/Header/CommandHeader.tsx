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
          classes: 'bg-[#3d1a24]/90 border-[#c25975] text-[#f5d0d8] shadow-[0_0_18px_rgba(194,89,117,0.4)]'
        };
      case 'orange':
        return {
          label: 'DEFCON 3 // ELEVATED POSTURE',
          desc: 'Anomalous tracks active in operational zone',
          classes: 'bg-[#3b2a33]/90 border-[#cfa07e] text-[#faede3] shadow-[0_0_15px_rgba(207,160,126,0.35)]'
        };
      case 'yellow':
        return {
          label: 'DEFCON 4 // GUARDED POSTURE',
          desc: 'Routine multi-source surveillance active',
          classes: 'bg-[#2b2027]/90 border-[#806874] text-[#e5dce1] shadow-[0_0_12px_rgba(128,104,116,0.3)]'
        };
      default:
        return {
          label: 'DEFCON 5 // NORMAL OPERATIONS',
          desc: 'All sectors secure',
          classes: 'bg-[#182620]/90 border-[#6e9b87] text-[#d6ede3]'
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
    <header className="relative z-40 bg-[#140f12]/92 border-b border-[#806874]/40 px-4 py-2 flex items-center justify-between backdrop-blur-xl shadow-[0_4px_24px_rgba(12,9,11,0.5)]">
      {/* Left: Brand & Return Button */}
      <div className="flex items-center space-x-3">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-1 px-2.5 py-1 bg-[#231b20] hover:bg-[#2f242b] border border-[#806874]/50 hover:border-[#b39ba8] rounded-md text-xs text-[#e5dce1] transition cursor-pointer"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-sans font-medium">Home</span>
          </button>
        )}

        <div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-[#806874] to-[#b39ba8] flex items-center justify-center shadow-[0_0_10px_rgba(128,104,116,0.5)]">
              <Compass className="w-4 h-4 text-[#0c090b] animate-spin" style={{ animationDuration: '24s' }} />
            </div>
            <span className="font-sans font-black tracking-wider text-base text-white mauve-glow">
              VANGUARD
            </span>
            <span className="text-[11px] text-[#cfc0c8] font-mono font-semibold">
              C4ISR COP
            </span>
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                backendMode === 'live'
                  ? 'bg-[#2b1f26] border border-[#806874] text-[#e5dce1] shadow-[0_0_8px_rgba(128,104,116,0.35)]'
                  : 'bg-[#2e231b] border border-[#cfa07e] text-[#faede3]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendMode === 'live' ? 'bg-[#b39ba8] animate-pulse' : 'bg-[#cfa07e]'
                }`}
              />
              <span>{backendMode === 'live' ? 'LIVE STREAM' : 'STANDALONE'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Center: Threat Posture Banner */}
      <div className={`px-4 py-1 rounded-md border flex items-center space-x-2.5 ${threat.classes}`}>
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <div className="text-xs font-bold font-mono tracking-wide">
          {threat.label}
        </div>
      </div>

      {/* Right: Simulation Scenarios & Utilities */}
      <div className="flex items-center space-x-2">
        {/* Scenarios */}
        <div className="flex items-center space-x-1 bg-[#1e171b]/90 border border-[#806874]/40 rounded-md p-1">
          <span className="text-[10px] text-[#b39ba8] font-mono px-1">Simulate:</span>
          <button
            onClick={() => injectScenario('incursion')}
            className="px-2.5 py-1 bg-[#4a212b] hover:bg-[#5c2a36] border border-[#c25975]/60 rounded text-[11px] text-[#f5d0d8] font-sans font-semibold transition cursor-pointer shadow-[0_0_8px_rgba(194,89,117,0.3)]"
            title="Inject Multi-Source Incursion Spike"
          >
            Incursion
          </button>
          <button
            onClick={() => injectScenario('degraded')}
            className={`px-2.5 py-1 rounded text-[11px] font-sans font-semibold transition border cursor-pointer ${
              isDegradedMode
                ? 'bg-[#806874] text-white border-[#cfc0c8] font-bold shadow-[0_0_10px_rgba(128,104,116,0.5)]'
                : 'bg-[#2b2126] hover:bg-[#382b31] border-[#806874]/50 text-[#e5dce1]'
            }`}
            title="Simulate Degraded Communications"
          >
            {isDegradedMode ? 'Comms: Degraded' : 'Comms: Normal'}
          </button>
          <button
            onClick={() => injectScenario('reset')}
            className="p-1 hover:bg-[#2f242b] text-[#cfc0c8] hover:text-white rounded transition cursor-pointer"
            title="Reset to Normal State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Force Sync */}
        <button
          onClick={handleSyncAI}
          className="flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-[#806874] to-[#5e4b55] hover:from-[#957b88] hover:to-[#6d5863] border border-[#b39ba8]/50 rounded-md text-[11px] text-white font-sans font-semibold transition cursor-pointer shadow-[0_0_12px_rgba(128,104,116,0.35)]"
          title="Regenerate Grounded AI Briefing"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#e5dce1]" />
          <span>AI Sync</span>
        </button>

        {/* SITREP Export */}
        <button
          onClick={() => downloadSitrepText(aiBriefing, events, threatLevel)}
          className="flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-[#5e4b55] to-[#45363e] hover:from-[#6d5863] hover:to-[#52414b] border border-[#806874]/40 rounded-md text-[11px] text-[#e5dce1] font-sans font-semibold transition cursor-pointer shadow-[0_0_10px_rgba(128,104,116,0.25)]"
          title="Download SITREP Report"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Audio Mute */}
        <button
          onClick={toggleAudioMute}
          className="p-1.5 text-[#cfc0c8] hover:text-white rounded transition cursor-pointer"
          title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-[#c25975]" /> : <Volume2 className="w-4 h-4 text-[#b39ba8]" />}
        </button>

        {/* Clock */}
        <div className="text-right border-l border-[#806874]/40 pl-2 text-xs font-mono text-[#cfc0c8]">
          {timeUtc}
        </div>
      </div>
    </header>
  );
};

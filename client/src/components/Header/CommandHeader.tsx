import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  RotateCcw,
  Volume2,
  VolumeX,
  FileDown,
  ArrowLeft,
  Sparkles,
  Radio,
  Crosshair
} from 'lucide-react';
import { useEventStore } from '../../store/useEventStore';
import { downloadSitrepText } from '../../services/sitrepGenerator';
import { triggerNewBriefing } from '../../services/api';
import { soundFx } from '../../services/soundFx';

interface CommandHeaderProps {
  onBackToLanding?: () => void;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({ onBackToLanding }) => {
  const [timeUtc, setTimeUtc] = useState('');
  const [bombCountdown, setBombCountdown] = useState<number | null>(null);

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
          classes: 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
        };
      case 'orange':
        return {
          label: 'DEFCON 3 // ELEVATED POSTURE',
          desc: 'Anomalous tracks active in operational zone',
          classes: 'bg-amber-950/90 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
        };
      case 'yellow':
        return {
          label: 'DEFCON 4 // GUARDED POSTURE',
          desc: 'Routine multi-source surveillance active',
          classes: 'bg-yellow-950/80 border-yellow-500/80 text-yellow-200 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
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
    <header className="relative z-40 bg-[#0c131c]/90 border-b border-slate-800/80 px-6 py-3 flex items-center justify-between backdrop-blur-xl shadow-lg">
      {/* Left: Brand & Return Home with spacious layout */}
      <div className="flex items-center space-x-4">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400 rounded-xl text-xs text-slate-200 transition cursor-pointer shadow-sm"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-sans font-medium">Home</span>
          </button>
        )}

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-950 to-slate-900 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.25)]">
            <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '24s' }} />
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-sans font-black tracking-wider text-base text-white defense-glow">
                VANGUARD
              </span>
              <span className="text-[11px] text-cyan-400 font-mono font-bold tracking-wide">
                C4ISR COP
              </span>
              <span
                className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  backendMode === 'live'
                    ? 'bg-emerald-950/90 border border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                    : 'bg-amber-950/90 border border-amber-500 text-amber-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    backendMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>{backendMode === 'live' ? 'LIVE STREAM' : 'STANDALONE'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Threat Posture Banner (Rounded pill with breathing room) */}
      <div className={`px-5 py-1.5 rounded-xl border flex items-center space-x-3 ${threat.classes}`}>
        <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
        <div className="text-xs font-bold font-mono tracking-wider">
          {threat.label}
        </div>
      </div>

      {/* Right: Simulation Scenarios & Utilities (Comfortable spacing & rounded corners) */}
      <div className="flex items-center space-x-3">
        {/* Scenarios Cluster */}
        <div className="flex items-center space-x-1.5 bg-[#080d14]/90 border border-slate-700/60 rounded-xl p-1 shadow-sm">
          <span className="text-[10px] text-slate-400 font-mono px-2">Simulate:</span>
          <button
            onClick={() => injectScenario('incursion')}
            className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/50 rounded-lg text-[11px] text-red-200 font-sans font-semibold transition cursor-pointer shadow-[0_0_8px_rgba(239,68,68,0.25)]"
            title="Inject Multi-Source Incursion Spike"
          >
            Incursion
          </button>
          <button
            onClick={() => injectScenario('degraded')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-sans font-semibold transition border cursor-pointer ${
              isDegradedMode
                ? 'bg-amber-500 text-black border-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Simulate Degraded Communications"
          >
            {isDegradedMode ? 'Comms: Degraded' : 'Comms: Normal'}
          </button>
          <button
            onClick={() => injectScenario('reset')}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            title="Reset to Normal State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timer Bomb Audio Trigger */}
        <button
          onClick={() => {
            if (bombCountdown !== null) {
              soundFx.stopBombTimer();
              soundFx.playBombDefused();
              setBombCountdown(null);
            } else {
              setBombCountdown(5);
              soundFx.startAcceleratingBombTimer(
                5,
                (sec) => setBombCountdown(sec),
                () => {
                  setBombCountdown(null);
                  injectScenario('incursion');
                }
              );
            }
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-sans font-bold transition cursor-pointer border ${
            bombCountdown !== null
              ? 'bg-rose-600 text-white border-rose-300 shadow-[0_0_16px_rgba(225,29,72,0.7)] animate-pulse'
              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-rose-300 hover:text-rose-200'
          }`}
          title="Trigger 5s Timer Bomb Audio Countdown (Click again to defuse)"
        >
          <span>💣</span>
          <span>{bombCountdown !== null ? `T-${bombCountdown}s BOMB` : 'Timer Bomb'}</span>
        </button>

        {/* AI Force Sync Button */}
        <button
          onClick={handleSyncAI}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-sans font-bold text-[11px] rounded-xl shadow-[0_0_12px_rgba(0,240,255,0.3)] transition cursor-pointer"
          title="Regenerate Grounded AI Briefing"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Sync</span>
        </button>

        {/* SITREP Export Button */}
        <button
          onClick={() => downloadSitrepText(aiBriefing, events, threatLevel)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-sans font-bold text-[11px] rounded-xl shadow-[0_0_10px_rgba(16,185,129,0.3)] transition cursor-pointer"
          title="Download SITREP Report"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Audio Mute */}
        <button
          onClick={toggleAudioMute}
          className="p-2 text-slate-400 hover:text-white rounded-xl transition cursor-pointer hover:bg-slate-800/60"
          title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* UTC Clock */}
        <div className="text-right border-l border-slate-700/80 pl-3 text-xs font-mono text-slate-300">
          {timeUtc}
        </div>
      </div>
    </header>
  );
};

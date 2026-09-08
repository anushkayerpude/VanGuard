import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  RotateCcw,
  FileDown,
  ArrowLeft,
  Sparkles,
  Crosshair
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
          label: 'DEFCON 1 // RED ALERT',
          classes: 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
        };
      case 'orange':
        return {
          label: 'DEFCON 3 // ELEVATED',
          classes: 'bg-amber-950/90 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
        };
      case 'yellow':
        return {
          label: 'DEFCON 4 // GUARDED',
          classes: 'bg-yellow-950/80 border-yellow-500/80 text-yellow-200 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
        };
      default:
        return {
          label: 'DEFCON 5 // SECURE',
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
    <header className="relative z-40 bg-[#101b2b]/85 border-b border-slate-700/60 px-6 sm:px-8 py-3 flex items-center justify-between backdrop-blur-xl shadow-lg">
      {/* Left: Clean Brand & Return Home */}
      <div className="flex items-center space-x-4">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#18283d]/90 hover:bg-[#223652] border border-slate-600/70 hover:border-cyan-400 rounded-xl text-xs text-slate-100 transition cursor-pointer shadow-sm"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-sans font-medium">Home</span>
          </button>
        )}

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-900 to-slate-800 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.35)]">
            <Crosshair className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '24s' }} />
          </div>

          <span className="font-sans font-black tracking-widest text-lg text-white defense-glow">
            VANGUARD
          </span>
        </div>
      </div>

      {/* Center: Clean DEFCON Threat Posture */}
      <div className={`px-5 py-1.5 rounded-xl border flex items-center space-x-2.5 ${threat.classes}`}>
        <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
        <span className="text-xs font-bold font-mono tracking-wider">
          {threat.label}
        </span>
      </div>

      {/* Right: Essential Action Controls & Clock */}
      <div className="flex items-center space-x-3">
        {/* Scenarios Cluster */}
        <div className="flex items-center space-x-1.5 bg-[#18283d]/90 border border-slate-600/70 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => injectScenario('incursion')}
            className="px-3 py-1.5 bg-red-900/80 hover:bg-red-800 border border-red-400/60 rounded-lg text-xs text-red-100 font-sans font-semibold transition cursor-pointer shadow-[0_0_8px_rgba(239,68,68,0.3)]"
          >
            Incursion
          </button>
          <button
            onClick={() => injectScenario('reset')}
            className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
            title="Reset Scenario"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Sync Button */}
        <button
          onClick={handleSyncAI}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-black font-sans font-bold text-xs rounded-xl shadow-[0_0_14px_rgba(0,240,255,0.4)] transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-900" />
          <span>AI Sync</span>
        </button>

        {/* SITREP Export */}
        <button
          onClick={() => downloadSitrepText(aiBriefing, events, threatLevel)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#1e324c] hover:bg-[#284263] border border-slate-500/60 rounded-xl text-white font-sans font-semibold text-xs transition cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5 text-cyan-300" />
          <span>Export</span>
        </button>

        {/* UTC Clock */}
        <div className="border-l border-slate-600/80 pl-3 text-xs font-mono text-slate-200 font-bold">
          {timeUtc}
        </div>
      </div>
    </header>
  );
};

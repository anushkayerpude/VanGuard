import React from 'react';
import { useEventStore } from '../../store/useEventStore';
import {
  Activity,
  Radio,
  Wind,
  Users,
  FileText,
  AlertTriangle
} from 'lucide-react';
import type { SourceType } from '../../types/vanguard';

export const FeedHealthCard: React.FC = () => {
  const sourceHealth = useEventStore((s) => s.sourceHealth);

  const getSourceIcon = (src: SourceType) => {
    switch (src) {
      case 'radar':
        return <Radio className="w-3.5 h-3.5 text-cyan-400" />;
      case 'weather':
        return <Wind className="w-3.5 h-3.5 text-amber-400" />;
      case 'personnel':
        return <Users className="w-3.5 h-3.5 text-emerald-400" />;
      case 'log':
        return <FileText className="w-3.5 h-3.5 text-sky-400" />;
      case 'incident':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a1017]/88 border border-slate-700/60 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      {/* Header */}
      <div className="px-4 py-2 bg-[#070b10]/95 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="font-sans font-bold text-xs text-white tracking-wider uppercase">
            FEED ADAPTER PIPELINES
          </span>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center space-x-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>5/5 LIVE</span>
          </span>
        </div>
      </div>

      {/* Adapter Telemetry Rows */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {sourceHealth.map((sh) => (
          <div
            key={sh.sourceType}
            className="p-2.5 bg-[#0f1724]/90 border border-slate-700/60 rounded-xl flex items-center justify-between shadow-sm hover:border-cyan-500/40 transition"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-[#080d14] rounded-lg border border-slate-700/60">
                {getSourceIcon(sh.sourceType)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-white uppercase">
                    {sh.sourceType}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold uppercase ${
                      sh.status === 'live'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                    }`}
                  >
                    {sh.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-sans">
                  Obs: {sh.totalIngested}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-cyan-300 font-bold">
                {sh.latencyMs} ms
              </div>
              <div className="text-[9px] font-mono text-slate-400">
                Rel: {(sh.reliabilityScore * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { useEventStore } from '../../store/useEventStore';
import { Sparkles, ArrowUpRight, Volume2 } from 'lucide-react';
import { RocketDoodle, ConstellationDoodle, SparkleDoodle } from '../Galaxy/GalaxyDoodles';

export const AISitrepCard: React.FC = () => {
  const aiBriefing = useEventStore((s) => s.aiBriefing);
  const selectedEventId = useEventStore((s) => s.selectedEventId);
  const selectEvent = useEventStore((s) => s.selectEvent);
  const isVoiceReading = useEventStore((s) => s.isVoiceReading);
  const triggerVoiceBriefing = useEventStore((s) => s.triggerVoiceBriefing);
  const stopVoiceBriefing = useEventStore((s) => s.stopVoiceBriefing);

  return (
    <div className="flex flex-col h-full bg-[#0a1017]/88 border border-slate-700/60 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      {/* Header */}
      <div className="px-4 py-2.5 bg-[#070b10]/95 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="font-sans font-bold text-xs text-white tracking-wider uppercase">
            AI SITREP // INTELLIGENCE
          </span>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
            100% CITED
          </span>
        </div>

        <button
          onClick={isVoiceReading ? stopVoiceBriefing : triggerVoiceBriefing}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-sans font-bold flex items-center space-x-1.5 transition border cursor-pointer ${
            isVoiceReading
              ? 'bg-rose-600 text-white border-rose-300 shadow-[0_0_12px_rgba(225,29,72,0.6)] animate-pulse'
              : 'bg-slate-800/90 border-slate-600/70 text-slate-200 hover:text-white hover:bg-slate-700/80'
          }`}
          title="Readout SITREP Summary"
        >
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isVoiceReading ? 'Speaking...' : 'Listen'}</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
        {/* Executive Headline */}
        <div className="p-3 bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-[#0c131c] border-l-4 border-cyan-400 rounded-r-xl rounded-l-md shadow-md flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[9px] font-bold text-cyan-300 uppercase tracking-widest mb-1 font-mono flex items-center space-x-1">
              <span>SITUATION SUMMARY</span>
              <SparkleDoodle size={10} />
            </div>
            <div className="text-xs font-bold text-slate-100 leading-snug font-sans truncate">
              {aiBriefing.headline || 'Active Multi-Source Situational Awareness'}
            </div>
          </div>
          <RocketDoodle size={28} className="hidden sm:inline-block opacity-85 shrink-0 ml-1" />
        </div>

        {/* Grounded Summary */}
        <div className="bg-[#0f1724]/90 border border-slate-700/50 rounded-xl p-3 shadow-sm">
          <p className="text-xs text-slate-200 leading-relaxed font-sans font-normal">
            {aiBriefing.executiveSummary}
          </p>
        </div>

        {/* Key Corroborated Developments */}
        <div className="bg-[#0f1724]/90 border border-slate-700/50 rounded-xl p-3 shadow-sm space-y-2">
          <div className="text-[10px] font-bold tracking-wider uppercase text-sky-400 font-mono">
            KEY CORROBORATED DEVELOPMENTS
          </div>
          <div className="space-y-2">
            {aiBriefing.keyDevelopments.map((dev, idx) => (
              <div key={idx} className="text-xs text-slate-200 pl-2.5 border-l-2 border-cyan-500/60 space-y-1.5">
                <p className="leading-snug font-sans text-slate-200">{dev.point}</p>
                <div className="flex flex-wrap gap-1">
                  {dev.supportingEventIds.map((eid) => (
                    <button
                      key={eid}
                      onClick={() => selectEvent(eid)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase transition flex items-center space-x-1 cursor-pointer ${
                        selectedEventId === eid
                          ? 'bg-cyan-600 text-white font-black shadow-[0_0_10px_rgba(0,240,255,0.6)] border border-cyan-300'
                          : 'bg-slate-800/90 hover:bg-slate-700 border border-slate-600/60 text-cyan-300'
                      }`}
                    >
                      <span>#{eid}</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Directives */}
        <div className="bg-[#0f1724]/90 border border-slate-700/50 rounded-xl p-3 shadow-sm relative overflow-hidden space-y-2">
          <div className="absolute right-2 top-2 pointer-events-none opacity-20">
            <ConstellationDoodle size={40} />
          </div>

          <div className="text-[10px] font-bold tracking-wider uppercase text-amber-400 font-mono">
            PRIORITIZED ACTION DIRECTIVES
          </div>
          <div className="space-y-2 z-10 relative">
            {aiBriefing.prioritizedActions.map((act) => (
              <div
                key={act.actionId}
                className="p-2.5 bg-[#141f2e]/90 border border-slate-700/50 rounded-xl flex items-start space-x-2.5"
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black ${
                    act.priority === 'P1'
                      ? 'bg-rose-600 text-white shadow-[0_0_6px_rgba(225,29,72,0.5)]'
                      : act.priority === 'P2'
                      ? 'bg-amber-600 text-white shadow-[0_0_6px_rgba(217,119,6,0.5)]'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {act.priority}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-sans font-semibold text-slate-100">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans mt-0.5 leading-snug">
                    {act.rationale}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

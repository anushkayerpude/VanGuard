import React, { useState } from 'react';
import { useEventStore } from '../../store/useEventStore';
import {
  Sparkles,
  Radio,
  Activity,
  ArrowUpRight,
  AlertTriangle,
  Wind,
  Users,
  FileText,
  Search,
  Volume2
} from 'lucide-react';
import type { SourceType } from '../../types/vanguard';
import { RocketDoodle, GalaxySpiralDoodle, ConstellationDoodle, SparkleDoodle } from '../Galaxy/GalaxyDoodles';

export const AIBriefingPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'briefing' | 'feed' | 'health'>('briefing');
  const [feedSearch, setFeedSearch] = useState('');

  const aiBriefing = useEventStore((s) => s.aiBriefing);
  const events = useEventStore((s) => s.events);
  const selectedEventId = useEventStore((s) => s.selectedEventId);
  const selectEvent = useEventStore((s) => s.selectEvent);
  const openExplainability = useEventStore((s) => s.openExplainability);
  const sourceHealth = useEventStore((s) => s.sourceHealth);
  const isVoiceReading = useEventStore((s) => s.isVoiceReading);
  const triggerVoiceBriefing = useEventStore((s) => s.triggerVoiceBriefing);
  const stopVoiceBriefing = useEventStore((s) => s.stopVoiceBriefing);

  const getSourceIcon = (src: SourceType) => {
    switch (src) {
      case 'radar':
        return <Radio className="w-4 h-4 text-cyan-400" />;
      case 'weather':
        return <Wind className="w-4 h-4 text-amber-400" />;
      case 'personnel':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'log':
        return <FileText className="w-4 h-4 text-sky-400" />;
      case 'incident':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
  };

  const filteredEvents = events.filter((e) => {
    if (!feedSearch) return true;
    const q = feedSearch.toLowerCase();
    return (
      e.id.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.sourceType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#0c131c]/92 border border-slate-700/60 rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      {/* Tab Navigation Header */}
      <div className="px-4 pt-3 pb-2.5 bg-[#090e15]/95 border-b border-slate-700/60 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('briefing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-sans font-bold flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'briefing'
                ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white shadow-[0_0_16px_rgba(0,240,255,0.35)] border border-cyan-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>AI SITREP</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-sans font-bold flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white shadow-[0_0_16px_rgba(0,240,255,0.35)] border border-cyan-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-300" />
            <span>Live Feed ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`px-3.5 py-2 rounded-xl text-xs font-sans font-bold flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'health'
                ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white shadow-[0_0_16px_rgba(0,240,255,0.35)] border border-cyan-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-300" />
            <span>Feed Health</span>
          </button>
        </div>

        {activeTab === 'briefing' && (
          <button
            onClick={isVoiceReading ? stopVoiceBriefing : triggerVoiceBriefing}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold flex items-center space-x-2 transition border cursor-pointer ${
              isVoiceReading
                ? 'bg-rose-600 text-white border-rose-300 shadow-[0_0_14px_rgba(225,29,72,0.6)] animate-pulse'
                : 'bg-slate-800/90 border-slate-600/70 text-slate-200 hover:text-white hover:bg-slate-700/80'
            }`}
            title="Readout SITREP Summary"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isVoiceReading ? 'Speaking...' : 'Listen'}</span>
          </button>
        )}
      </div>

      {/* Tab 1: AI Briefing Content */}
      {activeTab === 'briefing' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative">
          {/* Executive Headline Card with Rocket Doodle */}
          <div className="p-4 bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-[#0c131c] border-l-4 border-cyan-400 rounded-r-2xl rounded-l-md shadow-lg flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest mb-1.5 font-mono flex items-center space-x-1.5">
                <span>OPERATIONAL SITUATION SUMMARY</span>
                <SparkleDoodle size={12} />
              </div>
              <div className="text-sm font-bold text-slate-100 leading-snug font-sans">
                {aiBriefing.headline || 'Active Multi-Source Situational Awareness'}
              </div>
            </div>
            <RocketDoodle size={36} className="hidden sm:inline-block opacity-85 shrink-0 ml-2" />
          </div>

          {/* Grounded Executive Summary with Spiral Doodle Watermark */}
          <div className="bg-[#0f1724]/90 border border-slate-700/60 rounded-2xl p-4 shadow-sm relative overflow-hidden space-y-2">
            <div className="absolute right-2 -bottom-2 pointer-events-none opacity-15">
              <GalaxySpiralDoodle size={70} />
            </div>

            <div className="text-[11px] font-bold tracking-wider uppercase text-cyan-400 font-mono flex items-center justify-between z-10 relative">
              <span>EXECUTIVE BRIEFING</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                100% CITED &amp; GROUNDED
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans font-normal z-10 relative">
              {aiBriefing.executiveSummary}
            </p>
          </div>

          {/* Key Corroborated Developments */}
          <div className="bg-[#0f1724]/90 border border-slate-700/60 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="text-[11px] font-bold tracking-wider uppercase text-sky-400 font-mono">
              KEY CORROBORATED DEVELOPMENTS
            </div>
            <div className="space-y-3">
              {aiBriefing.keyDevelopments.map((dev, idx) => (
                <div key={idx} className="text-xs text-slate-200 pl-3.5 border-l-2 border-cyan-500/60 space-y-2">
                  <p className="leading-snug font-sans text-slate-200">{dev.point}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dev.supportingEventIds.map((eid) => (
                      <button
                        key={eid}
                        onClick={() => selectEvent(eid)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition flex items-center space-x-1 cursor-pointer ${
                          selectedEventId === eid
                            ? 'bg-cyan-600 text-white font-black shadow-[0_0_12px_rgba(0,240,255,0.6)] border border-cyan-300'
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

          {/* Prioritized Action Directives with Constellation Doodle */}
          <div className="bg-[#0f1724]/90 border border-slate-700/60 rounded-2xl p-4 shadow-sm relative overflow-hidden space-y-3">
            <div className="absolute right-3 top-2 pointer-events-none opacity-20">
              <ConstellationDoodle size={50} />
            </div>

            <div className="text-[11px] font-bold tracking-wider uppercase text-amber-400 font-mono flex items-center space-x-1">
              <span>PRIORITIZED ACTION DIRECTIVES</span>
            </div>
            <div className="space-y-2.5 z-10 relative">
              {aiBriefing.prioritizedActions.map((act) => (
                <div
                  key={act.actionId}
                  className="p-3.5 bg-[#141f2e]/90 border border-slate-700/50 rounded-xl flex items-start space-x-3.5"
                >
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black ${
                      act.priority === 'P1'
                        ? 'bg-rose-600 text-white shadow-[0_0_8px_rgba(225,29,72,0.5)]'
                        : act.priority === 'P2'
                        ? 'bg-amber-600 text-white shadow-[0_0_8px_rgba(217,119,6,0.5)]'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {act.priority}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-sans font-semibold text-slate-100">
                      {act.title}
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans mt-1 leading-snug">
                      {act.rationale}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live Multi-Source Feed */}
      {activeTab === 'feed' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Feed Search Bar */}
          <div className="p-3 bg-[#090e15] border-b border-slate-700/60">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={feedSearch}
                onChange={(e) => setFeedSearch(e.target.value)}
                placeholder="Filter feed by ID, keyword, or source..."
                className="w-full pl-9 pr-3.5 py-2 bg-[#0c131c] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Event Stream List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar">
            {filteredEvents.map((evt) => {
              const isSelected = evt.id === selectedEventId;
              const isCritical = evt.severity === 'critical';
              const isHigh = evt.severity === 'high';

              return (
                <div
                  key={evt.id}
                  onClick={() => selectEvent(evt.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#16253b] border-cyan-400 shadow-[0_0_18px_rgba(0,240,255,0.3)]'
                      : 'bg-[#0f1724]/90 hover:bg-[#141f2e] border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSourceIcon(evt.sourceType)}
                      <span className="font-mono font-bold text-xs text-white">
                        {evt.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          isCritical
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                            : isHigh
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                            : 'bg-slate-800 text-slate-300 border border-slate-600/50'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-cyan-300 font-bold">
                        {evt.confidence}% CONF
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openExplainability(evt.id);
                        }}
                        className="text-[10px] text-sky-400 hover:text-cyan-300 underline font-mono cursor-pointer"
                      >
                        Math &rarr;
                      </button>
                    </div>
                  </div>

                  <div className="text-xs font-sans font-semibold text-slate-100 mt-1.5 leading-snug">
                    {evt.title}
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans mt-1 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-700/50 text-[10px] font-mono text-slate-400">
                    <span>
                      {evt.location.lat.toFixed(2)}°N, {evt.location.lng.toFixed(2)}°E
                    </span>
                    {evt.corroboratedBy && evt.corroboratedBy.length > 0 && (
                      <span className="text-cyan-300 font-semibold">
                        +{evt.corroboratedBy.length} Corroborating Feeds
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Feed Adapter Health Telemetry */}
      {activeTab === 'health' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
          <div className="text-xs font-mono text-cyan-400 tracking-wider mb-1">
            5 INGESTION ADAPTER PIPELINES (REAL-TIME TELEMETRY)
          </div>

          <div className="space-y-2.5">
            {sourceHealth.map((sh) => (
              <div
                key={sh.sourceType}
                className="p-3.5 bg-[#0f1724] border border-slate-700/60 rounded-xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-[#080d14] rounded-xl border border-slate-700/60">
                    {getSourceIcon(sh.sourceType)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-white uppercase">
                        {sh.sourceType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          sh.status === 'live'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        }`}
                      >
                        {sh.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Ingested: {sh.totalIngested} observations
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono text-cyan-300 font-bold">
                    {sh.latencyMs} ms
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Reliability: {(sh.reliabilityScore * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

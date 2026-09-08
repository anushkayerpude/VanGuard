import React, { useState } from 'react';
import { useEventStore } from '../../store/useEventStore';
import {
  Sparkles,
  Radio,
  Activity,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Wind,
  Users,
  FileText,
  AlertTriangle,
  Search
} from 'lucide-react';
import type { SourceType } from '../../types/vanguard';
import { RocketDoodle, ConstellationDoodle, SparkleDoodle } from '../Galaxy/GalaxyDoodles';

type FeatureType = 'sitrep' | 'feed' | 'health';

export const FeatureRowsPanel: React.FC = () => {
  // Can have one active expanded feature or null (all 3 sleek & collapsed)
  const [activeFeature, setActiveFeature] = useState<FeatureType | null>('sitrep');
  const [feedSearch, setFeedSearch] = useState('');

  const aiBriefing = useEventStore((s) => s.aiBriefing);
  const events = useEventStore((s) => s.events);
  const selectedEventId = useEventStore((s) => s.selectedEventId);
  const selectEvent = useEventStore((s) => s.selectEvent);
  const openExplainability = useEventStore((s) => s.openExplainability);
  const sourceHealth = useEventStore((s) => s.sourceHealth);

  const toggleFeature = (feat: FeatureType) => {
    setActiveFeature((prev) => (prev === feat ? null : feat));
  };

  const getSourceIcon = (src: SourceType) => {
    switch (src) {
      case 'radar':
        return <Radio className="w-4 h-4 text-cyan-300" />;
      case 'weather':
        return <Wind className="w-4 h-4 text-amber-300" />;
      case 'personnel':
        return <Users className="w-4 h-4 text-emerald-300" />;
      case 'log':
        return <FileText className="w-4 h-4 text-sky-300" />;
      case 'incident':
        return <AlertTriangle className="w-4 h-4 text-rose-300" />;
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
    <div className="flex flex-col justify-center my-auto w-full max-w-xl mx-auto gap-6 sm:gap-7 overflow-hidden transition-all duration-300">
      {/* ========================================================================= */}
      {/* FEATURE ROW 1: AI SITREP // OPERATIONAL INTELLIGENCE (AZURE & CYAN THEME) */}
      {/* ========================================================================= */}
      <div
        className={`flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl ${
          activeFeature === 'sitrep'
            ? 'bg-[#0a1b30]/92 border-cyan-400/90 shadow-[0_0_28px_rgba(0,240,255,0.28)] max-h-[46vh] min-h-[200px]'
            : 'bg-[#0c1e34]/85 border-cyan-500/50 hover:border-cyan-400/90 hover:bg-[#102744]/95 cursor-pointer shrink-0'
        }`}
      >
        {/* Clickable Header Bar */}
        <div
          onClick={() => toggleFeature('sitrep')}
          className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-[#0d2340]/95 via-[#13325c]/90 to-[#0d2340]/95 border-b border-cyan-500/40 hover:from-[#123058] transition"
        >
          <div className="flex items-center space-x-3.5">
            <div
              className={`p-2.5 rounded-xl transition shadow-md ${
                activeFeature === 'sitrep'
                  ? 'bg-gradient-to-tr from-cyan-400 to-sky-500 text-slate-950 shadow-[0_0_14px_rgba(0,240,255,0.55)]'
                  : 'bg-cyan-950/90 border border-cyan-400/60 text-cyan-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-sans font-black text-sm text-cyan-50 tracking-wider uppercase">
                  AI SITREP // INTELLIGENCE
                </span>
                <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-400/60 shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                  100% CITED
                </span>
              </div>
              <div className="text-[11px] text-cyan-200/80 font-sans mt-0.5">
                Autonomous multi-source intelligence briefing &amp; prioritized action directives
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`p-1.5 rounded-xl transition ${
                activeFeature === 'sitrep'
                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-400/50'
                  : 'bg-slate-800/80 text-cyan-200 hover:text-white'
              }`}
            >
              {activeFeature === 'sitrep' ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded View Content */}
        {activeFeature === 'sitrep' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
            {/* Headline Card */}
            <div className="p-3.5 bg-gradient-to-r from-cyan-950/80 via-[#10243d]/95 to-[#0b1b30] border-l-4 border-cyan-400 rounded-r-xl rounded-l-md shadow-md flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest mb-1 font-mono flex items-center space-x-1">
                  <span>SITUATION SUMMARY</span>
                  <SparkleDoodle size={10} />
                </div>
                <div className="text-xs sm:text-sm font-bold text-white leading-snug font-sans">
                  {aiBriefing.headline || 'Active Multi-Source Situational Awareness'}
                </div>
              </div>
              <RocketDoodle size={32} className="hidden sm:inline-block opacity-90 shrink-0 ml-2" />
            </div>

            {/* Executive Grounded Summary */}
            <div className="bg-[#10243d]/90 border border-cyan-500/30 rounded-xl p-3.5 shadow-sm">
              <div className="text-[10px] font-bold tracking-wider uppercase text-cyan-300 mb-1.5 font-mono">
                EXECUTIVE BRIEFING
              </div>
              <p className="text-xs text-slate-100 leading-relaxed font-sans font-normal">
                {aiBriefing.executiveSummary}
              </p>
            </div>

            {/* Key Corroborated Developments */}
            <div className="bg-[#10243d]/90 border border-cyan-500/30 rounded-xl p-3.5 shadow-sm space-y-2.5">
              <div className="text-[10px] font-bold tracking-wider uppercase text-sky-300 font-mono">
                KEY CORROBORATED DEVELOPMENTS
              </div>
              <div className="space-y-2">
                {aiBriefing.keyDevelopments.map((dev, idx) => (
                  <div key={idx} className="text-xs text-slate-100 pl-3 border-l-2 border-cyan-400/80 space-y-1.5">
                    <p className="leading-snug font-sans text-slate-100">{dev.point}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {dev.supportingEventIds.map((eid) => (
                        <button
                          key={eid}
                          onClick={() => selectEvent(eid)}
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase transition flex items-center space-x-1 cursor-pointer ${
                            selectedEventId === eid
                              ? 'bg-cyan-400 text-slate-950 font-black shadow-[0_0_10px_rgba(0,240,255,0.7)] border border-cyan-200'
                              : 'bg-slate-900/95 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300'
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

            {/* Prioritized Action Directives */}
            <div className="bg-[#10243d]/90 border border-cyan-500/30 rounded-xl p-3.5 shadow-sm relative overflow-hidden space-y-2.5">
              <div className="absolute right-3 top-2 pointer-events-none opacity-25">
                <ConstellationDoodle size={45} />
              </div>

              <div className="text-[10px] font-bold tracking-wider uppercase text-amber-300 font-mono">
                PRIORITIZED ACTION DIRECTIVES
              </div>
              <div className="space-y-2 z-10 relative">
                {aiBriefing.prioritizedActions.map((act) => (
                  <div
                    key={act.actionId}
                    className="p-3 bg-[#152e4e]/90 border border-cyan-500/30 rounded-xl flex items-start space-x-3"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-black ${
                        act.priority === 'P1'
                          ? 'bg-rose-600 text-white shadow-[0_0_8px_rgba(225,29,72,0.6)]'
                          : act.priority === 'P2'
                          ? 'bg-amber-600 text-white shadow-[0_0_8px_rgba(217,119,6,0.6)]'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {act.priority}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-sans font-semibold text-white">
                        {act.title}
                      </div>
                      <div className="text-[11px] text-slate-200 font-sans mt-0.5 leading-snug">
                        {act.rationale}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* FEATURE ROW 2: LIVE MULTI-SOURCE FEED (INDIGO & SAPPHIRE THEME) */}
      {/* ========================================================================= */}
      <div
        className={`flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl ${
          activeFeature === 'feed'
            ? 'bg-[#15122e]/92 border-indigo-400/90 shadow-[0_0_28px_rgba(129,140,248,0.28)] max-h-[46vh] min-h-[200px]'
            : 'bg-[#1b1538]/85 border-indigo-500/50 hover:border-indigo-400/90 hover:bg-[#231b46]/95 cursor-pointer shrink-0'
        }`}
      >
        {/* Clickable Header Bar */}
        <div
          onClick={() => toggleFeature('feed')}
          className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-[#1e173e]/95 via-[#2b2158]/90 to-[#1e173e]/95 border-b border-indigo-400/40 hover:from-[#261d4f] transition"
        >
          <div className="flex items-center space-x-3.5">
            <div
              className={`p-2.5 rounded-xl transition shadow-md ${
                activeFeature === 'feed'
                  ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-[0_0_14px_rgba(129,140,248,0.55)]'
                  : 'bg-indigo-950/90 border border-indigo-400/60 text-indigo-300'
              }`}
            >
              <Radio className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-sans font-black text-sm text-indigo-50 tracking-wider uppercase">
                  LIVE MULTI-SOURCE FEED
                </span>
                <span className="text-[10px] text-indigo-200 font-bold bg-indigo-950/90 px-2.5 py-0.5 rounded-full border border-indigo-400/60 font-mono shadow-[0_0_8px_rgba(129,140,248,0.3)]">
                  {events.length} ACTIVE CONTACTS
                </span>
              </div>
              <div className="text-[11px] text-indigo-200/80 font-sans mt-0.5">
                Real-time kinematic radar, weather telemetry, personnel logs, &amp; sensor tripwires
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`p-1.5 rounded-xl transition ${
                activeFeature === 'feed'
                  ? 'bg-indigo-950/90 text-indigo-300 border border-indigo-400/50'
                  : 'bg-slate-800/80 text-indigo-200 hover:text-white'
              }`}
            >
              {activeFeature === 'feed' ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded View Content */}
        {activeFeature === 'feed' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter search bar */}
            <div className="p-3.5 bg-[#120e28]/95 border-b border-indigo-500/40">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-indigo-300" />
                <input
                  type="text"
                  value={feedSearch}
                  onChange={(e) => setFeedSearch(e.target.value)}
                  placeholder="Filter feed by ID, keyword, or source type..."
                  className="w-full pl-9 pr-3.5 py-2 bg-[#1b153b] border border-indigo-400/50 rounded-xl text-xs text-white placeholder-indigo-300/70 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Stream list */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar">
              {filteredEvents.map((evt) => {
                const isSelected = evt.id === selectedEventId;
                const isCritical = evt.severity === 'critical';
                const isHigh = evt.severity === 'high';

                return (
                  <div
                    key={evt.id}
                    onClick={() => selectEvent(evt.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#2b1f52] border-indigo-400 shadow-[0_0_18px_rgba(129,140,248,0.45)]'
                        : 'bg-[#1b153b]/90 hover:bg-[#251d4e] border-indigo-500/30'
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
                              ? 'bg-rose-950 text-rose-200 border border-rose-400/60'
                              : isHigh
                              ? 'bg-amber-950 text-amber-200 border border-amber-400/60'
                              : 'bg-indigo-950 text-indigo-200 border border-indigo-500/60'
                          }`}
                        >
                          {evt.severity}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-indigo-300 font-bold">
                          {evt.confidence}% CONF
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openExplainability(evt.id);
                          }}
                          className="text-[10px] text-sky-300 hover:text-cyan-200 underline font-mono cursor-pointer"
                        >
                          Math &rarr;
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-sans font-semibold text-white mt-1.5 leading-snug">
                      {evt.title}
                    </div>
                    <div className="text-[11px] text-slate-200 font-sans mt-0.5 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-indigo-500/30 text-[10px] font-mono text-indigo-200/80">
                      <span>
                        {evt.location.lat.toFixed(2)}°N, {evt.location.lng.toFixed(2)}°E
                      </span>
                      {evt.corroboratedBy && evt.corroboratedBy.length > 0 && (
                        <span className="text-indigo-300 font-semibold">
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
      </div>

      {/* ========================================================================= */}
      {/* FEATURE ROW 3: FEED ADAPTER PIPELINES (EMERALD & JADE THEME) */}
      {/* ========================================================================= */}
      <div
        className={`flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl ${
          activeFeature === 'health'
            ? 'bg-[#081e18]/92 border-emerald-400/90 shadow-[0_0_28px_rgba(16,185,129,0.28)] max-h-[46vh] min-h-[200px]'
            : 'bg-[#0c241e]/85 border-emerald-500/50 hover:border-emerald-400/90 hover:bg-[#102e26]/95 cursor-pointer shrink-0'
        }`}
      >
        {/* Clickable Header Bar */}
        <div
          onClick={() => toggleFeature('health')}
          className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-[#0d2a23]/95 via-[#133e33]/90 to-[#0d2a23]/95 border-b border-emerald-500/40 hover:from-[#11382e] transition"
        >
          <div className="flex items-center space-x-3.5">
            <div
              className={`p-2.5 rounded-xl transition shadow-md ${
                activeFeature === 'health'
                  ? 'bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 shadow-[0_0_14px_rgba(16,185,129,0.55)]'
                  : 'bg-emerald-950/90 border border-emerald-400/60 text-emerald-300'
              }`}
            >
              <Activity className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-sans font-black text-sm text-emerald-50 tracking-wider uppercase">
                  FEED ADAPTER TELEMETRY
                </span>
                <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-400/60 flex items-center space-x-1.5 font-mono shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>5/5 LIVE PIPELINES</span>
                </span>
              </div>
              <div className="text-[11px] text-emerald-200/80 font-sans mt-0.5">
                Real-time pipeline health, millisecond latencies, &amp; adapter reliability scores
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`p-1.5 rounded-xl transition ${
                activeFeature === 'health'
                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-400/50'
                  : 'bg-slate-800/80 text-emerald-200 hover:text-white'
              }`}
            >
              {activeFeature === 'health' ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded View Content */}
        {activeFeature === 'health' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div className="text-xs font-mono text-emerald-300 font-bold tracking-wider mb-1">
              5 INGESTION ADAPTER PIPELINES (REAL-TIME TELEMETRY)
            </div>

            <div className="space-y-2.5">
              {sourceHealth.map((sh) => (
                <div
                  key={sh.sourceType}
                  className="p-3.5 bg-[#0f2c24]/90 border border-emerald-500/30 rounded-xl flex items-center justify-between shadow-sm hover:border-emerald-400/60 transition"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2 bg-[#0a1f19] rounded-xl border border-emerald-500/40">
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
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-400/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-400/60'
                          }`}
                        >
                          {sh.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-sans mt-0.5">
                        Ingested: {sh.totalIngested} observations
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono text-emerald-300 font-bold">
                      {sh.latencyMs} ms
                    </div>
                    <div className="text-[10px] font-mono text-emerald-200/80">
                      Reliability: {(sh.reliabilityScore * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

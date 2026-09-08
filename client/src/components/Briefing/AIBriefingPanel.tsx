import React, { useState } from 'react';
import { useEventStore } from '../../store/useEventStore';
import {
  Sparkles,
  Radio,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  Wind,
  Users,
  FileText,
  Search,
  CheckCircle2,
  TrendingUp,
  Volume2,
  VolumeX
} from 'lucide-react';
import type { SeverityLevel, SourceType } from '../../types/vanguard';

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
        return <Radio className="w-3.5 h-3.5 text-cyan-400" />;
      case 'weather':
        return <Wind className="w-3.5 h-3.5 text-sky-400" />;
      case 'personnel':
        return <Users className="w-3.5 h-3.5 text-emerald-400" />;
      case 'log':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      case 'incident':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
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
    <div className="flex flex-col h-full bg-[#050910] border border-cyan-500/30 rounded-lg overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="px-3 pt-2.5 pb-1.5 bg-[#09121d] border-b border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('briefing')}
            className={`px-3 py-1.5 rounded text-xs font-sans font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'briefing'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI SITREP</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded text-xs font-sans font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Feed ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded text-xs font-sans font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'health'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Feed Health</span>
          </button>
        </div>

        {activeTab === 'briefing' && (
          <button
            onClick={isVoiceReading ? stopVoiceBriefing : triggerVoiceBriefing}
            className={`px-2 py-1 rounded text-[11px] font-sans font-bold flex items-center space-x-1 transition border cursor-pointer ${
              isVoiceReading
                ? 'bg-cyan-400 text-black border-cyan-300 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-cyan-300'
            }`}
            title="Readout SITREP Summary"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isVoiceReading ? 'Speaking...' : 'Listen'}</span>
          </button>
        )}
      </div>

      {/* Tab 1: AI Briefing Content */}
      {activeTab === 'briefing' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
          {/* Executive Headline Card */}
          <div className="p-3 bg-gradient-to-r from-red-950/50 via-slate-900/60 to-slate-900/40 border-l-4 border-red-500 rounded-r-md">
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1 font-mono">
              OPERATIONAL SITUATION SUMMARY
            </div>
            <div className="text-sm font-bold text-white leading-snug font-sans">
              {aiBriefing.headline || 'Active Multi-Source Situational Awareness'}
            </div>
          </div>

          {/* Grounded Executive Summary */}
          <div className="bg-[#070e17] border border-cyan-500/20 rounded-md p-3">
            <div className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 mb-1.5 font-mono flex items-center justify-between">
              <span>EXECUTIVE BRIEFING</span>
              <span className="text-[9px] text-emerald-400">100% CITED &amp; GROUNDED</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans font-normal">
              {aiBriefing.executiveSummary}
            </p>
          </div>

          {/* Key Corroborated Developments */}
          <div className="bg-[#070e17] border border-cyan-500/20 rounded-md p-3">
            <div className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 mb-2 font-mono">
              KEY CORROBORATED DEVELOPMENTS
            </div>
            <div className="space-y-2.5">
              {aiBriefing.keyDevelopments.map((dev, idx) => (
                <div key={idx} className="text-xs text-slate-300 pl-2.5 border-l-2 border-cyan-500/40">
                  <p className="leading-snug font-sans mb-1.5 text-slate-200">{dev.point}</p>
                  <div className="flex flex-wrap gap-1">
                    {dev.supportingEventIds.map((eid) => (
                      <button
                        key={eid}
                        onClick={() => selectEvent(eid)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition flex items-center space-x-1 cursor-pointer ${
                          selectedEventId === eid
                            ? 'bg-cyan-400 text-black font-black'
                            : 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300'
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
          <div className="bg-[#070e17] border border-cyan-500/20 rounded-md p-3">
            <div className="text-[10px] font-bold tracking-wider uppercase text-amber-400 mb-2 font-mono">
              PRIORITIZED ACTION DIRECTIVES
            </div>
            <div className="space-y-2">
              {aiBriefing.prioritizedActions.map((act) => (
                <div
                  key={act.actionId}
                  className="p-2 bg-slate-900/80 border border-slate-800 rounded flex items-start space-x-2.5"
                >
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black ${
                      act.priority === 'P1'
                        ? 'bg-red-500 text-black'
                        : act.priority === 'P2'
                        ? 'bg-amber-500 text-black'
                        : 'bg-cyan-500 text-black'
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
      )}

      {/* Tab 2: Live Multi-Source Feed */}
      {activeTab === 'feed' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Feed Search Bar */}
          <div className="p-2.5 bg-[#070e17] border-b border-cyan-500/20">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={feedSearch}
                onChange={(e) => setFeedSearch(e.target.value)}
                placeholder="Filter live feed by ID, keyword, or source..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Event Stream List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
            {filteredEvents.map((evt) => {
              const isSelected = evt.id === selectedEventId;
              const isCritical = evt.severity === 'critical';
              const isHigh = evt.severity === 'high';

              return (
                <div
                  key={evt.id}
                  onClick={() => selectEvent(evt.id)}
                  className={`p-2.5 rounded-lg border transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-[#070e17]/80 hover:bg-[#0c1624] border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSourceIcon(evt.sourceType)}
                      <span className="font-mono font-bold text-xs text-white">
                        {evt.id}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                          isCritical
                            ? 'bg-red-950 text-red-400 border border-red-500/40'
                            : isHigh
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {evt.confidence}% CONF
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openExplainability(evt.id);
                        }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-200 underline font-mono cursor-pointer"
                      >
                        Math &rarr;
                      </button>
                    </div>
                  </div>

                  <div className="text-xs font-sans font-semibold text-slate-100 mt-1 leading-snug">
                    {evt.title}
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
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
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
          <div className="text-xs font-mono text-slate-400 mb-1">
            5 INGESTION ADAPTER PIPELINES (REAL-TIME TELEMETRY)
          </div>

          <div className="space-y-2">
            {sourceHealth.map((sh) => (
              <div
                key={sh.sourceType}
                className="p-3 bg-[#070e17] border border-cyan-500/20 rounded-md flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-900 rounded border border-slate-700">
                    {getSourceIcon(sh.sourceType)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-white uppercase">
                        {sh.sourceType}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                          sh.status === 'live'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
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

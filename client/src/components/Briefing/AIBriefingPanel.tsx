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
        return <Radio className="w-3.5 h-3.5 text-[#cfc0c8]" />;
      case 'weather':
        return <Wind className="w-3.5 h-3.5 text-[#cfa07e]" />;
      case 'personnel':
        return <Users className="w-3.5 h-3.5 text-[#6e9b87]" />;
      case 'log':
        return <FileText className="w-3.5 h-3.5 text-[#b39ba8]" />;
      case 'incident':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#c25975]" />;
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
    <div className="flex flex-col h-full bg-[#140f12]/88 border border-[#806874]/35 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(12,9,11,0.5)] backdrop-blur-xl">
      {/* Tab Navigation Header */}
      <div className="px-3 pt-2.5 pb-1.5 bg-[#1a1317]/92 border-b border-[#806874]/35 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab('briefing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'briefing'
                ? 'bg-gradient-to-r from-[#806874] to-[#5e4b55] text-white shadow-[0_0_14px_rgba(128,104,116,0.5)] border border-[#b39ba8]/40'
                : 'text-[#cfc0c8] hover:text-white hover:bg-[#251c22]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI SITREP</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-gradient-to-r from-[#806874] to-[#5e4b55] text-white shadow-[0_0_14px_rgba(128,104,116,0.5)] border border-[#b39ba8]/40'
                : 'text-[#cfc0c8] hover:text-white hover:bg-[#251c22]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Feed ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'health'
                ? 'bg-gradient-to-r from-[#806874] to-[#5e4b55] text-white shadow-[0_0_14px_rgba(128,104,116,0.5)] border border-[#b39ba8]/40'
                : 'text-[#cfc0c8] hover:text-white hover:bg-[#251c22]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Feed Health</span>
          </button>
        </div>

        {activeTab === 'briefing' && (
          <button
            onClick={isVoiceReading ? stopVoiceBriefing : triggerVoiceBriefing}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold flex items-center space-x-1.5 transition border cursor-pointer ${
              isVoiceReading
                ? 'bg-[#c25975] text-white border-[#f5d0d8] shadow-[0_0_10px_rgba(194,89,117,0.6)] animate-pulse'
                : 'bg-[#231b20] border-[#806874]/50 text-[#e5dce1] hover:text-white'
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
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar relative">
          {/* Executive Headline Card with Rocket Doodle */}
          <div className="p-3 bg-gradient-to-r from-[#3d1a24]/80 via-[#261b21]/90 to-[#1e151a]/80 border-l-4 border-[#c25975] rounded-r-lg shadow-md flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-[#f5d0d8] uppercase tracking-wider mb-1 font-mono flex items-center space-x-1">
                <span>OPERATIONAL SITUATION SUMMARY</span>
                <SparkleDoodle size={12} />
              </div>
              <div className="text-sm font-bold text-white leading-snug font-sans">
                {aiBriefing.headline || 'Active Multi-Source Situational Awareness'}
              </div>
            </div>
            <RocketDoodle size={32} className="hidden sm:inline-block opacity-80 shrink-0 ml-2" />
          </div>

          {/* Grounded Executive Summary with Spiral Doodle Watermark */}
          <div className="bg-[#1b1419]/90 border border-[#806874]/30 rounded-lg p-3 shadow-sm relative overflow-hidden">
            <div className="absolute right-2 -bottom-2 pointer-events-none opacity-15">
              <GalaxySpiralDoodle size={64} />
            </div>

            <div className="text-[10px] font-bold tracking-wider uppercase text-[#b39ba8] mb-1.5 font-mono flex items-center justify-between z-10">
              <span>EXECUTIVE BRIEFING</span>
              <span className="text-[9px] text-[#6e9b87] font-bold">100% CITED &amp; GROUNDED</span>
            </div>
            <p className="text-xs text-[#e5dce1] leading-relaxed font-sans font-normal z-10 relative">
              {aiBriefing.executiveSummary}
            </p>
          </div>

          {/* Key Corroborated Developments */}
          <div className="bg-[#1b1419]/90 border border-[#806874]/30 rounded-lg p-3 shadow-sm">
            <div className="text-[10px] font-bold tracking-wider uppercase text-[#b39ba8] mb-2 font-mono">
              KEY CORROBORATED DEVELOPMENTS
            </div>
            <div className="space-y-2.5">
              {aiBriefing.keyDevelopments.map((dev, idx) => (
                <div key={idx} className="text-xs text-[#e5dce1] pl-2.5 border-l-2 border-[#806874]/60">
                  <p className="leading-snug font-sans mb-1.5 text-[#e5dce1]">{dev.point}</p>
                  <div className="flex flex-wrap gap-1">
                    {dev.supportingEventIds.map((eid) => (
                      <button
                        key={eid}
                        onClick={() => selectEvent(eid)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition flex items-center space-x-1 cursor-pointer ${
                          selectedEventId === eid
                            ? 'bg-[#806874] text-white font-black shadow-[0_0_10px_rgba(128,104,116,0.6)] border border-[#cfc0c8]'
                            : 'bg-[#291f25] hover:bg-[#382b33] border border-[#806874]/50 text-[#cfc0c8]'
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
          <div className="bg-[#1b1419]/90 border border-[#806874]/30 rounded-lg p-3 shadow-sm relative overflow-hidden">
            <div className="absolute right-3 top-2 pointer-events-none opacity-20">
              <ConstellationDoodle size={45} />
            </div>

            <div className="text-[10px] font-bold tracking-wider uppercase text-[#cfa07e] mb-2 font-mono flex items-center space-x-1">
              <span>PRIORITIZED ACTION DIRECTIVES</span>
            </div>
            <div className="space-y-2 z-10 relative">
              {aiBriefing.prioritizedActions.map((act) => (
                <div
                  key={act.actionId}
                  className="p-2.5 bg-[#231a20]/90 border border-[#806874]/25 rounded-lg flex items-start space-x-2.5"
                >
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black ${
                      act.priority === 'P1'
                        ? 'bg-[#c25975] text-white shadow-[0_0_6px_rgba(194,89,117,0.5)]'
                        : act.priority === 'P2'
                        ? 'bg-[#cfa07e] text-white shadow-[0_0_6px_rgba(207,160,126,0.5)]'
                        : 'bg-[#806874] text-white'
                    }`}
                  >
                    {act.priority}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-sans font-semibold text-white">
                      {act.title}
                    </div>
                    <div className="text-[11px] text-[#cfc0c8] font-sans mt-0.5 leading-snug">
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
          <div className="p-2.5 bg-[#1b1419] border-b border-[#806874]/25">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#b39ba8]" />
              <input
                type="text"
                value={feedSearch}
                onChange={(e) => setFeedSearch(e.target.value)}
                placeholder="Filter feed by ID, keyword, or source..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#140f12] border border-[#806874]/45 rounded-lg text-xs text-white placeholder-[#b39ba8]/60 focus:outline-none focus:border-[#cfc0c8] focus:ring-1 focus:ring-[#cfc0c8]"
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
                      ? 'bg-[#2f2229] border-[#b39ba8] shadow-[0_0_16px_rgba(128,104,116,0.4)]'
                      : 'bg-[#1b1419]/90 hover:bg-[#251b22] border-[#806874]/25'
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
                            ? 'bg-[#3d1a24] text-[#f5d0d8] border border-[#c25975]/50'
                            : isHigh
                            ? 'bg-[#3b2a33] text-[#faede3] border border-[#cfa07e]/50'
                            : 'bg-[#2b2027] text-[#e5dce1] border border-[#806874]/50'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-[#e5dce1] font-bold">
                        {evt.confidence}% CONF
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openExplainability(evt.id);
                        }}
                        className="text-[10px] text-[#cfc0c8] hover:text-white underline font-mono cursor-pointer"
                      >
                        Math &rarr;
                      </button>
                    </div>
                  </div>

                  <div className="text-xs font-sans font-semibold text-white mt-1 leading-snug">
                    {evt.title}
                  </div>
                  <div className="text-[11px] text-[#cfc0c8] font-sans mt-0.5 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#806874]/25 text-[10px] font-mono text-[#b39ba8]">
                    <span>
                      {evt.location.lat.toFixed(2)}°N, {evt.location.lng.toFixed(2)}°E
                    </span>
                    {evt.corroboratedBy && evt.corroboratedBy.length > 0 && (
                      <span className="text-[#cfc0c8] font-semibold">
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
          <div className="text-xs font-mono text-[#b39ba8] mb-1">
            5 INGESTION ADAPTER PIPELINES (REAL-TIME TELEMETRY)
          </div>

          <div className="space-y-2">
            {sourceHealth.map((sh) => (
              <div
                key={sh.sourceType}
                className="p-3 bg-[#1b1419] border border-[#806874]/30 rounded-lg flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#140f12] rounded-lg border border-[#806874]/40">
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
                            ? 'bg-[#1b2b24] text-[#d6ede3] border border-[#6e9b87]/50'
                            : 'bg-[#3b2a33] text-[#faede3] border border-[#cfa07e]/50'
                        }`}
                      >
                        {sh.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#b39ba8] font-sans mt-0.5">
                      Ingested: {sh.totalIngested} observations
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono text-[#e5dce1] font-bold">
                    {sh.latencyMs} ms
                  </div>
                  <div className="text-[10px] font-mono text-[#b39ba8]">
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

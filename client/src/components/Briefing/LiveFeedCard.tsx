import React, { useState } from 'react';
import { useEventStore } from '../../store/useEventStore';
import {
  Radio,
  Wind,
  Users,
  FileText,
  AlertTriangle,
  Search
} from 'lucide-react';
import type { SourceType } from '../../types/vanguard';

export const LiveFeedCard: React.FC = () => {
  const [feedSearch, setFeedSearch] = useState('');
  const events = useEventStore((s) => s.events);
  const selectedEventId = useEventStore((s) => s.selectedEventId);
  const selectEvent = useEventStore((s) => s.selectEvent);
  const openExplainability = useEventStore((s) => s.openExplainability);

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
    <div className="flex flex-col h-full bg-[#0a1017]/88 border border-slate-700/60 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      {/* Header */}
      <div className="px-4 py-2 bg-[#070b10]/95 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="font-sans font-bold text-xs text-white tracking-wider uppercase">
            LIVE MULTI-SOURCE FEED
          </span>
          <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/40 font-mono">
            {events.length} ACTIVE
          </span>
        </div>

        {/* Search input mini */}
        <div className="relative w-44">
          <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            value={feedSearch}
            onChange={(e) => setFeedSearch(e.target.value)}
            placeholder="Search feed..."
            className="w-full pl-7 pr-2.5 py-1 bg-[#0c131c] border border-slate-700 rounded-lg text-[11px] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Stream List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {filteredEvents.map((evt) => {
          const isSelected = evt.id === selectedEventId;
          const isCritical = evt.severity === 'critical';
          const isHigh = evt.severity === 'high';

          return (
            <div
              key={evt.id}
              onClick={() => selectEvent(evt.id)}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isSelected
                  ? 'bg-[#16253b] border-cyan-400 shadow-[0_0_14px_rgba(0,240,255,0.3)]'
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
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold uppercase ${
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

              <div className="text-xs font-sans font-semibold text-slate-100 mt-1 leading-snug">
                {evt.title}
              </div>
              <div className="text-[11px] text-slate-300 font-sans mt-0.5 line-clamp-1 leading-relaxed">
                {evt.description}
              </div>

              <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-700/50 text-[9px] font-mono text-slate-400">
                <span>
                  {evt.location.lat.toFixed(2)}°N, {evt.location.lng.toFixed(2)}°E
                </span>
                {evt.corroboratedBy && evt.corroboratedBy.length > 0 && (
                  <span className="text-cyan-300 font-semibold">
                    +{evt.corroboratedBy.length} Feeds
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

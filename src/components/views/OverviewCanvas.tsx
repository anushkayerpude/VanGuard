import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  Crosshair,
  Gauge,
  Layers,
  Map as MapIcon,
  Radio,
  Satellite,
  Zap,
  RefreshCw,
  Play,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { UnifiedEvent, AISummary, CorrelationCluster } from '../../types/schema';
import { DemoScenarioMode } from '../../data/scenarioEngine';
import TacticalMap from '../TacticalMap';
import ThreatPostureInstrument from '../intelligence/ThreatPostureInstrument';
import SituationBriefingCard from '../intelligence/SituationBriefingCard';
import { StatTile, ScreenHeading, Chip } from '../ui/tactical';

interface OverviewCanvasProps {
  situation: any;
  events: UnifiedEvent[];
  recenterNonce?: number;
  briefing?: AISummary | null;
  briefingMeta?: { ageMs: number; generating: boolean; groundingVerified: boolean };
  clusters?: CorrelationCluster[];
  selectedEventId?: string;
  onSelectEvent: (event: UnifiedEvent) => void;
  onSelectEventId: (eventId: string) => void;
  easyMode: boolean;
  onNavigateToTab?: (tab: any) => void;
  activeScenario?: DemoScenarioMode | null;
  onInjectScenario?: (scenario: DemoScenarioMode) => void;
  onClearScenario?: () => void;
  onOpenPitchGuide?: () => void;
}

export default function OverviewCanvas({
  situation,
  events,
  recenterNonce = 0,
  briefing,
  briefingMeta,
  clusters = [],
  selectedEventId,
  onSelectEvent,
  onSelectEventId,
  easyMode,
  onNavigateToTab,
  activeScenario,
  onInjectScenario,
  onClearScenario,
  onOpenPitchGuide,
}: OverviewCanvasProps) {
  const [showFlowcard, setShowFlowcard] = useState(true);
  const criticalEvents = events.filter((e) => e.severity === 'critical');
  const anomalyEvents = events.filter((e) => e.isAnomaly);
  const corroborated = events.filter((e) => (e.corroboratedBy?.length ?? 0) > 0);

  const meanConfidence = events.length
    ? Math.round(events.reduce((acc, e) => acc + e.confidence, 0) / events.length)
    : situation?.meanConfidence ?? 0;

  // Distinct feeds currently contributing to the picture
  const activeFeeds = new Set(events.map((e) => e.sourceType)).size;

  const kpis = [
    { label: 'Active Tracks', value: events.length, icon: Radio, tone: 'lime' as const, hint: 'Signals in the live window' },
    { label: 'Critical', value: criticalEvents.length, icon: AlertTriangle, tone: 'rose' as const, hint: 'Severity: critical' },
    { label: 'Anomalies', value: anomalyEvents.length, icon: Crosshair, tone: 'amber' as const, hint: 'Kinematic outliers flagged' },
    { label: 'Corroborated', value: corroborated.length, icon: Layers, tone: 'emerald' as const, hint: 'Confirmed by ≥2 feeds' },
    { label: 'Mean Confidence', value: meanConfidence, unit: '%', icon: Gauge, tone: 'lime' as const, hint: 'Rs × Dt × Bc' },
    { label: 'Fused Clusters', value: clusters.length, icon: Satellite, tone: 'slate' as const, hint: 'Spatiotemporal groups' },
  ];

  return (
    <div className="space-y-4 select-none font-mono pb-2">
      {/* 4-STEP SYSTEM FLOW & PITCH CARD */}
      {showFlowcard && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0c1407] via-[#111c0a] to-[#091007] border border-[#526a27]/70 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#a4c639]/15 border border-[#a4c639]/50 flex items-center justify-center text-[#c6ff00] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-100">
                  HOW VANGUARD WORKS (4-STAGE DEFENCE PIPELINE)
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold">
                  0% HALLUCINATION GUARANTEE
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300 font-sans">
                <span className="flex items-center gap-1 font-bold text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-white/10 text-slate-300 text-[10px] flex items-center justify-center">1</span>
                  5 Ingest Feeds
                </span>
                <span className="text-slate-500">→</span>
                <span className="flex items-center gap-1 font-bold text-[#c6ff00]">
                  <span className="w-4 h-4 rounded-full bg-[#a4c639]/20 text-[#c6ff00] text-[10px] flex items-center justify-center">2</span>
                  Union-Find Fusion (ΔR≤2.1km)
                </span>
                <span className="text-slate-500">→</span>
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center">3</span>
                  Anti-Hallucination Gate
                </span>
                <span className="text-slate-500">→</span>
                <span className="flex items-center gap-1 font-bold text-cyan-300">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center">4</span>
                  Sub-MS FAISS COP
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenPitchGuide && (
              <button
                onClick={onOpenPitchGuide}
                className="px-3 py-1.5 rounded-lg bg-[#a4c639]/20 hover:bg-[#a4c639]/30 border border-[#a4c639] text-[#c6ff00] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pitch Guide & Script</span>
              </button>
            )}
            <button
              onClick={() => setShowFlowcard(false)}
              className="text-slate-400 hover:text-white p-1 text-xs cursor-pointer"
              title="Dismiss pipeline card"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <ScreenHeading
        eyebrow="Common Operating Picture"
        title="Sector Situational Overview"
        icon={Activity}
        description="Every sensor feed fused into one geospatial picture, with the confidence arithmetic behind each track kept visible."
        actions={
          <Chip active>
            <span className="w-1.5 h-1.5 rounded-full bg-[#c6ff00] animate-pulse" />
            {activeFeeds} feeds live
          </Chip>
        }
      />

      {/* 1. KPI INSTRUMENT STRIP — the fusion picture in six numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <StatTile {...kpi} />
          </motion.div>
        ))}
      </div>

      {/* QUICK OPERATIONAL SCENARIO INJECTION STRIP */}
      <div className="p-2.5 rounded-xl bg-[#091007]/90 border border-[#526a27]/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#a4c639] font-bold uppercase flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#c6ff00]" />
            SCENARIO:
          </span>
          {activeScenario ? (
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/80 border border-amber-500 text-amber-300 font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              ACTIVE: {activeScenario.replace(/_/g, ' ')}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#16200d] border border-[#526a27] text-[#a4c639] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c6ff00] animate-pulse" />
              LIVE TELEMETRY STREAM
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'COORDINATED_ATTACK', label: '⚔️ Multi-Axis Incursion' },
            { id: 'AIR_COMBAT_INTERCEPT', label: '✈️ Air Intercept' },
            { id: 'NAVAL_WARFARE_STRIKE', label: '⚓ Naval Strike' },
            { id: 'SUBMARINE_ASW_HUNT', label: '🌊 Submarine ASW' },
            { id: 'OSINT_AI_VERIFICATION', label: '🛡️ OSINT Forensics' },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => onInjectScenario?.(sc.id as any)}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                activeScenario === sc.id
                  ? 'bg-[#1b2711] border border-[#a4c639] text-[#c6ff00] shadow-[0_0_10px_rgba(82,106,39,0.5)]'
                  : 'bg-black/50 border border-white/10 text-slate-300 hover:text-white hover:border-[#a4c639]/60'
              }`}
            >
              {sc.label}
            </button>
          ))}

          {activeScenario && (
            <button
              onClick={onClearScenario}
              className="px-2 py-1 rounded text-[11px] font-bold bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/60 text-rose-300 transition-all cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Live</span>
            </button>
          )}

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('simulation')}
              className="px-2 py-1 rounded text-[11px] font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              All 8 Scenarios →
            </button>
          )}
        </div>
      </div>

      {/* 2. FULL-WIDTH GEOSPATIAL COMMON OPERATING PICTURE */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="vg-panel vg-panel-glow p-1.5 w-full h-[480px]"
      >
        <div className="w-full h-full rounded-xl overflow-hidden relative">
          <TacticalMap
            events={events}
            clusters={clusters}
            recenterNonce={recenterNonce}
            onSelectEvent={onSelectEvent}
            selectedEventId={selectedEventId}
          />
        </div>
      </motion.div>

      {/* 3. THREAT POSTURE & GROUNDED SITUATION BRIEFING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <ThreatPostureInstrument
            situation={situation}
            eventsCount={events.length}
            criticalCount={criticalEvents.length}
            anomalyCount={anomalyEvents.length}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <SituationBriefingCard
            situation={situation}
            briefing={briefing}
            briefingMeta={briefingMeta}
            onSelectEventId={onSelectEventId}
            easyMode={easyMode}
          />
        </motion.div>
      </div>

      {/* Footer readout */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-1 pt-1 vg-label">
        <span className="flex items-center gap-1.5">
          <MapIcon className="w-3 h-3 text-[#526a27]" />
          Projection: Leaflet / WGS-84
        </span>
        <span>Fusion window: ΔR ≤ 2.1 km · ΔT ≤ 18 s</span>
        <span>
          Grounding:{' '}
          <span className={briefingMeta?.groundingVerified ? 'text-emerald-400' : 'text-amber-400'}>
            {briefingMeta?.groundingVerified ? 'verified' : 'pending'}
          </span>
        </span>
      </div>
    </div>
  );
}

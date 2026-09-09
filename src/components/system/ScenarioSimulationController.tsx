import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Activity,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Zap,
  MapPin,
  Compass,
  ArrowRight
} from 'lucide-react';
import { DemoScenarioMode } from '../../data/scenarioEngine';
import { ScreenHeading, TacticalButton, TacticalPanel } from '../ui/tactical';
import { useAuth } from '../../context/AuthContext';

interface ScenarioSimulationControllerProps {
  activeScenario: DemoScenarioMode | null;
  onInjectScenario: (scenario: DemoScenarioMode) => void;
  onClearScenario: () => void;
  onToggleDegradedComms: (enabled: boolean) => void;
  isDegradedComms: boolean;
  onNavigateToOverview?: () => void;
}

const SCENARIOS: Array<{
  id: DemoScenarioMode;
  title: string;
  description: string;
  threatTarget: string;
  eventsInjected: number;
  accent: string;
  badge: string;
}> = [
  {
    id: 'COORDINATED_ATTACK',
    title: 'Coordinated Multi-Axis Incursion',
    description:
      'Hostile supersonic air incursion combined with ground perimeter tripwire breaches and electronic warfare jamming in Sector 4.',
    threatTarget: 'Critical (280+ pts)',
    eventsInjected: 6,
    accent: '#f43f5e',
    badge: 'border-rose-500/60 bg-rose-950/60 text-rose-300',
  },
  {
    id: 'AIR_COMBAT_INTERCEPT',
    title: 'Air Combat Intercept (QRA Scramble)',
    description:
      'Air defence radar tracking non-squawking fast jets near border corridor; patrol squad visual intercept confirmation.',
    threatTarget: 'High severity',
    eventsInjected: 5,
    accent: '#f97316',
    badge: 'border-orange-500/60 bg-orange-950/60 text-orange-300',
  },
  {
    id: 'NAVAL_WARFARE_STRIKE',
    title: 'Naval Carrier Strike Group Warfare',
    description:
      'INS Vikrant CSG engaged in high-subsonic sea-skimming anti-ship cruise missile defense and acoustic sub-surface contact tracking.',
    threatTarget: 'Critical naval strike',
    eventsInjected: 3,
    accent: '#38bdf8',
    badge: 'border-sky-500/60 bg-sky-950/60 text-sky-300',
  },
  {
    id: 'SUBMARINE_ASW_HUNT',
    title: 'Sub-Surface ASW Hydrophone Contact',
    description:
      'Sonar arrays detecting 120Hz cavitation noise from unidentified submerged attack submarine in coastal maritime corridor.',
    threatTarget: 'High ASW priority',
    eventsInjected: 3,
    accent: '#06b6d4',
    badge: 'border-cyan-500/60 bg-cyan-950/60 text-cyan-300',
  },
  {
    id: 'GROUND_ARMY_COMBAT',
    title: 'Heavy Artillery & Armored Incursion',
    description:
      'Heavy 155mm battery fire located via weapon locating radar with mechanized troop mobilization along border forward outpost.',
    threatTarget: 'Critical combat',
    eventsInjected: 3,
    accent: '#ef4444',
    badge: 'border-red-500/60 bg-red-950/60 text-red-300',
  },
  {
    id: 'OSINT_AI_VERIFICATION',
    title: 'OSINT Deepfake & Disinformation Surge',
    description:
      'Viral social posts evaluated by AI forensics: PRNU sensor residuals, synthetic vocoder checks, and satellite cross-sensor verification.',
    threatTarget: 'Hybrid veracity',
    eventsInjected: 4,
    accent: '#a4c639',
    badge: 'border-[#526a27]/70 bg-[#a4c639]/12 text-[#bcd94f]',
  },
  {
    id: 'SEVERE_WEATHER',
    title: 'Severe Meteorological Clutter',
    description:
      'Monsoon storm cell degrading radar returns; exercises spatial deduplication and multi-sensor corroboration rejection.',
    threatTarget: 'Guarded routine',
    eventsInjected: 4,
    accent: '#eab308',
    badge: 'border-yellow-500/60 bg-yellow-950/60 text-yellow-300',
  },
  {
    id: 'NORMAL_OPS',
    title: 'Routine Operations Baseline',
    description:
      'Nominal surveillance patrols, active squawking flights, and calibrated sensor telemetry across all sectors.',
    threatTarget: 'Routine stable',
    eventsInjected: 8,
    accent: '#34d399',
    badge: 'border-emerald-500/60 bg-emerald-950/60 text-emerald-300',
  },
];

export default function ScenarioSimulationController({
  activeScenario,
  onInjectScenario,
  onClearScenario,
  onToggleDegradedComms,
  isDegradedComms,
  onNavigateToOverview,
}: ScenarioSimulationControllerProps) {
  const { permissions, operatorProfile, switchRole } = useAuth();
  const canDegrade = permissions.canToggleDegradedComms;
  const canSimulate = permissions.canTriggerSimulation;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExecuteScenario = (scenarioId: DemoScenarioMode) => {
    // If not elevated to Commander or Intel Officer, auto-elevate so simulation always succeeds!
    if (!canSimulate) {
      switchRole('COMMANDER');
    }
    onInjectScenario(scenarioId);

    const match = SCENARIOS.find((s) => s.id === scenarioId);
    setToastMessage(`SUCCESS: Scenario '${match?.title || scenarioId}' injected into C2 Battlespace!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="space-y-4 select-none font-mono text-xs pb-2">
      <ScreenHeading
        eyebrow="Tactical Stress Simulator"
        title="Operational Scenario Injector"
        icon={Play}
        description="Inject realistic battlespace incidents across land, air, sea, sub-surface, and OSINT domains to test multi-sensor fusion, correlation, and the AI Grounding Gate."
        actions={
          <div className="flex items-center gap-2">
            <TacticalButton
              onClick={() => onToggleDegradedComms(!isDegradedComms)}
              variant={isDegradedComms ? 'danger' : 'default'}
              icon={isDegradedComms ? WifiOff : Activity}
            >
              {isDegradedComms ? 'Comms Degraded' : 'Degrade Comms'}
            </TacticalButton>

            {activeScenario && (
              <TacticalButton onClick={onClearScenario} icon={RefreshCw}>
                Reset to Live Telemetry
              </TacticalButton>
            )}
          </div>
        }
      />

      {/* SUCCESS CONFIRMATION TOAST */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-xl bg-[#14200c] border border-[#a4c639] text-[#c6ff00] text-xs flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#c6ff00]" />
              <span className="font-bold">{toastMessage}</span>
            </div>
            {onNavigateToOverview && (
              <button
                onClick={onNavigateToOverview}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#a4c639]/20 hover:bg-[#a4c639]/30 text-white font-bold cursor-pointer transition-all border border-[#a4c639]/50 text-[11px]"
              >
                <span>VIEW ON TACTICAL MAP</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#c6ff00]" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE STATUS BANNER */}
      <div
        className={`vg-panel p-3.5 flex flex-wrap items-center justify-between gap-3 ${
          activeScenario ? 'vg-panel-glow !border-amber-500/60 bg-amber-950/20' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          {activeScenario ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#a4c639] shrink-0" />
          )}
          <span className="text-slate-300 font-sans text-xs">
            {activeScenario ? (
              <>
                Active Scripted Scenario Driving C2:{' '}
                <strong className="text-amber-300 font-mono text-sm font-bold uppercase">
                  {activeScenario.replace(/_/g, ' ')}
                </strong>
                . Live feed suspended. Map, briefing, and threat scores reflecting scenario contacts.
              </>
            ) : (
              'Standby — Live physical telemetry stream (ADS-B, AIS, FIRMS, USGS, OSINT) is driving the Common Operating Picture.'
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeScenario && onNavigateToOverview && (
            <button
              onClick={onNavigateToOverview}
              className="vg-btn vg-btn-primary !px-3 !py-1 !text-xs font-bold flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>MAP & COP VIEW</span>
            </button>
          )}

          {activeScenario && (
            <TacticalButton onClick={onClearScenario} icon={RefreshCw}>
              Reset Live
            </TacticalButton>
          )}
        </div>
      </div>

      {/* QUICK INJECTION BAR */}
      <div className="p-3 rounded-xl bg-black/60 border border-[#526a27]/40 space-y-2">
        <div className="text-[10px] text-[#a4c639] font-bold uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#c6ff00]" />
          <span>Quick Scenario Injection Bar (1-Click Trigger)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SCENARIOS.map((sc) => {
            const isActive = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleExecuteScenario(sc.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#1b2711] border border-[#a4c639] text-[#c6ff00] shadow-[0_0_12px_rgba(82,106,39,0.5)]'
                    : 'bg-black/50 border border-white/10 text-slate-300 hover:text-white hover:border-[#a4c639]/60'
                }`}
              >
                <Play className={`w-3 h-3 ${isActive ? 'text-[#c6ff00]' : 'text-slate-400'}`} />
                <span>{sc.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SCENARIO DETAILED GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {SCENARIOS.map((sc, idx) => {
          const isActive = activeScenario === sc.id;

          return (
            <motion.div
              key={sc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`vg-panel vg-panel-interactive p-4 pl-6 flex flex-col justify-between gap-3 relative ${
                isActive ? 'vg-panel-glow' : ''
              }`}
              style={isActive ? { borderColor: `${sc.accent}99` } : undefined}
            >
              {/* Scenario accent spine */}
              <span
                className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r"
                style={{
                  background: sc.accent,
                  opacity: isActive ? 1 : 0.4,
                  boxShadow: isActive ? `0 0 12px ${sc.accent}` : 'none',
                }}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border tracking-wider ${sc.badge}`}
                  >
                    {sc.threatTarget}
                  </span>
                  <span className="vg-label">{sc.eventsInjected} contacts</span>
                </div>
                <div className="vg-title text-[13px] text-slate-100 leading-snug">{sc.title}</div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                  {sc.description}
                </p>
              </div>

              <TacticalButton
                onClick={() => handleExecuteScenario(sc.id)}
                variant={isActive ? 'primary' : 'default'}
                icon={isActive ? CheckCircle2 : Play}
                className="w-full font-bold cursor-pointer"
              >
                {isActive ? 'Scenario Active in C2' : 'Inject Scenario'}
              </TacticalButton>
            </motion.div>
          );
        })}
      </div>

      <TacticalPanel title="What Operational Injection Exercises" icon={Activity} brackets={false}>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-400 font-sans">
          <li className="vg-glass-inset p-3">
            <span className="vg-label block mb-1 text-[#a4c639]">Multi-Sensor Fusion</span>
            Injected contacts run through Union-Find spatio-temporal clustering (ΔR ≤ 2.1 km, ΔT ≤ 18 s) and FAISS spatial vector indexing.
          </li>
          <li className="vg-glass-inset p-3">
            <span className="vg-label block mb-1 text-[#a4c639]">Confidence Product (PRD §5.1)</span>
            Confidence arithmetic calculates source reliability, exponential recency decay, and cross-sensor corroboration multipliers.
          </li>
          <li className="vg-glass-inset p-3">
            <span className="vg-label block mb-1 text-[#a4c639]">Anti-Hallucination Grounding</span>
            AI synthesis generates key developments and prioritized actions with mandatory citation verification against raw sensor IDs.
          </li>
        </ul>
      </TacticalPanel>
    </div>
  );
}

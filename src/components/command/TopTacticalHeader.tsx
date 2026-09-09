import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, OperatorRole, ROLE_DEFINITIONS } from '../../context/AuthContext';
import {
  ShieldAlert,
  Radio,
  Search,
  RefreshCw,
  Sliders,
  Terminal,
  Activity,
  Clock,
  Globe,
  Newspaper,
  ShieldCheck,
  Server,
  Play,
  Shield,
  LogOut,
  LogIn,
  ChevronDown,
  Lock,
  KeyRound,
  ArrowLeft,
  UserCheck,
  Workflow,
  Sparkles,
} from 'lucide-react';
import { DemoScenarioMode } from '../../data/scenarioEngine';
import { StatusDot } from '../ui/tactical';

export type NavSection =
  | 'overview'
  | 'events'
  | 'news'
  | 'recon'
  | 'osint'
  | 'timeline'
  | 'sources'
  | 'simulation'
  | 'api_tester'
  | 'architecture';

interface TopTacticalHeaderProps {
  situation: any;
  serverOnline: boolean;
  wsLive?: boolean;
  easyMode: boolean;
  onToggleEasyMode: () => void;
  activeScenario: DemoScenarioMode | null;
  onOpenCommandPalette: () => void;
  onManualRefresh: () => void;
  refreshing: boolean;
  activeTab?: NavSection;
  onTabChange?: (tab: NavSection) => void;
  eventCount?: number;
  anomalyCount?: number;
  onOpenAuthModal?: () => void;
  onNavigateToLanding?: () => void;
  onOpenPitchGuide?: () => void;
}

/** Threat posture vocabulary, shared with the landing page's escalation ladder. */
const THREAT_POSTURE: Record<
  string,
  { badge: string; label: string; bar: string }
> = {
  red: {
    badge: 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.35)]',
    label: 'CRITICAL ESCALATION',
    bar: 'from-rose-600 via-rose-400 to-rose-600',
  },
  orange: {
    badge: 'bg-orange-950/80 border-orange-500/60 text-orange-300',
    label: 'UNSTABLE',
    bar: 'from-orange-600 via-orange-400 to-orange-600',
  },
  yellow: {
    badge: 'bg-yellow-950/80 border-yellow-500/60 text-yellow-300',
    label: 'MODERATE',
    bar: 'from-yellow-600 via-yellow-400 to-yellow-600',
  },
  green: {
    badge: 'bg-[#a4c639]/10 backdrop-blur-md border-[#526a27]/70 text-[#a4c639]',
    label: 'NOMINAL',
    bar: 'from-[#526a27] via-[#a4c639] to-[#526a27]',
  },
};

function UtcClock({ fallbackTime }: { fallbackTime?: string }) {
  const [time, setTime] = useState<string>(() => fallbackTime || new Date().toUTCString());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toUTCString()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="vg-readout text-[10px] font-semibold">{time}</span>;
}

export default function TopTacticalHeader({
  situation,
  serverOnline,
  wsLive = false,
  easyMode,
  onToggleEasyMode,
  activeScenario,
  onOpenCommandPalette,
  onManualRefresh,
  refreshing,
  activeTab = 'overview',
  onTabChange,
  eventCount = 0,
  anomalyCount = 0,
  onOpenAuthModal,
  onNavigateToLanding,
  onOpenPitchGuide,
}: TopTacticalHeaderProps) {
  const { operatorProfile, permissions, switchRole, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [clearanceAlert, setClearanceAlert] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Local chronometer — isolates the 1s tick here instead of re-rendering the
  // whole App tree every second.
  const [now, setNow] = useState<string>(() => new Date().toUTCString());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date().toUTCString()), 1000);
    return () => clearInterval(t);
  }, []);

  // Dismiss the operator menu on any outside click
  useEffect(() => {
    if (!profileDropdownOpen) return;
    const onDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [profileDropdownOpen]);

  const threatLevel = situation?.threatLevel || 'green';
  const threatScore = situation?.threatScore ?? 0;
  const posture = THREAT_POSTURE[threatLevel] ?? THREAT_POSTURE.green;

  const navTabs: Array<{
    id: NavSection;
    label: string;
    icon: any;
    key: string;
    count?: number;
    tag?: string;
    requiredClearance?: string;
    isLocked?: boolean;
    category: 'OPERATIONS' | 'INTELLIGENCE' | 'SYSTEM';
  }> = [
    { id: 'overview', label: 'Overview', icon: Activity, key: 'O', category: 'OPERATIONS' },
    { id: 'events', label: 'Signal Stream', icon: Radio, key: 'E', count: eventCount, category: 'OPERATIONS' },
    {
      id: 'recon',
      label: 'Satellite Recon',
      icon: Globe,
      key: 'R',
      tag: 'ESRI',
      requiredClearance: 'RESTRICTED',
      isLocked: !permissions.canAccessRawTelemetry,
      category: 'OPERATIONS',
    },
    {
      id: 'osint',
      label: 'OSINT Veracity',
      icon: ShieldCheck,
      key: 'V',
      count: anomalyCount,
      requiredClearance: 'SECRET',
      isLocked: !permissions.canAccessOsintSensors,
      category: 'INTELLIGENCE',
    },
    { id: 'news', label: 'Verified News', icon: Newspaper, key: 'N', tag: 'LIVE', category: 'INTELLIGENCE' },
    { id: 'timeline', label: 'Timeline', icon: Clock, key: 'T', category: 'INTELLIGENCE' },
    {
      id: 'simulation',
      label: 'Scenario Injector',
      icon: Play,
      key: 'X',
      tag: 'SIM',
      category: 'SYSTEM',
    },
    {
      id: 'architecture',
      label: 'Architecture & Models',
      icon: Workflow,
      key: 'A',
      tag: 'SPECS',
      category: 'SYSTEM',
    },
    {
      id: 'sources',
      label: 'Topology',
      icon: Server,
      key: 'S',
      requiredClearance: 'RESTRICTED',
      isLocked: !permissions.canAccessRawTelemetry,
      category: 'SYSTEM',
    },
    {
      id: 'api_tester',
      label: 'API Console',
      icon: Terminal,
      key: 'D',
      requiredClearance: 'TS-SCI',
      isLocked: !permissions.canAccessApiConsole,
      category: 'SYSTEM',
    },
  ];

  const handleTabClick = (tab: typeof navTabs[0]) => {
    if (tab.isLocked) {
      setClearanceAlert(`ACCESS DENIED: Section '${tab.label}' requires [${tab.requiredClearance}] clearance.`);
      setTimeout(() => setClearanceAlert(null), 4000);
      return;
    }
    setClearanceAlert(null);
    onTabChange?.(tab.id);
  };

  const currentRoleMeta = operatorProfile ? ROLE_DEFINITIONS[operatorProfile.role] : null;

  return (
    <header className="sticky top-0 z-40 select-none font-mono bg-black/92 backdrop-blur-xl border-b border-[#526a27]/30 text-slate-200">
      {/* THREAT POSTURE IGNITION BAR */}
      <div className={`h-[2px] w-full bg-gradient-to-r ${posture.bar} opacity-80`} />

      {/* RBAC CLEARANCE DENIAL BANNER */}
      <AnimatePresence>
        {clearanceAlert && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-rose-950/95 border-b border-rose-500 text-rose-200 text-xs px-4 py-1.5 flex items-center justify-between font-mono z-50 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="font-bold">{clearanceAlert}</span>
            </div>
            <button
              onClick={() => setClearanceAlert(null)}
              className="text-rose-400 hover:text-white px-2 py-0.5 text-xs font-bold cursor-pointer"
            >
              ✕ DISMISS
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRIMARY HEADER ROW */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-3">
        {/* 1. LEFT: SYSTEM IDENTITY & BACKEND STATUS */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onNavigateToLanding}
            className="flex items-center gap-2.5 group shrink-0"
            title="Return to the VANGUARD overview site"
          >
            <span className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-[#a4c639]/10 backdrop-blur-md border border-[#526a27]/70 group-hover:border-[#a4c639] transition-colors">
              <Shield className="w-3.5 h-3.5 text-[#a4c639]" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#a4c639] vg-pulse-ring" />
            </span>
            <span className="font-heading font-black text-sm tracking-[0.18em] uppercase text-slate-100 group-hover:text-white transition-colors">
              VANGUARD <span className="text-[#a4c639] text-[11px] tracking-widest">C2</span>
            </span>
          </button>

          {/* Feed health readout */}
          <div className="hidden sm:flex items-center gap-2.5 px-2.5 py-1 rounded-lg bg-white/[0.04] backdrop-blur-md border border-[#526a27]/25 text-[10px]">
            <StatusDot online={serverOnline} label={serverOnline ? 'CORE' : 'FALLBACK'} />
            <span className="w-px h-3 bg-[#526a27]/40" />
            <StatusDot online={wsLive} label={wsLive ? 'PUSH' : 'POLL'} />
          </div>

          {activeScenario && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="vg-chip border-amber-500/60 bg-amber-950/80 text-amber-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Scenario Active
            </motion.div>
          )}
        </div>

        {/* 2. CENTER: GLOBAL SEARCH PALETTE BUTTON */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg w-72 justify-between group bg-white/[0.04] backdrop-blur-md border border-[#526a27]/25 hover:border-[#a4c639]/70 hover:bg-[#a4c639]/10 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#a4c639]" />
            <span className="text-[11px]">Search events, sectors, scenarios…</span>
          </span>
          <kbd className="px-1.5 py-0.5 rounded-lg bg-[#a4c639]/10 backdrop-blur-md border border-[#526a27]/50 text-[9px] text-[#a4c639] font-bold">
            CTRL K
          </kbd>
        </button>

        {/* 3. RIGHT: OPERATOR CLEARANCE, THREAT POSTURE & CHRONOMETER */}
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            {!operatorProfile ? (
              <button
                onClick={() => onOpenAuthModal?.()}
                className="vg-btn vg-btn-primary !py-1 !text-[10px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            ) : (
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] backdrop-blur-md border border-[#526a27]/45 hover:border-[#a4c639] text-slate-200 transition-all group cursor-pointer"
              >
                <span className="w-5 h-5 rounded-md bg-[#a4c639]/10 backdrop-blur-md border border-[#526a27] flex items-center justify-center text-[10px] font-bold text-[#a4c639] uppercase">
                  {operatorProfile.displayName ? operatorProfile.displayName.charAt(0) : 'OP'}
                </span>
                <span className="hidden lg:flex flex-col text-left leading-none gap-0.5">
                  <span className="text-[11px] font-bold text-[#a4c639] group-hover:text-white truncate max-w-[120px]">
                    {operatorProfile.callsign || operatorProfile.displayName}
                  </span>
                  <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        currentRoleMeta?.color ? `bg-[${currentRoleMeta.color}]` : 'bg-[#a4c639]'
                      }`}
                    />
                    [{operatorProfile.clearanceLevel}]
                  </span>
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-500 transition-transform ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}

            {/* HIGH-FIDELITY RBAC OPERATOR DROPDOWN */}
            <AnimatePresence>
              {profileDropdownOpen && operatorProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-80 vg-panel vg-panel-glow p-3.5 z-50 space-y-3 text-xs bg-[#091007]/95 border border-[#526a27]/80 shadow-2xl backdrop-blur-xl rounded-xl"
                >
                  {/* OPERATOR DETAILS CARD */}
                  <div className="p-3 rounded-lg bg-[#16200d]/80 border border-[#526a27]/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#a4c639]">
                        ACTIVE C2 CLEARANCE
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${
                          currentRoleMeta?.badgeColor || ''
                        }`}
                      >
                        {operatorProfile.clearanceLevel}
                      </span>
                    </div>
                    <div className="font-bold text-slate-100 text-sm truncate">
                      {operatorProfile.displayName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                      <span>CALLSIGN: <strong className="text-slate-200">{operatorProfile.callsign}</strong></span>
                      <span>{operatorProfile.badgeNumber || 'VG-C2'}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      {operatorProfile.email}
                    </div>
                  </div>

                  {/* LIVE ROLE SWITCHER (RBAC DEMO) */}
                  <div className="space-y-1.5 pt-1 border-t border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                      <span>SWITCH ROLE / CLEARANCE (LIVE RBAC)</span>
                      <KeyRound className="w-3 h-3 text-[#a4c639]" />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['COMMANDER', 'INTEL_OFFICER', 'TACTICAL_OPERATOR', 'ANALYST'] as OperatorRole[]).map(
                        (r) => {
                          const isCurrent = operatorProfile.role === r;
                          const meta = ROLE_DEFINITIONS[r];
                          return (
                            <button
                              key={r}
                              onClick={() => switchRole(r)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-[#1b2711] border-[#a4c639] text-[#c6ff00] shadow-[0_0_10px_rgba(82,106,39,0.3)]'
                                  : 'bg-black/40 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                              }`}
                            >
                              <div className="truncate">{meta.label.split(' ')[0]}</div>
                              <div className="text-[8px] opacity-75">{meta.clearance}</div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* ACTIVE PERMISSIONS MATRIX */}
                  <div className="space-y-1 pt-1 border-t border-white/10 text-[10px]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      PERMITTED CAPABILITIES
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[9px]">
                      <div
                        className={`flex items-center gap-1 ${
                          permissions.canToggleDegradedComms
                            ? 'text-[#c6ff00]'
                            : 'text-slate-600 line-through'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3 shrink-0" /> Comms Override
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          permissions.canTriggerSimulation
                            ? 'text-[#c6ff00]'
                            : 'text-slate-600 line-through'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3 shrink-0" /> Scenarios
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          permissions.canAccessApiConsole
                            ? 'text-[#c6ff00]'
                            : 'text-slate-600 line-through'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3 shrink-0" /> API Diagnostics
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          permissions.canAccessOsintSensors
                            ? 'text-[#c6ff00]'
                            : 'text-slate-600 line-through'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3 shrink-0" /> SIGINT / OSINT
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS: BACK TO LANDING & SIGN OUT */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigateToLanding?.();
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-black/50 border border-[#526a27]/50 hover:border-[#a4c639] text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-[#a4c639]" />
                      <span>Return to Briefing Site</span>
                    </button>

                    <button
                      onClick={async () => {
                        setProfileDropdownOpen(false);
                        await logout();
                        onOpenAuthModal?.();
                      }}
                      className="vg-btn vg-btn-danger w-full text-xs cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out Operator</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* THREAT POSTURE */}
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${posture.badge}`}
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="tracking-wider hidden sm:inline">{posture.label}</span>
            <span className="vg-readout text-[10px] opacity-75">({threatScore})</span>
          </div>

          {/* PITCH GUIDE / PRESENTATION COMPANION BUTTON */}
          {onOpenPitchGuide && (
            <button
              onClick={onOpenPitchGuide}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-[#1c2e0e] to-[#121c0b] border border-[#a4c639] text-[#c6ff00] hover:border-[#c6ff00] hover:bg-[#a4c639]/20 text-[11px] font-bold shadow-[0_0_15px_rgba(198,255,0,0.25)] transition-all cursor-pointer animate-pulse hover:animate-none"
              title="Open Pitch Guide & 60-Second Demo Script (Shortcut: P)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c6ff00]" />
              <span className="hidden sm:inline">PITCH GUIDE</span>
              <kbd className="hidden md:inline px-1 py-0.2 rounded bg-black/60 text-[9px] border border-[#a4c639]/50 text-slate-200">
                P
              </kbd>
            </button>
          )}

          {/* EASY / EXPERT MODE TOGGLE */}
          <button
            onClick={onToggleEasyMode}
            title="Toggle plain-language explanations across the console"
            className={`vg-btn !px-2.5 !py-1 !text-[10px] ${
              easyMode ? '!border-[#a4c639]/70 !bg-[#a4c639]/10 backdrop-blur-md !text-[#a4c639]' : ''
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">{easyMode ? 'Easy COP' : 'Expert'}</span>
          </button>

          {/* SYNC / REFRESH */}
          <button
            onClick={onManualRefresh}
            disabled={refreshing}
            className="vg-btn !px-2 !py-1.5 cursor-pointer"
            title="Force resync with the fusion core"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#a4c639]' : ''}`} />
          </button>

          {/* CHRONOMETER */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] backdrop-blur-md border border-[#526a27]/25 text-slate-300">
            <Clock className="w-3 h-3 text-[#a4c639]" />
            <span className="vg-readout text-[10px] font-semibold">{now}</span>
          </div>
        </div>
      </div>

      {/* SECONDARY ROW: TACTICAL NAVIGATION TABS WITH RBAC LOCKS */}
      {onTabChange && (
        <nav className="w-full flex items-center gap-1.5 px-4 border-t border-[#526a27]/20 bg-black/60 overflow-x-auto scrollbar-none py-0.5">
          {navTabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            const isFirstOfCategory = idx === 0 || tab.category !== navTabs[idx - 1].category;

            return (
              <React.Fragment key={tab.id}>
                {isFirstOfCategory && (
                  <div className={`flex items-center gap-1 pl-2 pr-1 text-[9px] font-bold uppercase tracking-wider select-none ${
                    idx > 0 ? 'border-l border-white/10 ml-1' : ''
                  } ${
                    tab.category === 'OPERATIONS'
                      ? 'text-[#a4c639]'
                      : tab.category === 'INTELLIGENCE'
                      ? 'text-cyan-400'
                      : 'text-amber-400'
                  }`}>
                    <span>{tab.category === 'OPERATIONS' ? 'OPS' : tab.category === 'INTELLIGENCE' ? 'INTEL' : 'SYSTEM'}</span>
                  </div>
                )}
                <button
                  onClick={() => handleTabClick(tab)}
                  title={
                    tab.isLocked
                      ? `Clearance required: ${tab.requiredClearance}`
                      : `${tab.label}  ·  shortcut ${tab.key}`
                  }
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer rounded-lg ${
                    tab.isLocked
                      ? 'text-slate-600 hover:text-rose-400 opacity-60'
                      : isSelected
                      ? 'text-[#c6ff00] bg-white/[0.05]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                  }`}
                >
                <Icon className={`w-3.5 h-3.5 ${tab.isLocked ? 'text-slate-600' : ''}`} />
                <span>{tab.label}</span>
                {tab.isLocked && <Lock className="w-3 h-3 text-rose-400 shrink-0" />}
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 rounded-lg text-[9px] vg-readout ${
                      isSelected
                        ? 'bg-[#33401c] text-[#c6ff00] border border-[#526a27]/70'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.tag && (
                  <span className="px-1 rounded-lg bg-[#a4c639]/10 backdrop-blur-md border border-[#526a27]/50 text-[9px] text-[#a4c639] font-bold">
                    {tab.tag}
                  </span>
                )}
                {/* Shared layout indicator */}
                {isSelected && !tab.isLocked && (
                  <motion.span
                    layoutId="vg-nav-indicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-x-1 -bottom-px h-[2px] rounded-full bg-[#c6ff00] shadow-[0_0_10px_rgba(198,255,0,0.9)]"
                  />
                )}
              </button>
            </React.Fragment>
          );
        })}
        </nav>
      )}
    </header>
  );
}

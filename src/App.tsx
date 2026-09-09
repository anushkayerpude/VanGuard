import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UnifiedEvent, AISummary, CorrelationCluster, BriefingLatestResponse, ThreatLevel } from './types/schema';
import { getScenarioDataset, DemoScenarioMode } from './data/scenarioEngine';
import {
  getSituation,
  getTimeline,
  getEvents,
  getClusters,
  getBriefingLatest,
  postBriefing,
  postQuery,
  postDegraded,
  postScenario,
} from './data/apiClient';
import { LiveStreamClient } from './data/wsClient';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import OperatorAuthModal from './components/auth/OperatorAuthModal';

// Components
import TopTacticalHeader, { NavSection } from './components/command/TopTacticalHeader';
import CommandPalette from './components/command/CommandPalette';
import NlQueryBar from './components/command/NlQueryBar';
import OverviewCanvas from './components/views/OverviewCanvas';
import SignalHorizonStream from './components/intelligence/SignalHorizonStream';
import TemporalIntelligenceTimeline from './components/timeline/TemporalIntelligenceTimeline';
import VerifiedNewsHub from './components/VerifiedNewsHub';
import OsintAuthenticityVerifier from './components/OsintAuthenticityVerifier';
import SourceTopologyMatrix from './components/sources/SourceTopologyMatrix';
import ScenarioSimulationController from './components/system/ScenarioSimulationController';
import ApiConsoleDiagnostics from './components/system/ApiConsoleDiagnostics';
import EventInvestigationDrawer from './components/intelligence/EventInvestigationDrawer';
import EventReconMedia from './components/EventReconMedia';
import VanguardLandingPage from './components/landing/VanguardLandingPage';
import TacticalAuthPage from './components/auth/TacticalAuthPage';
import ArchitectureDeepDivePage from './components/architecture/ArchitectureDeepDivePage';
import DemoPitchCompanionModal from './components/guidance/DemoPitchCompanionModal';
import { SmoothScrollProvider } from './components/common/SmoothScrollProvider';

function AppContent() {
  useTheme();
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'console' | 'architecture'>('landing');
  const [activeTab, setActiveTab] = useState<NavSection>('overview');
  const [pitchGuideOpen, setPitchGuideOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [wsLive, setWsLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isFirstLoadRef = useRef(true);
  const mainScrollRef = useRef<HTMLElement | null>(null);

  // Smooth scroll workspace to top whenever the operator switches navigation tabs
  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Core Data States
  const [situation, setSituation] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [sourcesHealth, setSourcesHealth] = useState<any[]>([]);
  const [clusters, setClusters] = useState<CorrelationCluster[]>([]);
  const [briefing, setBriefing] = useState<AISummary | null>(null);
  const [briefingMeta, setBriefingMeta] = useState<Pick<BriefingLatestResponse, 'ageMs' | 'generating' | 'groundingVerified'>>({
    ageMs: 0,
    generating: false,
    groundingVerified: false,
  });
  const [selectedEvent, setSelectedEvent] = useState<UnifiedEvent | null>(null);
  const [easyMode, setEasyMode] = useState<boolean>(true);
  const [activeScenario, setActiveScenario] = useState<DemoScenarioMode | null>(null);
  const [scenarioNonce, setScenarioNonce] = useState(0);
  const [isDegradedComms, setIsDegradedComms] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Signature cache: avoids redundant setState → whole-tree re-renders when the
  // WS/REST picture is byte-identical across 3s ticks / 5s polls.
  const liveFrameSig = useRef<Record<string, string>>({});

  // Natural-language omnibar filter (POST /ai/query)
  const [nlQuery, setNlQuery] = useState<string>('');
  const [nlResult, setNlResult] = useState<{ interpretation: string; parser: string; latencyMs: number; matchedEventIds: string[] } | null>(null);

  const refreshBriefing = useCallback(async () => {
    try {
      const brief = await getBriefingLatest();
      setBriefingMeta({
        ageMs: brief.ageMs,
        generating: brief.generating,
        groundingVerified: brief.groundingVerified,
      });
      if (brief.summary) {
        setBriefing(brief.summary);
      } else if (!brief.generating) {
        // No briefing cached yet and none generating — trigger the first synthesis.
        const forced = await postBriefing();
        setBriefing(forced.summary);
        setBriefingMeta((m) => ({ ...m, groundingVerified: forced.groundingVerified }));
      }
    } catch {
      // Backend down — briefing stays at its last value (or null on first load).
    }
  }, []);

  // Fetch live backend data from the fusion REST server
  const fetchBackendData = useCallback(async (isManualSync = false) => {
    if (isManualSync) {
      setRefreshing(true);
      setActiveScenario(null);
    }
    if (events.length === 0 || isManualSync) {
      setLoading(true);
    }
    try {
      // 1. Situation Current
      const sitRes = await getSituation();
      setServerOnline(true);
      if (!activeScenario || isManualSync) {
        const sitSig = JSON.stringify(sitRes.situation);
        if (sitSig !== liveFrameSig.current.situation) {
          liveFrameSig.current.situation = sitSig;
          setSituation(sitRes.situation);
        }
        const srcSig = JSON.stringify(sitRes.sources);
        if (srcSig !== liveFrameSig.current.sources) {
          liveFrameSig.current.sources = srcSig;
          setSourcesHealth(sitRes.sources);
        }
      }

      // 2. Timeline (escalation audit log)
      const timeRes = await getTimeline();
      const timelineData = Array.isArray(timeRes) ? timeRes : timeRes.timeline || [];
      const timeSig = JSON.stringify(timelineData);
      if (timeSig !== liveFrameSig.current.timeline) {
        liveFrameSig.current.timeline = timeSig;
        setTimeline(timelineData);
      }

      // 3. Events (active in-memory events, capped)
      const evtRes = await getEvents();
      if (!activeScenario || isManualSync) {
        let sig = '';
        for (const evt of evtRes.events) {
          sig += evt.id === undefined ? '' : evt.id;
          sig += ':' + (evt.timestamp ?? '') + ':' + (evt.confidence ?? '') + '|';
        }
        if (sig !== liveFrameSig.current.events) {
          liveFrameSig.current.events = sig;
          setEvents(evtRes.events || []);
        }
      }

      // 4. Correlation clusters (map clustering + topology)
      const cluRes = await getClusters();
      const clustersData = (cluRes.clusters ?? []).map(({ events: _e, ...cluster }) => cluster);
      const cluSig = JSON.stringify(clustersData);
      if (cluSig !== liveFrameSig.current.clusters) {
        liveFrameSig.current.clusters = cluSig;
        setClusters(clustersData);
      }

      // 5. Cached AI briefing (never blocks).
      await refreshBriefing();
    } catch (err) {
      console.warn('[Frontend] Backend unreachable at localhost:3001, utilizing resilient fallback:', err);
      setServerOnline(false);
    } finally {
      setLoading(false);
      if (isManualSync) setRefreshing(false);
    }
  }, [events.length, activeScenario, refreshBriefing]);

  // Polling — runs every 5s
  useEffect(() => {
    fetchBackendData();
    const pollTimer = setInterval(() => fetchBackendData(false), 5000);
    return () => {
      clearInterval(pollTimer);
    };
  }, [fetchBackendData]);

  // WebSocket live pump — keeps real-time feed active without tearing down
  useEffect(() => {
    const client = new LiveStreamClient(undefined, {
      state: (state) => setWsLive(state === 'open'),
      situationUpdate: (frame) => {
        if (activeScenario) return;
        const sig = JSON.stringify(frame.payload.situation);
        if (sig === liveFrameSig.current.situation) return;
        liveFrameSig.current.situation = sig;
        setSituation(frame.payload.situation);
      },
      healthStatus: (frame) => {
        if (activeScenario) return;
        const sig = JSON.stringify(frame.payload.sources);
        if (sig === liveFrameSig.current.sources) return;
        liveFrameSig.current.sources = sig;
        setSourcesHealth(frame.payload.sources);
      },
      briefingUpdate: (frame) => {
        if (activeScenario) return;
        const sig = frame.payload.summary ? JSON.stringify(frame.payload.summary) : '';
        if (sig === liveFrameSig.current.briefing) return;
        liveFrameSig.current.briefing = sig;
        setBriefing(frame.payload.summary);
        setBriefingMeta((m) => ({ ...m, groundingVerified: true }));
      },
      eventStream: (frame) => {
        if (activeScenario) return; // scenario mode overrides the live picture
        // Build a cheap signature of the incoming picture; skip the state update
        // entirely when nothing changed so the COP does not re-render every tick.
        let sig = '';
        for (const evt of frame.payload.events) {
          sig += evt.id === undefined ? '' : evt.id;
          sig += ':' + (evt.timestamp ?? '') + ':' + (evt.confidence ?? '') + '|';
        }
        if (sig === liveFrameSig.current.events) return;
        liveFrameSig.current.events = sig;
        setEvents((prev) => {
          const byId = new Map(prev.map((e) => [e.id, e]));
          for (const evt of frame.payload.events) byId.set(evt.id, evt);
          const merged = [...byId.values()];
          return merged.length > 200 ? merged.slice(-200) : merged;
        });
      },
      clusterUpdate: (frame) => {
        if (activeScenario) return;
        const sig = JSON.stringify(frame.payload.clusters);
        if (sig === liveFrameSig.current.clusters) return;
        liveFrameSig.current.clusters = sig;
        setClusters(frame.payload.clusters);
      },
      escalation: (frame) => {
        if (activeScenario) return;
        const sig = JSON.stringify(frame.payload.record);
        if (sig === liveFrameSig.current.escalation) return;
        liveFrameSig.current.escalation = sig;
        setTimeline((prev) => [frame.payload.record, ...prev].slice(0, 200));
      },
      degradedMode: (frame) => {
        if (activeScenario) return;
        setIsDegradedComms(frame.payload.enabled);
      },
      alertTrigger: (frame) => {
        if (activeScenario) return;
        const evt = frame.payload.event;
        setEvents((prev) => {
          const byId = new Map(prev.map((e) => [e.id, e]));
          byId.set(evt.id, evt);
          const merged = [...byId.values()];
          return merged.length > 200 ? merged.slice(-200) : merged;
        });
      },
      resync: () => {
        fetchBackendData(false);
      },
    });
    client.connect();
    return () => client.close();
  }, [fetchBackendData, activeScenario]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'o' || e.key === 'O') {
        setActiveTab('overview');
      } else if (e.key === 'e' || e.key === 'E') {
        setActiveTab('events');
      } else if (e.key === 't' || e.key === 'T') {
        setActiveTab('timeline');
      } else if (e.key === 'n' || e.key === 'N') {
        setActiveTab('news');
      } else if (e.key === 'v' || e.key === 'V') {
        setActiveTab('osint');
      } else if (e.key === 'r' || e.key === 'R') {
        setActiveTab('recon');
      } else if (e.key === 's' || e.key === 'S') {
        setActiveTab('sources');
      } else if (e.key === 'x' || e.key === 'X') {
        setActiveTab('simulation');
      } else if (e.key === 'd' || e.key === 'D') {
        setActiveTab('api_tester');
      } else if (e.key === 'p' || e.key === 'P') {
        // Only trigger if not focused in an input
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          setPitchGuideOpen((prev) => !prev);
        }
      } else if (e.key === 'l' || e.key === 'L') {
        setViewMode((prev) => (prev === 'landing' ? 'console' : 'landing'));
      } else if (e.key === 'Escape') {
        setSelectedEvent(null);
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Scenario Injections
  const handleInjectScenario = async (mode: DemoScenarioMode) => {
    setActiveScenario(mode);
    setScenarioNonce((n) => n + 1);
    const scenario = getScenarioDataset(mode);

    // 1. Situation Posture
    setSituation({
      threatLevel: scenario.threatLevel,
      threatScore: scenario.events.reduce(
        (acc, e) => acc + (e.severity === 'critical' ? 250 : e.severity === 'high' ? 100 : 25),
        0
      ),
      activeAlertsCount: scenario.events.length,
      criticalCount: scenario.events.filter((e) => e.severity === 'critical').length,
      totalEvents: scenario.events.length,
      meanConfidence: Math.round(
        scenario.events.reduce((acc, e) => acc + e.confidence, 0) / (scenario.events.length || 1)
      ),
      headline: `${scenario.name} — ${scenario.description}`,
    });

    // 2. Events & Feed Health
    setEvents(scenario.events);
    setSourcesHealth(scenario.sourcesHealth);

    // 3. Auto-select primary critical event
    const primary = scenario.events.find((e) => e.severity === 'critical') || scenario.events[0];
    if (primary) {
      setSelectedEvent(primary);
    }

    // 4. Generate Synthesized Scenario Clusters
    const avgLat = scenario.events.reduce((s, e) => s + e.location.lat, 0) / (scenario.events.length || 1);
    const avgLng = scenario.events.reduce((s, e) => s + e.location.lng, 0) / (scenario.events.length || 1);
    const scenarioClusters: CorrelationCluster[] = [
      {
        id: `clust-${mode.toLowerCase()}-01`,
        eventIds: scenario.events.map((e) => e.id),
        distinctSources: Array.from(new Set(scenario.events.map((e) => e.sourceType))),
        centroid: { lat: avgLat, lng: avgLng },
        radiusMeters: 3200,
        firstSeen: new Date(Date.now() - 60000).toISOString(),
        lastSeen: new Date().toISOString(),
        peakSeverity: (primary?.severity as any) || 'critical',
        meanConfidence: Math.round(
          scenario.events.reduce((s, e) => s + e.confidence, 0) / (scenario.events.length || 1)
        ),
      },
    ];
    setClusters(scenarioClusters);

    // 5. Generate Tailored AI Tactical Intelligence Briefing
    const scenarioBriefing: AISummary = {
      generatedAt: new Date().toISOString(),
      threatLevel: (scenario.threatLevel?.toLowerCase() as ThreatLevel) || 'orange',
      headline: `${scenario.name} — ACTIVE THREAT CONVERGENCE`,
      executiveSummary: `Tactical C2 has ingested scripted incident [${scenario.name}]. Multi-sensor correlation confirms active convergence across ${scenario.sourcesHealth.length} feeds. Grounding verification active.`,
      overallConfidence: Math.round(
        scenario.events.reduce((s, e) => s + e.confidence, 0) / (scenario.events.length || 1)
      ),
      keyDevelopments: scenario.events.slice(0, 4).map((evt) => ({
        point: `${evt.title}: ${evt.description}`,
        supportingEventIds: [evt.id, ...(evt.corroboratedBy || [])],
      })),
      prioritizedActions: [
        {
          action: `Establish 360° defensive perimeter around sector ${primary?.id || 'ALPHA'}.`,
          urgency: 5,
          supportingEventIds: [primary?.id || scenario.events[0]?.id || ''],
        },
        {
          action: 'Cross-reference satellite multispectral passes with primary radar return residuals.',
          urgency: 4,
          supportingEventIds: scenario.events.slice(0, 2).map((e) => e.id),
        },
        {
          action: 'Alert tactical command net and ready kinetic interdiction elements.',
          urgency: 4,
          supportingEventIds: scenario.events.map((e) => e.id).slice(0, 3),
        },
      ],
      coursesOfAction: [
        {
          id: 'coa-scenario-01',
          title: 'Immediate Defensive Scramble',
          description: 'Vector quick-reaction intercept assets to lock target coordinates and interdict trajectory.',
          pros: ['Halts incursion immediately', 'Secures high-value ground assets'],
          tradeoffs: ['Commits ready reserve squadrons'],
          recommendedUrgency: 5,
          supportingEventIds: [primary?.id || ''],
        },
      ],
      provenance: {
        engine: 'deterministic',
        model: 'Scenario Grounded Engine',
        latencyMs: 14,
        eventsConsidered: scenario.events.length,
        citationsStripped: 0,
        claimsDiscarded: 0,
      },
    };
    setBriefing(scenarioBriefing);
    setBriefingMeta({
      ageMs: 0,
      generating: false,
      groundingVerified: true,
    });

    // 6. Prepend Timeline Escalation Record
    const escalationRecord: any = {
      id: `esc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      from: 'green',
      to: (scenario.threatLevel?.toLowerCase() as ThreatLevel) || 'orange',
      score: 280,
      reason: `Operational Injection: ${scenario.name} triggered by C2 Operator`,
      triggerEventIds: [primary?.id || scenario.events[0]?.id || ''],
    };
    setTimeline((prev) => [escalationRecord, ...prev]);

    // 7. Trigger backend simulation endpoint if online
    try {
      await postScenario(mode);
    } catch {
      console.log('[Scenario Injector] Local mock scenario engine successfully active:', mode);
    }
  };

  const handleClearScenario = () => {
    setActiveScenario(null);
    fetchBackendData(true);
  };

  const handleSelectEventId = (eventId: string) => {
    const found = events.find((e) => e.id === eventId);
    if (found) {
      setSelectedEvent(found);
    }
  };

  const handleToggleDegradedComms = async (enabled: boolean) => {
    setIsDegradedComms(enabled);
    try {
      await postDegraded(enabled);
      fetchBackendData(false);
    } catch (e) {
      console.warn('Degraded comms simulation fallback');
    }
  };

const handleRunNlQuery = async (query: string) => {
  setNlQuery(query);
  try {
    const res = await postQuery(query);
      setNlResult({
        interpretation: res.interpretation,
        parser: res.parser,
        latencyMs: res.latencyMs,
        matchedEventIds: res.matchedEventIds,
      });
    } catch {
      setNlResult(null);
    }
  };

  const handleClearNlQuery = () => {
    setNlQuery('');
    setNlResult(null);
  };

  const anomalyCount = events.filter((e) => e.isAnomaly).length;
  const viewEvents = nlResult ? events.filter((e) => nlResult.matchedEventIds.includes(e.id)) : events;

  if (viewMode === 'landing') {
    return (
      <VanguardLandingPage
        onLaunchCop={() => setViewMode('login')}
        onOpenArchitecture={() => setViewMode('architecture')}
        serverOnline={serverOnline}
        eventCount={events.length}
        threatLevel={situation?.threatLevel}
      />
    );
  }

  if (viewMode === 'login') {
    return (
      <TacticalAuthPage
        onAuthenticated={() => setViewMode('console')}
        onBackToLanding={() => setViewMode('landing')}
        onOpenArchitecture={() => setViewMode('architecture')}
        serverOnline={serverOnline}
      />
    );
  }

  if (viewMode === 'architecture') {
    return (
      <ArchitectureDeepDivePage
        onBackToLanding={() => setViewMode('landing')}
        onLaunchConsole={() => setViewMode('console')}
        serverOnline={serverOnline}
      />
    );
  }

  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-black text-slate-200 font-sans selection:bg-[#a4c639] selection:text-black">
      {/* 0. CONSOLE BACKDROP — hairline tactical grid under every screen */}
      <div className="pointer-events-none fixed inset-0 vg-console-bg opacity-70" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(82,106,39,0.12), transparent 60%), radial-gradient(ellipse 70% 50% at 50% 100%, rgba(0,0,0,0.9), transparent 70%)',
        }}
      />

      {/* 1. TOP TACTICAL COMMAND HEADER */}
      <TopTacticalHeader
        situation={situation}
        serverOnline={serverOnline && wsLive}
        wsLive={wsLive}
        easyMode={easyMode}
        onToggleEasyMode={() => setEasyMode(!easyMode)}
        activeScenario={activeScenario}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onManualRefresh={() => fetchBackendData(true)}
        refreshing={refreshing}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        eventCount={viewEvents.length}
        anomalyCount={anomalyCount}
        onOpenAuthModal={() => setViewMode('login')}
        onNavigateToLanding={() => setViewMode('landing')}
        onOpenPitchGuide={() => setPitchGuideOpen(true)}
      />

      {/* 2. PRIMARY FULL-WIDTH OPERATIONAL WORKSPACE */}
      <div className="relative flex-1 flex flex-col min-w-0 overflow-hidden">
        <main
          ref={mainScrollRef}
          id="tactical-main-scroll"
          data-lenis-prevent
          className="flex-1 overflow-y-auto p-4 md:p-5 relative scroll-smooth"
        >
          {/* DEGRADED COMMS AMBER SCANLINE OVERLAY */}
          {isDegradedComms && (
            <>
              <div className="fixed inset-0 degraded-scanlines z-10 pointer-events-none" />
              <div className="fixed top-[104px] left-1/2 -translate-x-1/2 z-30 pointer-events-none vg-chip border-amber-500/60 bg-amber-950/90 text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.35)]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Degraded comms — reduced feed fidelity
              </div>
            </>
          )}

          {/* VIEW ROUTING — each screen fades in so tab switches read as a
              deliberate instrument change rather than a hard cut. */}
          <div key={activeTab} className="vg-fade-up h-full">
          {activeTab === 'overview' && (
            <OverviewCanvas
              situation={situation}
              events={viewEvents}
              recenterNonce={scenarioNonce}
              briefing={briefing}
              briefingMeta={briefingMeta}
              clusters={clusters}
              selectedEventId={selectedEvent?.id}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
              onSelectEventId={handleSelectEventId}
              easyMode={easyMode}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              activeScenario={activeScenario}
              onInjectScenario={handleInjectScenario}
              onClearScenario={handleClearScenario}
              onOpenPitchGuide={() => setPitchGuideOpen(true)}
            />
          )}

          {activeTab === 'events' && (
            <div className="flex flex-col gap-3 h-full">
              <NlQueryBar
                activeQuery={nlQuery}
                result={nlResult}
                onRun={handleRunNlQuery}
                onClear={handleClearNlQuery}
              />
              <div className="flex-1 min-h-0">
                <SignalHorizonStream
                  events={viewEvents}
                  selectedEventId={selectedEvent?.id}
                  onSelectEvent={(evt) => setSelectedEvent(evt)}
                  easyMode={easyMode}
                />
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <TemporalIntelligenceTimeline
              timeline={timeline}
              events={viewEvents}
              selectedEventId={selectedEvent?.id}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
            />
          )}

          {activeTab === 'news' && (
            <div className="h-[calc(100vh-140px)] flex flex-col overflow-y-auto">
              <VerifiedNewsHub
                event={selectedEvent || events[0]}
                isStandaloneTab={true}
              />
            </div>
          )}

          {activeTab === 'recon' && (
            <div className="h-[calc(100vh-140px)] flex flex-col overflow-y-auto">
              <EventReconMedia
                event={
                  selectedEvent ||
                  events[0] || {
                    id: 'RECON-001',
                    sourceType: 'radar',
                    title: 'Sector 04 Satellite Surveillance & Recon Grid',
                    description: 'High-resolution orbital satellite optical surveillance and multispectral reconnaissance imagery of Sector 04 AO.',
                    location: { lat: 23.0225, lng: 72.5714 },
                    severity: 'high',
                    confidence: 92,
                    timestamp: new Date().toISOString(),
                    corroboratedBy: [],
                    isAnomaly: false,
                    raw: {}
                  }
                }
              />
            </div>
          )}

          {activeTab === 'osint' && (
            <OsintAuthenticityVerifier
              events={events}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
            />
          )}

          {activeTab === 'sources' && (
            <SourceTopologyMatrix
              sourcesHealth={sourcesHealth}
              onToggleDegradedComms={handleToggleDegradedComms}
              isDegradedComms={isDegradedComms}
            />
          )}

          {activeTab === 'simulation' && (
            <ScenarioSimulationController
              activeScenario={activeScenario}
              onInjectScenario={handleInjectScenario}
              onClearScenario={handleClearScenario}
              onToggleDegradedComms={handleToggleDegradedComms}
              isDegradedComms={isDegradedComms}
              onNavigateToOverview={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'api_tester' && <ApiConsoleDiagnostics />}

          {activeTab === 'architecture' && (
            <ArchitectureDeepDivePage
              onBackToLanding={() => setViewMode('landing')}
              onLaunchConsole={() => setActiveTab('overview')}
              serverOnline={serverOnline}
            />
          )}
          </div>
        </main>
      </div>

      {/* 3. CONTEXTUAL EDGE INVESTIGATION DRAWER */}
      {selectedEvent && (
        <EventInvestigationDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSelectCorrelatedEvent={handleSelectEventId}
          easyMode={easyMode}
        />
      )}

      {/* 4. COMMAND PALETTE (CTRL + K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setCommandPaletteOpen(false);
        }}
        events={events}
        onSelectEvent={(evt) => {
          setSelectedEvent(evt);
          setCommandPaletteOpen(false);
        }}
        onInjectScenario={(sc) => {
          handleInjectScenario(sc);
          setCommandPaletteOpen(false);
        }}
      />

      {/* 5. OPERATOR AUTH MODAL */}
      <OperatorAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* 6. DEMO PITCH COMPANION & GUIDE MODAL */}
      <DemoPitchCompanionModal
        isOpen={pitchGuideOpen}
        onClose={() => setPitchGuideOpen(false)}
        onInjectScenario={handleInjectScenario}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setPitchGuideOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SmoothScrollProvider>
          <AppContent />
        </SmoothScrollProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
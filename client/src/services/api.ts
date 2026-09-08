/**
 * VANGUARD — Dual-Mode API Client.
 *
 * Automatically talks to the live Express/TypeScript backend at port 3001
 * with built-in health probing and fallback detection.
 */

import type { UnifiedEvent, AISummary, SourceHealth, ThreatLevel } from '../types/vanguard';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api/v1';

export interface CurrentSituationResponse {
  situation: {
    threatLevel: ThreatLevel;
    threatScore: number;
    activeAlertsCount: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    summary: string;
    updatedAt: string;
    degradedMode: boolean;
  };
}

export interface EventsResponse {
  count: number;
  events: UnifiedEvent[];
}

export interface EventDetailResponse {
  event: UnifiedEvent;
  correlations: UnifiedEvent[];
  correlationCount: number;
}

export interface LatestBriefingResponse {
  briefing: AISummary;
}

export interface SourceHealthResponse {
  sources: SourceHealth[];
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: string;
      coordinates: any;
    };
    properties: Record<string, any>;
  }>;
}

/** Check if live backend server is reachable */
export async function probeBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:3001/health', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === 'ok';
  } catch {
    return false;
  }
}

/** Fetch current threat situation */
export async function fetchCurrentSituation(): Promise<CurrentSituationResponse['situation']> {
  const res = await fetch(`${API_BASE}/situation/current`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch situation`);
  const data: CurrentSituationResponse = await res.json();
  return data.situation;
}

/** Fetch unified events */
export async function fetchEvents(params?: {
  source?: string;
  severity?: string;
  limit?: number;
}): Promise<UnifiedEvent[]> {
  const url = new URL(`${API_BASE}/events`);
  if (params?.source) url.searchParams.set('source', params.source);
  if (params?.severity) url.searchParams.set('severity', params.severity);
  if (params?.limit) url.searchParams.set('limit', String(params.limit));

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch events`);
  const data: EventsResponse = await res.json();
  return data.events;
}

/** Fetch single event with its corroboration chain */
export async function fetchEventCorrelations(eventId: string): Promise<EventDetailResponse> {
  const res = await fetch(`${API_BASE}/events/${encodeURIComponent(eventId)}/correlations`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch event correlations`);
  return res.json();
}

/** Fetch latest AI briefing */
export async function fetchLatestBriefing(): Promise<AISummary> {
  const res = await fetch(`${API_BASE}/ai/briefing/latest`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch AI briefing`);
  const data: LatestBriefingResponse = await res.json();
  return data.briefing;
}

/** Trigger fresh briefing generation */
export async function triggerNewBriefing(): Promise<AISummary> {
  const res = await fetch(`${API_BASE}/ai/briefing`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to trigger AI briefing`);
  const data: LatestBriefingResponse = await res.json();
  return data.briefing;
}

/** Submit Natural Language query to omnibar parser */
export async function queryOmnibar(query: string): Promise<any> {
  const res = await fetch(`${API_BASE}/ai/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to parse query`);
  return res.json();
}

/** Fetch source health monitoring metrics */
export async function fetchSourceHealth(): Promise<SourceHealth[]> {
  const res = await fetch(`${API_BASE}/intelligence/source-health`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch source health`);
  const data: SourceHealthResponse = await res.json();
  return data.sources;
}

/** Fetch GeoJSON map layer: assets */
export async function fetchMapAssets(): Promise<GeoJsonFeatureCollection> {
  const res = await fetch(`${API_BASE}/map/assets`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch map assets`);
  return res.json();
}

/** Fetch GeoJSON map layer: alerts */
export async function fetchMapAlerts(): Promise<GeoJsonFeatureCollection> {
  const res = await fetch(`${API_BASE}/map/alerts`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch map alerts`);
  return res.json();
}

/** Fetch GeoJSON map layer: zones */
export async function fetchMapZones(): Promise<GeoJsonFeatureCollection> {
  const res = await fetch(`${API_BASE}/map/zones`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch map zones`);
  return res.json();
}

/** Fetch GeoJSON map layer: weather grid */
export async function fetchMapWeather(): Promise<GeoJsonFeatureCollection> {
  const res = await fetch(`${API_BASE}/map/weather`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch map weather`);
  return res.json();
}

/** Inject a tactical simulation scenario */
export async function injectScenario(scenario: string): Promise<any> {
  const res = await fetch(`${API_BASE}/simulation/scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ scenario }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to inject scenario`);
  return res.json();
}

/** Toggle degraded communications mode */
export async function setDegradedComms(enabled: boolean): Promise<any> {
  const res = await fetch(`${API_BASE}/simulation/degraded`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to toggle degraded comms`);
  return res.json();
}

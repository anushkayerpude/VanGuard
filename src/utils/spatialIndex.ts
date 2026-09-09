import { UnifiedEvent, CorrelationCluster } from '../types/schema';

export interface ProjectedEvent extends UnifiedEvent {
  lat: number;
  lng: number;
  screenX: number;
  screenY: number;
  isVisible: boolean;
}

export interface CorrelationArc {
  id: string;
  sourceId: string;
  targetId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isAnomaly: boolean;
  severity: string;
}

export interface SpatialIndexStats {
  buildTimeMs: number;
  lastQueryMs: number;
  totalEntities: number;
  visibleEntities: number;
  arcCount: number;
}

/**
 * Mercator projection math
 */
export function latLngToWorld(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const scale = 256 * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = (0.5 - mercN / (2 * Math.PI)) * scale;
  return { x, y };
}

export function worldToLatLng(x: number, y: number, zoom: number): { lat: number; lng: number } {
  const scale = 256 * Math.pow(2, zoom);
  const lng = (x / scale) * 360 - 180;
  const mercN = (0.5 - y / scale) * (2 * Math.PI);
  const latRad = 2 * Math.atan(Math.exp(mercN)) - Math.PI / 2;
  const lat = (latRad * 180) / Math.PI;
  return { lat, lng };
}

export function getMetersPerPixel(lat: number, zoom: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

/**
 * FaissSpatialIndex:
 * High-performance 2D vector & spatial index inspired by FAISS (Flat/IVF).
 * Indexes geographic and screen coordinates into flat numeric buffers and spatial grid buckets.
 * Enables O(1) cell queries, O(K) viewport culling, and sub-millisecond KNN search for 60 FPS map interaction.
 */
export class FaissSpatialIndex {
  private events: ProjectedEvent[] = [];
  private eventById: Map<string, ProjectedEvent> = new Map();

  // Flat coordinate vector buffers for vectorized distance calculation (FAISS IndexFlat style)
  private screenCoords: Float64Array = new Float64Array(0); // [x0, y0, x1, y1, ...]
  private geoCoords: Float64Array = new Float64Array(0);    // [lat0, lng0, lat1, lng1, ...]

  // Spatial Grid (Spatial Hashing for rapid cell lookup)
  private cellSize: number = 64; // 64px spatial cells
  private grid: Map<string, number[]> = new Map();

  // Deduplicated correlation arcs (precomputed once at index time, not on every render)
  private arcs: CorrelationArc[] = [];

  // Performance telemetry
  public stats: SpatialIndexStats = {
    buildTimeMs: 0,
    lastQueryMs: 0,
    totalEntities: 0,
    visibleEntities: 0,
    arcCount: 0,
  };

  /**
   * Build or update the spatial vector index.
   */
  public build(
    rawEvents: UnifiedEvent[],
    center: { lat: number; lng: number },
    zoom: number,
    dimensions: { width: number; height: number }
  ): void {
    const started = performance.now();
    const count = rawEvents.length;

    this.events = [];
    this.eventById.clear();
    this.grid.clear();
    this.arcs = [];

    // Allocate flat buffers
    this.screenCoords = new Float64Array(count * 2);
    this.geoCoords = new Float64Array(count * 2);

    const { width, height } = dimensions;
    const centerWorld = latLngToWorld(center.lat, center.lng, zoom);
    const x0 = centerWorld.x - width / 2;
    const y0 = centerWorld.y - height / 2;

    let visibleCount = 0;

    for (let i = 0; i < count; i++) {
      const evt = rawEvents[i];
      const lat = typeof evt.location?.lat === 'number' ? evt.location.lat : 23.0225;
      const lng = typeof evt.location?.lng === 'number' ? evt.location.lng : 72.5714;

      const world = latLngToWorld(lat, lng, zoom);
      const screenX = world.x - x0;
      const screenY = world.y - y0;

      const isVisible =
        screenX >= -60 && screenX <= width + 60 && screenY >= -60 && screenY <= height + 60;
      if (isVisible) visibleCount++;

      const proj: ProjectedEvent = {
        ...evt,
        lat,
        lng,
        screenX,
        screenY,
        isVisible,
      };

      this.events.push(proj);
      this.eventById.set(evt.id, proj);

      // Flat vectors
      this.screenCoords[i * 2] = screenX;
      this.screenCoords[i * 2 + 1] = screenY;
      this.geoCoords[i * 2] = lat;
      this.geoCoords[i * 2 + 1] = lng;

      // Add to spatial grid cell
      const cellX = Math.floor(screenX / this.cellSize);
      const cellY = Math.floor(screenY / this.cellSize);
      const cellKey = `${cellX}:${cellY}`;
      let cellList = this.grid.get(cellKey);
      if (!cellList) {
        cellList = [];
        this.grid.set(cellKey, cellList);
      }
      cellList.push(i);
    }

    // Build precomputed deduplicated correlation arcs in O(N) using a seen set
    const seenPairs = new Set<string>();
    for (let i = 0; i < count; i++) {
      const src = this.events[i];
      if (!src.corroboratedBy || src.corroboratedBy.length === 0) continue;

      for (let j = 0; j < src.corroboratedBy.length; j++) {
        const targetId = src.corroboratedBy[j];
        const pairKey = src.id < targetId ? `${src.id}:${targetId}` : `${targetId}:${src.id}`;
        if (seenPairs.has(pairKey)) continue;
        seenPairs.add(pairKey);

        const target = this.eventById.get(targetId);
        if (target) {
          this.arcs.push({
            id: pairKey,
            sourceId: src.id,
            targetId,
            x1: src.screenX,
            y1: src.screenY,
            x2: target.screenX,
            y2: target.screenY,
            isAnomaly: src.isAnomaly || target.isAnomaly,
            severity: src.severity === 'critical' || target.severity === 'critical' ? 'critical' : 'normal',
          });
        }
      }
    }

    this.stats = {
      buildTimeMs: Math.round((performance.now() - started) * 100) / 100,
      lastQueryMs: 0,
      totalEntities: count,
      visibleEntities: visibleCount,
      arcCount: this.arcs.length,
    };
  }

  /**
   * Fast viewport retrieval: returns only events currently inside the visible screen bounds (plus buffer).
   */
  public queryViewport(bufferPx: number = 40): ProjectedEvent[] {
    return this.events.filter((e) => e.isVisible);
  }

  /**
   * FAISS-style K-Nearest Neighbors (KNN) search in screen space.
   * Finds the closest entity to the cursor (x, y) within maxRadiusPx in sub-millisecond time.
   */
  public searchKNN(x: number, y: number, k: number = 1, maxRadiusPx: number = 32): ProjectedEvent[] {
    const started = performance.now();
    const radiusSq = maxRadiusPx * maxRadiusPx;

    const minCellX = Math.floor((x - maxRadiusPx) / this.cellSize);
    const maxCellX = Math.floor((x + maxRadiusPx) / this.cellSize);
    const minCellY = Math.floor((y - maxRadiusPx) / this.cellSize);
    const maxCellY = Math.floor((y + maxRadiusPx) / this.cellSize);

    const candidates: Array<{ index: number; distSq: number }> = [];

    // Query candidate spatial grid cells
    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const cell = this.grid.get(`${cx}:${cy}`);
        if (!cell) continue;

        for (let i = 0; i < cell.length; i++) {
          const idx = cell[i];
          const px = this.screenCoords[idx * 2];
          const py = this.screenCoords[idx * 2 + 1];
          const dx = px - x;
          const dy = py - y;
          const distSq = dx * dx + dy * dy;

          if (distSq <= radiusSq) {
            candidates.push({ index: idx, distSq });
          }
        }
      }
    }

    // Sort by Euclidean distance (L2)
    candidates.sort((a, b) => a.distSq - b.distSq);
    const results = candidates.slice(0, k).map((c) => this.events[c.index]);

    this.stats.lastQueryMs = Math.round((performance.now() - started) * 1000) / 1000;
    return results;
  }

  /**
   * Get all precomputed deduplicated correlation arcs.
   */
  public getDeduplicatedArcs(): CorrelationArc[] {
    return this.arcs;
  }

  /**
   * Get all projected events.
   */
  public getAll(): ProjectedEvent[] {
    return this.events;
  }

  /**
   * Fast lookup by event ID in O(1).
   */
  public getById(id: string): ProjectedEvent | undefined {
    return this.eventById.get(id);
  }
}

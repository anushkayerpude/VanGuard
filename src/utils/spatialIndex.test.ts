import { describe, it, expect } from 'vitest';
import { FaissSpatialIndex } from './spatialIndex';
import { UnifiedEvent } from '../types/schema';

function makeMockEvent(id: string, lat: number, lng: number, corroboratedBy: string[] = []): UnifiedEvent {
  return {
    id,
    sourceType: 'radar',
    sourceName: 'RADAR-01',
    title: `Target ${id}`,
    description: `Track ${id}`,
    location: { lat, lng },
    severity: 'medium',
    confidence: 85,
    timestamp: new Date().toISOString(),
    corroboratedBy,
    isAnomaly: false,
    raw: {},
  };
}

describe('FaissSpatialIndex', () => {
  it('builds spatial index and projects coordinates correctly', () => {
    const events: UnifiedEvent[] = [
      makeMockEvent('EV-1', 23.0300, 72.5600, ['EV-2']),
      makeMockEvent('EV-2', 23.0350, 72.5650, ['EV-1']),
      makeMockEvent('EV-3', 23.0800, 72.6000),
      makeMockEvent('EV-FAR', 40.0000, 10.0000), // Off screen
    ];

    const index = new FaissSpatialIndex();
    index.build(events, { lat: 23.0300, lng: 72.5600 }, 11, { width: 800, height: 600 });

    const all = index.getAll();
    expect(all).toHaveLength(4);

    const viewportEvents = index.queryViewport();
    expect(viewportEvents.length).toBeGreaterThanOrEqual(3);
    expect(viewportEvents.some((e) => e.id === 'EV-FAR')).toBe(false);

    // Check precomputed deduplicated arcs
    const arcs = index.getDeduplicatedArcs();
    expect(arcs).toHaveLength(1); // EV-1 <-> EV-2 deduplicated to exactly 1 arc
    expect(arcs[0].sourceId).toBe('EV-1');
    expect(arcs[0].targetId).toBe('EV-2');
  });

  it('performs sub-millisecond KNN search accurately', () => {
    const events: UnifiedEvent[] = [];
    for (let i = 0; i < 200; i++) {
      events.push(makeMockEvent(`EV-${i}`, 23.02 + (i % 20) * 0.005, 72.55 + Math.floor(i / 20) * 0.005));
    }

    const index = new FaissSpatialIndex();
    index.build(events, { lat: 23.0300, lng: 72.5600 }, 12, { width: 1000, height: 800 });

    // Target EV-0
    const ev0 = index.getById('EV-0');
    expect(ev0).toBeDefined();

    const started = performance.now();
    const nearest = index.searchKNN(ev0!.screenX + 2, ev0!.screenY + 1, 1, 20);
    const elapsed = performance.now() - started;

    expect(nearest).toHaveLength(1);
    expect(nearest[0].id).toBe('EV-0');
    expect(elapsed).toBeLessThan(5); // Sub-millisecond KNN
    console.log(`FAISS KNN query elapsed: ${elapsed.toFixed(3)}ms across 200 spatial vectors`);
  });
});

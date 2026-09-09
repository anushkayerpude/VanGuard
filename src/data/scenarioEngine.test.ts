import { describe, it, expect } from 'vitest';
import { getScenarioDataset, DemoScenarioMode } from './scenarioEngine';

const ALL_MODES: DemoScenarioMode[] = [
  'NORMAL_OPS',
  'SEVERE_WEATHER',
  'COORDINATED_ATTACK',
  'AIR_COMBAT_INTERCEPT',
  'NAVAL_WARFARE_STRIKE',
  'SUBMARINE_ASW_HUNT',
  'GROUND_ARMY_COMBAT',
  'OSINT_AI_VERIFICATION',
];

describe('Scenario Engine & Dataset Verification', () => {
  it('successfully generates all 8 operational scenarios', () => {
    for (const mode of ALL_MODES) {
      const scenario = getScenarioDataset(mode);
      expect(scenario).toBeDefined();
      expect(scenario.name).toBeTruthy();
      expect(scenario.description).toBeTruthy();
      expect(scenario.events.length).toBeGreaterThan(0);
      expect(scenario.sourcesHealth.length).toBeGreaterThan(0);
      expect(['green', 'yellow', 'orange', 'red']).toContain(scenario.threatLevel.toLowerCase());
    }
  });

  it('verifies all scenario events contain valid geolocations, confidence scores, and severities', () => {
    for (const mode of ALL_MODES) {
      const scenario = getScenarioDataset(mode);
      for (const event of scenario.events) {
        expect(event.id).toBeTruthy();
        expect(event.title).toBeTruthy();
        expect(typeof event.location.lat).toBe('number');
        expect(typeof event.location.lng).toBe('number');
        expect(event.location.lat).toBeGreaterThanOrEqual(-90);
        expect(event.location.lat).toBeLessThanOrEqual(90);
        expect(event.confidence).toBeGreaterThanOrEqual(0);
        expect(event.confidence).toBeLessThanOrEqual(100);
        expect(['low', 'medium', 'high', 'critical']).toContain(event.severity);
      }
    }
  });

  it('verifies OSINT scenario contains authenticity audit and cross-sensor corroboration', () => {
    const osintScenario = getScenarioDataset('OSINT_AI_VERIFICATION');
    const osintEvent = osintScenario.events.find((e) => e.sourceType === 'social_media');
    expect(osintEvent).toBeDefined();
    expect(osintEvent?.authenticityAudit).toBeDefined();
    expect(osintEvent?.authenticityAudit?.overallAuthenticityScore).toBeGreaterThan(50);
  });

  it('verifies air intercept scenario contains air radar contacts', () => {
    const airScenario = getScenarioDataset('AIR_COMBAT_INTERCEPT');
    const radarContact = airScenario.events.find((e) => e.sourceType === 'radar');
    expect(radarContact).toBeDefined();
    expect(radarContact?.location.altitudeMeters).toBeGreaterThan(0);
  });

  it('verifies naval and submarine scenarios contain naval/submarine events', () => {
    const navalScenario = getScenarioDataset('NAVAL_WARFARE_STRIKE');
    expect(navalScenario.events.length).toBeGreaterThan(0);

    const subScenario = getScenarioDataset('SUBMARINE_ASW_HUNT');
    const subEvent = subScenario.events.find((e) => e.sourceType === 'submarine');
    expect(subEvent).toBeDefined();
  });
});

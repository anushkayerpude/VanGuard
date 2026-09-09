import { describe, it, expect } from 'vitest';
import { ROLE_DEFINITIONS, PRESET_OPERATORS, OperatorRole } from './AuthContext';

describe('RBAC Roles & Permissions Matrix', () => {
  it('enforces COMMANDER clearance with full authority', () => {
    const commander = ROLE_DEFINITIONS.COMMANDER;
    expect(commander.clearance).toBe('TS-SCI');
    expect(commander.permissions.canAccessApiConsole).toBe(true);
    expect(commander.permissions.canToggleDegradedComms).toBe(true);
    expect(commander.permissions.canTriggerSimulation).toBe(true);
    expect(commander.permissions.canForceAiSynthesis).toBe(true);
    expect(commander.permissions.canAccessRawTelemetry).toBe(true);
    expect(commander.permissions.canAccessOsintSensors).toBe(true);
  });

  it('enforces INTEL_OFFICER clearance with intelligence and simulation access', () => {
    const intel = ROLE_DEFINITIONS.INTEL_OFFICER;
    expect(intel.clearance).toBe('SECRET');
    expect(intel.permissions.canTriggerSimulation).toBe(true);
    expect(intel.permissions.canAccessOsintSensors).toBe(true);
    expect(intel.permissions.canForceAiSynthesis).toBe(true);
    // Locked for Intel Officer:
    expect(intel.permissions.canAccessApiConsole).toBe(false);
    expect(intel.permissions.canToggleDegradedComms).toBe(false);
  });

  it('enforces TACTICAL_OPERATOR clearance for field radar and telemetry only', () => {
    const operator = ROLE_DEFINITIONS.TACTICAL_OPERATOR;
    expect(operator.clearance).toBe('RESTRICTED');
    expect(operator.permissions.canAccessRawTelemetry).toBe(true);
    // Locked for Tactical Operator:
    expect(operator.permissions.canTriggerSimulation).toBe(false);
    expect(operator.permissions.canToggleDegradedComms).toBe(false);
    expect(operator.permissions.canAccessApiConsole).toBe(false);
    expect(operator.permissions.canAccessOsintSensors).toBe(false);
  });

  it('enforces ANALYST clearance as read-only observer', () => {
    const analyst = ROLE_DEFINITIONS.ANALYST;
    expect(analyst.clearance).toBe('UNCLASSIFIED');
    expect(analyst.permissions.canAccessApiConsole).toBe(false);
    expect(analyst.permissions.canToggleDegradedComms).toBe(false);
    expect(analyst.permissions.canTriggerSimulation).toBe(false);
    expect(analyst.permissions.canAccessOsintSensors).toBe(false);
    expect(analyst.permissions.canAccessRawTelemetry).toBe(false);
  });

  it('provides preset operators for all 4 clearance levels', () => {
    const roles: OperatorRole[] = ['COMMANDER', 'INTEL_OFFICER', 'TACTICAL_OPERATOR', 'ANALYST'];
    roles.forEach((r) => {
      const preset = PRESET_OPERATORS.find((p) => p.role === r);
      expect(preset).toBeDefined();
      expect(preset?.callsign).toBeDefined();
      expect(preset?.email).toBeDefined();
      expect(preset?.clearanceLevel).toBe(ROLE_DEFINITIONS[r].clearance);
    });
  });
});

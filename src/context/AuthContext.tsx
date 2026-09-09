import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export type OperatorRole = 'COMMANDER' | 'INTEL_OFFICER' | 'TACTICAL_OPERATOR' | 'ANALYST';
export type ClearanceLevel = 'TS-SCI' | 'SECRET' | 'RESTRICTED' | 'UNCLASSIFIED' | 'OPERATOR';

export interface RolePermissions {
  canAccessApiConsole: boolean;        // TS-SCI (COMMANDER)
  canTriggerSimulation: boolean;       // TS-SCI / SECRET (COMMANDER, INTEL_OFFICER)
  canToggleDegradedComms: boolean;     // TS-SCI (COMMANDER)
  canForceAiSynthesis: boolean;        // TS-SCI / SECRET (COMMANDER, INTEL_OFFICER)
  canDispatchCountermeasures: boolean; // TS-SCI (COMMANDER)
  canAccessOsintSensors: boolean;      // TS-SCI / SECRET (COMMANDER, INTEL_OFFICER)
  canAccessRawTelemetry: boolean;      // TS-SCI / SECRET / RESTRICTED (COMMANDER, INTEL_OFFICER, TACTICAL_OPERATOR)
}

export interface OperatorProfile {
  uid: string;
  displayName: string;
  callsign: string;
  email: string;
  photoURL?: string;
  clearanceLevel: ClearanceLevel;
  role: OperatorRole;
  badgeNumber?: string;
}

export const ROLE_DEFINITIONS: Record<
  OperatorRole,
  {
    label: string;
    clearance: ClearanceLevel;
    clearanceCode: string;
    rank: string;
    color: string;
    badgeColor: string;
    borderAccent: string;
    description: string;
    permissions: RolePermissions;
  }
> = {
  COMMANDER: {
    label: 'Tactical Commander',
    clearance: 'TS-SCI',
    clearanceCode: 'LEVEL 4 // TOP SECRET - SCI',
    rank: 'C2 BATTLESPACE COMMANDER',
    color: '#f43f5e',
    badgeColor: 'border-rose-500/60 bg-rose-950/60 text-rose-300',
    borderAccent: 'border-rose-500/80',
    description: 'Supreme operational authority. Authorized for threat escalation, AI model re-grounding, degraded comms overrides, and kinetic countermeasures.',
    permissions: {
      canAccessApiConsole: true,
      canTriggerSimulation: true,
      canToggleDegradedComms: true,
      canForceAiSynthesis: true,
      canDispatchCountermeasures: true,
      canAccessOsintSensors: true,
      canAccessRawTelemetry: true,
    },
  },
  INTEL_OFFICER: {
    label: 'Senior Intelligence Officer',
    clearance: 'SECRET',
    clearanceCode: 'LEVEL 3 // SECRET',
    rank: 'MAJOR // SIGINT CHIEF',
    color: '#f59e0b',
    badgeColor: 'border-amber-500/60 bg-amber-950/60 text-amber-300',
    borderAccent: 'border-amber-500/80',
    description: 'Senior intelligence specialist. Authorized for synthetic media forensics, satellite tasking, AI briefing synthesis, and full OSINT intelligence.',
    permissions: {
      canAccessApiConsole: false,
      canTriggerSimulation: true,
      canToggleDegradedComms: false,
      canForceAiSynthesis: true,
      canDispatchCountermeasures: false,
      canAccessOsintSensors: true,
      canAccessRawTelemetry: true,
    },
  },
  TACTICAL_OPERATOR: {
    label: 'Tactical Watch Operator',
    clearance: 'RESTRICTED',
    clearanceCode: 'LEVEL 2 // RESTRICTED',
    rank: 'LIEUTENANT // RADAR CHIEF',
    color: '#a4c639',
    badgeColor: 'border-[#526a27]/70 bg-[#a4c639]/15 text-[#c6ff00]',
    borderAccent: 'border-[#a4c639]/80',
    description: 'Field operations specialist. Real-time tactical radar, entity tracking, telemetry validation, and incident monitoring.',
    permissions: {
      canAccessApiConsole: false,
      canTriggerSimulation: false,
      canToggleDegradedComms: false,
      canForceAiSynthesis: false,
      canDispatchCountermeasures: false,
      canAccessOsintSensors: false,
      canAccessRawTelemetry: true,
    },
  },
  ANALYST: {
    label: 'Intelligence Analyst / Observer',
    clearance: 'UNCLASSIFIED',
    clearanceCode: 'LEVEL 1 // UNCLASSIFIED',
    rank: 'SPECIALIST // OBSERVER',
    color: '#94a3b8',
    badgeColor: 'border-slate-700 bg-slate-900/60 text-slate-300',
    borderAccent: 'border-slate-600',
    description: 'Read-only observer session. Public situation overview, news feeds, sanitized event timeline. Operational commands require elevated clearance.',
    permissions: {
      canAccessApiConsole: false,
      canTriggerSimulation: false,
      canToggleDegradedComms: false,
      canForceAiSynthesis: false,
      canDispatchCountermeasures: false,
      canAccessOsintSensors: false,
      canAccessRawTelemetry: false,
    },
  },
};

export const PRESET_OPERATORS: OperatorProfile[] = [
  {
    uid: 'preset-commander',
    displayName: 'Commander Sarah Vance',
    callsign: 'VANGUARD-ACTUAL',
    email: 's.vance@vanguard.c2.mil',
    clearanceLevel: 'TS-SCI',
    role: 'COMMANDER',
    badgeNumber: 'VG-9081-C2',
  },
  {
    uid: 'preset-intel',
    displayName: 'Major David Chen',
    callsign: 'SPECTRE-LEAD',
    email: 'd.chen@vanguard.intel.mil',
    clearanceLevel: 'SECRET',
    role: 'INTEL_OFFICER',
    badgeNumber: 'VG-7412-SIG',
  },
  {
    uid: 'preset-tactical',
    displayName: 'Lt. Marcus Miller',
    callsign: 'SENTINEL-3',
    email: 'm.miller@vanguard.ops.mil',
    clearanceLevel: 'RESTRICTED',
    role: 'TACTICAL_OPERATOR',
    badgeNumber: 'VG-4190-RAD',
  },
  {
    uid: 'preset-analyst',
    displayName: 'Analyst Elena Ward',
    callsign: 'HORIZON-WATCH',
    email: 'e.ward@defense.gov',
    clearanceLevel: 'UNCLASSIFIED',
    role: 'ANALYST',
    badgeNumber: 'VG-1024-OBS',
  },
];

const DEFAULT_PERMISSIONS: RolePermissions = ROLE_DEFINITIONS.COMMANDER.permissions;
const STORAGE_KEY = 'vanguard_operator_profile';

interface AuthContextType {
  user: User | null;
  operatorProfile: OperatorProfile | null;
  permissions: RolePermissions;
  loading: boolean;
  loginAsPreset: (preset: OperatorProfile) => void;
  switchRole: (role: OperatorRole) => void;
  loginWithEmail: (e: string, p: string, role?: OperatorRole) => Promise<void>;
  signupWithEmail: (e: string, p: string, name?: string, role?: OperatorRole) => Promise<void>;
  loginWithGoogle: (role?: OperatorRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [operatorProfile, setOperatorProfile] = useState<OperatorProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : PRESET_OPERATORS[0];
    } catch {
      return PRESET_OPERATORS[0];
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync profile to localStorage whenever it changes
  useEffect(() => {
    try {
      if (operatorProfile) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(operatorProfile));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Unable to persist operator profile', e);
    }
  }, [operatorProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setOperatorProfile((prev) => {
          if (prev && prev.uid === firebaseUser.uid) {
            return prev;
          }
          const role: OperatorRole = prev?.role || 'COMMANDER';
          const clearance = ROLE_DEFINITIONS[role].clearance;
          return {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || prev?.displayName || firebaseUser.email?.split('@')[0] || 'Tactical Operator',
            callsign: prev?.callsign || 'OPERATOR-1',
            email: firebaseUser.email || 'operator@vanguard.c2',
            photoURL: firebaseUser.photoURL || undefined,
            clearanceLevel: clearance,
            role: role,
            badgeNumber: prev?.badgeNumber || 'VG-7700-C2',
          };
        });
      } else {
        setUser(null);
        // Do not immediately wipe preset profile if user authenticated via preset
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsPreset = (preset: OperatorProfile) => {
    setOperatorProfile(preset);
  };

  const switchRole = (newRole: OperatorRole) => {
    setOperatorProfile((prev) => {
      if (!prev) return null;
      const roleDef = ROLE_DEFINITIONS[newRole];
      return {
        ...prev,
        role: newRole,
        clearanceLevel: roleDef.clearance,
      };
    });
  };

  const loginWithEmail = async (email: string, pass: string, assignedRole: OperatorRole = 'COMMANDER') => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const roleDef = ROLE_DEFINITIONS[assignedRole];
      setOperatorProfile({
        uid: res.user.uid,
        displayName: res.user.displayName || email.split('@')[0] || 'Tactical Operator',
        callsign: (email.split('@')[0] || 'OP').toUpperCase(),
        email: email,
        clearanceLevel: roleDef.clearance,
        role: assignedRole,
        badgeNumber: `VG-${Math.floor(1000 + Math.random() * 9000)}-C2`,
      });
    } catch (err: any) {
      console.warn('[Firebase Auth] Sign in failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (
    email: string,
    pass: string,
    name?: string,
    assignedRole: OperatorRole = 'COMMANDER'
  ) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const roleDef = ROLE_DEFINITIONS[assignedRole];
      setOperatorProfile({
        uid: cred.user.uid,
        displayName: name || email.split('@')[0],
        callsign: (name ? name.split(' ')[0] : email.split('@')[0]).toUpperCase(),
        email,
        clearanceLevel: roleDef.clearance,
        role: assignedRole,
        badgeNumber: `VG-${Math.floor(1000 + Math.random() * 9000)}-C2`,
      });
    } catch (err: any) {
      console.warn('[Firebase Auth] Signup failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (assignedRole: OperatorRole = 'COMMANDER') => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const roleDef = ROLE_DEFINITIONS[assignedRole];
      setOperatorProfile({
        uid: res.user.uid,
        displayName: res.user.displayName || 'Tactical Operator',
        callsign: (res.user.displayName?.split(' ')[0] || 'OPERATOR').toUpperCase(),
        email: res.user.email || 'operator@vanguard.c2',
        photoURL: res.user.photoURL || undefined,
        clearanceLevel: roleDef.clearance,
        role: assignedRole,
        badgeNumber: `VG-${Math.floor(1000 + Math.random() * 9000)}-C2`,
      });
    } catch (err: any) {
      console.warn('[Firebase Auth] Google login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      setUser(null);
      setOperatorProfile(null);
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('[Firebase Auth] Sign out failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const permissions: RolePermissions = operatorProfile
    ? ROLE_DEFINITIONS[operatorProfile.role]?.permissions || DEFAULT_PERMISSIONS
    : DEFAULT_PERMISSIONS;

  return (
    <AuthContext.Provider
      value={{
        user,
        operatorProfile,
        permissions,
        loading,
        loginAsPreset,
        switchRole,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

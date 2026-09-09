import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  UserCheck,
  CheckCircle2,
  Cpu,
  LogIn,
  UserPlus,
  ArrowLeft,
  Server,
  Sparkles,
  ChevronRight,
  Fingerprint,
  KeyRound,
  Radio,
  Eye,
  AlertTriangle,
  Radar,
  Sliders
} from 'lucide-react';
import {
  useAuth,
  OperatorRole,
  PRESET_OPERATORS,
  ROLE_DEFINITIONS,
  OperatorProfile
} from '../../context/AuthContext';
import { StatusDot } from '../ui/tactical';

interface TacticalAuthPageProps {
  onAuthenticated: () => void;
  onBackToLanding: () => void;
  onOpenArchitecture?: () => void;
  serverOnline?: boolean;
}

export default function TacticalAuthPage({
  onAuthenticated,
  onBackToLanding,
  onOpenArchitecture,
  serverOnline = true,
}: TacticalAuthPageProps) {
  const {
    loginAsPreset,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    operatorProfile,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'PRESETS' | 'CREDENTIALS'>('PRESETS');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Credentials form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<OperatorRole>('COMMANDER');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Preset 1-Click Login
  const handleSelectPreset = (preset: OperatorProfile) => {
    loginAsPreset(preset);
    onAuthenticated();
  };

  // Handle Firebase Email Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Enter both operator email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'REGISTER') {
        await signupWithEmail(email, password, displayName || undefined, selectedRole);
      } else {
        await loginWithEmail(email, password, selectedRole);
      }
      onAuthenticated();
    } catch (err: any) {
      console.error('[Auth Error]', err);
      const code = err.code || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        setErrorMessage('Invalid credentials. Check email and password.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMessage('Email already registered. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setErrorMessage('Password must be at least 6 characters.');
      } else {
        setErrorMessage(err.message || 'Authentication error.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Auth
  const handleGoogleAuth = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle(selectedRole);
      onAuthenticated();
    } catch (err: any) {
      console.warn('[Google Auth]', err);
      setErrorMessage('Google authentication popup was cancelled or failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-slate-200 font-mono overflow-x-hidden select-none flex flex-col justify-between p-4 md:p-8">
      {/* BACKGROUND ATMOSPHERICS */}
      <div className="pointer-events-none fixed inset-0 vg-console-bg opacity-80" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(82,106,39,0.22), transparent 70%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(10,15,10,0.9), transparent 80%)',
        }}
      />

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#526a27]/30">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToLanding}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-[#526a27]/40 hover:border-[#a4c639] text-xs text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#a4c639] group-hover:-translate-x-0.5 transition-transform" />
            <span>RETURN TO BRIEFING</span>
          </button>

          {onOpenArchitecture && (
            <button
              onClick={onOpenArchitecture}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-[#526a27]/50 hover:border-[#a4c639] text-xs text-[#a4c639] hover:text-white transition-all cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-[#c6ff00]" />
              <span className="hidden sm:inline">ARCHITECTURE & SPECS</span>
            </button>
          )}
        </div>

        {/* SYSTEM STATUS TELEMETRY */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] border border-[#526a27]/30 text-slate-300">
            <StatusDot online={serverOnline} />
            <span>FUSION CORE: {serverOnline ? 'ONLINE' : 'DEGRADED'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] border border-[#526a27]/30 text-slate-300">
            <Sparkles className="w-3 h-3 text-[#a4c639]" />
            <span>LOCAL AI: OLLAMA (LLAMA 3.2)</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] border border-[#526a27]/30 text-slate-400">
            <Lock className="w-3 h-3 text-[#a4c639]" />
            <span>SECURITY: AES-256-GCM</span>
          </div>
        </div>
      </header>

      {/* CENTER PORTAL CONTAINER */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-4xl bg-[#070c06]/90 border border-[#526a27]/60 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-[#16200d]/90 relative">
          
          {/* RETICLE CORNERS */}
          <div className="absolute top-2 left-2 text-[#a4c639]/40 text-xs font-mono select-none">+</div>
          <div className="absolute top-2 right-2 text-[#a4c639]/40 text-xs font-mono select-none">+</div>
          <div className="absolute bottom-2 left-2 text-[#a4c639]/40 text-xs font-mono select-none">+</div>
          <div className="absolute bottom-2 right-2 text-[#a4c639]/40 text-xs font-mono select-none">+</div>

          {/* CLASSIFICATION & PORTAL HEADER */}
          <div className="text-center space-y-2 mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16200d] border border-[#526a27] text-[#a4c639] text-[10px] tracking-widest uppercase font-bold">
              <Fingerprint className="w-3.5 h-3.5 text-[#c6ff00]" />
              <span>DEFENSE INTELLIGENCE C2 GATEWAY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c6ff00] animate-ping" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-slate-100 uppercase">
              OPERATOR AUTHENTICATION & CLEARANCE
            </h1>
            
            <p className="text-xs text-slate-400 max-w-xl mx-auto font-sans leading-relaxed">
              Authenticate your identity or select an operational clearance role to initialize the VANGUARD Common Operational Picture (COP).
            </p>
          </div>

          {/* TAB CONTROLS */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex p-1 rounded-xl bg-black/70 border border-[#526a27]/50 text-xs">
              <button
                onClick={() => { setActiveTab('PRESETS'); setErrorMessage(''); }}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'PRESETS'
                    ? 'bg-[#1b2711] border border-[#a4c639] text-[#c6ff00] shadow-[0_0_15px_rgba(82,106,39,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-[#a4c639]" />
                <span>1-CLICK RBAC CLEARANCES</span>
              </button>

              <button
                onClick={() => { setActiveTab('CREDENTIALS'); setErrorMessage(''); }}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'CREDENTIALS'
                    ? 'bg-[#1b2711] border border-[#a4c639] text-[#c6ff00] shadow-[0_0_15px_rgba(82,106,39,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-[#a4c639]" />
                <span>FIREBASE CREDENTIALS</span>
              </button>
            </div>
          </div>

          {/* TAB 1: 1-CLICK RBAC CLEARANCE PRESETS */}
          {activeTab === 'PRESETS' && (
            <div className="space-y-4">
              <div className="text-center text-[11px] text-slate-400 mb-2">
                Select an authorized clearance posture below for instant role evaluation:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESET_OPERATORS.map((preset) => {
                  const roleMeta = ROLE_DEFINITIONS[preset.role];
                  return (
                    <motion.div
                      key={preset.role}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => handleSelectPreset(preset)}
                      className={`relative group rounded-xl p-4 bg-[#0a1208]/90 border ${roleMeta.borderAccent} hover:border-[#c6ff00] transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-lg hover:shadow-[#a4c639]/10`}
                    >
                      {/* ROLE HEADER */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-widest border uppercase mb-1.5 ${roleMeta.badgeColor}`}
                          >
                            {roleMeta.clearanceCode}
                          </span>
                          <h3 className="text-sm font-bold text-slate-100 group-hover:text-[#c6ff00] transition-colors">
                            {preset.displayName}
                          </h3>
                          <div className="text-[10px] text-slate-400">{preset.callsign} · {roleMeta.rank}</div>
                        </div>

                        <div className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:text-[#c6ff00] group-hover:border-[#c6ff00] transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* ROLE DESCRIPTION */}
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        {roleMeta.description}
                      </p>

                      {/* PERMISSION PILLS */}
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5 text-[9px]">
                        {roleMeta.permissions.canToggleDegradedComms && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/40">
                            Degraded Comms
                          </span>
                        )}
                        {roleMeta.permissions.canTriggerSimulation && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40">
                            Scenario Stressor
                          </span>
                        )}
                        {roleMeta.permissions.canAccessApiConsole && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/40">
                            API Console
                          </span>
                        )}
                        {roleMeta.permissions.canForceAiSynthesis && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                            AI Synthesis
                          </span>
                        )}
                        {roleMeta.permissions.canAccessRawTelemetry && (
                          <span className="px-1.5 py-0.5 rounded bg-[#16200d] text-[#a4c639] border border-[#526a27]/60">
                            Telemetry Feeds
                          </span>
                        )}
                      </div>

                      {/* ACTION BUTTON */}
                      <button
                        className="w-full py-2 px-3 rounded-lg bg-white/[0.03] group-hover:bg-[#1b2711] border border-[#526a27]/40 group-hover:border-[#a4c639] text-[11px] font-bold text-slate-200 group-hover:text-[#c6ff00] flex items-center justify-center gap-2 transition-all"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#a4c639]" />
                        <span>AUTHORIZE AS {preset.role}</span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FIREBASE CREDENTIALS (EMAIL / PASSWORD / GOOGLE) */}
          {activeTab === 'CREDENTIALS' && (
            <div className="max-w-md mx-auto space-y-4">
              {/* SUB-TAB TOGGLE (LOGIN VS REGISTER) */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-[#526a27]/40 text-xs font-bold">
                <button
                  onClick={() => { setAuthMode('LOGIN'); setErrorMessage(''); }}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMode === 'LOGIN'
                      ? 'bg-[#1b2711] border border-[#a4c639] text-[#a4c639]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>SIGN IN</span>
                </button>
                <button
                  onClick={() => { setAuthMode('REGISTER'); setErrorMessage(''); }}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMode === 'REGISTER'
                      ? 'bg-[#1b2711] border border-[#a4c639] text-[#a4c639]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>REGISTER</span>
                </button>
              </div>

              {/* ERROR ALERT */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span className="font-sans leading-snug">{errorMessage}</span>
                </div>
              )}

              {/* GOOGLE SIGN IN */}
              <button
                onClick={handleGoogleAuth}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-[#16200d] hover:bg-[#1b2711] border border-[#526a27] hover:border-[#a4c639] text-zinc-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>SIGN IN VIA GOOGLE OAUTH</span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-[#526a27]/30" />
                <span className="text-[10px] text-[#a4c639]/70 uppercase font-bold">OR EMAIL SIGN-IN</span>
                <div className="flex-1 h-px bg-[#526a27]/30" />
              </div>

              {/* FORM */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {authMode === 'REGISTER' && (
                  <div>
                    <label className="text-[10px] text-[#a4c639]/90 uppercase font-bold mb-1 block">
                      OPERATOR CALLSIGN / NAME
                    </label>
                    <div className="relative">
                      <UserCheck className="w-3.5 h-3.5 absolute left-3 top-3 text-[#526a27]" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Commander Sarah Vance"
                        className="w-full bg-black/60 border border-[#526a27]/50 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-[#a4c639] focus:ring-1 focus:ring-[#a4c639]/40"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-[#a4c639]/90 uppercase font-bold mb-1 block">
                    OPERATOR EMAIL
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-[#526a27]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@vanguard.c2.mil"
                      className="w-full bg-black/60 border border-[#526a27]/50 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-[#a4c639] focus:ring-1 focus:ring-[#a4c639]/40"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#a4c639]/90 uppercase font-bold mb-1 block">
                    SECURITY CREDENTIAL
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-[#526a27]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-black/60 border border-[#526a27]/50 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-[#a4c639] focus:ring-1 focus:ring-[#a4c639]/40"
                      required
                    />
                  </div>
                </div>

                {/* ROLE SELECTION */}
                <div>
                  <label className="text-[10px] text-[#a4c639]/90 uppercase font-bold mb-1 block">
                    ASSIGNED CLEARANCE ROLE
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as OperatorRole)}
                    className="w-full bg-black/60 border border-[#526a27]/50 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-[#a4c639]"
                  >
                    <option value="COMMANDER">Commander [TS-SCI] — Unrestricted C2</option>
                    <option value="INTEL_OFFICER">Intel Officer [SECRET] — SIGINT & AI</option>
                    <option value="TACTICAL_OPERATOR">Tactical Operator [RESTRICTED] — Radar & Telemetry</option>
                    <option value="ANALYST">Analyst [UNCLASSIFIED] — Public Observer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2a3814] via-[#43571d] to-[#2a3814] border border-[#a4c639] hover:brightness-110 text-[#c6ff00] hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(82,106,39,0.35)] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#c6ff00]" />
                  <span>
                    {authMode === 'REGISTER'
                      ? 'REGISTER & INITIALIZE COP'
                      : 'AUTHENTICATE & ENTER COP'}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* ACTIVE LOGGED-IN SESSION BADGE */}
          {operatorProfile && (
            <div className="mt-6 pt-4 border-t border-[#526a27]/40 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c6ff00]" />
                <span className="text-slate-300">
                  Active Session: <strong className="text-white">{operatorProfile.displayName}</strong> ({operatorProfile.clearanceLevel})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onAuthenticated}
                  className="px-3 py-1 rounded bg-[#a4c639] text-black font-bold hover:brightness-110 transition-all text-xs"
                >
                  CONTINUE TO COP →
                </button>
                <button
                  onClick={async () => {
                    await logout();
                  }}
                  className="px-3 py-1 rounded bg-rose-950 border border-rose-500/60 text-rose-300 hover:bg-rose-900 transition-all text-xs"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* COMPLIANCE & LEGAL FOOTER */}
      <footer className="relative z-10 text-center py-4 border-t border-[#526a27]/20 text-[10px] text-slate-500 max-w-4xl mx-auto space-y-1">
        <div>
          UNITED STATES DEFENSE INTELLIGENCE AGENCY · JOINT CHIEFS OF STAFF COMMAND & CONTROL
        </div>
        <div className="text-slate-600">
          AUTHORIZED FOR OFFICIAL OPERATIONAL USE ONLY. ALL SESSIONS ENCRYPTED WITH NIST SP 800-38D COMPLIANT CIPHERS.
        </div>
      </footer>
    </div>
  );
}

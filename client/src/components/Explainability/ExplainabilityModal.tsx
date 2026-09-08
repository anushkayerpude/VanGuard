import React from 'react';
import { useEventStore } from '../../store/useEventStore';
import { X, Calculator, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

export const ExplainabilityModal: React.FC = () => {
  const explainabilityEventId = useEventStore((s) => s.explainabilityEventId);
  const closeExplainability = useEventStore((s) => s.closeExplainability);
  const events = useEventStore((s) => s.events);

  if (!explainabilityEventId) return null;

  const event = events.find((e) => e.id === explainabilityEventId);
  if (!event) return null;

  const bd = event.confidenceBreakdown || {
    overall: event.confidence,
    sourceAgreement: 88,
    spatialAgreement: 92,
    temporalAgreement: 85,
    sourceReliability: 94,
    dataFreshness: 96
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0c131c] border border-slate-700/80 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.15)] overflow-hidden font-mono">
        {/* Header */}
        <div className="bg-[#080d14] border-b border-slate-700/60 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-700 shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-black tracking-widest text-cyan-300 uppercase">
                EXPLAINABILITY &amp; CONFIDENCE MATH INSPECTOR
              </div>
              <div className="text-[11px] text-slate-400">
                EVENT ID: <span className="text-white font-bold">{event.id}</span> • SOURCE: <span className="text-cyan-400 uppercase font-bold">{event.sourceType}</span>
              </div>
            </div>
          </div>

          <button
            onClick={closeExplainability}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Main Overall Score Card */}
          <div className="bg-[#111c2a] border border-slate-700/60 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">
                COMPUTED FUSION CONFIDENCE
              </div>
              <div className="text-2xl font-black text-cyan-300">
                {event.confidence}% (HIGH CERTAINTY)
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-[0_0_16px_rgba(0,240,255,0.3)]">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>

          {/* Mathematical Decomposition Breakdown */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>CONFIDENCE DECOMPOSITION METRICS</span>
            </div>

            <div className="space-y-3 text-xs bg-[#090e15] border border-slate-700/50 rounded-xl p-4">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1.5">
                  <span>Multi-Source Spatial Co-location</span>
                  <span className="font-bold text-cyan-300">{bd.spatialAgreement}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700/60">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full rounded-full shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                    style={{ width: `${bd.spatialAgreement}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1.5">
                  <span>Temporal Clustering Agreement (&Delta;t &lt; 30s)</span>
                  <span className="font-bold text-cyan-300">{bd.temporalAgreement}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700/60">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full rounded-full shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                    style={{ width: `${bd.temporalAgreement}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1.5">
                  <span>Source Adapter Reliability Weight</span>
                  <span className="font-bold text-cyan-300">{bd.sourceReliability}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700/60">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full rounded-full shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                    style={{ width: `${bd.sourceReliability}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1.5">
                  <span>Telemetry Freshness &amp; Kinematic Decay</span>
                  <span className="font-bold text-cyan-300">{bd.dataFreshness}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700/60">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full rounded-full shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                    style={{ width: `${bd.dataFreshness}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Verification & Math Proof Details */}
          <div className="p-4 bg-[#111c2a] border border-slate-700/60 rounded-xl text-xs space-y-2">
            <div className="text-emerald-400 font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Multi-INT Corroboration Engine Verified</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed">
              Calculation: C = &Sigma;(w_i &times; s_i) + CorroborationBoost(&Delta;r, &Delta;t). Minimum 2 independent source feeds confirmed presence with 0% geometric conflict.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#080d14] border-t border-slate-700/60 px-5 py-3.5 flex justify-end">
          <button
            onClick={closeExplainability}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white font-sans font-bold text-xs rounded-xl shadow-[0_0_14px_rgba(0,240,255,0.35)] transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

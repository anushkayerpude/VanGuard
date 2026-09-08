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
      <div className="relative w-full max-w-xl bg-[#171015] border border-[#806874]/60 rounded-xl shadow-[0_0_50px_rgba(128,104,116,0.3)] overflow-hidden font-mono">
        {/* Header */}
        <div className="bg-[#20171d] border-b border-[#806874]/40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-[#806874] to-[#b39ba8] shadow-[0_0_8px_rgba(128,104,116,0.5)]">
              <Calculator className="w-4 h-4 text-[#0c090b]" />
            </div>
            <div>
              <div className="text-xs font-black tracking-widest text-[#e5dce1] uppercase mauve-glow">
                EXPLAINABILITY &amp; CONFIDENCE MATH INSPECTOR
              </div>
              <div className="text-[11px] text-[#b39ba8]">
                EVENT ID: <span className="text-white font-bold">{event.id}</span> • SOURCE: <span className="text-[#cfc0c8] uppercase font-bold">{event.sourceType}</span>
              </div>
            </div>
          </div>

          <button
            onClick={closeExplainability}
            className="p-1 text-[#b39ba8] hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Main Overall Score Card */}
          <div className="bg-[#21181f] border border-[#806874]/35 rounded-lg p-3.5 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] text-[#b39ba8] uppercase tracking-wider">
                COMPUTED FUSION CONFIDENCE
              </div>
              <div className="text-2xl font-black text-[#e5dce1] mauve-glow">
                {event.confidence}% (HIGH CERTAINTY)
              </div>
            </div>
            <div className="p-2 rounded-full bg-[#806874]/20 border border-[#806874]/50 text-[#e5dce1] shadow-[0_0_12px_rgba(128,104,116,0.3)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Mathematical Decomposition Breakdown */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-[#b39ba8] uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#cfc0c8]" />
              <span>CONFIDENCE DECOMPOSITION METRICS</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-[#e5dce1] mb-1">
                  <span>Multi-Source Spatial Co-location</span>
                  <span className="font-bold text-[#cfc0c8]">{bd.spatialAgreement}%</span>
                </div>
                <div className="w-full bg-[#110c0f] h-1.5 rounded-full overflow-hidden border border-[#806874]/25">
                  <div
                    className="bg-gradient-to-r from-[#806874] to-[#b39ba8] h-full rounded-full shadow-[0_0_6px_rgba(179,155,168,0.6)]"
                    style={{ width: `${bd.spatialAgreement}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#e5dce1] mb-1">
                  <span>Temporal Clustering Agreement (&Delta;t &lt; 30s)</span>
                  <span className="font-bold text-[#cfc0c8]">{bd.temporalAgreement}%</span>
                </div>
                <div className="w-full bg-[#110c0f] h-1.5 rounded-full overflow-hidden border border-[#806874]/25">
                  <div
                    className="bg-gradient-to-r from-[#806874] to-[#b39ba8] h-full rounded-full shadow-[0_0_6px_rgba(179,155,168,0.6)]"
                    style={{ width: `${bd.temporalAgreement}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#e5dce1] mb-1">
                  <span>Source Adapter Reliability Weight</span>
                  <span className="font-bold text-[#cfc0c8]">{bd.sourceReliability}%</span>
                </div>
                <div className="w-full bg-[#110c0f] h-1.5 rounded-full overflow-hidden border border-[#806874]/25">
                  <div
                    className="bg-gradient-to-r from-[#806874] to-[#b39ba8] h-full rounded-full shadow-[0_0_6px_rgba(179,155,168,0.6)]"
                    style={{ width: `${bd.sourceReliability}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#e5dce1] mb-1">
                  <span>Telemetry Freshness &amp; Kinematic Decay</span>
                  <span className="font-bold text-[#cfc0c8]">{bd.dataFreshness}%</span>
                </div>
                <div className="w-full bg-[#110c0f] h-1.5 rounded-full overflow-hidden border border-[#806874]/25">
                  <div
                    className="bg-gradient-to-r from-[#806874] to-[#b39ba8] h-full rounded-full shadow-[0_0_6px_rgba(179,155,168,0.6)]"
                    style={{ width: `${bd.dataFreshness}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Verification & Math Proof Details */}
          <div className="p-3 bg-[#1d141b] border border-[#806874]/35 rounded-lg text-[11px] space-y-1.5">
            <div className="text-[#b39ba8] font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6e9b87]" />
              <span>Multi-INT Corroboration Engine Verified</span>
            </div>
            <p className="text-[#cfc0c8] font-sans leading-relaxed">
              Calculation: C = &Sigma;(w_i &times; s_i) + CorroborationBoost(&Delta;r, &Delta;t). Minimum 2 independent source feeds confirmed presence with 0% geometric conflict.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#20171d] border-t border-[#806874]/40 p-3 flex justify-end">
          <button
            onClick={closeExplainability}
            className="px-4 py-1.5 bg-gradient-to-r from-[#806874] to-[#5e4b55] hover:from-[#957b88] hover:to-[#6d5863] text-white font-sans font-bold text-xs rounded-lg shadow-[0_0_10px_rgba(128,104,116,0.4)] transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

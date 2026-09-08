import React, { useEffect, useRef, useState } from 'react';
import { Radio, ShieldAlert, Zap, Compass, Crosshair } from 'lucide-react';

interface RadarContact {
  id: string;
  label: string;
  rangeFraction: number; // 0 to 1
  angleDeg: number;      // 0 to 360
  type: 'hostile' | 'friendly' | 'anomaly';
  speedKnots: number;
  altitudeFt: number;
  lastSweptTime: number;
}

export const MilitaryRotatingRadar: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rangeNm, setRangeNm] = useState<number>(100);
  const [rpm, setRpm] = useState<number>(15);
  const [currentAzimuth, setCurrentAzimuth] = useState<number>(0);
  const [activeContacts, setActiveContacts] = useState<number>(6);

  const contactsRef = useRef<RadarContact[]>([
    { id: 'BG-01', label: 'BOGEY-01 (J-20)', rangeFraction: 0.68, angleDeg: 38, type: 'hostile', speedKnots: 840, altitudeFt: 36700, lastSweptTime: 0 },
    { id: 'BG-02', label: 'BOGEY-02 (SU-57)', rangeFraction: 0.82, angleDeg: 52, type: 'hostile', speedKnots: 790, altitudeFt: 38200, lastSweptTime: 0 },
    { id: 'TL-06', label: 'TALON-6 (F-35)', rangeFraction: 0.45, angleDeg: 195, type: 'friendly', speedKnots: 620, altitudeFt: 42000, lastSweptTime: 0 },
    { id: 'VG-01', label: 'VANGUARD-01 (RAFALE)', rangeFraction: 0.32, angleDeg: 270, type: 'friendly', speedKnots: 710, altitudeFt: 39500, lastSweptTime: 0 },
    { id: 'UV-04', label: 'UAV-SWARM-4', rangeFraction: 0.58, angleDeg: 135, type: 'anomaly', speedKnots: 210, altitudeFt: 14000, lastSweptTime: 0 },
    { id: 'SM-07', label: 'SAM-HQ-RADAR', rangeFraction: 0.76, angleDeg: 310, type: 'friendly', speedKnots: 0, altitudeFt: 2100, lastSweptTime: 0 }
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 440);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 440);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    let angleRad = 0;
    let animId: number;

    const render = () => {
      // Calculate angular speed based on selected RPM
      const radPerFrame = ((rpm * 360) / 60 / 60) * (Math.PI / 180);
      angleRad = (angleRad + radPerFrame) % (Math.PI * 2);

      const currentDeg = Math.floor((angleRad * 180) / Math.PI);
      setCurrentAzimuth(currentDeg);

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.44;

      ctx.save();

      // 1. CRT Phosphor Radar Background Grid
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      bgGrad.addColorStop(0, '#0d1710');
      bgGrad.addColorStop(0.75, '#09110b');
      bgGrad.addColorStop(1, '#050a06');

      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Concentric Range Rings (Luminescent Phosphor Green)
      const ringSteps = [0.25, 0.5, 0.75, 1.0];
      ringSteps.forEach((step, idx) => {
        ctx.strokeStyle = idx === 3 ? 'rgba(74, 222, 128, 0.7)' : 'rgba(74, 222, 128, 0.25)';
        ctx.lineWidth = idx === 3 ? 2 : 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * step, 0, Math.PI * 2);
        ctx.stroke();

        // Range Label
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(74, 222, 128, 0.6)';
        ctx.fillText(`${(step * rangeNm).toFixed(0)}NM`, cx + 6, cy - radius * step + 11);
      });

      // 3. Compass Crosshairs & Radial Lines
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Cardinal Direction Labels
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('000° N', cx, cy - radius + 14);
      ctx.fillText('090° E', cx + radius - 20, cy);
      ctx.fillText('180° S', cx, cy + radius - 14);
      ctx.fillText('270° W', cx - radius + 20, cy);

      // 4. Rotating Sweeping Radar Beam (Phosphor Cone)
      const sweepConeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      sweepConeGrad.addColorStop(0, 'rgba(74, 222, 128, 0.35)');
      sweepConeGrad.addColorStop(0.8, 'rgba(74, 222, 128, 0.1)');
      sweepConeGrad.addColorStop(1, 'rgba(74, 222, 128, 0)');

      ctx.fillStyle = sweepConeGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angleRad - 0.45, angleRad);
      ctx.closePath();
      ctx.fill();

      // Leading Sweep Beam Line (Bright Neon Phosphor Edge)
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angleRad) * radius, cy + Math.sin(angleRad) * radius);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 5. Radar Contacts & Persistent Blips
      const now = Date.now();
      contactsRef.current.forEach((contact) => {
        const contactRad = (contact.angleDeg * Math.PI) / 180;
        const dist = contact.rangeFraction * radius;
        const px = cx + Math.cos(contactRad) * dist;
        const py = cy + Math.sin(contactRad) * dist;

        // Check if the sweep passed over the contact
        const angleDiff = Math.abs((angleRad - contactRad + Math.PI * 4) % (Math.PI * 2));
        if (angleDiff < 0.15) {
          contact.lastSweptTime = now;
        }

        const timeSinceSwept = now - contact.lastSweptTime;
        const isFresh = timeSinceSwept < 3500;
        const alpha = Math.max(0.25, 1 - timeSinceSwept / 4000);

        const isHostile = contact.type === 'hostile';
        const isFriendly = contact.type === 'friendly';
        const blipColor = isHostile ? '#ef4444' : isFriendly ? '#4ade80' : '#facc15';

        // Blip Glow & Persistence
        ctx.fillStyle = blipColor;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, isFresh ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();

        if (isFresh && isHostile) {
          // Pulse ring on hostile contact
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(px, py, 7 + Math.sin(now * 0.01) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Contact Identification Tag
        if (alpha > 0.4) {
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillStyle = blipColor;
          ctx.textAlign = 'left';
          ctx.fillText(contact.label, px + 9, py - 3);
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(200, 220, 200, 0.7)';
          ctx.fillText(`${contact.speedKnots}kt // FL${(contact.altitudeFt / 100).toFixed(0)}`, px + 9, py + 7);
        }

        ctx.globalAlpha = 1.0;
      });

      // 6. Outer Metallic Bezel Ring with Azimuth Ticks
      ctx.strokeStyle = 'rgba(107, 124, 103, 0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [rangeNm, rpm]);

  return (
    <div className="relative w-full max-w-lg mx-auto bg-[#0f1712]/95 border-2 border-[#4d5b4a] rounded-2xl p-4 shadow-[0_16px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(74,222,128,0.15)] font-mono">
      {/* Top Radar HUD Telemetry Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#4d5b4a]/50 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80] animate-ping" />
          <span className="font-bold text-[#4ade80] tracking-wider">
            PSR-3D SURVEILLANCE RADAR
          </span>
        </div>
        <div className="text-[11px] text-[#8a9a85] flex items-center space-x-2">
          <span>AZ: <strong className="text-white">{currentAzimuth.toString().padStart(3, '0')}°</strong></span>
          <span>•</span>
          <span>RPM: <strong className="text-white">{rpm}</strong></span>
        </div>
      </div>

      {/* Main Radar Screen Canvas */}
      <div className="relative w-full aspect-square my-3 flex items-center justify-center overflow-hidden rounded-xl bg-black">
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />

        {/* Live Radar Scanline Effect */}
        <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />

        {/* Corner Brackets Tactical Doodles */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#4ade80]" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#4ade80]" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#4ade80]" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#4ade80]" />
      </div>

      {/* Interactive Controls & Telemetry Readouts */}
      <div className="flex items-center justify-between pt-2 border-t border-[#4d5b4a]/50 text-xs">
        {/* Range Selector */}
        <div className="flex items-center space-x-1">
          <span className="text-[10px] text-[#8a9a85] mr-1 uppercase">Range:</span>
          {[25, 50, 100, 150].map((r) => (
            <button
              key={r}
              onClick={() => setRangeNm(r)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                rangeNm === r
                  ? 'bg-[#4ade80] text-black shadow-[0_0_8px_#4ade80]'
                  : 'bg-[#1a241c] text-[#8a9a85] hover:text-white border border-[#4d5b4a]/40'
              }`}
            >
              {r}NM
            </button>
          ))}
        </div>

        {/* Sweep Speed Toggle */}
        <div className="flex items-center space-x-1">
          <span className="text-[10px] text-[#8a9a85] mr-1 uppercase">Sweep:</span>
          {[10, 15, 30].map((speed) => (
            <button
              key={speed}
              onClick={() => setRpm(speed)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                rpm === speed
                  ? 'bg-[#facc15] text-black shadow-[0_0_8px_#facc15]'
                  : 'bg-[#1a241c] text-[#8a9a85] hover:text-white border border-[#4d5b4a]/40'
              }`}
            >
              {speed} RPM
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

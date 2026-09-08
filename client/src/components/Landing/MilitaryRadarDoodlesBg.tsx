import React, { useEffect, useRef } from 'react';

export const MilitaryRadarDoodlesBg: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let angle = 0;
    let animId: number;

    const tracks = [
      { x: 0.18, y: 0.32, vx: 0.00015, vy: -0.00008, id: 'TRK-801', type: 'HOSTILE', label: 'BOGEY-01 (J-20)', spd: '840 KTS', alt: '36,000 FT' },
      { x: 0.82, y: 0.28, vx: -0.00012, vy: 0.0001, id: 'TRK-104', type: 'FRIENDLY', label: 'TALON-6 (F-35)', spd: '620 KTS', alt: '42,000 FT' },
      { x: 0.88, y: 0.65, vx: -0.0002, vy: -0.00015, id: 'TRK-442', type: 'ANOMALY', label: 'UAV-SWARM-4', spd: '180 KTS', alt: '12,000 FT' },
      { x: 0.24, y: 0.78, vx: 0.0001, vy: 0.00018, id: 'TRK-019', type: 'GROUND', label: 'RADAR-AESA-07', spd: '0 KTS', alt: '1,200 FT' }
    ];

    const render = () => {
      angle = (angle + 0.008) % (Math.PI * 2);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.52;
      const maxR = Math.min(width, height) * 0.46;

      ctx.save();

      // 1. Concentric Tactical Range Rings (Military Olive & Phosphor Doodles)
      const ringSteps = [0.25, 0.5, 0.75, 1.0];
      ringSteps.forEach((step, idx) => {
        ctx.strokeStyle = idx === 3 ? 'rgba(74, 222, 128, 0.18)' : 'rgba(107, 124, 103, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * step, 0, Math.PI * 2);
        ctx.stroke();

        // Distance Stamp Doodles
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(138, 154, 133, 0.45)';
        ctx.fillText(`${step * 100} NM`, cx + 8, cy - maxR * step + 12);
      });

      // 2. Crosshair Axes & Bearing Radial Lines
      ctx.strokeStyle = 'rgba(107, 124, 103, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.stroke();

      // 3. Azimuth Degree Compass Ticks (360° Military Ring)
      for (let deg = 0; deg < 360; deg += 10) {
        const rad = (deg * Math.PI) / 180;
        const isMajor = deg % 30 === 0;
        const tickLen = isMajor ? 12 : 6;
        const r1 = maxR;
        const r2 = maxR - tickLen;

        const x1 = cx + Math.cos(rad) * r1;
        const y1 = cy + Math.sin(rad) * r1;
        const x2 = cx + Math.cos(rad) * r2;
        const y2 = cy + Math.sin(rad) * r2;

        ctx.strokeStyle = isMajor ? 'rgba(74, 222, 128, 0.35)' : 'rgba(107, 124, 103, 0.18)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (isMajor) {
          const tx = cx + Math.cos(rad) * (maxR + 16);
          const ty = cy + Math.sin(rad) * (maxR + 16);
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${deg.toString().padStart(3, '0')}°`, tx, ty);
        }
      }

      // 4. Background Radar Sweep Beam (Luminescent Phosphor Cone)
      const sweepGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      sweepGradient.addColorStop(0, 'rgba(74, 222, 128, 0.12)');
      sweepGradient.addColorStop(0.7, 'rgba(74, 222, 128, 0.04)');
      sweepGradient.addColorStop(1, 'rgba(74, 222, 128, 0)');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, angle - 0.55, angle);
      ctx.closePath();
      ctx.fill();

      // Sweep Leading Edge Line
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.6)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.stroke();

      // 5. Active Target Tracking Vectors & Doodles
      tracks.forEach((trk) => {
        trk.x = (trk.x + trk.vx + 1) % 1;
        trk.y = (trk.y + trk.vy + 1) % 1;

        const px = trk.x * width;
        const py = trk.y * height;

        const isHostile = trk.type === 'HOSTILE';
        const isFriendly = trk.type === 'FRIENDLY';
        const color = isHostile ? '#ef4444' : isFriendly ? '#4ade80' : '#facc15';

        // Velocity Vector Lead Line
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + trk.vx * 300000, py + trk.vy * 300000);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target Reticle Box Doodle
        ctx.strokeStyle = color;
        ctx.strokeRect(px - 7, py - 7, 14, 14);

        // Center Blip
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();

        // Target Tag Label Doodle
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = color;
        ctx.fillText(`[${trk.id}] ${trk.label}`, px + 12, py - 4);
        ctx.fillStyle = 'rgba(138, 154, 133, 0.7)';
        ctx.fillText(`${trk.spd} // ${trk.alt}`, px + 12, py + 7);
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0f0c]">
      {/* Background Military Terrain Image with Dark Night Vignette */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 filter grayscale contrast-150"
        style={{
          backgroundImage: `url('/assets/military_night_bg.png'), url('/assets/bg.jpg')`,
        }}
      />

      {/* Rotating Radar Tracking Grid Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Tactical MGRS Coordinates Grid Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(74, 222, 128, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(74, 222, 128, 0.3) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Atmospheric Military Vignette Mask */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0c] via-transparent to-[#0a0f0c]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#0a0f0c]/40 to-[#0a0f0c]/90 pointer-events-none" />
    </div>
  );
};

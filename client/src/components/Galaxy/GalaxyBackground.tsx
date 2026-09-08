import React, { useEffect, useRef } from 'react';

export const GalaxyBackground: React.FC = () => {
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

    // 1. Stealth Defense Stars & Particles
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      alpha: number;
      pulseSpeed: number;
      color: string;
    }> = [];

    const starColors = [
      'rgba(241, 245, 249, ', // Bright Slate White
      'rgba(186, 230, 253, ', // Ice Cyan
      'rgba(148, 163, 184, ', // Slate Blue
      'rgba(56, 189, 248, ',  // Sky Blue
    ];

    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }

    let time = 0;
    let animId: number;

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // A. Deep Aerospace Stealth Ambient Gradients
      const nebula1 = ctx.createRadialGradient(
        width * 0.3 + Math.sin(time * 0.25) * 40,
        height * 0.35 + Math.cos(time * 0.2) * 30,
        20,
        width * 0.3,
        height * 0.35,
        Math.max(width, height) * 0.6
      );
      nebula1.addColorStop(0, 'rgba(14, 165, 233, 0.07)'); // Subtle Cyan
      nebula1.addColorStop(0.5, 'rgba(15, 23, 42, 0.04)');  // Deep Slate
      nebula1.addColorStop(1, 'rgba(6, 9, 13, 0)');

      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(
        width * 0.75 + Math.cos(time * 0.2) * 40,
        height * 0.65 + Math.sin(time * 0.25) * 30,
        20,
        width * 0.75,
        height * 0.65,
        Math.max(width, height) * 0.55
      );
      nebula2.addColorStop(0, 'rgba(56, 189, 248, 0.06)'); // Sky Blue
      nebula2.addColorStop(0.6, 'rgba(30, 41, 59, 0.03)');
      nebula2.addColorStop(1, 'rgba(6, 9, 13, 0)');

      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // B. Render Stars
      stars.forEach((s) => {
        const dynamicAlpha = Math.max(0.1, Math.min(0.85, s.alpha + Math.sin(time * 2.5 + s.x) * 0.2));
        ctx.fillStyle = `${s.color}${dynamicAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // C. Subtle Tactical Doodles in Defense Blue/Slate
      ctx.save();
      ctx.lineWidth = 1;

      // Doodle 1: Celestial Orbit Rings (Top Left)
      const d1x = width * 0.12;
      const d1y = height * 0.2;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.beginPath();
      ctx.ellipse(d1x, d1y, 90, 35, (time * 0.08) % (Math.PI * 2), 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.beginPath();
      ctx.ellipse(d1x, d1y, 60, 24, -(time * 0.06) % (Math.PI * 2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Doodle 2: Constellation Chart with Coordinate Lines (Top Right)
      const cPoints = [
        { x: width * 0.84, y: height * 0.15 },
        { x: width * 0.88, y: height * 0.12 },
        { x: width * 0.92, y: height * 0.14 },
        { x: width * 0.89, y: height * 0.2 },
        { x: width * 0.85, y: height * 0.23 },
      ];
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.beginPath();
      ctx.moveTo(cPoints[0].x, cPoints[0].y);
      cPoints.forEach((p, idx) => {
        if (idx > 0) ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      cPoints.forEach((p) => {
        ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#06090d]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Subtle Tactical MGRS Coordinate Grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(56, 189, 248, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.2) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#06090d]/90 via-transparent to-[#06090d]/70 pointer-events-none" />
    </div>
  );
};

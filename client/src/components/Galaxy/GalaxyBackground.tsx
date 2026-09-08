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

    // Subtle Tactical telemetry particles
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      alpha: number;
      speedY: number;
    }> = [];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        speedY: -(Math.random() * 0.3 + 0.1),
      });
    }

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render floating micro-particles
      particles.forEach((p) => {
        p.y += p.speedY;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#05080c]">
      {/* 1. Fully Enhanced 8K Quality Naval Warships Background Picture */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 opacity-60 scale-100"
        style={{
          backgroundImage: `url('/warships_bg.jpg')`,
          filter: 'brightness(0.9) contrast(1.15) saturate(1.15)',
        }}
      />

      {/* 2. Deep Stealth Gradient Overlays for High UI Legibility & Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06090d] via-[#06090d]/50 to-[#06090d]/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#06090d]/80 via-[#06090d]/25 to-[#06090d]/80" />

      {/* 3. Subtle Tactical HUD Coordinate Grid */}
      <div
        className="absolute inset-0 opacity-12 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 240, 255, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 4. Canvas Floating Telemetry Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

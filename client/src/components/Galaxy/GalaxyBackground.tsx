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

    // 1. Stars & Cosmic Dust Particles (#806874 Color Harmonics)
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      alpha: number;
      pulseSpeed: number;
      color: string;
    }> = [];

    const starColors = [
      'rgba(229, 220, 225, ', // Light Mauve Tint
      'rgba(207, 192, 200, ', // Dusty Rose-Slate
      'rgba(179, 155, 168, ', // Mid Mauve
      'rgba(255, 255, 255, ', // White Sparkle
      'rgba(194, 170, 183, ', // Soft Heather
    ];

    for (let i = 0; i < 110; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.7 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }

    let time = 0;
    let animId: number;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // A. Deep Cosmic Nebula Gradient Background in #806874 Tones
      const nebula1 = ctx.createRadialGradient(
        width * 0.28 + Math.sin(time * 0.3) * 50,
        height * 0.32 + Math.cos(time * 0.2) * 40,
        20,
        width * 0.28,
        height * 0.32,
        Math.max(width, height) * 0.6
      );
      nebula1.addColorStop(0, 'rgba(128, 104, 116, 0.22)'); // #806874 Mauve
      nebula1.addColorStop(0.5, 'rgba(78, 60, 70, 0.12)');  // Deep Plum
      nebula1.addColorStop(1, 'rgba(12, 9, 11, 0)');

      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(
        width * 0.75 + Math.cos(time * 0.25) * 50,
        height * 0.68 + Math.sin(time * 0.3) * 40,
        20,
        width * 0.75,
        height * 0.68,
        Math.max(width, height) * 0.55
      );
      nebula2.addColorStop(0, 'rgba(179, 155, 168, 0.18)'); // Light Mauve
      nebula2.addColorStop(0.6, 'rgba(58, 44, 52, 0.08)');  // Shadow Mauve
      nebula2.addColorStop(1, 'rgba(12, 9, 11, 0)');

      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // B. Render Stars with Twinkle
      stars.forEach((s) => {
        const dynamicAlpha = Math.max(0.1, Math.min(0.9, s.alpha + Math.sin(time * 3 + s.x) * 0.25));
        ctx.fillStyle = `${s.color}${dynamicAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Star-burst for larger stars
        if (s.size > 1.6) {
          ctx.strokeStyle = `${s.color}${dynamicAlpha * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - 5, s.y);
          ctx.lineTo(s.x + 5, s.y);
          ctx.moveTo(s.x, s.y - 5);
          ctx.lineTo(s.x, s.y + 5);
          ctx.stroke();
        }
      });

      // C. Render Cosmic Doodles in #806874 Mauve
      ctx.save();
      ctx.lineWidth = 1;

      // Doodle 1: Celestial Orbit Rings (Top Left)
      const d1x = width * 0.14;
      const d1y = height * 0.22;
      ctx.strokeStyle = 'rgba(179, 155, 168, 0.22)';
      ctx.beginPath();
      ctx.ellipse(d1x, d1y, 110, 45, (time * 0.1) % (Math.PI * 2), 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = 'rgba(128, 104, 116, 0.25)';
      ctx.beginPath();
      ctx.ellipse(d1x, d1y, 75, 30, -(time * 0.08) % (Math.PI * 2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Orbit satellite doodle
      const satAngle = time * 0.4;
      const satX = d1x + Math.cos(satAngle) * 110;
      const satY = d1y + Math.sin(satAngle) * 45;
      ctx.fillStyle = '#cfc0c8';
      ctx.beginPath();
      ctx.arc(satX, satY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Satellite wings doodle
      ctx.strokeStyle = 'rgba(207, 192, 200, 0.45)';
      ctx.beginPath();
      ctx.moveTo(satX - 6, satY);
      ctx.lineTo(satX + 6, satY);
      ctx.moveTo(satX - 6, satY - 3);
      ctx.lineTo(satX - 6, satY + 3);
      ctx.moveTo(satX + 6, satY - 3);
      ctx.lineTo(satX + 6, satY + 3);
      ctx.stroke();

      // Doodle 2: Hand-drawn Constellation Pattern (Top Right)
      const cPoints = [
        { x: width * 0.82, y: height * 0.16 },
        { x: width * 0.86, y: height * 0.12 },
        { x: width * 0.91, y: height * 0.15 },
        { x: width * 0.88, y: height * 0.22 },
        { x: width * 0.84, y: height * 0.26 },
        { x: width * 0.82, y: height * 0.20 },
      ];

      ctx.strokeStyle = 'rgba(128, 104, 116, 0.28)';
      ctx.fillStyle = 'rgba(179, 155, 168, 0.7)';
      ctx.beginPath();
      ctx.moveTo(cPoints[0].x, cPoints[0].y);
      cPoints.forEach((p, idx) => {
        if (idx > 0) ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      cPoints.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Constellation Label Doodle
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(207, 192, 200, 0.35)';
      ctx.fillText('✦ CASSIOPEIA-SECTOR', width * 0.82, height * 0.29);

      // Doodle 3: Cosmic Compass / Crosshair (Bottom Left)
      const cx = width * 0.08;
      const cy = height * 0.85;
      ctx.strokeStyle = 'rgba(128, 104, 116, 0.24)';
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 48, cy);
      ctx.lineTo(cx + 48, cy);
      ctx.moveTo(cx, cy - 48);
      ctx.lineTo(cx + 48, cy);
      ctx.stroke();

      // Dotted outer tick marks
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, 52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillText('RA 22h / DEC +58°', cx - 35, cy + 62);

      // Doodle 4: Geometric Star Doodles (Scattered)
      const starDoodles = [
        { x: width * 0.45, y: height * 0.08, size: 9, rot: time * 0.1 },
        { x: width * 0.62, y: height * 0.88, size: 7, rot: -time * 0.15 },
        { x: width * 0.28, y: height * 0.65, size: 8, rot: time * 0.08 },
        { x: width * 0.74, y: height * 0.48, size: 6, rot: -time * 0.12 },
      ];

      starDoodles.forEach((sd) => {
        ctx.save();
        ctx.translate(sd.x, sd.y);
        ctx.rotate(sd.rot);
        ctx.strokeStyle = 'rgba(179, 155, 168, 0.25)';
        ctx.beginPath();
        // 4-point star sketch
        for (let i = 0; i < 4; i++) {
          ctx.lineTo(0, -sd.size);
          ctx.lineTo(sd.size * 0.3, -sd.size * 0.3);
          ctx.rotate(Math.PI / 2);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });

      // Doodle 5: Planetary Orbit with Ring (Bottom Right)
      const px = width * 0.92;
      const py = height * 0.82;
      ctx.fillStyle = 'rgba(128, 104, 116, 0.35)';
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(207, 192, 200, 0.4)';
      ctx.beginPath();
      ctx.ellipse(px, py, 26, 6, -0.4, 0, Math.PI * 2);
      ctx.stroke();

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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0c090b]">
      {/* Dynamic Animated Canvas for Mauve Nebulas, Stars & Doodles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Subtle Mauve Stardust Grid Overlay */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(128, 104, 116, 0.3) 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Soft Vignette Border */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c090b]/85 via-transparent to-[#0c090b]/65 pointer-events-none" />
    </div>
  );
};

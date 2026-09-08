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

    // 1. Stars & Cosmic Dust Particles (#806874 Harmonics)
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      alpha: number;
      pulseSpeed: number;
      color: string;
    }> = [];

    const starColors = [
      'rgba(243, 239, 241, ', // Bright White Sparkle
      'rgba(229, 220, 225, ', // Light Mauve
      'rgba(207, 192, 200, ', // Heather Mauve
      'rgba(179, 155, 168, ', // Mid #806874 Mauve
      'rgba(194, 89, 117, ',  // Crimson Accent
      'rgba(207, 160, 126, ', // Terracotta Accent
    ];

    for (let i = 0; i < 130; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.0 + 0.4,
        alpha: Math.random() * 0.7 + 0.25,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }

    // 2. Shooting Stars (Meteors with Glowing Tails)
    const shootingStars: Array<{
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      alpha: number;
      active: boolean;
      delay: number;
    }> = [
      { x: width * 0.3, y: height * 0.1, length: 120, speed: 8, angle: Math.PI / 4, alpha: 0, active: false, delay: 60 },
      { x: width * 0.7, y: height * 0.2, length: 90, speed: 10, angle: Math.PI / 3.5, alpha: 0, active: false, delay: 180 },
      { x: width * 0.5, y: height * 0.05, length: 140, speed: 9, angle: Math.PI / 4.2, alpha: 0, active: false, delay: 320 },
    ];

    let time = 0;
    let animId: number;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // A. Deep Cosmic Nebula Gradient Background
      const nebula1 = ctx.createRadialGradient(
        width * 0.25 + Math.sin(time * 0.3) * 50,
        height * 0.32 + Math.cos(time * 0.2) * 40,
        20,
        width * 0.25,
        height * 0.32,
        Math.max(width, height) * 0.6
      );
      nebula1.addColorStop(0, 'rgba(128, 104, 116, 0.25)'); // #806874 Mauve
      nebula1.addColorStop(0.5, 'rgba(78, 60, 70, 0.14)');  // Deep Plum
      nebula1.addColorStop(1, 'rgba(12, 9, 11, 0)');

      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(
        width * 0.78 + Math.cos(time * 0.25) * 50,
        height * 0.68 + Math.sin(time * 0.3) * 40,
        20,
        width * 0.78,
        height * 0.68,
        Math.max(width, height) * 0.55
      );
      nebula2.addColorStop(0, 'rgba(179, 155, 168, 0.2)'); // Light Mauve
      nebula2.addColorStop(0.6, 'rgba(58, 44, 52, 0.1)');  // Shadow Mauve
      nebula2.addColorStop(1, 'rgba(12, 9, 11, 0)');

      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // B. Render Stars with Twinkle
      stars.forEach((s) => {
        const dynamicAlpha = Math.max(0.1, Math.min(0.95, s.alpha + Math.sin(time * 3 + s.x) * 0.3));
        ctx.fillStyle = `${s.color}${dynamicAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // 4-point star-burst for larger stars
        if (s.size > 1.6) {
          ctx.strokeStyle = `${s.color}${dynamicAlpha * 0.5})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(s.x - 6, s.y);
          ctx.lineTo(s.x + 6, s.y);
          ctx.moveTo(s.x, s.y - 6);
          ctx.lineTo(s.x, s.y + 6);
          ctx.stroke();
        }
      });

      // C. Render Shooting Stars
      shootingStars.forEach((meteor) => {
        if (meteor.delay > 0) {
          meteor.delay--;
        } else if (!meteor.active) {
          meteor.active = true;
          meteor.alpha = 1;
          meteor.x = Math.random() * width * 0.8;
          meteor.y = Math.random() * height * 0.3;
        }

        if (meteor.active) {
          meteor.x += Math.cos(meteor.angle) * meteor.speed;
          meteor.y += Math.sin(meteor.angle) * meteor.speed;
          meteor.alpha -= 0.015;

          const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
          const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

          const grad = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
          grad.addColorStop(0, `rgba(243, 239, 241, ${meteor.alpha})`);
          grad.addColorStop(0.3, `rgba(179, 155, 168, ${meteor.alpha * 0.8})`);
          grad.addColorStop(1, 'rgba(128, 104, 116, 0)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(meteor.x, meteor.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          // Star head glow
          ctx.fillStyle = `rgba(255, 255, 255, ${meteor.alpha})`;
          ctx.beginPath();
          ctx.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2);
          ctx.fill();

          if (meteor.alpha <= 0 || meteor.x > width || meteor.y > height) {
            meteor.active = false;
            meteor.delay = Math.floor(Math.random() * 200 + 100);
          }
        }
      });

      // D. Render Cosmic Background Doodles (Clear, artistic, high-definition sketches)
      ctx.save();
      ctx.lineWidth = 1.2;

      // Doodle 1: Hand-Drawn Spiral Galaxy (Top Right)
      const gx = width * 0.88;
      const gy = height * 0.18;
      ctx.strokeStyle = 'rgba(179, 155, 168, 0.35)';
      ctx.beginPath();
      for (let i = 0; i < 720; i += 8) {
        const rad = (i * Math.PI) / 180;
        const r = 2.5 * Math.pow(Math.E, 0.14 * rad);
        if (r > 65) break;
        const px = gx + Math.cos(rad + time * 0.2) * r;
        const py = gy + Math.sin(rad + time * 0.2) * (r * 0.45);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(229, 220, 225, 0.8)';
      ctx.beginPath();
      ctx.arc(gx, gy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Doodle 2: Hand-Drawn Planet with Rings & Crater Doodles (Top Left)
      const plX = width * 0.12;
      const plY = height * 0.16;
      ctx.strokeStyle = 'rgba(207, 192, 200, 0.35)';
      ctx.fillStyle = 'rgba(128, 104, 116, 0.25)';
      ctx.beginPath();
      ctx.arc(plX, plY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Planet Rings
      ctx.strokeStyle = 'rgba(229, 220, 225, 0.45)';
      ctx.beginPath();
      ctx.ellipse(plX, plY, 36, 10, -0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Mini moon orbiting
      const moonAngle = time * 0.6;
      const mX = plX + Math.cos(moonAngle) * 44;
      const mY = plY + Math.sin(moonAngle) * 14;
      ctx.fillStyle = '#e5dce1';
      ctx.beginPath();
      ctx.arc(mX, mY, 2, 0, Math.PI * 2);
      ctx.fill();

      // Doodle 3: Constellation Chart with Connecting Lines (Bottom Left)
      const constel = [
        { x: width * 0.08, y: height * 0.76 },
        { x: width * 0.12, y: height * 0.72 },
        { x: width * 0.16, y: height * 0.78 },
        { x: width * 0.19, y: height * 0.71 },
        { x: width * 0.14, y: height * 0.84 },
      ];
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = 'rgba(179, 155, 168, 0.35)';
      ctx.beginPath();
      ctx.moveTo(constel[0].x, constel[0].y);
      constel.forEach((p, idx) => {
        if (idx > 0) ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      constel.forEach((p) => {
        ctx.fillStyle = '#f3eff1';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Label
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(207, 192, 200, 0.45)';
      ctx.fillText('✦ ORION-SECTOR', width * 0.08, height * 0.88);

      // Doodle 4: Orbiting Spacecraft / Satellite Doodle (Bottom Right)
      const satX = width * 0.89;
      const satY = height * 0.82;
      ctx.strokeStyle = 'rgba(207, 192, 200, 0.4)';
      ctx.strokeRect(satX - 6, satY - 6, 12, 12);
      // Wings
      ctx.strokeRect(satX - 18, satY - 4, 10, 8);
      ctx.strokeRect(satX + 8, satY - 4, 10, 8);
      // Antenna
      ctx.beginPath();
      ctx.moveTo(satX, satY - 6);
      ctx.lineTo(satX, satY - 14);
      ctx.arc(satX, satY - 16, 2, 0, Math.PI * 2);
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
      {/* Animated Canvas for Nebulas, Stars, Meteors & Doodles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Mauve Stardust Grid */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(128, 104, 116, 0.35) 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Soft Vignette Border */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c090b]/85 via-transparent to-[#0c090b]/65 pointer-events-none" />
    </div>
  );
};

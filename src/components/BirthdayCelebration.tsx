import React, { useEffect, useRef } from 'react';

interface BirthdayCelebrationProps {
  name: string;
  onClose: () => void;
}

export const BirthdayCelebration: React.FC<BirthdayCelebrationProps> = ({ name, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Confetti particles
    const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#fbbf24'];
    const confettiCount = 80;
    const confetti = Array.from({ length: confettiCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * -height * 0.5,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2.5,
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 8,
      wobble: Math.random() * Math.PI,
    }));

    // Balloons rising from below
    const balloonColors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];
    const balloons = Array.from({ length: 9 }).map((_, i) => ({
      x: (width / 10) * (i + 1) + (Math.random() - 0.5) * 40,
      y: height + Math.random() * 200 + 40,
      radius: Math.random() * 12 + 24,
      color: balloonColors[i % balloonColors.length],
      speed: Math.random() * 1.5 + 1.8,
      wobbleSpeed: Math.random() * 0.04 + 0.02,
      wobbleAmp: Math.random() * 25 + 15,
      wobbleOffset: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;

      // 1. Draw Confetti
      for (const p of confetti) {
        p.x += p.vx + Math.sin(p.wobble) * 1.2;
        p.y += p.vy;
        p.rotation += p.vRotation;
        p.wobble += 0.05;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      // 2. Draw Balloons
      for (const b of balloons) {
        b.y -= b.speed;
        const currentX = b.x + Math.sin(frame * b.wobbleSpeed + b.wobbleOffset) * b.wobbleAmp;

        // Balloon Body (Oval)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(currentX, b.y, b.radius * 0.85, b.radius, 0, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();

        // Balloon highlight
        ctx.beginPath();
        ctx.ellipse(currentX - b.radius * 0.3, b.y - b.radius * 0.35, b.radius * 0.22, b.radius * 0.35, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        // Balloon Knot
        ctx.beginPath();
        ctx.moveTo(currentX - 4, b.y + b.radius);
        ctx.lineTo(currentX + 4, b.y + b.radius);
        ctx.lineTo(currentX, b.y + b.radius + 6);
        ctx.closePath();
        ctx.fillStyle = b.color;
        ctx.fill();

        // String
        ctx.beginPath();
        ctx.moveTo(currentX, b.y + b.radius + 6);
        ctx.bezierCurveTo(
          currentX - 8,
          b.y + b.radius + 30,
          currentX + 8,
          b.y + b.radius + 50,
          currentX,
          b.y + b.radius + 75
        );
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();

        // Loop balloons
        if (b.y < -120) {
          b.y = height + Math.random() * 100 + 40;
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Birthday Card */}
      <div
        className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-amber-300 dark:border-amber-500/40 text-center animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center text-3xl shadow-lg mb-3">
          🎂
        </div>

        <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 mb-1.5">
          Happy Birthday
        </span>

        <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
          生日蒙福，{name}！
        </h2>

        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
          愿耶和华赐福给你，保护你；愿耶和华使祂的脸光照你，赐恩给你！在这特别的日子里，主恩满溢，喜乐常存！
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            收下祝福 🎈
          </button>
        </div>
      </div>
    </div>
  );
};

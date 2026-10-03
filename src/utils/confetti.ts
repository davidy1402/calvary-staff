/**
 * High-performance, zero-dependency canvas confetti explosion
 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  tilt: number;
  tiltSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'ribbon';
}

const CONFETTI_COLORS = [
  '#2563eb', // Calvary Blue
  '#3b82f6',
  '#38bdf8', // Sky
  '#f59e0b', // Amber/Gold
  '#fbbf24',
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#ec4899', // Pink
];

export function fireConfetti(): () => void {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return () => {};
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const particles: Particle[] = [];
  const particleCount = 140;

  // Create particles erupting from bottom corners towards center
  for (let i = 0; i < particleCount; i++) {
    const isLeft = i % 2 === 0;
    const originX = isLeft ? width * 0.15 : width * 0.85;
    const originY = height * 0.85;

    const angle = isLeft
      ? (Math.PI / 180) * ( -30 - Math.random() * 45 ) // Angle pointing up and right
      : (Math.PI / 180) * ( -150 + Math.random() * 45 ); // Angle pointing up and left

    const speed = 12 + Math.random() * 16;
    const shapes: ('rect' | 'circle' | 'ribbon')[] = ['rect', 'circle', 'ribbon'];

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
      vy: Math.sin(angle) * speed - (4 + Math.random() * 6),
      size: 5 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      tilt: Math.random() * Math.PI,
      tiltSpeed: 0.05 + Math.random() * 0.08,
      opacity: 1,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    });
  }

  let animationId = 0;
  const gravity = 0.42;
  const drag = 0.985;
  const startTime = Date.now();
  const maxDuration = 4000; // 4 seconds

  const render = () => {
    const elapsed = Date.now() - startTime;
    if (elapsed > maxDuration || particles.length === 0) {
      cancelAnimationFrame(animationId);
      if (canvas.parentNode) {
        canvas.remove();
      }
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.tilt += p.tiltSpeed;

      // Start fading in the last 1.5 seconds
      if (elapsed > maxDuration - 1500) {
        p.opacity = Math.max(0, (maxDuration - elapsed) / 1500);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      const tiltCos = Math.cos(p.tilt);

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'ribbon') {
        ctx.fillRect(-p.size, -p.size * 0.3 * tiltCos, p.size * 2, p.size * 0.6 * Math.abs(tiltCos));
      } else {
        ctx.fillRect(-p.size * 0.5, -p.size * 0.5 * tiltCos, p.size, p.size * Math.abs(tiltCos));
      }

      ctx.restore();

      // Clean up out-of-screen particles
      if (p.y > height + 50) {
        particles.splice(i, 1);
      }
    }

    animationId = requestAnimationFrame(render);
  };

  animationId = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(animationId);
    if (canvas.parentNode) {
      canvas.remove();
    }
  };
}

import { prefersReducedMotion } from '../state/store';

// A low-opacity canvas layer of slowly rising embers/smoke. Capped particle
// count, pauses when the tab is hidden, and disables itself under
// prefers-reduced-motion. Purely decorative (aria-hidden host).

interface Particle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  r: number;
  life: number;
  maxLife: number;
  hue: number;
}

export function startSmoke(host: HTMLElement): () => void {
  if (prefersReducedMotion()) return () => {};

  const canvas = document.createElement('canvas');
  canvas.className = 'smoke-canvas';
  host.appendChild(canvas);
  const cctx = canvas.getContext('2d', { alpha: true });
  if (!cctx) return () => canvas.remove();

  let w = 0;
  let h = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    cctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  const MAX = window.innerWidth < 640 ? 28 : 48;
  const particles: Particle[] = [];

  function spawn(): Particle {
    const maxLife = 6000 + Math.random() * 7000;
    return {
      x: Math.random() * w,
      y: h + Math.random() * 40,
      vy: -(6 + Math.random() * 14) / 1000,
      vx: (Math.random() - 0.5) * 6 / 1000,
      r: 18 + Math.random() * 60,
      life: 0,
      maxLife,
      hue: Math.random() < 0.18 ? 6 : 0, // occasional ember tint
    };
  }

  let raf = 0;
  let last = performance.now();
  let paused = false;

  function tick(now: number) {
    const dt = Math.min(now - last, 64);
    last = now;
    cctx!.clearRect(0, 0, w, h);

    if (particles.length < MAX && Math.random() < 0.4) particles.push(spawn());

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx += (Math.random() - 0.5) * 0.00002 * dt;
      const frac = p.life / p.maxLife;
      if (frac >= 1) {
        particles.splice(i, 1);
        continue;
      }
      const alpha = Math.sin(frac * Math.PI) * 0.06;
      const grad = cctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      if (p.hue) {
        grad.addColorStop(0, `rgba(190,40,30,${alpha})`);
        grad.addColorStop(1, 'rgba(190,40,30,0)');
      } else {
        grad.addColorStop(0, `rgba(120,110,120,${alpha})`);
        grad.addColorStop(1, 'rgba(120,110,120,0)');
      }
      cctx!.fillStyle = grad;
      cctx!.beginPath();
      cctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      cctx!.fill();
    }

    raf = requestAnimationFrame(tick);
  }

  function onVisibility() {
    if (document.hidden) {
      paused = true;
      cancelAnimationFrame(raf);
    } else if (paused) {
      paused = false;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.remove();
  };
}

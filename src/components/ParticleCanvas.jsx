import { useEffect, useRef } from 'react';

const WARM_COLORS = ['#ff7a5a', '#ff5f6d', '#ff9a62', '#ff4d4d', '#ff8c42'];

function createHeartTargets(width, height, particleCount) {
  const scale = Math.min(width, height) * 0.013;
  const centerX = width / 2;
  const centerY = height / 2 + 5;

  return Array.from({ length: particleCount }, (_, i) => {
    const t = (i / particleCount) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    return {
      x: centerX + x * scale,
      y: centerY - y * scale,
    };
  });
}

function createTextTargets(text, width, height, particleCount) {
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');

  if (!ctx) {
    return createHeartTargets(width, height, particleCount);
  }

  const fontSize = Math.max(38, Math.min(width * 0.12, 120));
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
  ctx.fillText(text, width / 2, height / 2);

  const imageData = ctx.getImageData(0, 0, width, height).data;
  const points = [];
  const step = Math.max(2, Math.floor(width / 180));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = imageData[(y * width + x) * 4 + 3];
      if (alpha > 50) {
        points.push({ x, y });
      }
    }
  }

  if (!points.length) {
    return createHeartTargets(width, height, particleCount);
  }

  return Array.from({ length: particleCount }, (_, i) => points[i % points.length]);
}

function createParticles(count, width, height) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    size: 1 + Math.random() * 1.8,
    color: WARM_COLORS[Math.floor(Math.random() * WARM_COLORS.length)],
  }));
}

export default function ParticleCanvas({ started, sequence, mode }) {
  const canvasRef = useRef(null);
  const animRef = useRef(0);
  const stateRef = useRef({
    particles: [],
    targets: [],
    mouse: { x: 0, y: 0, active: false },
    heartPulse: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !started) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    const particleCount = Math.max(450, Math.floor((width * height) / 2600));

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      stateRef.current.particles = createParticles(particleCount, width, height);
      stateRef.current.targets = createTextTargets(sequence, width, height, particleCount);
    };

    resize();

    const updateTargets = () => {
      stateRef.current.targets =
        sequence === '__heart__'
          ? createHeartTargets(width, height, particleCount)
          : createTextTargets(sequence, width, height, particleCount);
    };

    updateTargets();

    const onMouseMove = (e) => {
      stateRef.current.mouse.x = e.clientX;
      stateRef.current.mouse.y = e.clientY;
      stateRef.current.mouse.active = true;
    };

    const onMouseLeave = () => {
      stateRef.current.mouse.active = false;
    };

    const onResize = () => {
      resize();
      updateTargets();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', onResize);

    const draw = () => {
      const { particles, targets, mouse } = stateRef.current;
      ctx.clearRect(0, 0, width, height);

      if (sequence === '__heart__') {
        stateRef.current.heartPulse += 0.035;
      }

      particles.forEach((particle, i) => {
        const target = targets[i % targets.length];
        const pulse = sequence === '__heart__' ? 1 + Math.sin(stateRef.current.heartPulse) * 0.06 : 1;

        const tx = sequence === '__heart__' ? width / 2 + (target.x - width / 2) * pulse : target.x;
        const ty = sequence === '__heart__' ? height / 2 + (target.y - height / 2) * pulse : target.y;

        const dx = tx - particle.x;
        const dy = ty - particle.y;
        particle.vx += dx * 0.008;
        particle.vy += dy * 0.008;

        if (mouse.active) {
          const mdx = particle.x - mouse.x;
          const mdy = particle.y - mouse.y;
          const dist = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
          if (dist < 140) {
            const force = (140 - dist) / 140;
            const direction = mode === 'repel' ? 1 : -1;
            particle.vx += (mdx / dist) * force * 0.7 * direction;
            particle.vy += (mdy / dist) * force * 0.7 * direction;
          }
        }

        particle.vx *= 0.86;
        particle.vy *= 0.86;
        particle.x += particle.vx;
        particle.y += particle.vy;

        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [started, sequence, mode]);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

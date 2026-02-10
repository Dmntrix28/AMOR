import { useEffect, useRef } from 'react';

const WARM_COLORS = ['#ff7a5a', '#ff5f6d', '#ff9a62', '#ff4d4d', '#ff8c42', '#ffb070'];

function sampleHeartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);

  return { x, y };
}

function createNestedHeartTargets(width, height, particleCount) {
  const centerX = width / 2;
  const centerY = height / 2;
  const baseScale = Math.min(width, height) * 0.013;
  const layers = [1, 0.78, 0.58, 0.4, 0.27, 0.17, 0.1];

  return Array.from({ length: particleCount }, (_, i) => {
    const layer = layers[i % layers.length];
    const t = ((i + 1) / particleCount) * Math.PI * 2 * layers.length;
    const point = sampleHeartPoint(t);
    const jitter = (Math.random() - 0.5) * 2.2;

    return {
      x: centerX + point.x * baseScale * layer + jitter,
      y: centerY - point.y * baseScale * layer + jitter,
    };
  });
}

function createTextTargets(text, width, height, particleCount) {
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');

  if (!ctx) { 
    return createNestedHeartTargets(width, height, particleCount);
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
    return createNestedHeartTargets(width, height, particleCount);
  }

  return Array.from({ length: particleCount }, (_, i) => points[i % points.length]);
}

function createParticles(count, width, height) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    size: 0.9 + Math.random() * 2.1,
    color: WARM_COLORS[Math.floor(Math.random() * WARM_COLORS.length)],
    drift: Math.random() * Math.PI * 2,
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
    tick: 0,
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
    const particleCount = Math.max(550, Math.floor((width * height) / 2200));

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      stateRef.current.particles = createParticles(particleCount, width, height);
      stateRef.current.targets = createTextTargets(sequence, width, height, particleCount);
    };

    const updateTargets = () => {
      stateRef.current.targets =
        sequence === '__heart__'
          ? createNestedHeartTargets(width, height, particleCount)
          : createTextTargets(sequence, width, height, particleCount);
    };

    resize();
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
      const isHeart = sequence === '__heart__';
      const shapeCount = isHeart ? Math.floor(particles.length * 0.82) : particles.length;

      if (isHeart) {
        stateRef.current.heartPulse += 0.04;
        stateRef.current.tick += 1;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      particles.forEach((particle, i) => {
        const isAmbient = isHeart && i >= shapeCount;

        if (isAmbient) {
          const orbit = Math.min(width, height) * (0.3 + (i % 7) * 0.05);
          const theta = stateRef.current.tick * 0.01 + particle.drift * (1 + (i % 3) * 0.2);
          const tx = width / 2 + Math.cos(theta) * orbit;
          const ty = height / 2 + Math.sin(theta * 1.2) * orbit * 0.6;

          particle.vx += (tx - particle.x) * 0.002;
          particle.vy += (ty - particle.y) * 0.002;
          particle.vx += (Math.random() - 0.5) * 0.05;
          particle.vy += (Math.random() - 0.5) * 0.05;
        } else {
          const target = targets[i % targets.length];
          const pulse = isHeart ? 1 + Math.sin(stateRef.current.heartPulse) * 0.07 : 1;
          const tx = isHeart ? width / 2 + (target.x - width / 2) * pulse : target.x;
          const ty = isHeart ? height / 2 + (target.y - height / 2) * pulse : target.y;

          particle.vx += (tx - particle.x) * (isHeart ? 0.01 : 0.008);
          particle.vy += (ty - particle.y) * (isHeart ? 0.01 : 0.008);
        }

        if (mouse.active) {
          const mdx = particle.x - mouse.x;
          const mdy = particle.y - mouse.y;
          const dist = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
          if (dist < 150) {
            const force = (150 - dist) / 150;
            const direction = mode === 'repel' ? 1 : -1;
            particle.vx += (mdx / dist) * force * 0.8 * direction;
            particle.vy += (mdy / dist) * force * 0.8 * direction;
          }
        }

        particle.vx *= isHeart ? 0.9 : 0.86;
        particle.vy *= isHeart ? 0.9 : 0.86;
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;

        ctx.fillStyle = particle.color;
        ctx.globalAlpha = isAmbient ? 0.45 : 0.95;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, isAmbient ? particle.size * 0.8 : particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
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

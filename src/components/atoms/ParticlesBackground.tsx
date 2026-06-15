"use client";

import { useRef, useEffect } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const PARTICLE_COUNT = 50;
const PARTICLE_SPEED_Y_MIN = 0.05;
const PARTICLE_SPEED_Y_MAX = 0.35;
const PARTICLE_SPEED_X_RANGE = 0.2;
const PARTICLE_SIZE_MIN = 0.5;
const PARTICLE_SIZE_MAX = 3;
const PARTICLE_HUE_CYAN = 180;
const PARTICLE_HUE_GREEN = 120;
const PARTICLE_LIFE_BASE = 200;
const PARTICLE_LIFE_VARIANCE = 300;

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  hue: number;
  life: number;
  age: number;
}

const rand = (): number => Math.random(); // NOSONAR - solo animación visual, no criptografía

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const cvs: HTMLCanvasElement = canvas;
    const cctx: CanvasRenderingContext2D = ctx;

    function resize() {
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: rand() * canvas.width,
        y: rand() * canvas.height,
        size: rand() * PARTICLE_SIZE_MAX + PARTICLE_SIZE_MIN,
        speedY: -(rand() * (PARTICLE_SPEED_Y_MAX - PARTICLE_SPEED_Y_MIN) + PARTICLE_SPEED_Y_MIN),
        speedX: (rand() - 0.5) * PARTICLE_SPEED_X_RANGE,
        opacity: rand() * 0.3 + 0.05,
        hue: rand() < 0.5 ? PARTICLE_HUE_GREEN : PARTICLE_HUE_CYAN,
        life: rand() * PARTICLE_LIFE_VARIANCE + PARTICLE_LIFE_BASE,
        age: rand() * PARTICLE_LIFE_VARIANCE,
      });
    }

    function animate() {
      cctx.clearRect(0, 0, cvs.width, cvs.height);
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.age++;
        if (p.age > p.life || p.y < -20) {
          p.x = rand() * cvs.width;
          p.y = cvs.height + 10;
          p.age = 0;
        }
        cctx.beginPath();
        cctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        cctx.fillStyle = `hsla(${p.hue}, 70%, 50%, ${p.opacity * (1 - p.age / p.life)})`;
        cctx.fill();
      }
      animId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}

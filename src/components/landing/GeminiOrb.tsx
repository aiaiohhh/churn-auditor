"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  color: string;
}

const COLORS = ["#4285f4", "#4285f4", "#1a73e8", "#5e9eff", "#8ab4f8"];

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  // Seeded PRNG for consistent results within a session
  let s = 42;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + rand() * 0.6;
    const minRadius = 30;
    const maxRadius = 47;
    const radius = minRadius + rand() * (maxRadius - minRadius);
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;

    particles.push({
      id: i,
      x,
      y,
      size: 2 + rand() * 4,
      delay: rand() * 5,
      duration: 2.5 + rand() * 3.5,
      opacity: 0.25 + rand() * 0.45,
      color: COLORS[Math.floor(rand() * COLORS.length)] ?? "#4285f4",
    });
  }
  return particles;
}

export function GeminiStardust() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(generateParticles(65));
  }, []);

  // Render nothing on server — particles appear after hydration (no mismatch)
  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Radial glow behind the ring */}
      <div className="absolute left-1/2 top-[35%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gemini-blue/[0.06] blur-[100px]" />
      <div className="absolute left-1/2 top-[35%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gemini-deep/[0.04] blur-[60px]" />

      {/* Stardust particles in a ring around center */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {particles.map((p) => (
          <motion.circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.size / 10}
            fill={p.color}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, p.opacity, p.opacity * 0.5, 0],
              scale: [0.6, 1.3, 1, 0.6],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

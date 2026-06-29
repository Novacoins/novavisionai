import { useMemo } from "react";

/**
 * Cinematic animated sky background: gradient, soft drifting clouds,
 * twinkling stars, and gentle falling light particles. Pure CSS keyframes,
 * GPU-accelerated, lightweight.
 */
export function CinematicSky({ className = "" }: { className?: string }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 38 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 4,
        dur: 2.5 + Math.random() * 3,
      })),
    [],
  );
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 10,
        dur: 9 + Math.random() * 9,
        size: 1.5 + Math.random() * 2,
      })),
    [],
  );

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ background: "var(--gradient-sky)" }}
    >
      {/* Aurora glow */}
      <div
        className="absolute -top-24 -left-20 w-[70%] h-72 rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, var(--sky) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-20 -right-16 w-[60%] h-60 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)" }}
      />

      {/* Stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            boxShadow: "0 0 6px rgba(255,255,255,0.8)",
          }}
        />
      ))}

      {/* Clouds */}
      {[
        { top: "12%", dur: "55s", op: 0.18, scale: 1 },
        { top: "32%", dur: "80s", op: 0.12, scale: 1.4 },
        { top: "58%", dur: "65s", op: 0.14, scale: 0.9 },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute h-24 w-64 rounded-full blur-2xl"
          style={{
            top: c.top,
            left: 0,
            background: "linear-gradient(90deg, transparent, oklch(0.95 0.02 235 / 0.7), transparent)",
            opacity: c.op,
            transform: `scale(${c.scale})`,
            animation: `drift-cloud ${c.dur} linear ${i * -10}s infinite`,
          }}
        />
      ))}

      {/* Falling light particles */}
      {particles.map((p, i) => (
        <span
          key={`p-${i}`}
          className="absolute rounded-full"
          style={{
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: "var(--sky-soft)",
            boxShadow: "0 0 10px var(--sky)",
            opacity: 0.7,
            animation: `fall-particle ${p.dur}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

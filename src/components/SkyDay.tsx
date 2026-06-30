import { useMemo } from "react";

/**
 * Premium luxurious sky-day background:
 * soft sky-blue gradient + slow floating clouds, tiny sparkling stars,
 * gentle drifting light particles, and ambient light rays.
 * Pure CSS keyframes, GPU-accelerated, lightweight.
 */
export function SkyDay({ className = "" }: { className?: string }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 26 }, () => ({
        top: Math.random() * 70,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 5,
        dur: 3 + Math.random() * 4,
      })),
    [],
  );
  const dots = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 14,
        dur: 14 + Math.random() * 12,
        size: 2 + Math.random() * 2.5,
      })),
    [],
  );
  const clouds = useMemo(
    () => [
      { top: "8%", dur: "70s", scale: 1, op: 0.85, delay: -5 },
      { top: "22%", dur: "95s", scale: 1.4, op: 0.7, delay: -25 },
      { top: "44%", dur: "82s", scale: 0.9, op: 0.75, delay: -55 },
      { top: "62%", dur: "110s", scale: 1.2, op: 0.6, delay: -10 },
      { top: "78%", dur: "88s", scale: 1, op: 0.65, delay: -40 },
    ],
    [],
  );

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        background:
          "linear-gradient(180deg, #E9FAFF 0%, #E9FAFF 50%, #D8F4FF 100%)",
      }}
    >
      {/* Ambient light rays */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[140%] h-[60%] opacity-60"
        style={{
          background:
            "conic-gradient(from 200deg at 50% 0%, transparent 0deg, rgba(255,255,255,0.55) 18deg, transparent 36deg, rgba(186,230,253,0.5) 54deg, transparent 72deg, rgba(255,255,255,0.45) 96deg, transparent 120deg)",
          filter: "blur(28px)",
          animation: "ray-shift 24s ease-in-out infinite",
        }}
      />

      {/* Soft glows */}
      <div
        className="absolute -top-24 -left-20 w-[70%] h-72 rounded-full blur-3xl opacity-70"
        style={{ background: "radial-gradient(circle, #BAE6FD 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-16 w-[60%] h-72 rounded-full blur-3xl opacity-60"
        style={{ background: "radial-gradient(circle, #C7F0DD 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-[60%] h-60 rounded-full blur-3xl opacity-50"
        style={{ background: "radial-gradient(circle, #DCFCE7 0%, transparent 70%)" }}
      />

      {/* Floating clouds */}
      {clouds.map((c, i) => (
        <div
          key={i}
          className="absolute h-28 w-72 rounded-full"
          style={{
            top: c.top,
            left: 0,
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 45%, transparent 75%)",
            opacity: c.op,
            transform: `scale(${c.scale})`,
            filter: "blur(6px)",
            animation: `drift-cloud ${c.dur} linear ${c.delay}s infinite`,
          }}
        />
      ))}

      {/* Tiny sparkling stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            background: "#ffffff",
            boxShadow: "0 0 8px rgba(125, 211, 252, 0.9)",
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Gentle drifting light dots */}
      {dots.map((p, i) => (
        <span
          key={`d-${i}`}
          className="absolute rounded-full"
          style={{
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: "rgba(255,255,255,0.95)",
            boxShadow: "0 0 12px rgba(56,189,248,0.7)",
            opacity: 0.85,
            animation: `fall-particle ${p.dur}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

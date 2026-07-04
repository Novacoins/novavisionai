import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AccentId =
  | "default"
  | "blue"
  | "purple"
  | "orange"
  | "gold"
  | "red"
  | "pink"
  | "cyan"
  | "indigo"
  | "emerald"
  | "yellow"
  | "white"
  | "black";

export type AccentDef = {
  id: AccentId;
  label: string;
  swatch: string; // css color for swatch
  primary: string; // oklch
  primaryGlow: string;
  ring: string;
  themeColor: string; // meta theme-color hex
};

export const ACCENTS: AccentDef[] = [
  { id: "default", label: "Nova Green", swatch: "#0F9D58", primary: "oklch(0.62 0.16 155)", primaryGlow: "oklch(0.78 0.18 155)", ring: "oklch(0.62 0.16 155 / 60%)", themeColor: "#0B8F4D" },
  { id: "blue",    label: "Ocean Blue", swatch: "#3B82F6", primary: "oklch(0.62 0.17 250)", primaryGlow: "oklch(0.78 0.17 250)", ring: "oklch(0.62 0.17 250 / 60%)", themeColor: "#2563EB" },
  { id: "purple",  label: "Royal Purple", swatch: "#8B5CF6", primary: "oklch(0.60 0.20 300)", primaryGlow: "oklch(0.76 0.20 300)", ring: "oklch(0.60 0.20 300 / 60%)", themeColor: "#7C3AED" },
  { id: "orange",  label: "Sunset Orange", swatch: "#F97316", primary: "oklch(0.70 0.18 50)",  primaryGlow: "oklch(0.82 0.18 50)",  ring: "oklch(0.70 0.18 50 / 60%)",  themeColor: "#EA580C" },
  { id: "gold",    label: "Luxury Gold", swatch: "#EAB308", primary: "oklch(0.78 0.16 90)",  primaryGlow: "oklch(0.88 0.16 90)",  ring: "oklch(0.78 0.16 90 / 60%)",  themeColor: "#CA8A04" },
  { id: "red",     label: "Crimson", swatch: "#EF4444", primary: "oklch(0.62 0.22 27)",  primaryGlow: "oklch(0.78 0.22 27)",  ring: "oklch(0.62 0.22 27 / 60%)",  themeColor: "#DC2626" },
  { id: "pink",    label: "Blossom Pink", swatch: "#EC4899", primary: "oklch(0.68 0.20 350)", primaryGlow: "oklch(0.82 0.20 350)", ring: "oklch(0.68 0.20 350 / 60%)", themeColor: "#DB2777" },
  { id: "cyan",    label: "Aqua Cyan", swatch: "#06B6D4", primary: "oklch(0.70 0.13 210)", primaryGlow: "oklch(0.84 0.13 210)", ring: "oklch(0.70 0.13 210 / 60%)", themeColor: "#0891B2" },
  { id: "indigo",  label: "Deep Indigo", swatch: "#6366F1", primary: "oklch(0.58 0.18 275)", primaryGlow: "oklch(0.74 0.18 275)", ring: "oklch(0.58 0.18 275 / 60%)", themeColor: "#4F46E5" },
  { id: "emerald", label: "Fresh Emerald", swatch: "#10B981", primary: "oklch(0.68 0.16 165)", primaryGlow: "oklch(0.82 0.16 165)", ring: "oklch(0.68 0.16 165 / 60%)", themeColor: "#059669" },
  { id: "yellow",  label: "Sunny Yellow", swatch: "#FACC15", primary: "oklch(0.86 0.17 95)",  primaryGlow: "oklch(0.94 0.14 95)",  ring: "oklch(0.86 0.17 95 / 60%)",  themeColor: "#EAB308" },
  { id: "white",   label: "Pure White",   swatch: "#F8FAFC", primary: "oklch(0.97 0 0)",      primaryGlow: "oklch(0.99 0 0)",      ring: "oklch(0.97 0 0 / 60%)",      themeColor: "#F1F5F9" },
  { id: "black",   label: "Midnight",     swatch: "#0F172A", primary: "oklch(0.22 0.02 260)", primaryGlow: "oklch(0.35 0.03 260)", ring: "oklch(0.22 0.02 260 / 60%)", themeColor: "#0F172A" },
];

const STORAGE_KEY = "nova-accent";

function apply(id: AccentId) {
  if (typeof document === "undefined") return;
  const def = ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
  const root = document.documentElement;
  if (id === "default") {
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-glow");
    root.style.removeProperty("--ring");
  } else {
    root.style.setProperty("--primary", def.primary);
    root.style.setProperty("--primary-glow", def.primaryGlow);
    root.style.setProperty("--ring", def.ring);
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", def.themeColor);
}

const Ctx = createContext<{ accent: AccentId; setAccent: (id: AccentId) => void }>({
  accent: "default",
  setAccent: () => {},
});

export function AccentColorProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<AccentId>("default");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && (localStorage.getItem(STORAGE_KEY) as AccentId | null)) || "default";
    setAccentState(stored);
    apply(stored);
  }, []);

  const setAccent = (id: AccentId) => {
    setAccentState(id);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
    apply(id);
  };

  return <Ctx.Provider value={{ accent, setAccent }}>{children}</Ctx.Provider>;
}

export const useAccentColor = () => useContext(Ctx);

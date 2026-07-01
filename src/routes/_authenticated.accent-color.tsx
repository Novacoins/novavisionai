import { createFileRoute } from "@tanstack/react-router";
import { Palette, Check } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";
import { ACCENTS, useAccentColor } from "@/lib/accent-color";

export const Route = createFileRoute("/_authenticated/accent-color")({
  component: AccentColorPage,
});

function AccentColorPage() {
  const { accent, setAccent } = useAccentColor();
  return (
    <PageShell>
      <PageHeader
        title="Accent Color"
        icon={<Palette className="size-5 text-primary" />}
        subtitle="Personalize Nova Vision AI with your favorite color"
      />
      <div className="grid grid-cols-2 gap-3">
        {ACCENTS.map((a, i) => {
          const active = accent === a.id;
          return (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setAccent(a.id)}
              className={`glass-card p-4 flex flex-col items-start gap-3 text-left transition-all ${
                active ? "ring-2 ring-primary shadow-[0_0_24px_-6px_var(--primary)]" : ""
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className="size-10 rounded-full shadow-md"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${a.swatch}, ${a.swatch}cc)`,
                    boxShadow: `0 6px 18px -4px ${a.swatch}88`,
                  }}
                />
                {active && (
                  <span className="size-6 rounded-full bg-primary text-primary-foreground grid place-items-center">
                    <Check className="size-4" />
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">{a.label}</div>
                {a.id === "default" && (
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    Default
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center pt-4">
        Your accent color is saved automatically and applies across buttons, links, and highlights.
      </p>
    </PageShell>
  );
}

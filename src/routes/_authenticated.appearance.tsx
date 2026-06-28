import { createFileRoute } from "@tanstack/react-router";
import { Sun, Moon, Monitor } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated/appearance")({
  component: AppearancePage,
});

const OPTIONS = [
  { id: "light", label: "Light Mode", desc: "Bright and clear", icon: Sun },
  { id: "dark", label: "Dark Mode", desc: "Easy on the eyes", icon: Moon },
  { id: "system", label: "System Default", desc: "Match your device", icon: Monitor },
] as const;

function AppearancePage() {
  const { theme, setTheme } = useTheme();
  return (
    <PageShell>
      <PageHeader title="Appearance" icon={<Moon className="size-5 text-primary" />} subtitle="Personalize how VisionNova looks" />
      <div className="space-y-2">
        {OPTIONS.map((o) => {
          const Icon = o.icon;
          const active = theme === o.id;
          return (
            <button key={o.id} onClick={() => setTheme(o.id)} className={`w-full glass-card p-4 flex items-center gap-3 transition ${active ? "border-primary/50 bg-primary/5" : ""}`}>
              <span className={`size-12 rounded-xl grid place-items-center ${active ? "hero-gradient text-primary-foreground" : "bg-muted"}`}>
                <Icon className="size-5" />
              </span>
              <span className="flex-1 text-left">
                <div className="text-sm font-semibold">{o.label}</div>
                <div className="text-xs text-muted-foreground">{o.desc}</div>
              </span>
              {active && <span className="size-3 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </PageShell>
  );
}

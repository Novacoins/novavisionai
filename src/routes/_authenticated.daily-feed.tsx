import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, Sparkles, RefreshCw } from "lucide-react";
import { PageShell, PageHeader } from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { dailyTip } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/daily-feed")({ component: Page });

const CATEGORIES = [
  { key: "ai-news", label: "AI News", color: "from-sky-400 to-blue-500", prompt: "One short AI industry update from this week (1-2 sentences)." },
  { key: "productivity", label: "Productivity", color: "from-emerald-400 to-green-500", prompt: "One actionable productivity tip (1-2 sentences)." },
  { key: "tech", label: "Technology", color: "from-violet-400 to-indigo-500", prompt: "One interesting technology insight (1-2 sentences)." },
  { key: "business", label: "Business Idea", color: "from-amber-400 to-orange-500", prompt: "One small online business idea (1-2 sentences)." },
  { key: "health", label: "Health Tip", color: "from-rose-400 to-pink-500", prompt: "One simple health tip (1-2 sentences)." },
  { key: "finance", label: "Finance", color: "from-yellow-400 to-amber-500", prompt: "One personal finance tip (1-2 sentences)." },
  { key: "motivation", label: "Motivation", color: "from-fuchsia-400 to-purple-500", prompt: "One short motivational quote with attribution if known." },
  { key: "prompt", label: "Prompt of the Day", color: "from-cyan-400 to-teal-500", prompt: "One creative AI prompt users can try today (1 sentence)." },
];

function Page() {
  const [items, setItems] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const next: Record<string, string | null> = {};
    await Promise.all(
      CATEGORIES.map(async (c) => {
        try {
          const r = await dailyTip({ data: { topic: c.prompt } as never });
          next[c.key] = r.tip;
        } catch {
          next[c.key] = "Nova is gathering today's update — check back shortly.";
        }
      }),
    );
    setItems(next);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  return (
    <PageShell>
      <PageHeader
        title="Daily AI Feed"
        subtitle="Fresh insights every day"
        icon={<Newspaper className="size-5 text-[color:var(--sky)]" />}
      />
      <button
        onClick={refresh}
        disabled={loading}
        className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[oklch(0.78_0.13_235_/_0.14)] text-[color:var(--sky-soft)] border border-[oklch(0.78_0.13_235_/_0.35)] disabled:opacity-50"
      >
        <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
      </button>

      <div className="space-y-3">
        {CATEGORIES.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`size-7 rounded-lg bg-gradient-to-br ${c.color} grid place-items-center text-white shadow`}>
                <Sparkles className="size-4" />
              </span>
              <h3 className="text-sm font-semibold">{c.label}</h3>
            </div>
            {items[c.key] ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{items[c.key]}</p>
            ) : (
              <Skeleton className="h-10" />
            )}
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}

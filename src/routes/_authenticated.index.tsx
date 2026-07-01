import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Camera, Leaf, Utensils, Upload, Sparkles, ChevronRight, ScanLine, Search, MessagesSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { dailyTip, generateMealPlan } from "@/lib/ai.functions";
import { Skeleton } from "@/components/ui/skeleton";
import { AutoCarousel } from "@/components/AutoCarousel";
import { SkyDay } from "@/components/SkyDay";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});

type RecentScan = {
  id: string;
  title: string;
  category: string;
  thumbnail_url: string | null;
  created_at: string;
};

const PLACEHOLDERS = [
  "Search anything…",
  "Ask Nova AI…",
  "Identify an object…",
  "Generate ideas…",
  "Analyze an image…",
];

function HomePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tip, setTip] = useState<string | null>(null);
  const [meals, setMeals] = useState<{ meal_type: string; name: string; calories: number }[] | null>(null);
  const [recent, setRecent] = useState<RecentScan[] | null>(null);
  const [search, setSearch] = useState("");
  const [phIndex, setPhIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPhIndex((i) => (i + 1) % PLACEHOLDERS.length), 2600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    dailyTip({ data: undefined as never })
      .then((r) => setTip(r.tip))
      .catch(() => setTip("Eat the rainbow — colorful produce delivers a wider range of nutrients."));
    generateMealPlan({ data: { goal: "stay healthy", diet: "balanced" } })
      .then((r) => setMeals(r.meals.slice(0, 3).map((m) => ({ meal_type: m.meal_type, name: m.name, calories: m.calories }))))
      .catch(() => setMeals([]));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("scans")
      .select("id,title,category,thumbnail_url,created_at")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setRecent((data ?? []) as RecentScan[]));
  }, [user]);

  const greetingName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("home.morning") : hour < 18 ? t("home.afternoon") : t("home.evening");

  return (
    <div className="sky-day relative min-h-[100dvh]">
      <SkyDay className="fixed inset-0 -z-10" />
      <div className="relative px-4 pt-3 pb-4 space-y-5 max-w-md mx-auto">

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h1 className="text-2xl font-bold tracking-tight">{greetingName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("home.ready")}</p>
        </motion.section>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (search.trim()) navigate({ to: "/history" });
          }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={PLACEHOLDERS[phIndex]}
            className="w-full h-12 pl-11 pr-4 rounded-full glass-card text-sm placeholder:text-muted-foreground placeholder:transition-all focus:outline-none focus:ring-2 focus:ring-[color:var(--sky)]/60 transition-all shadow-[0_8px_24px_-12px_rgba(15,82,122,0.25)]"
          />
        </form>

        <Link to="/scan" className="block">
          <motion.div
            whileTap={{ scale: 0.98 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative overflow-hidden rounded-3xl p-6 hero-gradient text-primary-foreground premium-glow-green"
          >
            <div className="absolute -right-10 -top-10 size-44 rounded-full bg-white/10 blur-2xl" />
            <motion.div
              className="absolute -left-10 -bottom-10 size-40 rounded-full bg-[#63D8FF]/25 blur-3xl"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
                  <Sparkles className="size-3.5" /> {t("home.scanAnything")}
                </div>
                <h2 className="text-2xl font-bold mt-1">{t("home.tapToScan")}</h2>
                <p className="text-sm opacity-90 mt-1">{t("home.tapToScanDesc")}</p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="size-16 rounded-2xl bg-white/20 backdrop-blur grid place-items-center shadow-[0_0_30px_rgba(255,255,255,0.25)]"
              >
                <Camera className="size-8" />
              </motion.div>
            </div>
          </motion.div>
        </Link>

        <Link to="/chat" className="block">
          <motion.div
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-5 glass-card flex items-center gap-4 group"
            style={{ boxShadow: "0 20px 50px -22px var(--primary), 0 0 24px -10px var(--primary)" }}
          >
            <motion.div
              className="absolute -right-8 -top-8 size-32 rounded-full blur-2xl"
              style={{ background: "color-mix(in oklch, var(--primary) 40%, transparent)" }}
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative size-14 rounded-2xl grid place-items-center text-primary-foreground shrink-0"
              style={{ background: "var(--gradient-hero)", boxShadow: "0 0 30px -6px var(--primary)" }}
            >
              <MessagesSquare className="size-7" />
            </motion.div>
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary font-semibold">
                <Sparkles className="size-3" /> Nova Assistant
              </div>
              <div className="text-lg font-bold mt-0.5 leading-tight">Chat with AI</div>
              <div className="text-xs text-muted-foreground mt-0.5">Ask anything — code, ideas, math, life</div>
            </div>
            <ChevronRight className="relative size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </Link>

        <section className="grid grid-cols-4 gap-2">
          {[
            { to: "/scan", label: t("home.food"), icon: Utensils },
            { to: "/plant-scanner", label: t("home.plant"), icon: Leaf },
            { to: "/scan", label: t("home.upload"), icon: Upload },
            { to: "/meal-planner", label: t("home.mealsShort"), icon: ScanLine },
          ].map(({ to, label, icon: Icon }) => (
            <Link key={label} to={to} className="glass-card p-3 flex flex-col items-center gap-1.5 active:scale-95 transition">
              <span className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center"><Icon className="size-5" /></span>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </section>

        <section className="glass-card p-4 premium-glow-sky">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">{t("home.tipOfDay")}</h3>
          </div>
          {tip ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
          ) : (
            <Skeleton className="h-12" />
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-sm font-semibold">{t("home.todayMeal")}</h3>
            <Link to="/meal-planner" className="text-xs text-primary flex items-center gap-0.5">
              {t("home.seeAll")} <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {meals === null ? (
              <>
                <Skeleton className="h-16" /> <Skeleton className="h-16" /> <Skeleton className="h-16" />
              </>
            ) : meals.length === 0 ? (
              <Link to="/meal-planner" className="glass-card p-4 block text-sm text-muted-foreground text-center">
                {t("home.generateFirst")}
              </Link>
            ) : (
              meals.map((m) => (
                <div key={m.meal_type} className="glass-card p-3 flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center capitalize text-xs font-bold">
                    {m.meal_type.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground capitalize">{m.meal_type}</div>
                    <div className="text-sm font-medium truncate">{m.name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{m.calories} kcal</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-sm font-semibold">{t("home.recentScans")}</h3>
            <Link to="/history" className="text-xs text-primary flex items-center gap-0.5">
              {t("home.seeAll")} <ChevronRight className="size-3" />
            </Link>
          </div>
          {recent === null ? (
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
            </div>
          ) : recent.length === 0 ? (
            <Link to="/scan" className="glass-card p-6 block text-center">
              <Camera className="size-8 mx-auto text-primary mb-2" />
              <div className="text-sm font-medium">{t("home.noScans")}</div>
              <div className="text-xs text-muted-foreground mt-1">{t("home.noScansDesc")}</div>
            </Link>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {recent.map((s) => (
                <Link key={s.id} to="/history" className="glass-card overflow-hidden aspect-square relative group">
                  {s.thumbnail_url ? (
                    <img src={s.thumbnail_url} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-muted-foreground"><Camera className="size-6" /></div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="text-[10px] font-medium text-white truncate">{s.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="pt-2">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Sparkles className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">{t("home.discover")}</h3>
          </div>
          <AutoCarousel />
        </section>
      </div>
    </div>
  );
}

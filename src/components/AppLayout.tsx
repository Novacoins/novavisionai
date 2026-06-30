import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Home, ScanLine, Utensils, Leaf, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AppSidebar } from "./AppSidebar";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

type Tab = { to: string; key: "home" | "scan" | "meals" | "plants" | "profile"; icon: typeof Home; exact?: boolean };
const tabs: Tab[] = [
  { to: "/", key: "home", icon: Home, exact: true },
  { to: "/scan", key: "scan", icon: ScanLine },
  { to: "/meal-planner", key: "meals", icon: Utensils },
  { to: "/plant-scanner", key: "plants", icon: Leaf },
  { to: "/profile", key: "profile", icon: User },
];

export function AppLayout({ children, title }: { children: ReactNode; title?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useTranslation();
  const { language } = useLanguage();

  const isHome = pathname === "/";

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header
        className={cn(
          "sticky top-0 z-30 flex items-center justify-between px-4 h-14 backdrop-blur-xl border-b transition-colors",
          isHome
            ? "bg-white/40 border-white/50 text-slate-800"
            : "bg-background/70 border-border",
        )}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className={cn(
            "p-2 -ml-2 rounded-lg transition-colors",
            isHome ? "hover:bg-white/40" : "hover:bg-accent",
          )}
          aria-label={t("sidebar.openMenu")}
        >
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg hero-gradient grid place-items-center glow">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">{title ?? t("brand")}</span>
        </div>
        <Link
          to="/scan"
          className={cn(
            "p-2 -mr-2 rounded-lg transition-colors",
            isHome ? "hover:bg-white/40 text-emerald-600" : "hover:bg-accent text-primary",
          )}
          aria-label={t("sidebar.quickScan")}
        >
          <ScanLine className="size-5" />
        </Link>
      </header>


      <main className="flex-1 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 bg-background/80 backdrop-blur-xl border-t border-border">
        <ul className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {tabs.map((tab) => {
            const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
            const Icon = tab.icon;
            return (
              <li key={tab.to}>
                <Link
                  to={tab.to as "/"}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-xs transition-all",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className={cn("p-1.5 rounded-lg transition-all", active && "bg-primary/15 glow")}>
                    <Icon className="size-5" />
                  </span>
                  <span className="font-medium">{t(`nav.${tab.key}`)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}

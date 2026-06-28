import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Home, ScanLine, Utensils, Leaf, User, Sparkles } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

type Tab = { to: string; label: string; icon: typeof Home; exact?: boolean };
const tabs: Tab[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/meal-planner", label: "Meals", icon: Utensils },
  { to: "/plant-scanner", label: "Plants", icon: Leaf },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppLayout({ children, title }: { children: ReactNode; title?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 backdrop-blur-xl bg-background/70 border-b border-border">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg hero-gradient grid place-items-center glow">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">{title ?? "VisionNova AI"}</span>
        </div>
        <Link to="/scan" className="p-2 -mr-2 rounded-lg hover:bg-accent transition-colors" aria-label="Quick scan">
          <ScanLine className="size-5 text-primary" />
        </Link>
      </header>

      <main className="flex-1 pb-24">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-30 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 bg-background/80 backdrop-blur-xl border-t border-border">
        <ul className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <li key={t.to}>
                <Link
                  to={t.to as "/"}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-xs transition-all",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      active && "bg-primary/15 glow",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="font-medium">{t.label}</span>
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

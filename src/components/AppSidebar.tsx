import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Home, User, History, Heart, MessageSquare, Globe, Moon, Bell, Users, HelpCircle,
  Mail, Info, Shield, FileText, LogOut, X, Sparkles, Brain, Newspaper, Briefcase,
  Wrench, Image as ImageIcon, GraduationCap, HardDrive, Palette,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Item = { to: string; icon: typeof Home; label: string; desc: string; color: string };

const groups: { title: string; items: Item[] }[] = [
  {
    title: "Main",
    items: [
      { to: "/", icon: Home, label: "Home", desc: "Back to dashboard", color: "from-sky-400 to-blue-500" },
      { to: "/profile", icon: User, label: "My Profile", desc: "Account & stats", color: "from-emerald-400 to-teal-500" },
      { to: "/history", icon: History, label: "Scan History", desc: "Everything you've scanned", color: "from-amber-400 to-orange-500" },
      { to: "/storage", icon: HardDrive, label: "Storage", desc: "All your saved images", color: "from-sky-500 to-cyan-500" },
      { to: "/favorites", icon: Heart, label: "Favorites", desc: "Your saved scans", color: "from-rose-400 to-pink-500" },
    ],
  },
  {
    title: "AI Suite",
    items: [
      { to: "/ai-memory", icon: Brain, label: "AI Memory", desc: "Conversations & preferences", color: "from-fuchsia-400 to-purple-500" },
      { to: "/daily-feed", icon: Newspaper, label: "Daily AI Feed", desc: "News, tips & prompts", color: "from-cyan-400 to-sky-500" },
      { to: "/workspace", icon: Briefcase, label: "AI Workspace", desc: "Projects & documents", color: "from-indigo-400 to-violet-500" },
      { to: "/tools", icon: Wrench, label: "AI Tools Hub", desc: "Writer, OCR, translator…", color: "from-lime-400 to-green-500" },
      { to: "/image-studio", icon: ImageIcon, label: "AI Image Studio", desc: "Generate & enhance", color: "from-pink-400 to-rose-500" },
      { to: "/academy", icon: GraduationCap, label: "AI Learning Academy", desc: "Lessons & quizzes", color: "from-yellow-400 to-amber-500" },
      { to: "/chat", icon: MessageSquare, label: "AI Chat", desc: "Talk to Nova Vision", color: "from-emerald-400 to-green-500" },
    ],
  },
  {
    title: "Settings",
    items: [
      { to: "/appearance", icon: Moon, label: "Appearance", desc: "Theme & display", color: "from-slate-400 to-slate-600" },
      { to: "/accent-color", icon: Palette, label: "Accent Color", desc: "Personalize your theme", color: "from-fuchsia-500 to-pink-500" },
      { to: "/languages", icon: Globe, label: "Languages", desc: "App language", color: "from-blue-400 to-indigo-500" },
      { to: "/notifications", icon: Bell, label: "Notifications", desc: "Manage alerts", color: "from-orange-400 to-red-500" },
    ],
  },
  {
    title: "Support",
    items: [
      { to: "/community", icon: Users, label: "Community", desc: "Connect with users", color: "from-teal-400 to-cyan-500" },
      { to: "/faq", icon: HelpCircle, label: "FAQ", desc: "Common questions", color: "from-violet-400 to-purple-500" },
      { to: "/contact", icon: Mail, label: "Contact Support", desc: "We're here to help", color: "from-sky-400 to-blue-500" },
      { to: "/about", icon: Info, label: "About", desc: "What is Nova Vision AI", color: "from-emerald-400 to-teal-500" },
      { to: "/privacy", icon: Shield, label: "Privacy Policy", desc: "How we handle data", color: "from-slate-400 to-zinc-500" },
      { to: "/terms", icon: FileText, label: "Terms of Service", desc: "Rules of the road", color: "from-slate-400 to-zinc-500" },
    ],
  },
];

export function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[88%] max-w-sm flex flex-col bg-background/85 backdrop-blur-2xl border-r border-[oklch(0.78_0.13_235_/_0.18)] shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl hero-gradient grid place-items-center glow">
                  <Sparkles className="size-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold tracking-tight">{t("brand")}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {user?.email ?? t("sidebar.signedIn")}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="relative p-2 rounded-full text-[#63D8FF] hover:bg-[#63D8FF]/10 transition-colors"
                aria-label={t("sidebar.closeMenu")}
                style={{ animation: "float-breath 3.4s ease-in-out infinite" }}
              >
                <X className="size-5 drop-shadow-[0_0_8px_rgba(99,216,255,0.85)]" />
              </button>

            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-5">
              {groups.map((group) => (
                <div key={group.title}>
                  <div className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {group.title}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((it, idx) => {
                      const Icon = it.icon;
                      const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
                      return (
                        <motion.div
                          key={it.to}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <Link
                            to={it.to as "/"}
                            onClick={onClose}
                            className={cn(
                              "relative flex items-center gap-3 p-2.5 rounded-full transition-all group overflow-hidden",
                              active
                                ? "bg-[#0F9D58] hover:bg-[#16A765] active:bg-[#0B8043] text-white shadow-[0_10px_28px_-12px_rgba(15,157,88,0.7),0_0_18px_-4px_rgba(15,157,88,0.55)]"
                                : "hover:bg-white/5 border border-transparent",
                            )}
                          >
                            <span className={cn(
                              "size-10 rounded-xl grid place-items-center shrink-0 shadow-md transition-all",
                              active
                                ? "bg-white/20 text-white"
                                : cn("text-white bg-gradient-to-br", it.color),
                            )}>
                              <Icon className="size-5" />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className={cn(
                                "block text-sm font-semibold truncate",
                                active && "text-white",
                              )}>{it.label}</span>
                              <span className={cn(
                                "block text-[11px] truncate",
                                active ? "text-white/85" : "text-muted-foreground",
                              )}>{it.desc}</span>
                            </span>
                          </Link>

                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-3 border-t border-border">
              <button
                onClick={() => setConfirmLogout(true)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-destructive/10 text-destructive transition-colors"
              >
                <span className="size-10 rounded-xl bg-destructive/15 grid place-items-center">
                  <LogOut className="size-5" />
                </span>
                <span className="text-sm font-medium">{t("sidebar.logout")}</span>
              </button>
              <div className="px-3 pt-2 text-[10px] text-muted-foreground">v9.8.0 · Powered by Lovable AI</div>
            </div>
          </motion.aside>
        </>
      )}

      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("sidebar.logoutTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("sidebar.logoutDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("sidebar.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await signOut();
                setConfirmLogout(false);
                onClose();
              }}
            >
              {t("sidebar.logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
}

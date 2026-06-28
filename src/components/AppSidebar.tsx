import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, User, History, Heart, MessageSquare, Globe, Moon, Bell, Users, HelpCircle,
  Mail, Info, Shield, FileText, LogOut, X, Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const items = [
  { to: "/", icon: Home, label: "Home", desc: "Back to dashboard" },
  { to: "/profile", icon: User, label: "My Profile", desc: "Account & stats" },
  { to: "/history", icon: History, label: "Scan History", desc: "Everything you've scanned" },
  { to: "/favorites", icon: Heart, label: "Favorites", desc: "Your saved scans" },
  { to: "/chat", icon: MessageSquare, label: "AI Chat", desc: "Talk to Nova Vision" },
  { to: "/appearance", icon: Moon, label: "Appearance", desc: "Theme & display" },
  { to: "/languages", icon: Globe, label: "Languages", desc: "App language" },
  { to: "/notifications", icon: Bell, label: "Notifications", desc: "Manage alerts" },
  { to: "/community", icon: Users, label: "Community", desc: "Connect with users" },
  { to: "/faq", icon: HelpCircle, label: "FAQ", desc: "Common questions" },
  { to: "/contact", icon: Mail, label: "Contact Support", desc: "We're here to help" },
  { to: "/about", icon: Info, label: "About", desc: "What is Nova Vision AI" },
  { to: "/privacy", icon: Shield, label: "Privacy Policy", desc: "How we handle data" },
  { to: "/terms", icon: FileText, label: "Terms of Service", desc: "Rules of the road" },
] as { to: string; icon: typeof Home; label: string; desc: string }[];

export function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[86%] max-w-sm flex flex-col bg-background/95 backdrop-blur-2xl border-r border-border shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl hero-gradient grid place-items-center glow">
                  <Sparkles className="size-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold tracking-tight">Nova Vision AI</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {user?.email ?? "Signed in"}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent" aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {items.map((it) => {
                const Icon = it.icon;
                return (
                  <Link
                    key={it.to}
                    to={it.to as "/"}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors group"
                  >
                    <span className="size-10 rounded-lg bg-primary/10 grid place-items-center text-primary group-hover:bg-primary/20 transition-colors">
                      <Icon className="size-5" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium">{it.label}</span>
                      <span className="block text-xs text-muted-foreground truncate">{it.desc}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-border">
              <button
                onClick={() => setConfirmLogout(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
              >
                <span className="size-10 rounded-lg bg-destructive/10 grid place-items-center">
                  <LogOut className="size-5" />
                </span>
                <span className="text-sm font-medium">Log out</span>
              </button>
              <div className="px-3 pt-2 text-[10px] text-muted-foreground">v9.7.1 · Powered by Lovable AI</div>
            </div>
          </motion.aside>
        </>
      )}

      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of Nova Vision AI?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access your scans and chats.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await signOut();
                setConfirmLogout(false);
                onClose();
              }}
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
}

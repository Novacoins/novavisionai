import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Nova Vision AI" },
      { name: "description", content: "Sign in or create an account to use Nova Vision AI." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Welcome to Nova Vision AI!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
      }
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[100dvh] grid place-items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-7 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="size-14 rounded-2xl hero-gradient grid place-items-center glow mb-3">
            <Sparkles className="size-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Vision AI</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your AI vision assistant for food, plants & everyday life
          </p>
        </div>

        <div className="flex p-1 rounded-xl bg-muted mb-5">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === m ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <Input
                placeholder="Display name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="password"
              required
              minLength={6}
              placeholder="Password (6+ chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" className="w-full hero-gradient text-primary-foreground font-semibold h-11" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="text-[11px] text-muted-foreground text-center mt-5">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

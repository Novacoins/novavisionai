import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  User,
  ArrowLeft,
  ScanLine,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isAndroidWebView, openInSystemBrowser } from "@/lib/webview";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Nova Vision AI Smart Visual Assistant" },
      {
        name: "description",
        content:
          "Sign in or create your Nova Vision AI account to start scanning food, plants, and everyday objects with AI.",
      },
      { property: "og:title", content: "Sign in — Nova Vision AI" },
      {
        property: "og:description",
        content:
          "Sign in or create your Nova Vision AI account to start scanning food, plants, and everyday objects with AI.",
      },
      { property: "og:url", content: "https://novavisionai.lovable.app/auth" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://novavisionai.lovable.app/auth" }],
  }),
  component: AuthPage,
});

type View = "welcome" | "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [busy, setBusy] = useState(false);
  const [inWebView, setInWebView] = useState(false);

  useEffect(() => {
    setInWebView(isAndroidWebView());
  }, []);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  async function signInGoogle() {
    // Google blocks OAuth inside embedded Android WebViews.
    // Route the flow through the system browser / Chrome Custom Tabs instead.
    if (isAndroidWebView()) {
      const opened = openInSystemBrowser(window.location.origin + "/auth");
      if (opened) {
        toast.info("Opening secure browser to complete Google sign-in…");
        return;
      }
      toast.error("Google sign-in isn't available in this app. Please use email & password.");
      return;
    }
    setBusy(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (res.error) throw res.error instanceof Error ? res.error : new Error(String(res.error));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  function validEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  function strongPw(v: string) {
    return v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validEmail(email)) return toast.error("Please enter a valid email address");
    if (view === "signup") {
      if (!fullName.trim()) return toast.error("Please enter your full name");
      if (!strongPw(password))
        return toast.error("Password must be 8+ chars with letters and numbers");
      if (password !== confirm) return toast.error("Passwords do not match");
    }
    setBusy(true);
    try {
      if (view === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: fullName, full_name: fullName },
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
    <div className="min-h-[100dvh] relative overflow-hidden grid place-items-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <motion.div
          className="absolute -top-32 -left-24 size-[420px] rounded-full bg-primary/30 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-24 size-[420px] rounded-full bg-cyan-400/20 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[300px] rounded-full bg-emerald-500/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {view === "welcome" ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md glass-card p-8 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex flex-col items-center text-center mb-7">
              <motion.div
                initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="size-20 rounded-3xl hero-gradient grid place-items-center glow mb-4"
              >
                <ScanLine className="size-10 text-primary-foreground" />
              </motion.div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Nova Vision AI — Sign in to start scanning
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Smart AI Vision • Scan Anything • Understand Everything
              </p>
            </div>

            <div className="space-y-3">
              {!inWebView && (
                <Button
                  onClick={signInGoogle}
                  disabled={busy}
                  variant="outline"
                  className="w-full h-12 font-medium"
                >
                  <GoogleIcon className="size-5 mr-2" />
                  Continue with Google
                </Button>
              )}
              <Button
                onClick={() => setView("signin")}
                className="w-full h-12 hero-gradient text-primary-foreground font-semibold"
              >
                <Mail className="size-4 mr-2" /> Sign in with Email
              </Button>
              <Button
                onClick={() => setView("signup")}
                variant="secondary"
                className="w-full h-12 font-medium"
              >
                <User className="size-4 mr-2" /> Create Account
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground text-center mt-6">
              By continuing you agree to our Terms & Privacy Policy.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md glass-card p-7 shadow-2xl backdrop-blur-2xl"
          >
            <button
              onClick={() => setView("welcome")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>

            <div className="flex flex-col items-center text-center mb-5">
              <div className="size-12 rounded-2xl hero-gradient grid place-items-center glow mb-3">
                <Sparkles className="size-6 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold">
                {view === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {view === "signin"
                  ? "Sign in to continue to Nova Vision AI"
                  : "Join Nova Vision AI in seconds"}
              </p>
            </div>

            <form onSubmit={submit} className="space-y-3">
              {view === "signup" && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9 h-11"
                    maxLength={80}
                    required
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11"
                  autoComplete="email"
                />
              </div>
              <PasswordField
                value={password}
                onChange={setPassword}
                show={showPw}
                onToggle={() => setShowPw((s) => !s)}
                placeholder={
                  view === "signup" ? "Password (8+ chars, letters & numbers)" : "Password"
                }
                autoComplete={view === "signin" ? "current-password" : "new-password"}
              />
              {view === "signup" && (
                <PasswordField
                  value={confirm}
                  onChange={setConfirm}
                  show={showPw2}
                  onToggle={() => setShowPw2((s) => !s)}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
              )}

              {view === "signin" && (
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}
              <Button
                type="submit"
                className="w-full hero-gradient text-primary-foreground font-semibold h-11"
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : view === "signin" ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            {!inWebView && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background/60 backdrop-blur px-2 text-[11px] text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>

                <Button
                  onClick={signInGoogle}
                  disabled={busy}
                  variant="outline"
                  className="w-full h-11"
                >
                  <GoogleIcon className="size-4 mr-2" /> Continue with Google
                </Button>
              </>
            )}

            <p className="text-xs text-muted-foreground text-center mt-5">
              {view === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setView("signup")}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setView("signin")}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        type={show ? "text" : "password"}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-10 h-11"
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-accent text-muted-foreground"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.92a5.07 5.07 0 0 1-2.2 3.32v2.75h3.56c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.75c-.99.66-2.26 1.05-3.72 1.05-2.86 0-5.28-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.85 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.35-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.67-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.67 2.84C6.72 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

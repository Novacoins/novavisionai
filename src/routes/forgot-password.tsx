import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Nova Vision AI" },
      { name: "description", content: "Reset your Nova Vision AI account password by email." },
    ],
    links: [{ rel: "canonical", href: "https://novavisionai.lovable.app/forgot-password" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast.error("Please enter a valid email address");
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your email for the reset link");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[100dvh] grid place-items-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-background">
        <motion.div
          className="absolute -top-32 -left-24 size-[420px] rounded-full bg-primary/30 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-7 shadow-2xl backdrop-blur-2xl"
      >
        <Link to="/auth" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-3.5" /> Back to sign in
        </Link>
        <div className="flex flex-col items-center text-center mb-5">
          <div className="size-12 rounded-2xl hero-gradient grid place-items-center glow mb-3">
            <Sparkles className="size-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">Reset your password</h1>
          <p className="text-xs text-muted-foreground mt-1">
            We'll email you a secure link to set a new password.
          </p>
        </div>
        {sent ? (
          <div className="text-center space-y-3">
            <p className="text-sm text-foreground">
              If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.
            </p>
            <p className="text-xs text-muted-foreground">
              Didn't get it? Check your spam folder, then try again.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
              Send another link
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
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
            <Button type="submit" className="w-full hero-gradient text-primary-foreground font-semibold h-11" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Send reset link"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

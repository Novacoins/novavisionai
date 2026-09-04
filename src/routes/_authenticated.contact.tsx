import { createFileRoute } from "@tanstack/react-router";
import { Mail, Send, RotateCcw, CheckCircle2 } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/_authenticated/contact")({
  head: () =>
    pageHead({
      path: "/contact",
      title: "Contact Support — Nova Vision AI",
      description:
        "Get help with Nova Vision AI. Send a message to the support team about scans, accounts, billing, or feedback.",
    }),
  component: ContactPage,
});

function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.user_metadata?.display_name ?? "",
    email: user?.email ?? "",
    phone: "",
    subject: "",
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  function reset() {
    setForm({ name: "", email: user?.email ?? "", phone: "", subject: "", message: "" });
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      // Send email via Web3Forms → delivered to oniyetaofiqishola11@gmail.com
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "b3825961-2c7a-4517-802e-e355bdf5557a",
          subject: `[Nova Vision AI] ${form.subject}`,
          from_name: "Nova Vision AI Contact Form",
          name: form.name,
          email: form.email,
          phone: form.phone || "Not provided",
          message: form.message,
          replyto: form.email,
          botcheck: "",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to send message");

      // Best-effort log to support_tickets (requires auth; skip for anon users)
      if (user?.id) {
        await supabase.from("support_tickets").insert({
          user_id: user.id,
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          subject: form.subject,
          message: form.message,
        });
      }

      setSuccess(true);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Contact Support"
        icon={<Mail className="size-5 text-primary" />}
        subtitle="We typically reply within 24 hours"
      />
      <form onSubmit={send} className="glass-card p-4 space-y-3">
        <div>
          <Label className="text-xs">Full name</Label>
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Email address</Label>
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Phone (optional)</Label>
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Subject</Label>
          <Input
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Message</Label>
          <Textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={busy}
            className="flex-1 hero-gradient text-primary-foreground font-semibold"
          >
            <Send className="size-4 mr-2" /> {busy ? "Sending…" : "Send message"}
          </Button>
          <Button type="button" variant="outline" onClick={reset}>
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </form>

      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="text-center">
          <DialogHeader>
            <div className="size-16 mx-auto rounded-full bg-primary/15 grid place-items-center mb-2">
              <CheckCircle2 className="size-9 text-primary" />
            </div>
            <DialogTitle className="text-center">Message received</DialogTitle>
            <DialogDescription className="text-center">
              Thank you for contacting Nova Vision AI. Your message has been received successfully.
              Our support team will review it and reply to your email as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setSuccess(false)}
              className="hero-gradient text-primary-foreground"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

type Prefs = {
  scan_completed: boolean;
  ai_updates: boolean;
  product_news: boolean;
  security_alerts: boolean;
  weekly_tips: boolean;
  new_features: boolean;
};
const DEFAULT: Prefs = {
  scan_completed: true,
  ai_updates: true,
  product_news: false,
  security_alerts: true,
  weekly_tips: true,
  new_features: true,
};
const LABELS: Record<keyof Prefs, string> = {
  scan_completed: "Scan completed",
  ai_updates: "AI updates",
  product_news: "Product news",
  security_alerts: "Security alerts",
  weekly_tips: "Weekly tips",
  new_features: "New features",
};

function NotificationsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);

  useEffect(() => {
    if (!user) return;
    supabase.from("notification_preferences").select("*").eq("user_id", user.id).single().then(async ({ data }) => {
      if (data) setPrefs({ ...DEFAULT, ...data });
      else await supabase.from("notification_preferences").insert({ user_id: user.id, ...DEFAULT });
    });
  }, [user]);

  async function update(key: keyof Prefs, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    if (user) {
      await supabase.from("notification_preferences").upsert({ user_id: user.id, ...next });
      toast.success("Preferences saved");
    }
    if (key === "scan_completed" && value && "Notification" in window) Notification.requestPermission();
  }

  return (
    <PageShell>
      <PageHeader title="Notifications" icon={<Bell className="size-5 text-primary" />} subtitle="Choose what you'd like to hear about" />
      <div className="glass-card divide-y divide-border">
        {(Object.keys(LABELS) as (keyof Prefs)[]).map((k) => (
          <div key={k} className="flex items-center justify-between p-4">
            <Label htmlFor={k} className="text-sm font-medium">{LABELS[k]}</Label>
            <Switch id={k} checked={prefs[k]} onCheckedChange={(v) => update(k, v)} />
          </div>
        ))}
      </div>
      <div className="glass-card p-4 mt-4">
        <h3 className="text-sm font-semibold mb-2">Notification history</h3>
        <p className="text-xs text-muted-foreground">You'll see in-app notifications here when they arrive.</p>
      </div>
    </PageShell>
  );
}

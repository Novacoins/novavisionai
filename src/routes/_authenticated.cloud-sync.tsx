import { createFileRoute } from "@tanstack/react-router";
import { Cloud, CheckCircle2, Loader2, RefreshCw, Database as DatabaseIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { PageShell, PageHeader } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/_authenticated/cloud-sync")({
  component: CloudSyncPage,
  head: () =>
    pageHead({
      path: "/cloud-sync",
      title: "Cloud Sync — Nova Vision AI",
      description: "See what's backed up in the cloud.",
    }),
});

type Row = { key: string; label: string; count: number; latest: string | null };

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

function CloudSyncPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const tables = [
      { key: "scans", label: "Image scans", timeCol: "created_at" },
      { key: "chat_conversations", label: "Chat conversations", timeCol: "updated_at" },
      { key: "chat_messages", label: "Chat messages", timeCol: "created_at" },
      { key: "meal_plans", label: "Meal plans", timeCol: "created_at" },
      { key: "user_preferences", label: "AI preferences", timeCol: "updated_at" },
      { key: "notification_preferences", label: "Notification settings", timeCol: "updated_at" },
    ] as const;

    const results = await Promise.all(
      tables.map(async (t) => {
        const { count } = await supabase
          .from(t.key)
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        const { data } = await supabase
          .from(t.key)
          .select(t.timeCol)
          .eq("user_id", user.id)
          .order(t.timeCol, { ascending: false })
          .limit(1);
        const latest = (data?.[0] as Record<string, string> | undefined)?.[t.timeCol] ?? null;
        return { key: t.key, label: t.label, count: count ?? 0, latest };
      }),
    );
    setRows(results);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const latestAny = rows.reduce<string | null>((acc, r) => {
    if (!r.latest) return acc;
    if (!acc) return r.latest;
    return new Date(r.latest) > new Date(acc) ? r.latest : acc;
  }, null);

  return (
    <PageShell>
      <PageHeader
        title="Cloud Sync"
        subtitle="Everything is stored securely in the cloud"
        icon={<Cloud className="size-5 text-primary" />}
      />

      <div className="space-y-4">
        <div className="glass-card p-5 text-center">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 grid place-items-center mx-auto mb-3">
            <CheckCircle2 className="size-7 text-white" />
          </div>
          <div className="text-base font-bold">All data synced</div>
          <div className="text-xs text-muted-foreground mt-1">
            Last activity: {formatWhen(latestAny)}
          </div>
          <Button onClick={load} variant="outline" size="sm" className="mt-3" disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="size-3.5 mr-1.5" /> Refresh
              </>
            )}
          </Button>
        </div>

        <div className="glass-card divide-y divide-border">
          {loading && rows.length === 0 ? (
            <div className="py-10 grid place-items-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            rows.map((r) => (
              <div key={r.key} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                    <DatabaseIcon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{r.label}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {r.count.toLocaleString()} item{r.count === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground shrink-0">
                  {formatWhen(r.latest)}
                </div>
              </div>
            ))
          )}
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          Your data is encrypted at rest and synced across all your devices automatically.
        </p>
      </div>
    </PageShell>
  );
}

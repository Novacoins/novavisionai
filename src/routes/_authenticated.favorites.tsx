import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Search, Camera, Share2, Trash2 } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/favorites")({
  component: FavoritesPage,
});

type Row = {
  id: string;
  title: string;
  category: string;
  thumbnail_url: string | null;
  created_at: string;
};

function FavoritesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("scans").select("id,title,category,thumbnail_url,created_at").eq("user_id", user.id).eq("is_favorite", true).order("created_at", { ascending: false }).then(({ data }) => setRows((data ?? []) as Row[]));
  }, [user]);

  async function remove(id: string) {
    await supabase.from("scans").update({ is_favorite: false }).eq("id", id);
    setRows((rs) => rs?.filter((r) => r.id !== id) ?? null);
    toast.success("Removed from favorites");
  }
  async function share(r: Row) {
    const text = `${r.title} — VisionNova AI`;
    if (navigator.share) { try { await navigator.share({ text, title: r.title }); } catch { /* */ } }
    else { await navigator.clipboard.writeText(text); toast.success("Copied"); }
  }

  const filtered = rows?.filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase())) ?? [];

  return (
    <PageShell>
      <PageHeader title="Favorites" icon={<Heart className="size-5 text-primary" />} subtitle="Your saved scans" />
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Search favorites…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      {rows === null ? (
        <div className="grid grid-cols-2 gap-2">{[0,1,2,3].map((i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Heart className="size-12 mx-auto text-primary/40 mb-3" />
          <p className="text-sm font-semibold">No favorites yet</p>
          <p className="text-xs text-muted-foreground mt-1">Tap the heart on any scan to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((r) => (
            <div key={r.id} className="glass-card overflow-hidden">
              <div className="aspect-square bg-muted relative">
                {r.thumbnail_url ? <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center"><Camera className="size-6 text-muted-foreground" /></div>}
              </div>
              <div className="p-3">
                <Badge variant="secondary" className="text-[10px] capitalize mb-1">{r.category}</Badge>
                <div className="text-sm font-semibold truncate">{r.title}</div>
                <div className="flex justify-between mt-2">
                  <button onClick={() => share(r)} className="p-1.5 rounded-lg hover:bg-accent"><Share2 className="size-4" /></button>
                  <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

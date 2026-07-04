import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Share2, Heart, Loader2, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ScanResult, type AIResult } from "@/components/ScanResult";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { refreshSignedUrl } from "@/lib/scans";

export const Route = createFileRoute("/_authenticated/scan-result/$scanId")({
  component: ScanResultPage,
});

type ScanRow = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  scan_type: string;
  thumbnail_url: string | null;
  image_path: string | null;
  ai_result: AIResult | null;
  is_favorite: boolean;
  created_at: string;
};

function ScanResultPage() {
  const { scanId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [row, setRow] = useState<ScanRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .eq("id", scanId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast.error("Scan not found");
        navigate({ to: "/history" });
        return;
      }
      const r = data as unknown as ScanRow;
      setRow(r);
      let url = r.thumbnail_url;
      if (r.image_path) {
        const fresh = await refreshSignedUrl(r.image_path);
        if (fresh) url = fresh;
      }
      setImgUrl(url);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [scanId, user, navigate]);

  async function toggleFavorite() {
    if (!row) return;
    const next = !row.is_favorite;
    setRow({ ...row, is_favorite: next });
    const { error } = await supabase.from("scans").update({ is_favorite: next }).eq("id", row.id);
    if (error) {
      setRow({ ...row, is_favorite: !next });
      toast.error("Could not update favorite");
    } else {
      toast.success(next ? "Added to favorites" : "Removed from favorites");
    }
  }

  async function share() {
    if (!row) return;
    const shareText = `${row.title} — via Nova Vision AI`;
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
      if (nav.share) {
        await nav.share({ title: row.title, text: shareText, url: shareUrl });
        return;
      }
    } catch { /* fallthrough */ }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Sharing not supported");
    }
  }

  if (loading || !row) {
    return (
      <div className="min-h-[60dvh] grid place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const ai = row.ai_result;

  return (
    <div className="px-4 pt-3 pb-8 max-w-md mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/" })} aria-label="Back">
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-lg font-bold truncate flex-1">{row.title}</h1>
      </div>

      <div className="relative rounded-2xl overflow-hidden glass-card bg-black">
        {imgUrl ? (
          <img src={imgUrl} alt={row.title} className="w-full max-h-[420px] object-contain" />
        ) : (
          <div className="aspect-square grid place-items-center text-muted-foreground">
            <Camera className="size-10" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Calendar className="size-3.5" />
        <span>{new Date(row.created_at).toLocaleString()}</span>
        <span className="ml-auto capitalize px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {row.scan_type}
        </span>
      </div>

      {ai ? (
        <ScanResult
          result={ai}
          onFavorite={toggleFavorite}
          onShare={share}
          isFavorite={row.is_favorite}
        />
      ) : (
        <div className="glass-card p-4 space-y-3">
          <p className="text-sm text-muted-foreground">No AI details saved for this scan.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleFavorite}>
              <Heart className={`size-4 mr-1.5 ${row.is_favorite ? "fill-destructive text-destructive" : ""}`} />
              {row.is_favorite ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={share}>
              <Share2 className="size-4 mr-1.5" /> Share
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

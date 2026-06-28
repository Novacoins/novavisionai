import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScanCapture, type CapturedImage } from "@/components/ScanCapture";
import { ScanResult, type AIResult } from "@/components/ScanResult";
import { analyzeImage } from "@/lib/ai.functions";
import { saveScan, uploadScanImage } from "@/lib/scans";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/scan")({
  component: ScanPage,
});

const TYPES = [
  { id: "general", label: "Anything" },
  { id: "food", label: "Food" },
  { id: "plant", label: "Plant" },
] as const;

function ScanPage() {
  const { user } = useAuth();
  const [scanType, setScanType] = useState<"general" | "food" | "plant">("general");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);

  async function handleCapture(img: CapturedImage) {
    if (!user) return;
    setLoading(true);
    setResult(null);
    setScanId(null);
    setIsFav(false);
    try {
      const ai = await analyzeImage({ data: { imageDataUrl: img.dataUrl, scanType } });
      setResult(ai as AIResult);
      const uploaded = await uploadScanImage(user.id, img.dataUrl);
      const row = await saveScan({ userId: user.id, result: ai as AIResult, scanType, image: uploaded });
      if (row?.id) setScanId(row.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleFav() {
    if (!scanId) return;
    const next = !isFav;
    setIsFav(next);
    await supabase.from("scans").update({ is_favorite: next }).eq("id", scanId);
    toast.success(next ? "Saved to Favorites" : "Removed from Favorites");
  }

  async function share() {
    if (!result) return;
    const text = `${result.title}\n\n${result.summary}\n\nVia Nova Vision AI`;
    if (navigator.share) {
      try { await navigator.share({ title: result.title, text }); } catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    }
  }

  return (
    <div className="px-4 pt-3 pb-6 max-w-md mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="size-5 text-primary" /> Scan
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Point your camera or upload an image.</p>
      </div>

      <div className="flex p-1 rounded-xl bg-muted">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setScanType(t.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              scanType === t.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ScanCapture
        onCapture={handleCapture}
        loading={loading}
        helperText="Good lighting and a clear close-up boost accuracy."
      />

      {result && (
        <ScanResult result={result} onFavorite={toggleFav} onShare={share} isFavorite={isFav} />
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScanCapture, type CapturedImage } from "@/components/ScanCapture";
import { ScanResult, type AIResult } from "@/components/ScanResult";
import { analyzeImage } from "@/lib/ai.functions";
import { saveScan, uploadScanImage } from "@/lib/scans";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/_authenticated/plant-scanner")({
  component: PlantScanner,
});

function PlantScanner() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  async function handleCapture(img: CapturedImage) {
    if (!user) return;
    setLoading(true);
    setResult(null);
    try {
      const ai = await analyzeImage({ data: { imageDataUrl: img.dataUrl, scanType: "plant" } });
      setResult(ai as AIResult);
      const uploaded = await uploadScanImage(user.id, img.dataUrl);
      await saveScan({ userId: user.id, result: ai as AIResult, scanType: "plant", image: uploaded });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Plant analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 pt-3 pb-6 max-w-md mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Leaf className="size-5 text-primary" /> Plant Scanner
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Identify plants, check toxicity, and get care tips.
        </p>
      </div>
      <ScanCapture
        onCapture={handleCapture}
        loading={loading}
        helperText="Capture leaves and flowers clearly for best results."
      />
      {result && <ScanResult result={result} />}
    </div>
  );
}

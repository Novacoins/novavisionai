import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldX, Sparkles, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type AIResult = {
  title: string;
  category: string;
  confidence: number;
  safety: string;
  summary: string;
  details: string[];
  recommendations: string[];
  warnings: string[];
};

const safetyIcon = (s: string) => {
  if (s === "safe") return <ShieldCheck className="size-4" />;
  if (s === "caution") return <ShieldAlert className="size-4" />;
  if (s === "unsafe") return <ShieldX className="size-4" />;
  return <Sparkles className="size-4" />;
};

const safetyColor = (s: string) => {
  if (s === "safe") return "bg-primary/15 text-primary border-primary/30";
  if (s === "caution") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  if (s === "unsafe") return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground border-border";
};

export function ScanResult({
  result,
  onFavorite,
  onShare,
  isFavorite,
}: {
  result: AIResult;
  onFavorite?: () => void;
  onShare?: () => void;
  isFavorite?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="glass-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge variant="secondary" className="mb-2 capitalize">
              {result.category}
            </Badge>
            <h2 className="text-xl font-bold leading-tight">{result.title}</h2>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${safetyColor(result.safety)}`}
          >
            {safetyIcon(result.safety)}
            <span className="capitalize">{result.safety}</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full hero-gradient"
              style={{ width: `${Math.round((result.confidence || 0) * 100)}%` }}
            />
          </div>
          <span className="font-medium">
            {Math.round((result.confidence || 0) * 100)}% confidence
          </span>
        </div>
        {(onFavorite || onShare) && (
          <div className="mt-4 flex gap-2">
            {onFavorite && (
              <Button variant="outline" size="sm" onClick={onFavorite}>
                <Heart
                  className={`size-4 mr-1.5 ${isFavorite ? "fill-destructive text-destructive" : ""}`}
                />
                {isFavorite ? "Saved" : "Save"}
              </Button>
            )}
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="size-4 mr-1.5" />
                Share
              </Button>
            )}
          </div>
        )}
      </div>

      {result.warnings?.length > 0 && (
        <div className="glass-card p-4 border-destructive/30 bg-destructive/5">
          <h3 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
            <ShieldAlert className="size-4" /> Important warnings
          </h3>
          <ul className="space-y-1.5 text-sm">
            {result.warnings.map((w, i) => (
              <li key={i} className="text-destructive/90">
                • {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.details?.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-3">Details</h3>
          <ul className="space-y-2 text-sm">
            {result.details.map((d, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.recommendations?.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-3">What to do next</h3>
          <ul className="space-y-2 text-sm">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2">
                <Sparkles className="size-3.5 mt-1 text-primary shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground text-center px-4">
        Nova Vision AI provides educational information only — not medical or professional advice.
      </p>
    </motion.div>
  );
}

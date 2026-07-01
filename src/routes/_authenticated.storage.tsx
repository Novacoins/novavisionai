import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HardDrive, Search, Trash2, Download, Eye, X, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/storage")({
  component: StoragePage,
});

type Item = {
  id: string;
  title: string;
  category: string;
  thumbnail_url: string | null;
  image_url: string | null;
  created_at: string;
  file_size?: number | null;
};

const CATEGORIES = ["all", "food", "plant", "product", "object", "document", "ingredient", "animal", "unknown"];

async function addWatermarkAndDownload(url: string, filename: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("load"));
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(img, 0, 0);
  // Watermark
  const pad = Math.round(Math.min(canvas.width, canvas.height) * 0.02);
  const fontSize = Math.max(14, Math.round(canvas.width * 0.028));
  ctx.font = `600 ${fontSize}px "Sora", "Inter", sans-serif`;
  const text = "✨ Nova Vision AI";
  const metrics = ctx.measureText(text);
  const tw = metrics.width;
  const th = fontSize * 1.4;
  const x = canvas.width - tw - pad * 2;
  const y = canvas.height - th - pad;
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#000";
  ctx.fillRect(x - pad, y, tw + pad * 2, th);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y + th / 2);
  ctx.globalAlpha = 1;

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92));
  if (!blob) throw new Error("blob");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 2000);
}

function StoragePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[] | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [category, setCategory] = useState<string>("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<Item | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ ids: string[] } | null>(null);

  const load = () => {
    if (!user) return;
    supabase
      .from("scans")
      .select("id,title,category,thumbnail_url,image_url,created_at,file_size")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as Item[]));
  };
  useEffect(load, [user]);

  const filtered = useMemo(() => {
    if (!items) return null;
    let list = items;
    if (category !== "all") list = list.filter((i) => (i.category ?? "").toLowerCase() === category);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((i) => i.title?.toLowerCase().includes(s) || i.category?.toLowerCase().includes(s));
    }
    list = [...list].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sort === "newest" ? db - da : da - db;
    });
    return list;
  }, [items, q, sort, category]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const doDelete = async (ids: string[]) => {
    const { error } = await supabase.from("scans").delete().in("id", ids);
    if (error) return toast.error("Failed to delete");
    toast.success(`Deleted ${ids.length} item${ids.length > 1 ? "s" : ""}`);
    setSelected(new Set());
    setSelectMode(false);
    setConfirmDelete(null);
    load();
  };

  const doDownload = async (item: Item) => {
    const url = item.image_url || item.thumbnail_url;
    if (!url) return toast.error("No image available");
    try {
      await addWatermarkAndDownload(url, `nova-vision-${item.id.slice(0, 8)}.jpg`);
      toast.success("Downloaded with watermark");
    } catch {
      toast.error("Download failed");
    }
  };

  const doDownloadMany = async () => {
    const chosen = (filtered ?? []).filter((i) => selected.has(i.id));
    for (const it of chosen) {
      try { await addWatermarkAndDownload(it.image_url || it.thumbnail_url!, `nova-vision-${it.id.slice(0, 8)}.jpg`); } catch { /* skip */ }
    }
    toast.success(`Downloaded ${chosen.length} images`);
  };

  return (
    <PageShell>
      <PageHeader
        title="Storage"
        icon={<HardDrive className="size-5 text-primary" />}
        subtitle="Every image you've scanned, in one place"
      />

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stored images…"
            className="w-full h-11 pl-9 pr-3 rounded-full glass-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 h-8 rounded-full text-xs font-medium capitalize whitespace-nowrap transition ${
                category === c ? "bg-primary text-primary-foreground" : "glass-card"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex gap-1.5">
            <button
              onClick={() => setSort("newest")}
              className={`px-3 h-7 rounded-full ${sort === "newest" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
            >Newest</button>
            <button
              onClick={() => setSort("oldest")}
              className={`px-3 h-7 rounded-full ${sort === "oldest" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
            >Oldest</button>
          </div>
          <button
            onClick={() => { setSelectMode((v) => !v); setSelected(new Set()); }}
            className="px-3 h-7 rounded-full glass-card font-medium"
          >{selectMode ? "Cancel" : "Select"}</button>
        </div>
      </div>

      {selectMode && selected.size > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="sticky top-2 z-20 glass-card p-2 flex items-center gap-2"
        >
          <span className="text-xs font-medium px-2">{selected.size} selected</span>
          <button onClick={doDownloadMany} className="ml-auto h-9 px-3 rounded-lg bg-primary/15 text-primary text-xs font-semibold flex items-center gap-1.5">
            <Download className="size-3.5" /> Download
          </button>
          <button onClick={() => setConfirmDelete({ ids: Array.from(selected) })} className="h-9 px-3 rounded-lg bg-destructive/15 text-destructive text-xs font-semibold flex items-center gap-1.5">
            <Trash2 className="size-3.5" /> Delete
          </button>
        </motion.div>
      )}

      {filtered === null ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <HardDrive className="size-10 mx-auto text-muted-foreground mb-2" />
          <div className="text-sm font-medium">No stored images yet</div>
          <div className="text-xs text-muted-foreground mt-1">Scans you make will appear here.</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const isSel = selected.has(item.id);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.02 }}
                  className={`glass-card overflow-hidden relative ${isSel ? "ring-2 ring-primary" : ""}`}
                >
                  <button
                    onClick={() => selectMode ? toggleSelect(item.id) : setPreview(item)}
                    className="block w-full aspect-square relative"
                  >
                    {item.thumbnail_url || item.image_url ? (
                      <img src={item.thumbnail_url || item.image_url!} alt={item.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-muted-foreground text-xs">No image</div>
                    )}
                    {selectMode && (
                      <span className="absolute top-2 left-2 size-6 rounded-full bg-black/50 text-white grid place-items-center">
                        {isSel ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
                      </span>
                    )}
                  </button>
                  <div className="p-2.5 space-y-1">
                    <div className="text-xs font-semibold truncate">{item.title || "Untitled"}</div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="capitalize truncate">{item.category || "unknown"}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    {!selectMode && (
                      <div className="flex items-center gap-1 pt-1">
                        <button onClick={() => setPreview(item)} className="flex-1 h-7 rounded-md bg-muted text-[10px] font-medium flex items-center justify-center gap-1"><Eye className="size-3" />View</button>
                        <button onClick={() => doDownload(item)} className="flex-1 h-7 rounded-md bg-primary/15 text-primary text-[10px] font-medium flex items-center justify-center gap-1"><Download className="size-3" />Save</button>
                        <button onClick={() => setConfirmDelete({ ids: [item.id] })} className="h-7 px-2 rounded-md bg-destructive/15 text-destructive flex items-center justify-center"><Trash2 className="size-3" /></button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-4"
            onClick={() => setPreview(null)}
          >
            <button className="absolute top-4 right-4 size-10 rounded-full bg-white/10 text-white grid place-items-center" onClick={() => setPreview(null)}>
              <X className="size-5" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              src={preview.image_url || preview.thumbnail_url!}
              alt={preview.title}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              <button onClick={() => doDownload(preview)} className="h-11 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2">
                <Download className="size-4" /> Download
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirmDelete?.ids.length} image{(confirmDelete?.ids.length ?? 0) > 1 ? "s" : ""}?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone. The images will be permanently removed from your storage.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete && doDelete(confirmDelete.ids)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}

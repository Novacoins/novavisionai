import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { History, Search, Trash2, Heart, Share2, Camera, MessageSquare, Plus } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
});

type ScanRow = {
  id: string;
  title: string;
  category: string;
  confidence: number | null;
  safety: string | null;
  thumbnail_url: string | null;
  is_favorite: boolean;
  created_at: string;
};

type ChatMsg = { role: "user" | "assistant"; content: string; ts: number };
type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMsg[];
};

function chatKey(userId: string | undefined) {
  return `nova-chats-${userId ?? "anon"}`;
}

function loadChats(userId: string | undefined): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(chatKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveChats(userId: string | undefined, list: Conversation[]) {
  try {
    localStorage.setItem(chatKey(userId), JSON.stringify(list));
  } catch {
    /* quota */
  }
}

function groupChats(list: Conversation[]) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYest = startToday - 86400000;
  const start7 = startToday - 7 * 86400000;
  const buckets = {
    Today: [] as Conversation[],
    Yesterday: [] as Conversation[],
    "Last 7 Days": [] as Conversation[],
    Older: [] as Conversation[],
  };
  for (const c of list) {
    if (c.updatedAt >= startToday) buckets.Today.push(c);
    else if (c.updatedAt >= startYest) buckets.Yesterday.push(c);
    else if (c.updatedAt >= start7) buckets["Last 7 Days"].push(c);
    else buckets.Older.push(c);
  }
  return buckets;
}

function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ScanRow[] | null>(null);
  const [chats, setChats] = useState<Conversation[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  async function load() {
    if (!user) return;
    const { data: scans } = await supabase
      .from("scans")
      .select("id,title,category,confidence,safety,thumbnail_url,is_favorite,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRows((scans ?? []) as ScanRow[]);
    setChats(loadChats(user.id).sort((a, b) => b.updatedAt - a.updatedAt));
  }
  useEffect(() => {
    load();
  }, [user]);

  const categories = useMemo(
    () => Array.from(new Set((rows ?? []).map((r) => r.category))),
    [rows],
  );
  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (query && !r.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [rows, query, category]);

  async function toggleFav(id: string, current: boolean) {
    await supabase.from("scans").update({ is_favorite: !current }).eq("id", id);
    setRows((rs) => rs?.map((r) => (r.id === id ? { ...r, is_favorite: !current } : r)) ?? null);
  }
  async function confirmDelete() {
    if (!toDelete) return;
    await supabase.from("scans").delete().eq("id", toDelete);
    setRows((rs) => rs?.filter((r) => r.id !== toDelete) ?? null);
    setToDelete(null);
    toast.success("Scan deleted");
  }
  async function share(r: ScanRow) {
    const text = `${r.title} — Nova Vision AI`;
    if (navigator.share) {
      try {
        await navigator.share({ title: r.title, text });
      } catch {
        /* */
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    }
  }

  const filteredChats = useMemo(
    () => chats.filter((c) => !query || c.title.toLowerCase().includes(query.toLowerCase())),
    [chats, query],
  );
  const grouped = useMemo(() => groupChats(filteredChats), [filteredChats]);
  const mostRecentId = chats[0]?.id;

  function openChat(id: string) {
    navigate({ to: "/chat", search: { c: id } });
  }
  function newChat() {
    navigate({ to: "/chat", search: {} });
  }
  function deleteChat() {
    if (!chatToDelete) return;
    const next = chats.filter((c) => c.id !== chatToDelete);
    setChats(next);
    saveChats(user?.id, next);
    setChatToDelete(null);
    toast.success("Conversation deleted");
  }
  function clearAllChats() {
    setChats([]);
    saveChats(user?.id, []);
    setClearAllOpen(false);
    toast.success("History cleared");
  }

  return (
    <PageShell>
      <PageHeader
        title="History"
        icon={<History className="size-5 text-primary" />}
        subtitle="Scans, chats & activity"
      />
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search history…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="scans" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="scans">Scans</TabsTrigger>
          <TabsTrigger value="chats">AI Chats</TabsTrigger>
        </TabsList>

        <TabsContent value="scans" className="space-y-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {rows === null ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Camera className="size-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No scans yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your scan history will appear here.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((r) => (
                <li key={r.id} className="glass-card p-3 flex gap-3">
                  <div className="size-16 rounded-xl overflow-hidden bg-muted shrink-0 grid place-items-center">
                    {r.thumbnail_url ? (
                      <img
                        src={r.thumbnail_url}
                        alt={r.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{r.title}</div>
                        <Badge variant="secondary" className="mt-0.5 text-[10px] capitalize">
                          {r.category}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-muted-foreground text-right shrink-0">
                        {new Date(r.created_at).toLocaleDateString()}
                        <div>
                          {new Date(r.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {Math.round((r.confidence ?? 0) * 100)}% confidence
                    </div>
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => toggleFav(r.id, r.is_favorite)}
                        className="p-1.5 rounded-lg hover:bg-accent"
                        aria-label="Favorite"
                      >
                        <Heart
                          className={`size-4 ${r.is_favorite ? "fill-destructive text-destructive" : ""}`}
                        />
                      </button>
                      <button
                        onClick={() => share(r)}
                        className="p-1.5 rounded-lg hover:bg-accent"
                        aria-label="Share"
                      >
                        <Share2 className="size-4" />
                      </button>
                      <button
                        onClick={() => setToDelete(r.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive ml-auto"
                        aria-label="Delete"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="chats" className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={newChat}
              className="flex-1 hero-gradient text-primary-foreground rounded-xl"
            >
              <Plus className="size-4 mr-1" /> New chat
            </Button>
            {chats.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setClearAllOpen(true)}
                className="rounded-xl text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4 mr-1" /> Clear all
              </Button>
            )}
          </div>

          {filteredChats.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <MessageSquare className="size-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your AI chats will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Object.keys(grouped) as (keyof typeof grouped)[]).map((label) => {
                const items = grouped[label];
                if (!items.length) return null;
                return (
                  <div key={label}>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-2">
                      {label}
                    </div>
                    <ul className="space-y-2">
                      {items.map((c) => {
                        const last = c.messages[c.messages.length - 1];
                        const preview = last ? last.content.replace(/[#*`]/g, "").slice(0, 60) : "";
                        const isActive = c.id === mostRecentId;
                        return (
                          <li
                            key={c.id}
                            className={cn(
                              "glass-card p-3 flex items-center gap-3 cursor-pointer transition-colors hover:bg-accent/40",
                              isActive && "border-l-4 border-l-primary",
                            )}
                            onClick={() => openChat(c.id)}
                          >
                            <div className="size-12 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0">
                              <MessageSquare className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{c.title}</div>
                              {preview && (
                                <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                                  {preview}
                                </div>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[10px] text-muted-foreground">
                                {new Date(c.updatedAt).toLocaleDateString()}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {new Date(c.updatedAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChatToDelete(c.id);
                                }}
                                className="p-1.5 mt-1 rounded-lg hover:bg-destructive/10 text-destructive"
                                aria-label="Delete conversation"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this scan?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!chatToDelete} onOpenChange={(o) => !o && setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              All messages in this chat will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteChat}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all chat history?</AlertDialogTitle>
            <AlertDialogDescription>
              Every saved AI conversation will be permanently removed from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllChats}>Clear all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}

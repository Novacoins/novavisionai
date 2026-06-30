import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { History, Search, Trash2, Heart, Share2, Camera, MessageSquare } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

type ChatRow = { id: string; title: string; updated_at: string };

function HistoryPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ScanRow[] | null>(null);
  const [chats, setChats] = useState<ChatRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    const [{ data: scans }, { data: convos }] = await Promise.all([
      supabase
        .from("scans")
        .select("id,title,category,confidence,safety,thumbnail_url,is_favorite,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("chat_conversations")
        .select("id,title,updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
    ]);
    setRows((scans ?? []) as ScanRow[]);
    setChats((convos ?? []) as ChatRow[]);
  }
  useEffect(() => { load(); }, [user]);

  const categories = useMemo(() => Array.from(new Set((rows ?? []).map((r) => r.category))), [rows]);
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
    setRows((rs) => rs?.map((r) => r.id === id ? { ...r, is_favorite: !current } : r) ?? null);
  }
  async function confirmDelete() {
    if (!toDelete) return;
    await supabase.from("scans").delete().eq("id", toDelete);
    setRows((rs) => rs?.filter((r) => r.id !== toDelete) ?? null);
    setToDelete(null);
    toast.success("Scan deleted");
  }

  async function deleteChat() {
    if (!chatToDelete) return;
    await supabase.from("chat_messages").delete().eq("conversation_id", chatToDelete);
    await supabase.from("chat_conversations").delete().eq("id", chatToDelete);
    setChats((cs) => cs?.filter((c) => c.id !== chatToDelete) ?? null);
    setChatToDelete(null);
    toast.success("Conversation deleted");
  }

  const filteredChats = useMemo(
    () => (chats ?? []).filter((c) => !query || c.title.toLowerCase().includes(query.toLowerCase())),
    [chats, query],
  );

  return (
    <PageShell>
      <PageHeader title="History" icon={<History className="size-5 text-primary" />} subtitle="Scans, chats & activity" />
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search history…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Tabs defaultValue="scans" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="scans">Scans</TabsTrigger>
          <TabsTrigger value="chats">AI Chats</TabsTrigger>
        </TabsList>

        <TabsContent value="scans" className="space-y-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
            </SelectContent>
          </Select>

          {rows === null ? (
            <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Camera className="size-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No scans yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your scan history will appear here.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((r) => (
                <li key={r.id} className="glass-card p-3 flex gap-3">
                  <div className="size-16 rounded-xl overflow-hidden bg-muted shrink-0 grid place-items-center">
                    {r.thumbnail_url ? <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover" /> : <Camera className="size-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{r.title}</div>
                        <Badge variant="secondary" className="mt-0.5 text-[10px] capitalize">{r.category}</Badge>
                      </div>
                      <div className="text-[10px] text-muted-foreground text-right shrink-0">
                        {new Date(r.created_at).toLocaleDateString()}
                        <div>{new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {Math.round((r.confidence ?? 0) * 100)}% confidence
                    </div>
                    <div className="flex gap-1 mt-2">
                      <button onClick={() => toggleFav(r.id, r.is_favorite)} className="p-1.5 rounded-lg hover:bg-accent" aria-label="Favorite">
                        <Heart className={`size-4 ${r.is_favorite ? "fill-destructive text-destructive" : ""}`} />
                      </button>
                      <button onClick={() => share(r)} className="p-1.5 rounded-lg hover:bg-accent" aria-label="Share">
                        <Share2 className="size-4" />
                      </button>
                      <button onClick={() => setToDelete(r.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive ml-auto" aria-label="Delete">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="chats" className="space-y-2">
          {chats === null ? (
            <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
          ) : filteredChats.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <MessageSquare className="size-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your AI chats will appear here.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredChats.map((c) => (
                <li key={c.id} className="glass-card p-3 flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0">
                    <MessageSquare className="size-5" />
                  </div>
                  <Link to="/chat" className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(c.updated_at).toLocaleDateString()} · {new Date(c.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </Link>
                  <button onClick={() => setChatToDelete(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive" aria-label="Delete">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
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
            <AlertDialogDescription>All messages in this chat will be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteChat}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}

